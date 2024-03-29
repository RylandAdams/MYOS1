import React, { useState, useEffect } from 'react';

import './ipod.css';
import { BsMusicNote, BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdOutlineDownloading } from 'react-icons/md';
import { AiTwotoneStar, AiOutlineSearch } from 'react-icons/ai';

import dopamineArt from '../../assets/songs/Dopamine.PNG';
import dopamine from '../../assets/songs/DopamineClip.mp3';

import denialArt from '../../assets/songs/Denial.JPG';
import denial from '../../assets/songs/DenialClip.mp3';

import badWeather from '../../assets/songs/BadWeather.png';
import handsUp from '../../assets/songs/handsUpClip.mp3';

const Dopamine = new Audio(dopamine);
const Denial = new Audio(denial);
const HandsUp = new Audio(handsUp);

const Ipod = () => {
	const [curretSong, setCurrentSong] = useState('none');
	const [play, setPlay] = useState(true);

	useEffect(() => {
		// TEMP FIX FOR PLAYING 1 SONG AT A TIME
		Dopamine.pause();
		Denial.pause();
		HandsUp.pause();

		if (curretSong === 'dopamine') {
			setPlay(true);
			Dopamine.load();
			Dopamine.play();
		} else if (curretSong === 'denial') {
			setPlay(true);
			Denial.load();
			Denial.play();
		} else if (curretSong === 'handsUp') {
			setPlay(true);
			HandsUp.load();
			HandsUp.play();
		}
	}, [curretSong]);

	useEffect(() => {
		//PLAY PAUSE

		// Dopamine
		if (curretSong === 'dopamine' && play === false) {
			Dopamine.pause();
		} else if (curretSong === 'dopamine' && play === true) {
			Dopamine.play();
		}

		if (curretSong === 'denial' && play === false) {
			Denial.pause();
		} else if (curretSong === 'denial' && play === true) {
			Denial.play();
		}

		if (curretSong === 'handsUp' && play === false) {
			HandsUp.pause();
		} else if (curretSong === 'handsUp' && play === true) {
			HandsUp.play();
		}
	}, [play]);

	return (
		<div className='ipod'>
			<div className='topBarIpod'></div>
			<h1 className='HEADER'>iPod</h1>
			<div className='filterBy'>Release Date</div>
			<div className='filterBar'></div>
			<div className='byDate'></div>
			<div className='songsListed'>
				<button
					onClick={() => setCurrentSong('dopamine')}
					className='song1'
				>
					{curretSong === 'dopamine' ? (
						<button
							onClick={() => setPlay(!play)}
							className='pausePlayOverlaySong1'
						>
							<div className='pausePlayText'>
								{play === true ? (
									<BsFillPauseFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								) : (
									<BsFillPlayFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								)}
							</div>
						</button>
					) : (
						''
					)}
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

				<button
					onClick={() => setCurrentSong('denial')}
					className='song2'
				>
					{curretSong === 'denial' ? (
						<button
							onClick={() => setPlay(!play)}
							className='pausePlayOverlaySong2'
						>
							<div className='pausePlayText'>
								{play === true ? (
									<BsFillPauseFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								) : (
									<BsFillPlayFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								)}
							</div>
						</button>
					) : (
						''
					)}
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
					onClick={() => setCurrentSong('handsUp')}
					className='song3'
				>
					{curretSong === 'handsUp' ? (
						<button
							onClick={() => setPlay(!play)}
							className='pausePlayOverlaySong3'
						>
							<div className='pausePlayText'>
								{play === true ? (
									<BsFillPauseFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								) : (
									<BsFillPlayFill
										className='pausePlayIcon'
										color='rgb(0, 0, 0)'
										fill='rgb(0, 0, 0)'
									/>
								)}
							</div>
						</button>
					) : (
						''
					)}
					<img
						className='songImg'
						src={badWeather}
						alt='badWeather'
					/>
					<div className='songText'>
						<h2 className='songName3'>Throw Your Hands Up</h2>
						<h5 className='artistName3'>RYLAND</h5>
						{/* <img
							src={explicit}
							alt='explicit'
							className='explicit3'
						/> */}
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
