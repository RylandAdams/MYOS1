/**
 * Phone UI sounds, synthesized with Web Audio (no audio files).
 * Off by default; visitors turn them on in Settings → Sounds.
 * Character follows the music: soft on top, heavy underneath.
 */
const KEY = 'myos-ui-sounds';
const listeners = new Set();
let ctx = null;

export const soundsEnabled = () => {
	try {
		return localStorage.getItem(KEY) === 'on';
	} catch {
		return false;
	}
};

export const setSoundsEnabled = (on) => {
	try {
		localStorage.setItem(KEY, on ? 'on' : 'off');
	} catch {}
	listeners.forEach((fn) => fn(on));
	if (on) playSound('tap');
};

export const onSoundsChange = (fn) => {
	listeners.add(fn);
	return () => listeners.delete(fn);
};

const audio = () => {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!Ctx) return null;
	if (!ctx) ctx = new Ctx();
	if (ctx.state === 'suspended') ctx.resume().catch(() => {});
	return ctx;
};

const noiseBuffer = (c, seconds) => {
	const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return buf;
};

/** Short filtered noise burst – the body of every click */
const click = (c, at, { freq = 2400, q = 1.2, gain = 0.25, decay = 0.03 } = {}) => {
	const src = c.createBufferSource();
	src.buffer = noiseBuffer(c, decay + 0.02);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.value = freq;
	bp.Q.value = q;
	const g = c.createGain();
	g.gain.setValueAtTime(gain, at);
	g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
	src.connect(bp).connect(g).connect(c.destination);
	src.start(at);
	src.stop(at + decay + 0.02);
};

/** Low sine thump – the weight under the click */
const thump = (c, at, { from = 120, to = 45, gain = 0.35, decay = 0.12 } = {}) => {
	const o = c.createOscillator();
	o.type = 'sine';
	o.frequency.setValueAtTime(from, at);
	o.frequency.exponentialRampToValueAtTime(to, at + decay);
	const g = c.createGain();
	g.gain.setValueAtTime(gain, at);
	g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
	o.connect(g).connect(c.destination);
	o.start(at);
	o.stop(at + decay + 0.02);
};

const SOUNDS = {
	/** Opening an app */
	tap: (c, t) => {
		click(c, t, { freq: 3200, gain: 0.12, decay: 0.018 });
		thump(c, t, { from: 160, to: 70, gain: 0.12, decay: 0.05 });
	},
	/** Home button – a firmer press */
	home: (c, t) => {
		click(c, t, { freq: 1800, gain: 0.18, decay: 0.025 });
		thump(c, t, { from: 110, to: 50, gain: 0.3, decay: 0.09 });
	},
	/** Sleep/wake – the double lock click */
	lock: (c, t) => {
		click(c, t, { freq: 2600, gain: 0.22, decay: 0.02 });
		thump(c, t, { from: 140, to: 55, gain: 0.25, decay: 0.06 });
		click(c, t + 0.07, { freq: 1500, gain: 0.16, decay: 0.03 });
	},
	/** Power on – a low swell under a soft high shimmer */
	boot: (c, t) => {
		const sub = c.createOscillator();
		sub.type = 'sine';
		sub.frequency.setValueAtTime(38, t);
		sub.frequency.exponentialRampToValueAtTime(55, t + 1.6);
		const sg = c.createGain();
		sg.gain.setValueAtTime(0.0001, t);
		sg.gain.exponentialRampToValueAtTime(0.45, t + 0.5);
		sg.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
		sub.connect(sg).connect(c.destination);
		sub.start(t);
		sub.stop(t + 2.5);

		[880, 1320].forEach((f, i) => {
			const o = c.createOscillator();
			o.type = 'triangle';
			o.frequency.value = f;
			const g = c.createGain();
			g.gain.setValueAtTime(0.0001, t + 0.35 + i * 0.12);
			g.gain.exponentialRampToValueAtTime(0.035, t + 0.6 + i * 0.12);
			g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
			o.connect(g).connect(c.destination);
			o.start(t + 0.35 + i * 0.12);
			o.stop(t + 2.3);
		});
	},
};

export const playSound = (name) => {
	if (!soundsEnabled()) return;
	try {
		const c = audio();
		if (!c || !SOUNDS[name]) return;
		SOUNDS[name](c, c.currentTime + 0.005);
	} catch {}
};
