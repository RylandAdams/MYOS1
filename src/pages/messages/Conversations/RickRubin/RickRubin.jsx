import React from 'react';
import './RickRubin.css';

import typing from '../../../../assets/imgs/typing.png';
import { RxCaretLeft } from 'react-icons/rx';

import { Link } from 'react-router-dom';

import song001 from '../../../../assets/songs/001.jpg';

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
			<a className='textSongToRickBubble'></a>
			<a className='textSongToRickBubbleInner'></a>
			<a
				target='_blank'
				href='https://soundcloud.com/rylandofficialmusic/sets/demos'
			>
				<img
					src={song001}
					alt='typing'
					className='song001'
				/>
				<div className='songName001'>
					001 - Throw Your Hands Up (DEMO)
				</div>
			</a>
			<img
				src={typing}
				alt='typing'
				className='rickTyping'
			/>
		</div>
	);
};

export default RickRubin;
