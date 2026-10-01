import React from 'react';
import { Link } from 'react-router-dom';
import './homeButton.css';
import { useLock } from '../../context/LockContext';
import { playSound } from '../../utils/uiSound';

const HomeButton = () => {
	const { off, wake } = useLock();
	const handleClick = (e) => {
		// Home wakes a sleeping phone to the lock screen, like the original
		if (off) {
			e.preventDefault();
			playSound('boot');
			wake();
			return;
		}
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
