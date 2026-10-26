import SONGS from '../../assets/lyrics.json';

/* One note per song, newest first like Notes sorts them. The same JSON builds /lyrics/
   (scripts/build-lyrics-page.js), so the anchors here match the headings there. */

// keep in sync with scripts/build-lyrics-page.js
export const slug = (title) =>
	title
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export const COMING_SOON = 'lyrics coming soon';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parts = (iso) => iso.split('-').map(Number);

/** 9/29/24, as the note list shows it */
export const shortDate = (iso) => {
	const [y, m, d] = parts(iso);
	return `${m}/${d}/${String(y).slice(2)}`;
};

/** September 29, 2024, above the note */
export const longDate = (iso) => {
	const [y, m, d] = parts(iso);
	return `${MONTHS[m - 1]} ${d}, ${y}`;
};

export const NOTES = SONGS.map((s, i) => ({ ...s, i }))
	.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.i - b.i)
	.map(({ i, ...s }) => {
		const body = s.lyrics.trim() ? s.lyrics : COMING_SOON;
		return {
			...s,
			id: slug(s.title),
			body,
			preview: body.split('\n').find((l) => l.trim()) || '',
			lyricsUrl: `/lyrics/#${slug(s.title)}`,
			spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`RYLAND ${s.title}`)}`,
		};
	});
