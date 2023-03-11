import React from 'react';
import './LouisBell.css';

import { Link } from 'react-router-dom';

const LouisBell = () => {
	return (
		<div className='LouisBell'>
			<Link
				to={'/messages'}
				className='back'
			>
				Back
			</Link>
			<div className='topBarIpod'></div>
			<h1 className='HEADERLouisBell'>Louis Bell</h1>
		</div>
	);
};

export default LouisBell;
