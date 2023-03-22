import React, { useState } from 'react';
import './homeScreen.css';
import Denial from '../../assets/songs/Denial.JPG';

import { motion, AnimatePresence } from 'framer-motion';

import dock from '../../assets/imgs/DockBar.jpg';

import App from '../app';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

let didInit = false;

const HomeScreen = () => {
	const [notification, setNotification] = useState(false);

	if (!didInit) {
		setTimeout(() => {
			setNotification(true);
			shownotification();
		}, 2000);
	}

	const shownotification = () => {
		didInit = true;
		setTimeout(() => {
			setNotification(false);
		}, 7000);
	};

	return (
		<>
			{notification ? (
				<AnimatePresence>
					<motion.div
						initial={{ opacity: 0, y: -10, zIndex: 20 }}
						exit={{ opacity: 0, y: -10, zIndex: 20 }}
						animate={{
							opacity: 1,
							y: 0,
							zIndex: 20,
						}}
						transition={{
							duration: 2,
							type: 'spring',
							repeat: 1,
							repeatType: 'reverse',
							repeatDelay: 3,
						}}
						key='notification'
						target='_blank'
						href='https://distrokid.com/hyperfollow/ryland2/denial-2'
						className='notificationAlert'
					>
						<img
							className='notificationImg'
							src={Denial}
							alt='DenialCover'
						/>
						<div className='notificationTextTop'>
							Denial - Out March 31st
						</div>
						<div className='notificationTextBottem'>
							- Presave Here
						</div>
					</motion.div>
				</AnimatePresence>
			) : (
				''
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				{/* POP UP */}

				<div className='apps'>
					{MAINAPPS.map((app) => (
						<App data={app} />
					))}
				</div>
				<div className='footerApps'>
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
