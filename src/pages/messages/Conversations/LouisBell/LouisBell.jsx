import React from 'react';
import './LouisBell.css';

import { RxCaretLeft } from 'react-icons/rx';
import { Link } from 'react-router-dom';

import popHits from '../../../../assets/songs/popHits.png';

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
			<h1 className='HEADERLouisBell'>Virmedius</h1>
			<div className='textSongToLouisBubble'></div>
			<a className='textSongToLouisBubbleInner'></a>
			<a
				target='_blank'
				href='https://open.spotify.com/playlist/3Jl01AJ9ozTvBWYQbGJ3sj?si=3ae5f3e2ef57456a'
			>
				<img
					src={popHits}
					alt='typing'
					className='song002'
				/>
				<div className='songName002'> Best Pop Playlist</div>
			</a>
			<a
				target='_blank'
				href='https://virmedius.com/free-playlist-submission/'
				className='textToLouisBubble'
			></a>
			<div className='textToLouis'>
				Congrats on the playlist placement!
			</div>
		</div>
	);
};

export default LouisBell;
