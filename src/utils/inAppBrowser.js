/** Instagram / Facebook / etc. embedded browsers — separate cache, flaky SW + noscript. */
export function isInAppBrowser() {
	if (typeof window !== 'undefined' && window.__MYOS_IN_APP_BROWSER === true) {
		return true;
	}
	const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
	return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Twitter|Line\//i.test(ua);
}

export function unregisterServiceWorkers() {
	if (!('serviceWorker' in navigator)) return Promise.resolve();
	return navigator.serviceWorker.getRegistrations().then((regs) =>
		Promise.all(regs.map((reg) => reg.unregister()))
	);
}
