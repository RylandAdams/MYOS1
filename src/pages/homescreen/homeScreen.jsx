import React from 'react';
import './homeScreen.css';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
	return (
		<div className='homeScreen'>
			<div className='header'>Header</div>
			<div className='apps'>
				<Link to='/calender' />
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
				<Link to='/minesweeper' />
			</div>
			<div className='footer'>
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
