import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './app.css';
import { playSound } from '../utils/uiSound';
import { openInApp } from '../utils/openApp';
import { launchFrom } from './PageTransition';
import { iconFor } from '../utils/liveIcons';

const App = memo((app) => {
	const { id, appName, appImage, url, path } = app.data;
	const linkTo = path || `/${appName}`;
	const isCalender = appName === 'Calendar';
	const appClass = isCalender ? 'Apps calenderIcon' : 'Apps';
	return (
		<>
			{url === undefined ? (
				<Link
					to={linkTo}
					className={appClass}
					onClick={(e) => {
						playSound('tap');
						launchFrom(e.currentTarget.querySelector('img') || e.currentTarget);
					}}
				>
					<div className='singleApp'>
						<img
							src={iconFor(app.data) || appImage}
							alt={`app${id}`}
							loading="lazy"
						/>
						<div className='appName'>{appName}</div>
					</div>
				</Link>
			) : (
				<a
					href={url}
					target='_blank'
					rel="noopener noreferrer"
					className={appClass}
					onClick={(e) => {
						playSound('tap');
						// Open Spotify/Apple Music/YouTube/etc. in their app from Instagram & other in-app browsers
						if (openInApp(url)) e.preventDefault();
					}}
				>
					<div className='singleApp'>
						<img
							src={iconFor(app.data) || appImage}
							alt={`app${id}`}
							loading="lazy"
						/>
						<div className='appName'>{appName}</div>
					</div>
				</a>
			)}
		</>
	);
});

App.displayName = 'App';

export default App;
