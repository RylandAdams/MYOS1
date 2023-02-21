import React from 'react';
import { Link } from 'react-router-dom';
import './homeScreen.css';

import App from './app';
import { MAINAPPS } from '../assets/apps';
console.log('🚀 ~ file: homeScreen.jsx:7 ~ MAINAPPS:', MAINAPPS);

const HomeScreen = () => {
	return (
		<div className='homeScreen'>
			<div className='header'>Header</div>
			<div className='apps'>
				{MAINAPPS.map((app) => (
					<App data={app} />
				))}
				{/* <Link to='/calender' />
				<Link to='/photos' />
				<Link to='/weather' />
				<Link to='/ipod' />
				<link
					rel='stylesheet'
					href='Youtube'
				/>
				<link
					rel='stylesheet'
					href='Apple'
				/>
				<link
					rel='stylesheet'
					href='Spotify'
				/>
				<link
					rel='stylesheet'
					href='Soundcloud'
				/>
				<Link to='/calculator' />
				<Link to='/minesweeper' /> */}
			</div>
			<div className='footer'>
				DOCK
				<link
					rel='stylesheet'
					href='TEXT MY ARTIST NUMBER'
				/>
				<link
					rel='stylesheet'
					href='EMAIL ME'
				/>
			</div>
		</div>
	);
};

export default HomeScreen;
