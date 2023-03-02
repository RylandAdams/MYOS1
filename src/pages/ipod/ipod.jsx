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
			<div className='songListed'>
				<div>
					<button onClick={() => setSong2IsPlaying(!song2IsPlaying)}>
						<img
							className='ipodArt'
							src={denialArt}
							alt='DenialArt'
						/>
						<h2 className='songName'>DENIAL</h2>
						<h5 className='artistName'>RYLAND</h5>
					</button>
				</div>
				<div>
					<button onClick={() => setSong1IsPlaying(!song1IsPlaying)}>
						<img
							className='ipodArt'
							src={dopamineArt}
							alt='DopamineArt'
						/>
						<h2 className='songName'>DOPAMINE</h2>
						<h5 className='artistName'>RYLAND</h5>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Ipod;
