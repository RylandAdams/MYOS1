import React from 'react';
import './LouisBell.css';

import { RxCaretLeft } from 'react-icons/rx';
import { Link } from 'react-router-dom';

const LouisBell = () => {
	return (
		<div className='LouisBell'>
			<Link
				to={'/messages'}
				className='back'
			>
				<RxCaretLeft className='caretPostion' />
			</Link>
			<div className='topBarIpod'></div>
			<h1 className='HEADERLouisBell'>Louis Bell</h1>
			<div className='textSongToLouisBubble'></div>
			<div className='textToLouisBubble'></div>
			<div className='textToLouis'>This is where im at</div>
		</div>
	);
};

export default LouisBell;
