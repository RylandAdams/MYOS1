import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import LockScreen from './LockScreen/lockScreen';
import HomeScreen from './homeScreen/homeScreen';
import OffScreen from './offScreen/offScreen';

// MAIN APPS
import Calender from '../pages/calender/calender';
import Photos from '../pages/photos/photos';
import Weather from '../pages/weather/weather';
import Ipod from '../pages/ipod/ipod';
import Youtube from '../pages/youtube/youtube';
import Apple from '../pages/apple/apple';
import Spotify from '../pages/spotify/spotify';
import SoundCloud from '../pages/soundcloud/soundcloud';
import Flappybird from '../pages/flappybird/flappyBird';

// FOOTER APPS
import Messages from '../pages/messages/messages';
import Settings from '../pages/settings/settings';

// MESSAGE CONVERSATIONS
import RickRubin from '../pages/messages/Conversations/RickRubin/RickRubin';
import LouisBell from '../pages/messages/Conversations/LouisBell/LouisBell';

import { AnimatePresence } from 'framer-motion';

const AnimatedRoutes = () => {
	let location = useLocation();

	let searchBarURL = window.location.href;
	console.log(searchBarURL);

	return (
		<AnimatePresence>
			<Routes
				location={location}
				key={location.pathname}
			>
				<Route
					path={'*'}
					element={<HomeScreen />}
				/>
				<Route
					path='/'
					element={<LockScreen />}
				></Route>
				<Route
					path='/off'
					element={<OffScreen />}
				></Route>
				<Route
					path='/homeScreen'
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
					path='/flappyBird'
					element={<Flappybird />}
				/>
				// FOOTER APPS -------------
				<Route
					path='/settings'
					element={<Settings />}
				/>
				<Route
					path='/messages'
					element={<Messages />}
				/>
				// MESSAGE CONVERSATIONS ------
				<Route
					path='/messages/RickRubin'
					element={<RickRubin />}
				/>
				<Route
					path='/messages/Virmedius'
					element={<LouisBell />}
				/>
			</Routes>
		</AnimatePresence>
	);
};

export default AnimatedRoutes;
