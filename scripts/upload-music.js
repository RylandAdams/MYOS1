#!/usr/bin/env node
/**
 * Convert song masters to streaming AAC and upload them to Firebase Storage (music/).
 *
 * Usage:
 *   node scripts/upload-music.js "/path/to/folder of WAVs"            # convert + upload
 *   node scripts/upload-music.js "/path/to/folder of WAVs" --dry-run  # convert + show matches only
 *
 * Each file is matched to an iPod library title by name (e.g. "Denial FINAL.wav" → Denial).
 * WAV/AIFF/FLAC are converted with macOS afconvert to 256 kbps AAC (.m4a, ~2 MB per minute);
 * MP3/M4A files are uploaded as they are. src/assets/ipodAudio.js is updated with every upload.
 *
 * Requires: macOS (afconvert), firebase-admin, GOOGLE_APPLICATION_CREDENTIALS (service account key)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const folderPath = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!folderPath || !fs.existsSync(folderPath)) {
	console.error('Usage: node scripts/upload-music.js "<folder of WAVs>" [--dry-run]');
	process.exit(1);
}

const LIBRARY = path.join(__dirname, '../src/assets/ipodLibrary.js');
const MANIFEST = path.join(__dirname, '../src/assets/ipodAudio.js');

const norm = (s) => s.toLowerCase().replace(/&#39;|['’]/g, '').replace(/[^a-z0-9]+/g, '');
const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const titles = [...fs.readFileSync(LIBRARY, 'utf8').matchAll(/title: (['"])(.+?)\1,/g)].map((m) => m[2]);

const matchTitle = (fileName) => {
	const base = norm(path.parse(fileName).name.replace(/\bryland\b/gi, ''));
	const hits = titles.filter((t) => base.includes(norm(t)));
	return hits.sort((a, b) => norm(b).length - norm(a).length)[0] || null;
};

const files = fs
	.readdirSync(folderPath)
	.filter((f) => /\.(wav|aif|aiff|flac|mp3|m4a)$/i.test(f))
	.sort();

const plan = [];
const unmatched = [];
for (const file of files) {
	const title = matchTitle(file);
	if (title) plan.push({ file, title });
	else unmatched.push(file);
}

const seen = new Set();
for (const p of plan) {
	if (seen.has(p.title)) {
		console.error(`Two files match "${p.title}". Keep only the final version in the folder and run again.`);
		process.exit(1);
	}
	seen.add(p.title);
}

console.log(`Matched ${plan.length} of ${files.length} files:`);
plan.forEach((p) => console.log(`  ${p.file}  →  ${p.title}`));
if (unmatched.length) {
	console.log('\nNot matched to any library title (skipped):');
	unmatched.forEach((f) => console.log(`  ${f}`));
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'myos-music-'));

const encode = (p) => {
	const src = path.join(folderPath, p.file);
	const ext = path.extname(p.file).toLowerCase();
	if (ext === '.mp3' || ext === '.m4a') return { local: src, dest: `${slugify(p.title)}${ext}` };
	const out = path.join(tmp, `${slugify(p.title)}.m4a`);
	execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '256000', '-s', '0', src, out]);
	return { local: out, dest: `${slugify(p.title)}.m4a` };
};

const writeManifest = (entries) => {
	const src = fs.readFileSync(MANIFEST, 'utf8');
	const start = src.indexOf('export const HOSTED_AUDIO = {');
	const end = src.indexOf('};', start);
	const merged = { ...existingManifest(src), ...entries };
	const body = Object.keys(merged)
		.sort()
		.map((k) => `\t${k.includes("'") ? JSON.stringify(k) : `'${k}'`}: '${merged[k]}',`)
		.join('\n');
	fs.writeFileSync(MANIFEST, `${src.slice(0, start)}export const HOSTED_AUDIO = {\n${body}\n${src.slice(end)}`);
};

const existingManifest = (src) => {
	const block = src.slice(src.indexOf('export const HOSTED_AUDIO = {'));
	const body = block.slice(0, block.indexOf('};'));
	return Object.fromEntries([...body.matchAll(/^\t(['"])(.+?)\1: '(.+?)',$/gm)].map((m) => [m[2], m[3]]));
};

async function run() {
	if (!plan.length) return;
	let bucket = null;
	if (!dryRun) {
		const admin = require(path.join(__dirname, '../functions/node_modules/firebase-admin'));
		if (!admin.apps.length) admin.initializeApp({ projectId: 'myos1-8e625' });
		bucket = admin.storage().bucket('myos1-8e625.firebasestorage.app');
	}

	const uploaded = {};
	for (const [i, p] of plan.entries()) {
		const { local, dest } = encode(p);
		const mb = (fs.statSync(local).size / 1e6).toFixed(1);
		if (dryRun) {
			console.log(`  ${i + 1}/${plan.length}: ${p.title} → music/${dest} (${mb} MB, not uploaded)`);
			continue;
		}
		await bucket.upload(local, {
			destination: `music/${dest}`,
			metadata: {
				contentType: dest.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4',
				cacheControl: 'public, max-age=31536000',
			},
		});
		uploaded[p.title.toLowerCase()] = dest;
		console.log(`  ${i + 1}/${plan.length}: ${p.title} → music/${dest} (${mb} MB)`);
	}
	if (!dryRun) {
		writeManifest(uploaded);
		console.log(`\nUpdated ${path.relative(process.cwd(), MANIFEST)}. Commit it to make these songs play from your own hosting.`);
	}
	fs.rmSync(tmp, { recursive: true, force: true });
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
