import React from 'react';
import './settings.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { useWallpaper } from '../../context/WallpaperContext';

const Settings = () => {
	const { wallpaperId, setWallpaperId, wallpapers } = useWallpaper();

	return (
		<div className='settingsPage'>
			<AppHeaderBar title="Settings" />
			<div className='settingsScroll'>
				<div className='settingsSection'>
					<h2 className='settingsSectionTitle'>Wallpaper</h2>
					<div className='wallpaperGrid'>
						{wallpapers.map((w) => (
							<button
								key={w.id}
								type='button'
								className={`wallpaperOption ${wallpaperId === w.id ? 'wallpaperOption-active' : ''}`}
								onClick={() => setWallpaperId(w.id)}
								aria-pressed={wallpaperId === w.id}
							>
								<div
									className='wallpaperPreview'
									style={
										w.type === 'image'
											? { backgroundImage: `url(${w.value})` }
											: { background: w.value }
									}
								/>
								<span className='wallpaperLabel'>{w.label}</span>
							</button>
						))}
					</div>
				</div>
				<div className='settingsSection'>
					<div className='settingsRow'>
						<span className='settingsRowLabel'>Auto Updates</span>
						<span className='settingsRowValue'>On</span>
					</div>
					<p className='settingsVersion'>V2.0.1</p>
				</div>
			</div>
		</div>
	);
};

export default Settings;
