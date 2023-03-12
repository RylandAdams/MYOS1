import React from 'react';
import './RickRubin.css';

import typing from '../../../../assets/imgs/typing.png';
import { RxCaretLeft } from 'react-icons/rx';

import { Link } from 'react-router-dom';

const RickRubin = () => {
	return (
		<div className='RickRubin'>
			<Link
				to={'/messages'}
				className='back'
			>
				<RxCaretLeft className='caretPostion' />
			</Link>
			<div className='topBarIpod'></div>
			<div className='HEADERRickRubin'>Mr.Rubin</div>
			<div className='textToRickBubble'></div>
			<div className='textToRick'>
				Hey Rick, let me know what your thinking.
			</div>
			<div className='textSongToRickBubble'></div>
			<img
				src={typing}
				alt='typing'
				className='rickTyping'
			/>
		</div>
	);
};

export default RickRubin;
