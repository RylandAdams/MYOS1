#!/usr/bin/env node
/**
 * Build light versions of every Photos-app image so albums load fast on phones.
 *
 *   public/thumbs/<path>.jpg   160×160 square crop for the album grid / album list
 *   public/view/<path>.jpg     up to 1080px on the long side for the full-screen viewer
 *
 * <path> mirrors the original under public/ (e.g. public/portland/x.png → public/thumbs/portland/x.jpg).
 * Bundled camera-roll images in src/pages/photos/cameraRoll/photos go under thumbs/bundled and view/bundled.
 * Originals are never modified. Re-run after adding photos: node scripts/make-photo-variants.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SOURCES = [
	...['photos/mexico', 'portland', 'eugene', 'corvallis', 'dayton', 'new-york'].map((d) => ({ dir: path.join(PUBLIC, d), rel: d })),
	{ dir: path.join(ROOT, 'src/pages/photos/cameraRoll/photos'), rel: 'bundled' },
];

const isImage = (f) => /\.(png|jpe?g|webp)$/i.test(f);

async function run() {
	let made = 0;
	let skipped = 0;
	let inBytes = 0;
	let outBytes = 0;
	for (const { dir, rel } of SOURCES) {
		if (!fs.existsSync(dir)) continue;
		for (const file of fs.readdirSync(dir).filter(isImage)) {
			const src = path.join(dir, file);
			const name = file.replace(/\.[^.]+$/, '.jpg');
			const thumb = path.join(PUBLIC, 'thumbs', rel, name);
			const view = path.join(PUBLIC, 'view', rel, name);
			if (fs.existsSync(thumb) && fs.existsSync(view) && fs.statSync(thumb).mtimeMs > fs.statSync(src).mtimeMs) {
				skipped++;
				continue;
			}
			fs.mkdirSync(path.dirname(thumb), { recursive: true });
			fs.mkdirSync(path.dirname(view), { recursive: true });
			const img = sharp(src).rotate(); // respect EXIF orientation
			await img.clone().resize(160, 160, { fit: 'cover', position: 'attention' }).jpeg({ quality: 72, mozjpeg: true }).toFile(thumb);
			await img
				.clone()
				.resize(1080, 1080, { fit: 'inside', withoutEnlargement: true })
				.flatten({ background: '#000' })
				.jpeg({ quality: 80, mozjpeg: true })
				.toFile(view);
			inBytes += fs.statSync(src).size;
			outBytes += fs.statSync(view).size;
			made++;
		}
	}
	console.log(`Made ${made} photo variants (${skipped} up to date).`);
	if (made) console.log(`Viewer images: ${(inBytes / 1e6).toFixed(1)} MB originals → ${(outBytes / 1e6).toFixed(1)} MB`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
