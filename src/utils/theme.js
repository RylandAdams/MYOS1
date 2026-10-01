/**
 * Appearance. Default is Automatic: dark from 9 PM to 5 AM in the visitor's own time zone, light
 * otherwise (the phone's night). Settings can turn Automatic off and pick Dark or Light by hand.
 * Applied as .themeDark on .iphoneContent (see darkTheme.css). Remembered per visitor.
 */
const MODE_KEY = 'myos-theme-mode'; // 'auto' | 'manual'
const THEME_KEY = 'myos-theme'; // manual choice: 'dark' | 'light'
const NIGHT_START = 21; // 9 PM
const NIGHT_END = 5; // 5 AM
const listeners = new Set();
let timer = 0;

const read = (k) => {
	try {
		return localStorage.getItem(k);
	} catch {
		return null;
	}
};
const write = (k, v) => {
	try {
		localStorage.setItem(k, v);
	} catch {}
};

export const isNight = (d = new Date()) => d.getHours() >= NIGHT_START || d.getHours() < NIGHT_END;
export const getMode = () => (read(MODE_KEY) === 'manual' ? 'manual' : 'auto');
export const getTheme = () => {
	if (getMode() === 'auto') return isNight() ? 'dark' : 'light';
	return read(THEME_KEY) === 'dark' ? 'dark' : 'light';
};

const notify = () => {
	const t = getTheme();
	listeners.forEach((fn) => fn(t, getMode()));
};

export const applyTheme = () => {
	document.querySelector('.iphoneContent')?.classList.toggle('themeDark', getTheme() === 'dark');
	// In Automatic, flip at 9 PM / 5 AM while the page is open
	clearTimeout(timer);
	if (getMode() === 'auto') {
		const now = new Date();
		const next = new Date(now);
		next.setMinutes(0, 0, 0);
		if (isNight(now)) next.setHours(now.getHours() >= NIGHT_START ? 24 + NIGHT_END : NIGHT_END);
		else next.setHours(NIGHT_START);
		timer = setTimeout(() => {
			applyTheme();
			notify();
		}, Math.min(next - now + 500, 2 ** 31 - 1));
	}
};

/** Manual choice (also switches Automatic off) */
export const setTheme = (theme) => {
	write(MODE_KEY, 'manual');
	write(THEME_KEY, theme);
	applyTheme();
	notify();
};

export const setAutomatic = (on) => {
	write(MODE_KEY, on ? 'auto' : 'manual');
	if (!on) write(THEME_KEY, isNight() ? 'dark' : 'light'); // keep what's showing
	applyTheme();
	notify();
};

export const onThemeChange = (fn) => {
	listeners.add(fn);
	return () => listeners.delete(fn);
};
