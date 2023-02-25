import React from 'react';
import './homeScreen.css';

import App from '../app';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

const HomeScreen = () => {
	return (
		<div className='homeScreen'>
			<div className='header'></div>
			<div className='apps'>
				{MAINAPPS.map((app) => (
					<App data={app} />
				))}
			</div>
			<div className='footer'>
				{FOOTERAPPS.map((app) => (
					<App data={app} />
				))}
				<link
					rel='stylesheet'
					href='TEXT MY ARTIST NUMBER'
				/>
				<link
					rel='stylesheet'
					href='EMAIL ME'
				/>
			</div>
		</div>
	);
};

export default HomeScreen;
