import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './topBar.css';

import { usePowerOn } from '../../context/PowerOnContext';
import { GiNetworkBars } from 'react-icons/gi';
import { FaLock, FaWifi } from 'react-icons/fa';
import { LuBluetooth } from 'react-icons/lu';
import BatteryIcon from './BatteryIcon';

const TopBar = () => {
	const [date, setDate] = useState(new Date());
	const { powerOnComplete } = usePowerOn();

	let location = useLocation();
	const isLockScreen = location.pathname === '/lock'; // lock screen commented out; / is now homepage
	const isHomeScreen = location.pathname === '/' || location.pathname === '/homeScreen';
	const isFlappyBird = location.pathname.toLowerCase() === '/flappybird';
	const isAppPage = !isLockScreen && !isHomeScreen;


	function refreshClock() {
		setDate(new Date());
	}

	useEffect(() => {
		const timerId = setInterval(refreshClock, 1000);
		return function cleanup() {
			clearInterval(timerId);
		};
	}, []);

	const barVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.06,
				delayChildren: powerOnComplete ? 0 : 0.15,
			},
		},
	};
	const itemVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	return (
		<motion.div
			className={
				isHomeScreen
					? 'topBar topBarHome'
					: isAppPage
						? isFlappyBird
							? 'topBarIpod topBarCompact'
							: 'topBarIpod'
						: 'topBarAlt'
			}
			initial="hidden"
			animate={powerOnComplete ? 'visible' : 'hidden'}
			variants={barVariants}
		>
			<motion.div
				className={
					isHomeScreen
						? 'leftIpod'
						: isAppPage
							? 'leftIpod'
							: 'leftAlt'
				}
				variants={itemVariants}
				transition={{ duration: 0.4, ease: 'easeOut' }}
			>
				{(isAppPage || isHomeScreen) && (
					<GiNetworkBars
						color="#007AFF"
						fill="#007AFF"
						className="cellularBarsIpod"
					/>
				)}
				RYLAND
				{(isAppPage || isHomeScreen) && (
					<FaWifi
						className="topBarWifi"
						color="#007AFF"
						fill="#007AFF"
					/>
				)}
				{isLockScreen && (
					<GiNetworkBars
						color="#000000"
						fill="#000000"
						className="cellularBarsAlt"
					/>
				)}
			</motion.div>
			<motion.div
				className='topMid'
				variants={itemVariants}
				transition={{ duration: 0.4, ease: 'easeOut' }}
			>
				{isLockScreen ? (
					<FaLock
						color='#000000'
						fill='#454545'
						className='lockIcon'
					/>
				) : (
					<div
						className={
							isHomeScreen
								? 'clockIpod'
								: isAppPage
									? 'clockIpod'
									: 'clockAlt'
						}
					>
						{date.toLocaleTimeString([], {
							hour: 'numeric',
							minute: '2-digit',
						})}
					</div>
				)}
			</motion.div>

			<motion.div
				className={
					isHomeScreen
						? 'rightIpod'
						: isAppPage
							? 'rightIpod'
							: 'rightAlt'
				}
				variants={itemVariants}
				transition={{ duration: 0.4, ease: 'easeOut' }}
			>
				{(isAppPage || isHomeScreen) && (
					<LuBluetooth
						className="topBarBluetooth"
						color={isHomeScreen ? '#ffffff' : '#000000'}
					/>
				)}
				<BatteryIcon
					className="topBarBattery"
					fillColor={
						isAppPage || isHomeScreen
							? '#34C759'
							: '#000000'
					}
					strokeColor={isHomeScreen ? '#ffffff' : '#000000'}
				/>
			</motion.div>
		</motion.div>
	);
};

export default TopBar;
