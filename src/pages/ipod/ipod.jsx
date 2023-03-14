import React, { useState, useEffect } from 'react';
import './ipod.css';

import Iframe from 'react-iframe';
import explicit from '../../assets/songs/explicit.png';
import { BsMusicNote } from 'react-icons/bs';
import { MdOutlineDownloading } from 'react-icons/md';
import { AiTwotoneStar, AiOutlineSearch } from 'react-icons/ai';

import dopamineArt from '../../assets/songs/Dopamine.PNG';
import denialArt from '../../assets/songs/Denial.JPG';

import PWSHArt from '../../assets/songs/PWSH.jpg';

const Ipod = () => {
	return (
		<div className='ipod'>
			<div className='topBarIpod'></div>
			<h1 className='HEADER'>iPod</h1>
			<div className='filterBy'>Release Date</div>
			<div className='filterBar'></div>
			<div className='byDate'></div>
			<div className='songsListed'>
				<button className='song1'>
					<iframe
						className='playerFrameDopamine'
						allow='autoplay'
						src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1454684725&color=%23171a0f&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&single_active=true&liking=false&show_artwork=false'
					></iframe>

					<img
						className='songImg'
						src={dopamineArt}
						alt='DenialArt'
					/>
					<div className='songText'>
						{/* <h2 className='songName1'>Dopamine</h2>
						<h5 className='artistName1'>RYLAND</h5> */}
					</div>
				</button>
				<div className='notReleased'>???</div>
				<button className='song2'>
					<img
						className='songImg'
						src={denialArt}
						alt='DopamineArt'
					/>
					<Iframe
						className='playerFrameDenial'
						scrolling='no'
						frameborder='no'
						allow='autoplay'
						src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1454686057%3Fsecret_token%3Ds-JAy8urr8Unw&color=%23250405&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&single_active=true&liking=false&show_artwork=false'
					></Iframe>

					<div className='songText'>
						{/* <h2 className='songName2'>Denial</h2>
						<h5 className='artistName2'>RYLAND</h5> */}
					</div>
				</button>
				<button className='song3'>
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
