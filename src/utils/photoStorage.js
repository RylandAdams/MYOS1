/**
 * Bundled photo albums – images live in public/photos/<place>/
 * Add place id and image count when you add new albums.
 */
export const LOCAL_PLACES = { mexico: 73 };

/** Appended after `001.jpg` … `{count}.jpg` for Mexico only */
const MEXICO_EXTRA_PHOTOS = [
	{ src: '/photos/mexico/grinch-organillo-night.png' },
	{ src: '/photos/mexico/subway-motion-blur.png' },
	{ src: '/photos/mexico/feast-mural-staircase-collage.png' },
	{ src: '/photos/mexico/frida-hallway-pesos-collage.png' },
	{ src: '/photos/mexico/soumaya-david-gallery.png' },
	{ src: '/photos/mexico/convenience-store-drinks.png' },
	{ src: '/photos/mexico/cathedral-golden-altar.png' },
	{ src: '/photos/mexico/angel-lanterns-stickers-collage.png' },
];

function getLocalUrls(placeId) {
	const count = LOCAL_PLACES[placeId];
	if (!count) return [];
	return Array.from({ length: count }, (_, i) => ({
		src: `/photos/${placeId}/${String(i + 1).padStart(3, '0')}.jpg`,
	}));
}

export function isLocalPlace(placeId) {
	return placeId in LOCAL_PLACES;
}

export function getLocalPhotoList(placeId) {
	const base = getLocalUrls(placeId);
	if (placeId === 'mexico') {
		return [...base, ...MEXICO_EXTRA_PHOTOS];
	}
	return base;
}

/**
 * Preloads bundled photos in the background when home screen is shown.
 * Uses requestIdleCallback so it doesn't block the main thread.
 */
export function preloadStoragePhotos() {
	const run = () => {
		Object.keys(LOCAL_PLACES).forEach((placeId) => {
			getLocalPhotoList(placeId).forEach(({ src }) => {
				const img = new Image();
				img.src = src;
			});
		});
	};

	if (typeof requestIdleCallback !== 'undefined') {
		requestIdleCallback(run, { timeout: 3000 });
	} else {
		setTimeout(run, 1500);
	}
}
