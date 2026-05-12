import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from './PageTransition';
import PageFallback from './PageFallback';
import HomeScreen from './homeScreen/homeScreen';
import OffScreen from './offScreen/offScreen';

const Calender = lazy(() => import('../pages/calender/calender'));
const Photos = lazy(() => import('../pages/photos/photos'));
const Weather = lazy(() => import('../pages/weather/weather'));
const Ipod = lazy(() => import('../pages/ipod/ipod'));
const Youtube = lazy(() => import('../pages/youtube/youtube'));
const Apple = lazy(() => import('../pages/apple/apple'));
const Spotify = lazy(() => import('../pages/spotify/spotify'));
const SoundCloud = lazy(() => import('../pages/soundcloud/soundcloud'));
const Flappybird = lazy(() => import('../pages/flappybird/flappyBird'));
const News = lazy(() => import('../pages/news/news'));
const ArticleReader = lazy(() => import('../pages/news/ArticleReader'));

const Messages = lazy(() => import('../pages/messages/messages'));
const Settings = lazy(() => import('../pages/settings/settings'));
const Files = lazy(() => import('../pages/files/files'));

const RickRubin = lazy(() => import('../pages/messages/Conversations/RickRubin/RickRubin'));
const LouisBell = lazy(() => import('../pages/messages/Conversations/LouisBell/LouisBell'));

const AnimatedRoutes = () => {
	let location = useLocation();

	return (
		<AnimatePresence mode="sync" initial={false}>
			<Suspense fallback={<PageFallback />}>
				<Routes
					location={location}
					key={location.pathname}
				>
				{/* Homepage: myos1.org goes straight to home screen (lock screen commented out) */}
				<Route
					path='/'
					element={<HomeScreen />}
				/>
				{/* <Route path='/lock' element={<LockScreen />} /> */}
				<Route
					path={'*'}
					element={<HomeScreen />}
				/>
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
					element={<PageTransition><Calender /></PageTransition>}
				/>
				<Route
					path='/photos'
					element={<PageTransition><Photos /></PageTransition>}
				/>
				<Route
					path='/weather'
					element={<PageTransition><Weather /></PageTransition>}
				/>
				<Route
					path='/ipod'
					element={<PageTransition><Ipod /></PageTransition>}
				/>
				<Route
					path='/youtube'
					element={<PageTransition><Youtube /></PageTransition>}
				/>
				<Route
					path='/apple'
					element={<PageTransition><Apple /></PageTransition>}
				/>
				<Route
					path='/spotify'
					element={<PageTransition><Spotify /></PageTransition>}
				/>
				<Route
					path='/soundcloud'
					element={<PageTransition><SoundCloud /></PageTransition>}
				/>
				<Route
					path='/flappyBird'
					element={<PageTransition><Flappybird /></PageTransition>}
				/>
				<Route
					path='/news'
					element={<PageTransition><News /></PageTransition>}
				/>
				<Route
					path='/news/:id'
					element={<PageTransition><ArticleReader /></PageTransition>}
				/>
				{/* FOOTER APPS */}
				<Route
					path='/settings'
					element={<PageTransition><Settings /></PageTransition>}
				/>
				<Route
					path='/files'
					element={<PageTransition><Files /></PageTransition>}
				/>
				<Route
					path='/messages'
					element={<PageTransition><Messages /></PageTransition>}
				/>
				{/* MESSAGE CONVERSATIONS */}
				<Route
					path='/messages/RickRubin'
					element={<PageTransition><RickRubin /></PageTransition>}
				/>
				<Route
					path='/messages/Virmedius'
					element={<PageTransition><LouisBell /></PageTransition>}
				/>
				</Routes>
			</Suspense>
		</AnimatePresence>
	);
};

export default AnimatedRoutes;
