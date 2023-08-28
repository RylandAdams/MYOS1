import React, { useState, useEffect } from 'react';
import './lockScreen.css';
import { motion } from 'framer-motion';

import SlideToUnlock from '../slideToUnlock/slideToUnlock';

import lockScreenBackground from '../../assets/imgs/lockScreenBackground.JPG';

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

				<div className='lockScreenTopTransSqr'>
					{date.toLocaleTimeString([], {
						// hour: '2-digit',
						// minute: '2-digit',
						hour: 'numeric',
						minute: '2-digit',
						hour12: true,
					})}
				</div>
				<div className='lockScreenBottomTransSqr'></div>
			</motion.div>
		</>
	);
};

export default LockScreen;
