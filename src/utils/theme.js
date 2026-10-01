/**
 * Appearance: light (default) or dark – the black, glossy look of the Files player across the phone.
 * Applied as .themeDark on .iphoneContent (see darkTheme.css). Remembered per visitor.
 */
const KEY = 'myos-theme';
const listeners = new Set();

export const getTheme = () => {
	try {
		return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
	} catch {
		return 'light';
	}
};

export const applyTheme = (theme = getTheme()) => {
	document.querySelector('.iphoneContent')?.classList.toggle('themeDark', theme === 'dark');
};

export const setTheme = (theme) => {
	try {
		localStorage.setItem(KEY, theme);
	} catch {}
	applyTheme(theme);
	listeners.forEach((fn) => fn(theme));
};

export const onThemeChange = (fn) => {
	listeners.add(fn);
	return () => listeners.delete(fn);
};
