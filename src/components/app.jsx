import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './app.css';

const App = memo((app) => {
	const { id, appName, appImage, url, path } = app.data;
	const linkTo = path || `/${appName}`;
	const isCalender = appName === 'Calender';
	const appClass = isCalender ? 'Apps calenderIcon' : 'Apps';
	return (
		<>
			{url === undefined ? (
				<Link
					to={linkTo}
					className={appClass}
				>
					<div className='singleApp'>
						<img
							src={appImage}
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
				>
					<div className='singleApp'>
						<img
							src={appImage}
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
