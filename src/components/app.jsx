import React from 'react';
import './app.css';

const App = (app) => {
	const { id, appName, appImage } = app.data;

	console.log(app);
	return (
		<div className='singleApp'>
			<img
				src={appImage}
				alt={`app${id}`}
			/>
			<div className='appName'>{appName}</div>
		</div>
	);
};

export default App;
