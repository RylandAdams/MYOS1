import React from 'react';
import './LouisBell.css';

import { RxCaretLeft } from 'react-icons/rx';
import { Link } from 'react-router-dom';

import song002 from '../../../../assets/songs/002.jpg';

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
			<h1 className='HEADERLouisBell'>Mr.Bell</h1>
			<div className='textSongToLouisBubble'></div>
			<a className='textSongToLouisBubbleInner'></a>
			<a href='https://www.youtube.com/@RYLANDOfficial/featured'>
				<img
					src={song002}
					alt='typing'
					className='song002'
				/>
				<div className='songName002'> FF - 002</div>
			</a>
			<div className='textToLouisBubble'></div>
			<div className='textToLouis'>This is where im at</div>
		</div>
	);
};

export default LouisBell;
