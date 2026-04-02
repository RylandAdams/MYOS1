import calender from './imgs/calender.png';
import photos from './imgs/photos.png';
import weather from './imgs/weather.png';
import ipod from './imgs/ipod.png';
import insta from './imgs/Instagram.png';
import youtube from './imgs/youtube.png';
import apple from './imgs/apple.png';
import spotify from './imgs/spotify.png';
import soundcloud from './imgs/soundcloud.png';
import flappybird from './imgs/flappybird.png';
import mail from './imgs/mail.png';
import safari from './imgs/safari.png';
import settings from './imgs/settings.png';

export const EXTRAS_APPS = [
	{ id: 'extras-1', appName: 'Calender', appImage: calender, path: '/calender' },
	{ id: 'extras-2', appName: 'Safari', appImage: safari, path: '/news' },
	{ id: 'extras-3', appName: 'Weather', appImage: weather, path: '/weather' },
	{ id: 'extras-4', appName: 'Settings', appImage: settings, path: '/settings' },
];

export const MAINAPPS = [
	{
		id: 'folder-extras',
		isFolder: true,
		folderName: 'Extras',
		apps: EXTRAS_APPS,
	},
	{
		id: 2,
		appName: 'Photos',
		appImage: photos,
	},
	{
		id: 4,
		appName: 'YouTube',
		appImage: youtube,
		url: 'https://youtube.com/@RYLANDOfficial',
	},
	{
		id: 7,
		appName: 'SoundCloud',
		appImage: soundcloud,
		url: 'https://soundcloud.com/rylandofficialmusic/tracks',
	},
	{
		id: 5,
		appName: 'Apple',
		appImage: apple,
		url: 'https://music.apple.com/us/artist/ryland/1620591111',
	},
	{
		id: 6,
		appName: 'Spotify',
		appImage: spotify,
		url: 'https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A',
	},
];

export const FOOTERAPPS = [
	{
		id: 1,
		appName: 'Instagram',
		appImage: insta,
		url: 'https://instagram.com/ryland.wav?igshid=MjEwN2IyYWYwYw==',
	},
	{
		id: 2,
		appName: 'FlappyBird',
		appImage: flappybird,
		path: '/flappyBird',
	},
	{
		id: 3,
		appName: 'Ipod',
		appImage: ipod,
		path: '/ipod',
	},
	{
		id: 4,
		appName: 'Email Me',
		appImage: mail,
		url: 'mailto:rylandofficial@yahoo.com',
	},
];
