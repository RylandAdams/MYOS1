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
			<div className='topBarIpod'></div>
			<div className='HEADERRickRubin'>Mr.Rubin</div>
		</div>
	);
};

export default RickRubin;
