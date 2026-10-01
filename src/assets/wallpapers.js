/**
 * Wallpaper options – Classic, iconic iOS 1, and fun picks. All self-hosted in public/wallpapers
 * (the three photos are from Unsplash, free licence) so nothing loads from another site.
 */
export const WALLPAPERS = [
	{
		id: 'default',
		label: 'Classic',
		type: 'gradient',
		value: 'linear-gradient(to bottom left, rgb(105, 105, 105) 0%, rgb(50, 50, 50) 45%, rgb(15, 15, 15) 75%, rgb(0, 0, 0) 100%)',
	},
	{
		id: 'neon',
		label: 'Neon Dreams',
		type: 'image',
		value: '/wallpapers/neon.jpg',
	},
	{
		id: 'blue-marble',
		label: 'Blue Marble',
		type: 'image',
		value: '/wallpapers/blue-marble.jpg',
	},
	{
		id: 'clownfish',
		label: 'Clownfish',
		type: 'image',
		value: '/wallpapers/clownfish.png',
	},
	{
		id: 'cat',
		label: 'Cat',
		type: 'image',
		value: '/wallpapers/cat.jpg',
	},
];
