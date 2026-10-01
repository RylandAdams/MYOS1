/**
 * The Calendar icon shows today's weekday and date, like the real home screen (the bitmap said
 * "Tuesday 9" forever). Drawn once per day on a canvas in the iPhone OS style and cached.
 */
let cache = { key: '', url: '' };

export function calendarIconUrl() {
	const now = new Date();
	const key = now.toDateString();
	if (cache.key === key) return cache.url;
	try {
		const S = 228;
		const c = document.createElement('canvas');
		c.width = S;
		c.height = S;
		const g = c.getContext('2d');
		const r = 40;
		g.beginPath();
		g.roundRect(0, 0, S, S, r);
		g.clip();
		// paper
		const paper = g.createLinearGradient(0, 0, 0, S);
		paper.addColorStop(0, '#ffffff');
		paper.addColorStop(1, '#e4e5e8');
		g.fillStyle = paper;
		g.fillRect(0, 0, S, S);
		// red header band
		const band = g.createLinearGradient(0, 0, 0, 62);
		band.addColorStop(0, '#f2615c');
		band.addColorStop(0.5, '#d9302b');
		band.addColorStop(1, '#b81c18');
		g.fillStyle = band;
		g.fillRect(0, 0, S, 62);
		g.fillStyle = 'rgba(0,0,0,0.25)';
		g.fillRect(0, 62, S, 2);
		// weekday
		g.fillStyle = '#fff';
		g.textAlign = 'center';
		g.textBaseline = 'middle';
		g.font = '700 34px "Helvetica Neue", Helvetica, Arial, sans-serif';
		g.shadowColor = 'rgba(0,0,0,0.35)';
		g.shadowOffsetY = -1;
		g.fillText(now.toLocaleDateString('en-US', { weekday: 'long' }), S / 2, 33);
		// date
		g.shadowColor = 'rgba(255,255,255,0.9)';
		g.shadowOffsetY = 2;
		g.fillStyle = '#1a1a1c';
		g.font = '700 128px "Helvetica Neue", Helvetica, Arial, sans-serif';
		g.fillText(String(now.getDate()), S / 2, 146);
		// gloss
		g.shadowColor = 'transparent';
		const gl = g.createLinearGradient(0, 0, 0, S * 0.5);
		gl.addColorStop(0, 'rgba(255,255,255,0.45)');
		gl.addColorStop(1, 'rgba(255,255,255,0.04)');
		g.fillStyle = gl;
		g.beginPath();
		g.moveTo(0, 0);
		g.lineTo(S, 0);
		g.lineTo(S, S * 0.36);
		g.quadraticCurveTo(S / 2, S * 0.5, 0, S * 0.36);
		g.closePath();
		g.fill();
		cache = { key, url: c.toDataURL('image/png') };
	} catch {
		cache = { key, url: '' };
	}
	return cache.url;
}

/** The image to show for an app icon (live Calendar, otherwise its bitmap) */
export const iconFor = (app) => (app?.appName === 'Calendar' && calendarIconUrl()) || app?.appImage;
