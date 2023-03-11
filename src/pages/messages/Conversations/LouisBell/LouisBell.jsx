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
		</div>
	);
};

export default LouisBell;
