import React from 'react';
import { Link } from 'react-router-dom';
import './homeButton.css';

const HomeButton = () => {
	return (
		<div className='homeBttn'>
			<Link to='/'>HOME</Link>
		</div>
	);
};

export default HomeButton;
