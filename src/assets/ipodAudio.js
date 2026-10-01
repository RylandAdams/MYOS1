/**
 * Self-hosted audio for the iPod player.
 *
 * Songs listed here stream from Firebase Storage (music/ folder) through the
 * built-in player. Songs not listed fall back to the SoundCloud widget.
 *
 * Filled in by: node scripts/upload-music.js "<folder of WAVs>"
 * Keys are track titles, lowercased, matching ipodLibrary.js.
 */
const STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/myos1-8e625.appspot.com/o/music%2F';

export const HOSTED_AUDIO = {
	// 'denial': 'denial.m4a',
};

export function hostedAudioUrl(track) {
	if (track?.audioUrl) return track.audioUrl;
	const file = HOSTED_AUDIO[(track?.title || '').trim().toLowerCase()];
	return file ? `${STORAGE_BASE}${encodeURIComponent(file)}?alt=media` : null;
}
