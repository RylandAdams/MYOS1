import React, { useState, useEffect } from 'react';
import './lockScreen.css';

import SlideToUnlock from '../slideToUnlock/slideToUnlock';
import lockScreenBackground from '../../assets/imgs/lockScreenBackground.jpg';
import linkTreeImg from '../../assets/imgs/linkTree.png';

import { motion, AnimatePresence } from 'framer-motion';

let didInit = false;

const LockScreen = () => {
	const [date, setDate] = useState(new Date());
	const [notification, setNotification] = useState(false);

	// Initialize notification after 2 seconds
	if (!didInit) {
		setTimeout(() => {
			setNotification(true);
			shownotification();
		}, 200);
	}

	// Show notification and hide after 3.45 seconds
	const shownotification = () => {
		didInit = true;
		setTimeout(() => {
			setNotification(false);
		}, 34500);
	};

	function refreshClock() {
		setDate(new Date());
	}

	useEffect(() => {
		const timerId = setInterval(refreshClock, 1000);
		return function cleanup() {
			clearInterval(timerId);
		};
	}, []);

	const formattedTime = date
		.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})
		.replace(/\s?[APap][Mm]\.?/, ''); // Removes AM/PM text

	const formattedDate = date.toLocaleString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	return (
		<>
			{/* Fades in the lock screen */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				<div className='lockScreenPage'>
					{/* Background image */}
					<img
						src={lockScreenBackground}
						alt=''
						className='lockScreenPicture'
					/>
					{/* Slide to unlock component */}
					<SlideToUnlock />
				</div>
				<div className='lockScreenTopTransSqr'></div>
				<div
					className='lockScreenClock'
					style={{
						fontFamily: 'sans-serif',
						fontWeight: '100',
						textShadow: '1px 1px 2px rgba(0, 0, 0, 0.55)',
					}}
				>
					{formattedTime}
				</div>
				<div className='lockScreenDate'>{formattedDate}</div>
				<div className='lockScreenBottomTransSqr'></div>
			</motion.div>
			{/* Render notification if notification state is true */}
			{notification ? (
				<motion.a
					initial={{ opacity: 0, y: -10, zIndex: 20 }}
					// exit={{ opacity: 0, y: -10, zIndex: 20 }}
					animate={{
						opacity: 1,
						y: 0,
						zIndex: 20,
					}}
					transition={{
						duration: 1.5,
						type: 'spring',
						repeat: 1,
						// repeatType: 'reverse',
						// repeatDelay: 0.5,
					}}
					key='notification'
					target='_blank'
					onClick='https://linktr.ee/ry.land?utm_source=linktree_admin_share'
					href='https://linktr.ee/ry.land?utm_source=linktree_admin_share'
					className='notificationAlert'
				>
					<img
						className='notificationImg'
						src={linkTreeImg}
						alt='BadWeather'
					/>
					<div className='notificationTextTop'>Bad Weather - EP</div>
					<div className='notificationTextBottem'></div>
				</motion.a>
			) : (
				''
			)}
		</>
	);
};

export default LockScreen;
