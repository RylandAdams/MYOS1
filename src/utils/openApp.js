/**
 * Open music/social links in the native app when possible.
 *
 * In-app browsers (Instagram, TikTok, Facebook…) load https links inside themselves instead of
 * handing them to installed apps, so Spotify shows its web page ("couldn't load this artist")
 * before it settles. Here, from those browsers:
 *   - Android: an intent:// URL – Android opens the app, or the browser_fallback_url if it isn't installed.
 *   - iPhone: the app's URL scheme, then the web page after a short wait if nothing took over.
 * Regular mobile browsers on Android also get the intent (it skips the "open with" chooser);
 * desktop and iPhone Safari/Chrome keep the plain link, which already works there.
 */

const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/i.test(ua);
export const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|musical_ly|BytedanceWebview|TikTok|Snapchat|LinkedInApp|Line\//i.test(ua);

const FALLBACK_MS = 1500;

/** Per-service: Android package and how to build the iOS app URL from the web URL */
const SERVICES = [
	{
		match: /(^|\.)open\.spotify\.com$/,
		androidPackage: 'com.spotify.music',
		// https://open.spotify.com/artist/ID → spotify:artist:ID
		ios: (u) => {
			const [type, id] = u.pathname.split('/').filter(Boolean);
			return type && id ? `spotify:${type}:${id}` : null;
		},
	},
	{
		match: /(^|\.)music\.apple\.com$/,
		androidPackage: 'com.apple.android.music',
		ios: (u) => `music://${u.host}${u.pathname}`,
	},
	{
		match: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/,
		androidPackage: 'com.google.android.youtube',
		ios: (u) => `youtube://www.youtube.com${u.pathname}${u.search}`,
	},
	{
		match: /(^|\.)instagram\.com$/,
		androidPackage: 'com.instagram.android',
		ios: (u) => {
			const user = u.pathname.split('/').filter(Boolean)[0];
			return user ? `instagram://user?username=${encodeURIComponent(user)}` : null;
		},
	},
	{
		match: /(^|\.)soundcloud\.com$/,
		androidPackage: 'com.soundcloud.android',
		ios: () => null, // the iOS app scheme needs internal numeric IDs; the web page is used instead
	},
];

/** Drop share-tracking params (si, igshid, utm_*) that can make in-app pages load oddly */
const cleanUrl = (u) => {
	['si', 'igshid', 'igsh', 'feature'].forEach((k) => u.searchParams.delete(k));
	[...u.searchParams.keys()].filter((k) => k.startsWith('utm_')).forEach((k) => u.searchParams.delete(k));
	return u;
};

const androidIntent = (u, pkg) =>
	`intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=${pkg};` +
	`S.browser_fallback_url=${encodeURIComponent(u.href)};end`;

/** Try the iOS app scheme; go to the web page if the app didn't open */
const openIOS = (appUrl, webUrl) => {
	let left = false;
	const onHide = () => {
		left = true;
	};
	document.addEventListener('visibilitychange', onHide, { once: true });
	window.addEventListener('pagehide', onHide, { once: true });
	window.addEventListener('blur', onHide, { once: true });
	window.setTimeout(() => {
		document.removeEventListener('visibilitychange', onHide);
		window.removeEventListener('pagehide', onHide);
		window.removeEventListener('blur', onHide);
		if (!left && !document.hidden) window.location.href = webUrl;
	}, FALLBACK_MS);
	window.location.href = appUrl;
};

/**
 * Call from a link's click handler. Returns true when it took over the navigation
 * (the caller should then preventDefault); false to let the link behave normally.
 */
export function openInApp(href) {
	let u;
	try {
		u = cleanUrl(new URL(href));
	} catch {
		return false;
	}
	const service = SERVICES.find((s) => s.match.test(u.hostname));
	if (!service) return false;

	if (isAndroid && (isInAppBrowser || /Mobile/i.test(ua))) {
		window.location.href = androidIntent(u, service.androidPackage);
		return true;
	}
	if (isIOS && isInAppBrowser) {
		const appUrl = service.ios(u);
		if (appUrl) openIOS(appUrl, u.href);
		else window.location.href = u.href;
		return true;
	}
	return false;
}
