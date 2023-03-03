import './App.css';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/animatedRoutes';

import phone from './assets/imgs/Iphone.png';
import HomeButton from './components/homeButton/homeButton';

import TopBar from './components/topBar/topBar';
import HomeScreen from './components/homeScreen/homeScreen';

import Calender from './pages/calender/calender';
import Photos from './pages/photos/photos';
import Weather from './pages/weather/weather';
import Ipod from './pages/ipod/ipod';
import Youtube from './pages/youtube/youtube';
import Apple from './pages/apple/apple';
import Spotify from './pages/spotify/spotify';
import SoundCloud from './pages/soundcloud/soundcloud';
import Calculator from './pages/calculator/calculator';
import Flappybird from './pages/flappybird/flappyBird';

function App() {
	const documentHeight = () => {
		const doc = document.documentElement;
		doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
	};
	window.addEventListener('resize', documentHeight);
	documentHeight();

	return (
		<div className='App'>
			<div className='Frame'>
				<Router>
					<HomeButton />
					<div className='iphoneContent'>
						<TopBar />
						<AnimatedRoutes />
					</div>
					<img
						src={phone}
						className='phone'
						alt='phone'
					/>
				</Router>
			</div>
		</div>
	);
}

export default App;
