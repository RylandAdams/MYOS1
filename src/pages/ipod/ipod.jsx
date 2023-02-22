import React, { useState, useEffect } from 'react';
import './ipod.css';

import dopamine from '../../assets/songs/Dopamine.wav';
import denial from '../../assets/songs/Denial.wav';
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
			<div>
				<button onClick={() => setSong1IsPlaying(!song1IsPlaying)}>
					DOPAMINE
				</button>
			</div>
			<div>
				<button onClick={() => setSong2IsPlaying(!song2IsPlaying)}>
					DENIAL
				</button>
			</div>
		</div>
	);
};

export default Ipod;
