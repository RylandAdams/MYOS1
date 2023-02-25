import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import MineSweeper from './pages/minesweeper/mineSweeper';

function App() {
	return (
		<div className='App'>
			<div className='iphoneFrame'>
				<div className='iphoneContent'>
					<Router>
						<TopBar />
						<HomeButton />
						<Routes>
							<Route
								path='/'
								element={<HomeScreen />}
							/>
							<Route
								path='/calender'
								element={<Calender />}
							/>
							<Route
								path='/photos'
								element={<Photos />}
							/>
							<Route
								path='/weather'
								element={<Weather />}
							/>
							<Route
								path='/ipod'
								element={<Ipod />}
							/>
							<Route
								path='/youtube'
								element={<Youtube />}
							/>
							<Route
								path='/apple'
								element={<Apple />}
							/>
							<Route
								path='/spotify'
								element={<Spotify />}
							/>
							<Route
								path='/soundcloud'
								element={<SoundCloud />}
							/>
							<Route
								path='/calculator'
								element={<Calculator />}
							/>
							<Route
								path='/minesweeper'
								element={<MineSweeper />}
							/>
						</Routes>
					</Router>
				</div>
			</div>
		</div>
	);
}

export default App;
