import React from 'react';
import './homeScreen.css';
import BadWeather from '../../assets/songs/BadWeather.png';
import homeScreenBackground from '../../assets/imgs/iosbackground.jpeg';

import { motion } from 'framer-motion';

import dock from '../../assets/imgs/DockBar.jpg';

import App from '../app';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

const HomeScreen = () => {
	return (
		<>
			{/* Render apps */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<img
					src={homeScreenBackground}
					alt=''
					className='homeScreenPicture'
				/>
				{/* Main apps */}
				<div className='apps'>
					{MAINAPPS.map((app) => (
						<App
							data={app}
							key={app.id}
						/>
					))}
				</div>

				{/* Footer apps */}
				<div className='footerApps'>
					{FOOTERAPPS.map((app) => (
						<App
							data={app}
							key={app.id}
						/>
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

				{/* Dock bar */}
				<img
					src={dock}
					className='dock'
					alt='dock'
				/>
			</motion.div>
		</>
	);
};

export default HomeScreen;
