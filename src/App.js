import './App.css';
import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/animatedRoutes';

import hand from './assets/imgs/HAND.jpg';
import phone from './assets/imgs/Iphone.png';
import HomeButton from './components/homeButton/homeButton';

import TopBar from './components/topBar/topBar';

function App() {
	const documentHeight = () => {
		const doc = document.documentElement;
		doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
		doc.style.setProperty('--doc-width', `${window.innerWidth}px`);
	};
	window.addEventListener('resize', documentHeight);
	documentHeight();

	return (
		<div className='App'>
			<div className='Frame'>
				<Router>
					<HomeButton />
					<div className='wallpaper'></div>
					<div className='iphoneContent'>
						<TopBar />
						<AnimatedRoutes />
					</div>
					<div className='backLit'></div>
					<img
						src={hand}
						className='hand'
						alt='hand'
					/>

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
