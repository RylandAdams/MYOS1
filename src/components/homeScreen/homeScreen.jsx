import React, { useState } from 'react';
import './homeScreen.css';
import BadWeather from '../../assets/songs/BadWeather.png';

import { motion, AnimatePresence } from 'framer-motion';

import dock from '../../assets/imgs/DockBar.jpg';

import App from '../app';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

let didInit = false;

const HomeScreen = () => {
	// State for notification
	const [notification, setNotification] = useState(false);

	// Initialize notification after 2 seconds
	if (!didInit) {
		setTimeout(() => {
			setNotification(true);
			shownotification();
		}, 2000);
	}

	// Show notification and hide after 3.45 seconds
	const shownotification = () => {
		didInit = true;
		setTimeout(() => {
			setNotification(false);
		}, 3450);
	};

	return (
		<>
			{/* Render notification if notification state is true */}
			{notification ? (
				<AnimatePresence>
					<motion.a
						initial={{ opacity: 0, y: -10, zIndex: 20 }}
						exit={{ opacity: 0, y: -10, zIndex: 20 }}
						animate={{
							opacity: 1,
							y: 0,
							zIndex: 20,
						}}
						transition={{
							duration: 1.5,
							type: 'spring',
							repeat: 1,
							repeatType: 'reverse',
							repeatDelay: 0.5,
						}}
						key='notification'
						target='_blank'
						onClick='https://distrokid.com/hyperfollow/ryland2/bad-weather---ep-2'
						href='https://distrokid.com/hyperfollow/ryland2/bad-weather---ep-2'
						className='notificationAlert'
					>
						<img
							className='notificationImg'
							src={BadWeather}
							alt='BadWeather'
						/>
						<div className='notificationTextTop'>
							Bad Weather - EP
						</div>
						<div className='notificationTextBottem'></div>
					</motion.a>
				</AnimatePresence>
			) : (
				''
			)}

			{/* Render apps */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
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
