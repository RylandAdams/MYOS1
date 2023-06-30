import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import './powerButton.css';

const PowerButton = () => {
	let location = useLocation();
	let navigate = useNavigate();

	console.log(location.pathname);

	const phonePowerToggle = () => {
		if (location.pathname === '/off') {
			console.log('SCREEN ON');
			navigate('/lockScreen');
		} else {
			navigate('/off');
			console.log('SCREEN OFF');
		}
	};

	return (
		<div className='powerBttn'>
			<Link
				className='bttn'
				onClick={phonePowerToggle}
			>
				POWER
			</Link>
		</div>
	);
};

export default PowerButton;
