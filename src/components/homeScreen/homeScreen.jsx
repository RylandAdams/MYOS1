import React from 'react';
import './homeScreen.css';
import { motion } from 'framer-motion';

import dock from '../../assets/imgs/DockBar.jpg';

import App from '../app';
import { MAINAPPS, FOOTERAPPS } from '../../assets/apps';

const HomeScreen = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
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
	);
};

export default HomeScreen;
