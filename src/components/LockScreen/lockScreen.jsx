import React, { useState, useEffect } from 'react';
import './lockScreen.css';
import SlideToUnlock from '../slideToUnlock/slideToUnlock';
import lockScreenBackground from '../../assets/imgs/lockScreenBackground.jpg';
import linkTreeImg from '../../assets/imgs/linkTree.png';
import { motion } from 'framer-motion';

const LockScreen = () => {
	const [date, setDate] = useState(new Date());
	const [notificationVisible, setNotificationVisible] = useState(false);

	// Function to refresh the clock
	function refreshClock() {
		setDate(new Date());
	}

	useEffect(() => {
		// Show notification after 2 seconds
		const notificationTimeout = setTimeout(() => {
			setNotificationVisible(true);
		}, 200);

		// Clean up the timeout when the component unmounts
		return () => {
			clearTimeout(notificationTimeout);
		};
	}, []);

	useEffect(() => {
		// Set up an interval to refresh the clock every second
		const timerId = setInterval(refreshClock, 1000);

		return () => {
			// Clean up the interval when the component unmounts
			clearInterval(timerId);
		};
	}, []);

	const formattedTime = date
		.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})
		.replace(/\s?[APap][Mm]\.?/, ''); // Removes AM/PM text~

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
			{/* Render notification if notificationVisible is true */}
			{notificationVisible && (
				<motion.a
					initial={{ opacity: 0, y: -10, zIndex: 20 }}
					animate={{
						opacity: 1,
						y: 0,
						zIndex: 20,
					}}
					transition={{
						duration: 1.5,
						type: 'spring',
						repeat: 0,
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
					<div className='notificationTextTop'>LinkTree</div>
					<div className='notificationTextBottem'></div>
				</motion.a>
			)}
		</>
	);
};

export default LockScreen;
