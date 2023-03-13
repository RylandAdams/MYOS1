import React, { useState, useEffect } from 'react';
import './ipod.css';

import Iframe from 'react-iframe';
import explicit from '../../assets/songs/explicit.png';
import { BsMusicNote } from 'react-icons/bs';
import { MdOutlineDownloading } from 'react-icons/md';
import { AiTwotoneStar, AiOutlineSearch } from 'react-icons/ai';

import dopamine from '../../assets/songs/Dopamine.wav';
import dopamineArt from '../../assets/songs/Dopamine.PNG';

import denial from '../../assets/songs/Denial.wav';
import denialArt from '../../assets/songs/Denial.JPG';

import PWSHArt from '../../assets/songs/PWSH.jpg';

const Dopamine = new Audio(dopamine);
const Denial = new Audio(denial);

const Ipod = () => {
	const [song1IsPlaying, setSong1IsPlaying] = useState(false);
	const [song2IsPlaying, setSong2IsPlaying] = useState(false);

	const clickSong1 = () => {
		console.log('clicking');
		document
			.getElementById('denialSC')
			.contentDocument.getElementsByClassName('playButton__overlay')
			.click();
	};

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
			<div className='topBarIpod'></div>
			<h1 className='HEADER'>iPod</h1>
			<div className='filterBy'>Release Date</div>
			<div className='filterBar'></div>
			<div className='byDate'></div>
			<div className='songsListed'>
				<Iframe
					width='95%'
					id='denialSC'
					height='100'
					scrolling='no'
					allow='autoplay'
					src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1583243632%3Fsecret_token%3Ds-f5krrSVSOia&color=%23250405&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false'
				></Iframe>
				<button
					className='song1'
					onClick={() => clickSong1()}
				>
					<img
						className='songImg'
						src={dopamineArt}
						alt='DenialArt'
					/>
					<div className='songText'>
						<h2 className='songName1'>Dopamine</h2>
						<h5 className='artistName1'>RYLAND</h5>
					</div>
				</button>
				<div className='notReleased'>???</div>
				<button
					className='song2'
					onClick={() => clickSong1()}
				>
					<img
						className='songImg'
						src={denialArt}
						alt='DopamineArt'
					/>
					<div className='songText'>
						<h2 className='songName2'>Denial</h2>
						<h5 className='artistName2'>RYLAND</h5>
					</div>
				</button>
				<button
					className='song3'
					onClick={() => setSong1IsPlaying(!song1IsPlaying)}
				>
					<img
						className='songImg'
						src={PWSHArt}
						alt='PWSHArt'
					/>
					<div className='songText'>
						<h2 className='songName3'>P W S H</h2>
						<h5 className='artistName3'>RYLAND</h5>
						<img
							src={explicit}
							alt='explicit'
							className='explicit3'
						/>
					</div>
				</button>
			</div>

			<div className='bottomBar'></div>
			<div className='farLeft'>
				<BsMusicNote className='musicIcon' />
			</div>
			<div className='midLeft'>
				<AiTwotoneStar
					className='starIcon'
					color='rgb(64, 240, 240)'
					fill='rgb(64, 240, 240)'
				/>
				<AiTwotoneStar className='starIconShadow' />
			</div>
			<div className='midRight'>
				<AiOutlineSearch className='searchIcon' />
			</div>
			<div className='farRight'>
				<MdOutlineDownloading className='downloadIcon' />
			</div>
		</div>
	);
};

export default Ipod;
