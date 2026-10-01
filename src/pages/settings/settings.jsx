import React, { useEffect, useState } from 'react';
import './settings.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { useWallpaper } from '../../context/WallpaperContext';
import { soundsEnabled, setSoundsEnabled, onSoundsChange } from '../../utils/uiSound';
import { getTheme, setTheme, onThemeChange } from '../../utils/theme';
import { IPOD_TRACKS } from '../../assets/ipodLibrary';
import { ALBUMS } from '../photos/photosData';

/* iPhone OS Settings: grouped rows on the pinstripe background; Wallpaper and About drill in. */

const Switch = ({ on, onChange, label }) => (
	<button
		type='button'
		role='switch'
		aria-checked={on}
		aria-label={label}
		className={`settingsSwitch ${on ? 'settingsSwitch-on' : ''}`}
		onClick={() => onChange(!on)}
	>
		<span className='settingsSwitchTrack'>
			<span className='settingsSwitchOn'>ON</span>
			<span className='settingsSwitchOff'>OFF</span>
		</span>
		<span className='settingsSwitchKnob' />
	</button>
);

const Settings = () => {
	const { wallpaperId, setWallpaperId, wallpapers } = useWallpaper();
	const [sounds, setSounds] = useState(soundsEnabled);
	const [page, setPage] = useState('main'); // main | wallpaper | about
	useEffect(() => onSoundsChange(setSounds), []);
	const [dark, setDark] = useState(() => getTheme() === 'dark');
	useEffect(() => onThemeChange((t) => setDark(t === 'dark')), []);

	const current = wallpapers.find((w) => w.id === wallpaperId);
	const photoCount = ALBUMS.find((a) => a.id === 'camera-roll')?.photos.length ?? 0;

	const header =
		page === 'wallpaper'
			? { title: 'Wallpaper', backLabel: 'Settings', onBack: () => setPage('main') }
			: page === 'about'
				? { title: 'About', backLabel: 'Settings', onBack: () => setPage('main') }
				: { title: 'Settings' };

	return (
		<div className='settingsPage'>
			<AppHeaderBar {...header} />
			<div className='settingsScroll' key={page}>
				{page === 'main' && (
					<>
						<ul className='stGroup'>
							<li>
								<button type='button' className='stRow' onClick={() => setPage('wallpaper')}>
									<span className='stLabel'>Wallpaper</span>
									<span className='stValue'>{current?.label}</span>
									<span className='stChevron'>›</span>
								</button>
							</li>
							<li className='stRow'>
								<span className='stLabel'>Dark Mode</span>
								<Switch on={dark} onChange={(on) => setTheme(on ? 'dark' : 'light')} label='Dark Mode' />
							</li>
							<li className='stRow'>
								<span className='stLabel'>Sounds</span>
								<Switch on={sounds} onChange={setSoundsEnabled} label='Sounds' />
							</li>
						</ul>
						<ul className='stGroup'>
							<li>
								<button type='button' className='stRow' onClick={() => setPage('about')}>
									<span className='stLabel'>About</span>
									<span className='stChevron'>›</span>
								</button>
							</li>
							<li className='stRow'>
								<span className='stLabel'>Auto Updates</span>
								<span className='stValue'>On</span>
							</li>
						</ul>
					</>
				)}

				{page === 'wallpaper' && (
					<div className='stWallGrid'>
						{wallpapers.map((w) => (
							<button
								key={w.id}
								type='button'
								className={`stWall${wallpaperId === w.id ? ' stWall-on' : ''}`}
								onClick={() => setWallpaperId(w.id)}
								aria-pressed={wallpaperId === w.id}
								aria-label={w.label}
							>
								<span
									className='stWallPreview'
									style={w.type === 'image' ? { backgroundImage: `url(${w.value})` } : { background: w.value }}
								/>
								{wallpaperId === w.id && <span className='stWallCheck'>✓</span>}
								<span className='stWallLabel'>{w.label}</span>
							</button>
						))}
					</div>
				)}

				{page === 'about' && (
					<ul className='stGroup'>
						{[
							['Name', "RYLAND's iPhone"],
							['Songs', IPOD_TRACKS.length],
							['Photos', photoCount],
							['Version', '2.0.1'],
							['Carrier', 'RYLAND'],
						].map(([k, v]) => (
							<li key={k} className='stRow'>
								<span className='stLabel'>{k}</span>
								<span className='stValue'>{v}</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default Settings;
