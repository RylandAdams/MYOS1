/**
 * Icon grid listing (matches iOS Files audio rows).
 *
 * Fields:
 * - modifiedTime — e.g. "6:28 AM" (shown as second line; omit to hide).
 * - storage — omit to default to "On My Phone".
 * - peaks — optional waveform (array of 0–1 values); without it the player draws a neutral pattern.
 *
 * Place media under `public/files-demos/` and use `/files-demos/your.mp3`.
 */
export const FILES_DEMO_TRACKS = [
	{
		id: 'demo-shockcollar-older-raw-vocals',
		title: 'ShockCollar',
		src: '/files-demos/shockcollar-older-raw-vocals.m4a',
		modifiedTime: '7.1.25',
		// Loudness shape for the player's waveform, precomputed from the master WAV (120 bins, 0–1)
		peaks: [0.12, 0.12, 0.25, 0.34, 0.21, 0.23, 0.36, 0.27, 0.23, 0.47, 0.53, 0.64, 0.79, 0.57, 0.44, 0.36, 0.31, 0.27, 0.23, 0.31, 0.36, 0.39, 0.27, 0.29, 0.31, 0.47, 0.29, 0.39, 0.36, 0.36, 0.23, 0.27, 0.25, 0.29, 0.34, 0.34, 0.23, 0.31, 0.23, 0.41, 0.29, 0.31, 0.39, 0.44, 0.31, 0.29, 0.31, 0.39, 0.36, 0.34, 0.25, 0.27, 0.31, 0.23, 0.27, 0.27, 0.23, 0.27, 0.23, 0.16, 0.2, 0.39, 0.29, 0.31, 0.34, 0.31, 0.39, 0.53, 0.27, 0.39, 0.36, 0.23, 0.34, 0.23, 0.27, 0.29, 0.5, 0.39, 0.5, 0.5, 0.47, 0.39, 0.39, 0.34, 0.39, 0.34, 0.29, 0.29, 0.41, 0.12, 0.12, 0.34, 0.44, 0.44, 0.39, 0.34, 0.53, 0.34, 0.75, 1.0, 0.91, 0.79, 0.96, 0.71, 0.39, 0.57, 0.47, 0.91, 0.57, 0.75, 0.41, 0.96, 0.41, 0.2, 0.2, 0.16, 0.17, 0.25, 0.16, 0.17],
	},
];
