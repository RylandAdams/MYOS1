import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from './PageTransition';
import ExternalRedirect from './ExternalRedirect';
import PageFallback from './PageFallback';
import HomeScreen from './homeScreen/homeScreen';
import OffScreen from './offScreen/offScreen';

const Calender = lazy(() => import('../pages/calender/calender'));
const Photos = lazy(() => import('../pages/photos/photos'));
const Weather = lazy(() => import('../pages/weather/weather'));
const Ipod = lazy(() => import('../pages/ipod/ipod'));
const Flappybird = lazy(() => import('../pages/flappybird/flappyBird'));
const News = lazy(() => import('../pages/news/news'));
const ArticleReader = lazy(() => import('../pages/news/ArticleReader'));

const Messages = lazy(() => import('../pages/messages/messages'));
const Settings = lazy(() => import('../pages/settings/settings'));
const Files = lazy(() => import('../pages/files/files'));
const VoiceMemos = lazy(() => import('../pages/voicememos/voicememos'));

const RickRubin = lazy(() => import('../pages/messages/Conversations/RickRubin/RickRubin'));

const AnimatedRoutes = () => {
	let location = useLocation();

	return (
		/* Routes must be AnimatePresence's direct, keyed child so the page being left stays mounted
		   while it animates out (Suspense in between made it vanish instantly). '/' and '/homeScreen'
		   share a key so going home from home doesn't replay anything. */
		<Suspense fallback={<PageFallback />}>
			<AnimatePresence mode="sync" initial={false}>
				<Routes
					location={location}
					key={location.pathname === '/homeScreen' ? '/' : location.pathname}
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
				{/* the correct spelling opens the same app */}
				<Route path='/calendar' element={<Navigate to='/calender' replace />} />
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
					element={<ExternalRedirect appName='YouTube' />}
				/>
				<Route
					path='/apple'
					element={<ExternalRedirect appName='Apple' />}
				/>
				<Route
					path='/spotify'
					element={<ExternalRedirect appName='Spotify' />}
				/>
				<Route
					path='/soundcloud'
					element={<ExternalRedirect appName='SoundCloud' />}
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
					path='/voicememos'
					element={<PageTransition><VoiceMemos /></PageTransition>}
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
					element={<Navigate to='/messages' replace />}
				/>
				</Routes>
			</AnimatePresence>
		</Suspense>
	);
};

export default AnimatedRoutes;
