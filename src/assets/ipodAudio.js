/**
 * Self-hosted audio for the iPod player.
 *
 * Songs listed here stream from Firebase Storage (music/ folder) through the
 * built-in player. Songs not listed fall back to the SoundCloud widget.
 *
 * Filled in by: node scripts/upload-music.js "<folder of WAVs>"
 * Keys are track titles, lowercased, matching ipodLibrary.js.
 */
const STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/myos1-8e625.firebasestorage.app/o/music%2F';

export const HOSTED_AUDIO = {
	'02.23.23 channel 42': '02-23-23-channel-42.m4a',
	'04.04.23 west of alagor': '04-04-23-west-of-alagor.m4a',
	'06.04.22 dance alone': '06-04-22-dance-alone.m4a',
	'08.08.23 face2face': '08-08-23-face2face.m4a',
	'08.16.23 let me down': '08-16-23-let-me-down.m4a',
	'08.18.23 glisan': '08-18-23-glisan.m4a',
	'09.01.23 daylight': '09-01-23-daylight.m4a',
	'09.08.23 cops in the head': '09-08-23-cops-in-the-head.m4a',
	"09.16.22 something that'll": '09-16-22-something-thatll.m4a',
	'10.18.22 chickenhoney': '10-18-22-chickenhoney.m4a',
	'a couple nights ago': 'a-couple-nights-ago.m4a',
	'be that girl again': 'be-that-girl-again.m4a',
	'country ibuprofen': 'country-ibuprofen.m4a',
	'denial': 'denial.m4a',
	'dont fall in love with me': 'dont-fall-in-love-with-me.m4a',
	'dopamine': 'dopamine.m4a',
	'everlasting': 'everlasting.m4a',
	'get by rn': 'get-by-rn.m4a',
	'know': 'know.m4a',
	'looking for you': 'looking-for-you.m4a',
	'pretty with short hair': 'pretty-with-short-hair.m4a',
	'screamin': 'screamin.m4a',
	'so delighted when she speaks': 'so-delighted-when-she-speaks.m4a',
	'summer nights': 'summer-nights.m4a',
	'switchblade (fu)': 'switchblade-fu.m4a',
	'throw your hands up': 'throw-your-hands-up.m4a',
	'tough': 'tough.m4a',
};

export function hostedAudioUrl(track) {
	if (track?.audioUrl) return track.audioUrl;
	const file = HOSTED_AUDIO[(track?.title || '').trim().toLowerCase()];
	return file ? `${STORAGE_BASE}${encodeURIComponent(file)}?alt=media` : null;
}
