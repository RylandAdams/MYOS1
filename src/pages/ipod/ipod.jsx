import React, { useState, useEffect } from 'react';
import './ipod.css';

import dopamine from '../../assets/songs/Dopamine.wav';
import dopamineArt from '../../assets/songs/Dopamine.PNG';
import denial from '../../assets/songs/Denial.wav';
import denialArt from '../../assets/songs/Denial.JPG';

const Dopamine = new Audio(dopamine);
const Denial = new Audio(denial);

const Ipod = () => {
	const [song1IsPlaying, setSong1IsPlaying] = useState(false);
	const [song2IsPlaying, setSong2IsPlaying] = useState(false);

	useEffect(() => {
		// TEMP FIX FOR PLAYING 1 SONG AT A TIME

		// Dopamine
		if (song1IsPlaying === true) {
			Dopamine.load();
			Dopamine.play();
		} else {
			Dopamine.pause();
		}
		// Denial
		if (song2IsPlaying === true) {
			Denial.load();
			Denial.play();
		} else {
			Denial.pause();
		}
	}, [song1IsPlaying, song2IsPlaying]);

	return (
		<div className='ipod'>
			<div className='songsListed'>
				<button
					className='song1'
					onClick={() => setSong2IsPlaying(!song2IsPlaying)}
				>
					<img
						className='songImg'
						src={denialArt}
						alt='DenialArt'
					/>
					<div className='songText'>
						<h2 className='songName'>DENIAL</h2>
						<h5 className='artistName'>RYLAND</h5>
					</div>
				</button>
				<button
					className='song2'
					onClick={() => setSong1IsPlaying(!song1IsPlaying)}
				>
					<img
						className='songImg'
						src={dopamineArt}
						alt='DopamineArt'
					/>
					<div className='songText'>
						<h2 className='songName'>DOPAMINE</h2>
						<h5 className='artistName'>RYLAND</h5>
					</div>
				</button>
			</div>
		</div>
	);
};

export default Ipod;
