import React from 'react';
import { Link } from 'react-router-dom';
import './homeButton.css';
import { playSound } from '../../utils/uiSound';

const HomeButton = () => {
	const handleClick = () => {
		playSound('home');
		window.dispatchEvent(new CustomEvent('closeFolder'));
	};

	return (
		<div className='homeBttn'>
			<Link
				className='bttn'
				to='/homeScreen'
				onClick={handleClick}
				aria-label='Home'
			>
				<span className='bttnHit' aria-hidden='true' />
			</Link>
		</div>
	);
};

export default HomeButton;
