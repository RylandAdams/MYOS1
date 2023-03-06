import './App.css';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/animatedRoutes';

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
	// window.orientation('portrait');

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
