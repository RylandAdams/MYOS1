import React, { useEffect } from 'react';
import './homeScreen.css';

import { motion } from 'framer-motion';

import { usePowerOn } from '../../context/PowerOnContext';
import { preloadStoragePhotos } from '../../utils/photoStorage';
import { useWallpaper } from '../../context/WallpaperContext';
import App from '../app';
import Folder from '../Folder/Folder';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

const POWER_ON_KEY = 'homeScreenPowerOnSeen';

const HomeScreen = () => {
	const { powerOnComplete } = usePowerOn();
	const { wallpaper } = useWallpaper();
	const shouldInstantHome = (() => {
		try {
			return powerOnComplete && sessionStorage.getItem(POWER_ON_KEY) === '1';
		} catch {
			return false;
		}
	})();

	const containerVariants = shouldInstantHome
		? {
			hidden: { opacity: 1 },
			visible: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
		}
		: {
			hidden: { opacity: 0 },
			visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
		};

	const footerVariants = shouldInstantHome
		? {
			hidden: { opacity: 1 },
			visible: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
		}
		: {
			hidden: { opacity: 0 },
			visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.35 } },
		};

	const childVariants = shouldInstantHome
		? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
		: { hidden: { opacity: 0 }, visible: { opacity: 1 } };

	useEffect(() => {
		if (powerOnComplete) {
			preloadStoragePhotos();
			// Preload main apps so they open instantly
			import('../../pages/photos/photos');
			import('../../pages/ipod/ipod');
			import('../../pages/calender/calender');
			import('../../pages/weather/weather');
			import('../../pages/files/files');
		}
	}, [powerOnComplete]);

	const wallpaperStyle =
		wallpaper.type === 'image'
			? { backgroundImage: `url(${wallpaper.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
			: { background: wallpaper.value };

	return (
		<>
			{/* Power-on overlay moved to PowerOnOverlay – covers full iPhone screen */}
			{/* Render apps */}
			<motion.div
				className="homeScreenWrapper"
				initial={{ opacity: 1 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
				{/* Screen bounds – same positioning as apps/dock (left 50%, translateX -50%, max-width 310px) */}
				<div className="screenBounds" aria-hidden="true" />
				<motion.div
					className='homeScreenPicture'
					style={wallpaperStyle}
					initial={shouldInstantHome ? { opacity: 1 } : { opacity: 0 }}
					animate={powerOnComplete ? { opacity: 1 } : { opacity: 0 }}
					transition={shouldInstantHome ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
				/>
				{/* Main apps – fade in with stagger */}
				<motion.div
					className='apps'
					initial="hidden"
					animate={powerOnComplete ? 'visible' : 'hidden'}
					variants={containerVariants}
				>
					{MAINAPPS.map((app) =>
						app.isFolder ? (
							<motion.div key={app.id} variants={childVariants}>
								<Folder
									folderName={app.folderName}
									apps={app.apps}
								/>
							</motion.div>
						) : (
							<motion.div key={app.id} variants={childVariants}>
								<App data={app} />
							</motion.div>
						)
					)}
				</motion.div>

				{/* Footer apps – fade in with stagger like main apps */}
				<motion.div
					className='footerApps'
					initial="hidden"
					animate={powerOnComplete ? 'visible' : 'hidden'}
					variants={footerVariants}
				>
					{FOOTERAPPS.map((app) => (
						<motion.div key={app.id} variants={childVariants}>
							<App data={app} />
						</motion.div>
					))}
					<link
						rel='stylesheet'
						href='TEXT MY ARTIST NUMBER'
					/>
					<link
						rel='stylesheet'
						href='EMAIL ME'
					/>
				</motion.div>

				{/* Dock bar – fades in with background, no separate icon-style animation */}
				<motion.div
					className='dock'
					initial={shouldInstantHome ? { opacity: 1 } : { opacity: 0 }}
					animate={powerOnComplete ? { opacity: 1 } : { opacity: 0 }}
					transition={shouldInstantHome ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
				/>
			</motion.div>
		</>
	);
};

export default HomeScreen;
