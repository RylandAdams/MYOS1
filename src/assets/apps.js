import calender from './imgs/calender.png';
import photos from './imgs/photos.png';
import weather from './imgs/weather.png';
import ipod from './imgs/ipod.png';
import tiktok from './imgs/TikTok.png';
import insta from './imgs/Instagram.png';
import youtube from './imgs/youtube.jpg';
import apple from './imgs/apple.png';
import spotify from './imgs/spotify.png';
import soundcloud from './imgs/soundcloud.png';
import flappybird from './imgs/flappybird.png';
import messages from './imgs/messages.png';
import mail from './imgs/mail.png';
import safari from './imgs/safari.png';
import settings from './imgs/settings.png';

import IcalLink from './IcalLink/iCal-20230308-131800.ics';

import { isMacOs, isIOS } from 'react-device-detect';
var saveThedate = '';

/* OS DEPENDENT CALENDER LINKS */

// if (isMacOs === true || isIOS === true) {
// 	saveThedate = IcalLink;
// } else {
// 	saveThedate =
// 		'https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MmR2aGoyc3U0ZHM1c282bWNmMDNrdHRudHYgcnlsYW5kYWRhbXNAeWFob28uY29t&tmsrc=rylandadams%40yahoo.com';
// }

export const MAINAPPS = [
	{
		id: 1,
		appName: 'Calender',
		appImage: calender,
		url: saveThedate,
	},
	{
		id: 2,
		appName: 'Photos',
		appImage: photos,
	},
	{
		id: 3,
		appName: 'Weather',
		appImage: weather,
	},
	{
		id: 4,
		appName: 'Ipod',
		appImage: ipod,
	},
	{
		id: 5,
		appName: 'YouTube',
		appImage: youtube,
		url: 'https://youtube.com/@RYLANDOfficial',
	},
	{
		id: 6,
		appName: 'Apple',
		appImage: apple,
		url: 'https://music.apple.com/us/artist/ryland/1620591111',
	},
	{
		id: 7,
		appName: 'Spotify',
		appImage: spotify,
		url: 'https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A',
	},
	{
		id: 8,
		appName: 'SoundCloud',
		appImage: soundcloud,
		url: 'https://soundcloud.com/rylandofficialmusic/tracks',
	},
	{
		id: 9,
		appName: 'Instagram',
		appImage: insta,
		url: 'https://instagram.com/ryland.wav?igshid=MjEwN2IyYWYwYw==',
	},
	{
		id: 10,
		appName: 'TikTok',
		appImage: tiktok,
		url: 'https://www.tiktok.com/@ryland.wav',
	},
	{
		id: 11,
		appName: 'FlappyBird',
		appImage: flappybird,
	},
];

export const FOOTERAPPS = [
	{
		id: 1,
		appName: 'Messages',
		appImage: messages,
	},
	{
		id: 2,
		appName: 'Mail',
		appImage: mail,
		url: 'mailto:rylandofficial@yahoo.com',
	},
	{
		id: 3,
		appName: 'Safari',
		appImage: safari,
	},
	{
		id: 4,
		appName: 'Settings',
		appImage: settings,
	},
];
