import React from 'react';
import './RickRubin.css';

import { Link } from 'react-router-dom';

const RickRubin = () => {
	return (
		<div className='RickRubin'>
			<Link
				to={'/messages'}
				className='back'
			>
				Back
			</Link>
		</div>
	);
};

export default RickRubin;
