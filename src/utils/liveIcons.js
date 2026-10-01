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

/** Weather icon: sun by day, moon at night, and the visitor's last temperature if Weather has run */
let wcache = { key: '', url: '' };
export function weatherIconUrl() {
	let temp = null;
	try {
		const c = JSON.parse(localStorage.getItem('weather:current:v5') || 'null');
		if (c?.data?.current && Date.now() - c.when < 6 * 3600 * 1000) temp = Math.round(c.data.current.temperature_2m);
	} catch {}
	const h = new Date().getHours();
	const night = h >= 20 || h < 6;
	const key = `${night}-${temp}`;
	if (wcache.key === key) return wcache.url;
	try {
		const S = 228;
		const c = document.createElement('canvas');
		c.width = S;
		c.height = S;
		const g = c.getContext('2d');
		g.beginPath();
		g.roundRect(0, 0, S, S, 40);
		g.clip();
		const sky = g.createLinearGradient(0, 0, 0, S);
		if (night) {
			sky.addColorStop(0, '#4b3f8f');
			sky.addColorStop(1, '#1f1848');
		} else {
			sky.addColorStop(0, '#5aa7ea');
			sky.addColorStop(1, '#1f5fb4');
		}
		g.fillStyle = sky;
		g.fillRect(0, 0, S, S);
		const cx = S / 2;
		const cy = temp == null ? S * 0.5 : S * 0.4;
		if (night) {
			const m = g.createLinearGradient(0, cy - 50, 0, cy + 50);
			m.addColorStop(0, '#fffbe0');
			m.addColorStop(1, '#d8d2a8');
			g.fillStyle = m;
			g.beginPath();
			g.arc(cx, cy, 46, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = night ? '#3d3279' : '#000';
			g.beginPath();
			g.arc(cx + 24, cy - 16, 40, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = 'rgba(255,255,255,0.8)';
			[[40, 40, 3], [180, 60, 2.5], [60, 170, 2], [176, 150, 3], [120, 28, 2]].forEach(([x, y, r]) => {
				g.beginPath();
				g.arc(x, y, r, 0, Math.PI * 2);
				g.fill();
			});
		} else {
			const glow = g.createRadialGradient(cx, cy, 30, cx, cy, 90);
			glow.addColorStop(0, 'rgba(255,224,102,0.6)');
			glow.addColorStop(1, 'rgba(255,224,102,0)');
			g.fillStyle = glow;
			g.fillRect(0, 0, S, S);
			const sun = g.createRadialGradient(cx - 12, cy - 14, 6, cx, cy, 52);
			sun.addColorStop(0, '#fff6a8');
			sun.addColorStop(0.55, '#ffd21f');
			sun.addColorStop(1, '#f39a00');
			g.fillStyle = sun;
			g.beginPath();
			g.arc(cx, cy, 50, 0, Math.PI * 2);
			g.fill();
		}
		if (temp != null) {
			g.fillStyle = '#fff';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.font = '700 58px "Helvetica Neue", Helvetica, Arial, sans-serif';
			g.shadowColor = 'rgba(0,0,0,0.4)';
			g.shadowOffsetY = 2;
			g.fillText(`${temp}°`, cx + 6, S * 0.8);
			g.shadowColor = 'transparent';
		}
		const gl = g.createLinearGradient(0, 0, 0, S * 0.5);
		gl.addColorStop(0, 'rgba(255,255,255,0.4)');
		gl.addColorStop(1, 'rgba(255,255,255,0.03)');
		g.fillStyle = gl;
		g.beginPath();
		g.moveTo(0, 0);
		g.lineTo(S, 0);
		g.lineTo(S, S * 0.36);
		g.quadraticCurveTo(S / 2, S * 0.5, 0, S * 0.36);
		g.closePath();
		g.fill();
		wcache = { key, url: c.toDataURL('image/png') };
	} catch {
		wcache = { key, url: '' };
	}
	return wcache.url;
}

/** The image to show for an app icon (live Calendar/Weather, otherwise its bitmap) */
export const iconFor = (app) =>
	(app?.appName === 'Calendar' && calendarIconUrl()) || (app?.appName === 'Weather' && weatherIconUrl()) || app?.appImage;
