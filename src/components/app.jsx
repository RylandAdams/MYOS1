import React from 'react';
import { Link } from 'react-router-dom';
import './app.css';

const App = (app) => {
	const { id, appName, appImage, url } = app.data;

	console.log(app);
	console.log(url);
	return (
		<>
			{url === undefined ? (
				<Link
					to={`/${appName}`}
					className='singleApp'
				>
					<img
						src={appImage}
						alt={`app${id}`}
					/>
					<div className='appName'>{appName}</div>
				</Link>
			) : (
				<a
					href={url}
					target='_blank'
					className='singleApp'
				>
					<img
						src={appImage}
						alt={`app${id}`}
					/>
					<div className='appName'>{appName}</div>
				</a>
			)}
		</>
	);
};

export default App;
