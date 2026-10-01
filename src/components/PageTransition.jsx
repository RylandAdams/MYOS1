import React, { Suspense, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Each app suspends inside its own boundary while its code finishes loading, so the page being
 * left (e.g. the home screen) keeps animating instead of being blanked by a shared fallback.
 *
 * Original-iPhone app launch: the app grows out of the icon that was tapped (its position is
 * recorded by the icon – see launchFrom) and shrinks back into it when you go home.
 * Without a recent tap (deep link, back button) it rises gently from the centre.
 */
const EASE_OUT = [0.22, 0.68, 0.18, 1]; // smooth acceleration out of the icon, long gentle settle
const EASE_IN = [0.5, 0, 0.75, 0.2];

/** Called by home-screen icons on tap: where the app should grow from (screen px) */
export function launchFrom(el) {
	const screen = document.querySelector('.iphoneContent');
	if (!el || !screen) return;
	const s = screen.getBoundingClientRect();
	const r = el.getBoundingClientRect();
	const zoom = s.width / (screen.offsetWidth || s.width);
	window.__myosLaunch = {
		x: (r.left + r.width / 2 - s.left) / zoom,
		y: (r.top + Math.min(r.height, r.width) / 2 - s.top) / zoom,
		t: Date.now(),
	};
}

const PageTransition = ({ children }) => {
	const reduced = useReducedMotion();
	const [launch] = useState(() => {
		const l = window.__myosLaunch;
		return l && Date.now() - l.t < 1500 ? l : null;
	});
	window.__myosFromApp = true;

	const origin = launch ? `${Math.round(launch.x)}px ${Math.round(launch.y)}px` : '50% 50%';
	const from = launch ? 0.08 : 0.92;

	if (reduced) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.18 }}
				style={{ height: '100%', minHeight: '100%' }}
			>
				<Suspense fallback={null}>{children}</Suspense>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: from }}
			animate={{ opacity: 1, scale: 1, transition: { scale: { duration: 0.5, ease: EASE_OUT }, opacity: { duration: 0.2, ease: 'linear' } } }}
			exit={{ opacity: 0, scale: launch ? 0.08 : 0.92, transition: { scale: { duration: 0.34, ease: EASE_IN }, opacity: { duration: 0.2, delay: 0.14, ease: 'linear' } } }}
			style={{ position: 'absolute', inset: 0, height: '100%', minHeight: '100%', transformOrigin: origin, zIndex: 2 }}
		>
			<Suspense fallback={null}>{children}</Suspense>
		</motion.div>
	);
};

export default PageTransition;
