import React from 'react';
import './RickRubin.css';

import typing from '../../../../assets/imgs/typing.png';
import { RxCaretLeft } from 'react-icons/rx';

import { Link } from 'react-router-dom';

import CountryIbprofen from '../../../../assets/songs/CountryIbprofen.png';

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
				href='https://soundcloud.com/rylandofficialmusic/country-ibuprofen/s-C7MKFVD3y97?si=65b2282d37e547cfb4c895d06a8c9f85&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing'
			>
				<img
					src={CountryIbprofen}
					alt='typing'
					className='song001'
				/>
				<div className='songName001'>Country Ibuprofen</div>
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
