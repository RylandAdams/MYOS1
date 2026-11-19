/**
 * Writes public/lyrics/index.html from src/assets/lyrics.json (the same file the phone's Notes app
 * reads), so adding a song's lyrics there updates both. Runs before every `npm run build`.
 * Each song gets an h2, its lyrics with the line breaks kept, and an anchor (/lyrics/#slug) that
 * the Notes app's "Open in Safari" points to.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SONGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/lyrics.json'), 'utf8'));
const OUT = path.join(ROOT, 'public/lyrics/index.html');
const SITE = 'https://myphone.digital';
const ARTIST_URL = 'https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ';

// keep in sync with src/pages/notes/notesData.js
const slug = (title) =>
	title
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
const spotifyUrl = (title) => `https://open.spotify.com/search/${encodeURIComponent(`RYLAND ${title}`)}`;

// SoundCloud links come from the iPod library, so there is one list of them
const soundcloud = {};
const lib = fs.readFileSync(path.join(ROOT, 'src/assets/ipodLibrary.js'), 'utf8');
for (const m of lib.matchAll(/title: (?:'((?:[^'\\]|\\.)*)'|"([^"]*)"),.*?soundcloudUrl: '([^']*)'/g)) {
	soundcloud[(m[1] ?? m[2]).replace(/\\'/g, "'")] = m[3];
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (iso) => {
	const [y, m, d] = iso.split('-').map(Number);
	return `${MONTHS[m - 1]} ${d}, ${y}`;
};

// newest first; songs released the same day keep the file's order
const songs = SONGS.map((s, i) => ({ ...s, i }))
	.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.i - b.i)
	.map((s) => ({ ...s, id: slug(s.title) }));

const withLyrics = songs.filter((s) => s.lyrics.trim()).length;

const index = songs
	.map(
		(s) =>
			`\t\t\t\t<li><a href="${s.lyrics.trim() ? `/lyrics/${s.id}/` : `#${s.id}`}"><span class="lx-index__t">${esc(s.title)}</span><span class="lx-index__d mono">${fmt(s.releaseDate)}</span></a></li>`
	)
	.join('\n');

const sections = songs
	.map((s) => {
		const sc = soundcloud[s.title];
		const listen = [
			`<a class="link" href="${esc(spotifyUrl(s.title))}" rel="noopener">Spotify</a>`,
			sc && `<a class="link" href="${esc(sc)}" rel="noopener">SoundCloud</a>`,
		]
			.filter(Boolean)
			.join('\n\t\t\t\t\t\t');
		const release = s.release && s.release !== s.title ? `${esc(s.release)} · ` : '';
		const body = s.lyrics.trim()
			? `<p class="lx-lyrics">${esc(s.lyrics).replace(/\n/g, '<br>\n')}</p>`
			: `<p class="lx-lyrics lx-pending">Lyrics coming soon.</p>`;
		return `\t\t<section class="lx-song" id="${s.id}" aria-labelledby="${s.id}-h">
			<div class="wrap lx-song__grid">
				<div class="lx-side">
					<h2 id="${s.id}-h">${esc(s.title)}</h2>
					<p class="lx-meta">RYLAND · ${release}${fmt(s.releaseDate)}</p>
					<p class="lx-links">
						${listen}
					</p>
					<p class="lx-links">${s.lyrics.trim() ? `<a class="lx-back link" href="/lyrics/${s.id}/">Song page</a>` : ''}<a class="lx-back link" href="#songs">All songs</a></p>
				</div>
				${body}
			</div>
		</section>`;
	})
	.join('\n');

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': songs.map((s) => ({
		'@type': 'MusicRecording',
		name: s.title,
		url: `${SITE}/lyrics/#${s.id}`,
		datePublished: s.releaseDate,
		byArtist: { '@type': 'Person', '@id': `${SITE}/#ryland`, name: 'RYLAND', url: `${SITE}/` },
		...(s.release && s.release !== s.title ? { inAlbum: { '@type': 'MusicAlbum', name: s.release } } : {}),
	})),
};

const first = songs[songs.length - 1];
const last = songs[0];
const desc = `Lyrics to RYLAND songs from ${first.title} (${first.releaseDate.slice(0, 4)}) to ${last.title} (${last.releaseDate.slice(0, 4)}), including the album *Showing Friends, with release dates and where to listen.`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>RYLAND lyrics | every song, ${first.releaseDate.slice(0, 4)} to ${last.releaseDate.slice(0, 4)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/lyrics/">
<meta name="theme-color" content="#0e0d0c">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="32x32" href="/fish-tab-32.png">
<link rel="apple-touch-icon" href="/fish-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="RYLAND">
<meta property="og:title" content="RYLAND lyrics">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/lyrics/">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fragment+Mono&amp;family=Schibsted+Grotesk:wght@400..900&amp;display=swap">
<link rel="stylesheet" href="/site/site.css">
<style>
  html { scroll-behavior: smooth; }
  .lx-head { padding: 24px 0 56px; }
  .lx-head .lede { margin-top: 16px; max-width: 46ch; }
  .lx-index { list-style: none; padding: 0; margin: 40px 0 0; columns: 2; column-gap: 48px; }
  .lx-index li { break-inside: avoid; border-top: 1px solid var(--line); }
  .lx-index a { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; color: var(--ink); text-decoration: none; }
  .lx-index a:hover .lx-index__t { color: var(--accent); }
  .lx-index__d { color: var(--muted); font-size: var(--t-small); white-space: nowrap; }
  .lx-song { border-top: 1px solid var(--line); padding: 56px 0; scroll-margin-top: 8px; }
  .lx-song__grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  .lx-side h2 { font-size: var(--t-h2); }
  .lx-meta { color: var(--muted); font-size: var(--t-small); margin-top: 8px; }
  .lx-links { display: flex; gap: 20px; margin-top: 16px; }
  .lx-back { display: inline-block; margin-top: 4px; font-size: var(--t-small); color: var(--muted); }
  .lx-lyrics { font-size: var(--t-lead); line-height: 1.7; max-width: 52ch; }
  .lx-pending { color: var(--muted); }
  @media (min-width: 1024px) {
    .lx-song__grid { grid-template-columns: 5fr 7fr; gap: 48px; }
    .lx-side { position: sticky; top: 32px; align-self: start; }
  }
  @media (max-width: 760px) {
    .lx-index { columns: 1; }
    .lx-song { padding: 40px 0; }
  }
</style>
</head>
<body>
<!-- Generated by scripts/build-lyrics-page.js from src/assets/lyrics.json; edit those, not this file. -->
<header class="top">
  <div class="wrap top__row">
    <a class="wordmark" href="/" translate="no" style="color:inherit;text-decoration:none">RYLAND</a>
    <div class="top__meta">
      <a class="btn btn--secondary top__btn" href="/">Open the phone</a>
    </div>
  </div>
</header>
<main id="main">
	<section class="lx-head" id="songs" aria-labelledby="lx-h">
		<div class="wrap">
			<p class="eyebrow">Songs and lyrics<span class="eyebrow__sep"> · </span><span class="eyebrow__date">RYLAND</span></p>
			<h1 id="lx-h">Lyrics</h1>
			<p class="lede">Every RYLAND song, newest first.</p>
			<ol class="lx-index">
${index}
			</ol>
		</div>
	</section>
${sections}
</main>
<footer class="foot">
  <div class="wrap foot__row">
    <p class="wordmark wordmark--xl" translate="no" aria-hidden="true">RYLAND</p>
    <p class="foot__line">RYLAND · Portland, Oregon · <a class="link" href="/">myphone.digital</a> · <a class="link" href="/about/">About</a> · <a class="link" href="/press/">Press</a> · <a class="link" href="/contact/">Contact</a> · <a class="link" href="${ARTIST_URL}">Spotify</a></p>
  </div>
</footer>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`lyrics page: ${songs.length} songs, ${withLyrics} with lyrics -> ${path.relative(ROOT, OUT)}`);

// ---------------------------------------------------------------------------
// One page per song with lyrics: /lyrics/<slug>/ (cover, preview player when the
// sync catalogue has one, listen links, lyrics). Styled with /site/site.css like
// the About page. Songs without lyrics yet get no page; their index row keeps
// pointing at the anchor on /lyrics/.
// ---------------------------------------------------------------------------
const SYNC_DIR = path.join(ROOT, 'public/ryland');
const SYNC = fs.readFileSync(path.join(SYNC_DIR, 'bodega-sync/index.html'), 'utf8');
const SITE_DIR = path.join(ROOT, 'public/site');
const unent = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

const syncSongs = JSON.parse(SYNC.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)[1]).songs;
const syncByTitle = Object.fromEntries(syncSongs.map((s) => [unent(s.title), s]));
const appleByTitle = {};
for (const m of SYNC.matchAll(/href="([^"]+)"[^>]*aria-label="Apple Music: ([^"]+)"/g)) appleByTitle[unent(m[2])] = m[1];
const trackLi = {};
for (const m of SYNC.matchAll(/<li class="track">[\s\S]*?<\/li>/g)) trackLi[m[0].match(/data-play="([^"]+)"/)[1]] = m[0];
const dockHtml = SYNC.match(/<section class="dock"[\s\S]*?<\/section>/)[0];

const artByTitle = {};
for (const m of lib.matchAll(/title: (?:'((?:[^'\\]|\\.)*)'|"([^"]*)"),.*?artworkLarge: '([^']*)'/g)) {
	artByTitle[(m[1] ?? m[2]).replace(/\\'/g, "'")] = m[3];
}

const toSite = (rel) => {
	// copy a sync asset (../assets/x/y) into public/site/x/y and return its URL
	const r = rel.replace('../assets/', '');
	fs.mkdirSync(path.dirname(path.join(SITE_DIR, r)), { recursive: true });
	fs.copyFileSync(path.join(SYNC_DIR, 'assets', r), path.join(SITE_DIR, r));
	return `/site/${r}`;
};
const longDate = (iso) => {
	const [y, m, d] = iso.split('-').map(Number);
	return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${d}, ${y}`;
};

const withPages = songs.filter((s) => s.lyrics.trim());
let pages = 0;
withPages.forEach((s, i) => {
	const newer = withPages[i - 1];
	const older = withPages[i + 1];
	const sync = syncByTitle[s.title];
	const art = artByTitle[s.title];
	const sc = soundcloud[s.title];
	const spotify = sync?.spotify || spotifyUrl(s.title);
	const apple = appleByTitle[s.title];
	const fromRelease = s.release && s.release !== s.title;
	const url = `${SITE}/lyrics/${s.id}/`;
	const firstLine = s.lyrics.trim().split('\n')[0].trim();
	const desc = `Lyrics to “${s.title}” by RYLAND, released ${longDate(s.releaseDate)}${fromRelease ? ` on ${s.release}` : ''}. Listen on Spotify${apple ? ', Apple Music' : ''}${sc ? ' and SoundCloud' : ''}.`;

	let player = '';
	let data = '';
	if (sync && trackLi[sync.id]) {
		const li = trackLi[sync.id]
			.replace(/<a class="track__link" href="#[^"]+">([\s\S]*?)<\/a>/, '<span class="track__link">$1</span>')
			.replace(/<span class="track__frag">[\s\S]*?<\/span>(?=\s*<\/div>)/, `<span class="track__frag">${esc(sync.preview)}</span>`)
			.replace(/src="\.\.\/assets\/([^"]+)"/g, (_, r) => `src="${toSite('../assets/' + r)}"`);
		player = `\n        <ol class="tracks tracks--catalog" aria-label="Preview">\n          ${li}\n        </ol>`;
		const song = { ...sync, audio: toSite(sync.audio), cover: toSite(sync.cover) };
		data = `${dockHtml.replace(/src="\.\.\/assets\/([^"]+)"/g, (_, r) => `src="${toSite('../assets/' + r)}"`)}
<div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
<script type="application/json" id="data">${JSON.stringify({ songs: [song] })}</script>`;
	}

	const links = [
		`<a class="btn btn--secondary" href="${esc(spotify)}" rel="noopener">Listen on Spotify</a>`,
		apple && `<a class="link" href="${esc(apple)}" rel="noopener">Apple Music</a>`,
		sc && `<a class="link" href="${esc(sc)}" rel="noopener">SoundCloud</a>`,
	].filter(Boolean).join('\n          ');

	const ld = {
		'@context': 'https://schema.org',
		'@type': 'MusicRecording',
		'@id': `${url}#recording`,
		name: s.title,
		url,
		datePublished: s.releaseDate,
		byArtist: { '@type': 'Person', '@id': `${SITE}/#ryland`, name: 'RYLAND', url: `${SITE}/` },
		...(art ? { image: `${SITE}${art}` } : {}),
		...(fromRelease ? { inAlbum: { '@type': 'MusicAlbum', name: s.release } } : {}),
		sameAs: [spotify.includes('/track/') && spotify, apple, sc].filter(Boolean),
		recordingOf: {
			'@type': 'MusicComposition',
			name: s.title,
			composer: { '@id': `${SITE}/#ryland` },
			lyrics: { '@type': 'CreativeWork', text: s.lyrics.trim() },
		},
	};

	const page = `<!doctype html>
<html lang="en" data-framing="artist">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(s.title)} lyrics | RYLAND</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0e0d0c">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="32x32" href="/fish-tab-32.png">
<link rel="apple-touch-icon" href="/fish-icon.png">
<meta property="og:type" content="music.song">
<meta property="og:site_name" content="RYLAND">
<meta property="og:title" content="${esc(s.title)} by RYLAND">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${art ? SITE + art : SITE + '/og-image.jpg'}">
<meta name="twitter:card" content="${art ? 'summary' : 'summary_large_image'}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fragment+Mono&amp;family=Schibsted+Grotesk:wght@400..900&amp;display=swap">
<link rel="stylesheet" href="/site/site.css">
${data ? '<script src="/site/site.js" defer></script>\n' : ''}<style>
  .hero { min-height: 0; padding-bottom: 32px; }
  .hero .hero__photo { aspect-ratio: 1 / 1; align-self: start; max-height: none; height: auto; }
  .sp-meta { color: var(--muted); margin-top: 12px; }
  .sp-links { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin-top: 24px; }
  .sp-hero .tracks { margin-top: 24px; min-height: 0; max-height: none; flex: none; }
  .sp-hero .hero__text { justify-content: flex-start; }
  .sp-lyrics { border-top: 1px solid var(--line); padding: 48px 0 56px; }
  .sp-lyrics h2 { font-size: var(--t-h2); margin-bottom: 24px; }
  .sp-lyrics p { font-size: var(--t-lead); line-height: 1.7; max-width: 52ch; }
  .sp-nav { border-top: 1px solid var(--line); padding: 24px 0 48px; display: flex; flex-wrap: wrap; gap: 12px 28px; color: var(--muted); font-size: var(--t-small); }
  main section.sp-lyrics, main section.sp-nav { min-height: 0; }
</style>
</head>
<body>
<!-- Generated by scripts/build-lyrics-page.js from src/assets/lyrics.json; edit those, not this file. -->
<header class="top">
  <div class="wrap top__row">
    <a class="wordmark" href="/" translate="no" style="color:inherit;text-decoration:none">RYLAND</a>
    <div class="top__meta">
      <a class="btn btn--secondary top__btn" href="/">Open the phone</a>
    </div>
  </div>
</header>
<main id="main">
  <section class="hero sp-hero" aria-labelledby="sp-h">
    <div class="wrap grid hero__grid">
      <div class="hero__text">
        <p class="eyebrow"><a class="link" href="/lyrics/">Lyrics</a><span class="eyebrow__sep"> · </span><span class="eyebrow__date">RYLAND</span></p>
        <h1 id="sp-h">${esc(s.title)}</h1>
        <p class="sp-meta">RYLAND · ${fromRelease ? `${esc(s.release)} · ` : ''}${longDate(s.releaseDate)}</p>${player}
        <div class="sp-links">
          ${links}
        </div>
      </div>${art ? `
      <div class="hero__photo frame">
        <img src="${esc(art)}" width="600" height="600" alt="Cover art for ${esc(s.title)}" fetchpriority="high" decoding="async">
      </div>` : ''}
    </div>
  </section>
  <section class="sp-lyrics" aria-labelledby="sp-lyr-h">
    <div class="wrap">
      <h2 id="sp-lyr-h">Lyrics</h2>
      <p>${esc(s.lyrics.trim()).replace(/\n/g, '<br>\n')}</p>
    </div>
  </section>
  <nav class="sp-nav-wrap" aria-label="More songs">
    <div class="wrap sp-nav">
      ${newer ? `<span>Newer: <a class="link" href="/lyrics/${newer.id}/">${esc(newer.title)}</a></span>` : ''}
      ${older ? `<span>Older: <a class="link" href="/lyrics/${older.id}/">${esc(older.title)}</a></span>` : ''}
      <span><a class="link" href="/lyrics/">All lyrics</a></span>
    </div>
  </nav>
</main>
<footer class="foot">
  <div class="wrap foot__row">
    <p class="wordmark wordmark--xl" translate="no" aria-hidden="true">RYLAND</p>
    <p class="foot__line">RYLAND · Portland, Oregon · <a class="link" href="/">myphone.digital</a> · <a class="link" href="/about/">About</a> · <a class="link" href="/lyrics/">Lyrics</a> · <a class="link" href="/press/">Press</a> · <a class="link" href="/contact/">Contact</a></p>
  </div>
</footer>
${data}
</body>
</html>
`;
	const dir = path.join(ROOT, 'public/lyrics', s.id);
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, 'index.html'), page);
	pages++;
});
console.log(`song pages: ${pages} -> public/lyrics/<slug>/`);

// Sitemap: the hand-made pages plus every song page, so a new song's page is
// listed as soon as its lyrics are added.
const today = new Date().toISOString().slice(0, 10);
const fixed = [
	['/', 'weekly', '1.0'],
	['/about/', 'monthly', '0.8'],
	['/lyrics/', 'weekly', '0.8'],
	['/press/', 'monthly', '0.7'],
	['/contact/', 'monthly', '0.6'],
];
const urlTag = (loc, freq, pri) =>
	`  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...fixed.map((f) => urlTag(...f)), ...withPages.map((s) => urlTag(`/lyrics/${s.id}/`, 'monthly', '0.6'))].join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), sitemap);
console.log(`sitemap: ${fixed.length + withPages.length} urls`);
