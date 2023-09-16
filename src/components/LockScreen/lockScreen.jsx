import React, { useState, useEffect } from 'react';
import './lockScreen.css';
import { motion } from 'framer-motion';
import SlideToUnlock from '../slideToUnlock/slideToUnlock';
import lockScreenBackground from '../../assets/imgs/lockScreenBackground.jpg';

const LockScreen = () => {
	const [date, setDate] = useState(new Date());

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
		</>
	);
};

export default LockScreen;
