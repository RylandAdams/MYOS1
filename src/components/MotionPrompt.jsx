import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePowerOn } from '../context/PowerOnContext';
import { useLock } from '../context/LockContext';
import './MotionPrompt.css';

/**
 * iPhone only: the motion-sensor permission can't be requested without a tap, so on the first
 * arrival at the home screen the phone shows an original-style alert. "Allow" asks iOS right away;
 * the tilt starts via the 'myos:motion-granted' event (App.js). Asked once per visitor.
 */
export const MOTION_KEY = 'myos-motion';
const ARRIVAL_PAUSE_MS = 500;

export const motionChoice = () => {
	try {
		return localStorage.getItem(MOTION_KEY);
	} catch {
		return null;
	}
};

const remember = (v) => {
	try {
		localStorage.setItem(MOTION_KEY, v);
	} catch {}
};

export const needsIOSMotionPermission = () =>
	typeof window !== 'undefined' &&
	typeof window.DeviceOrientationEvent !== 'undefined' &&
	typeof window.DeviceOrientationEvent.requestPermission === 'function' &&
	(/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export const requestMotion = () =>
	window.DeviceOrientationEvent.requestPermission()
		.then((state) => {
			remember(state === 'granted' ? 'granted' : 'denied');
			if (state === 'granted') window.dispatchEvent(new Event('myos:motion-granted'));
			return state;
		})
		.catch(() => 'denied');

const MotionPrompt = () => {
	const { powerOnComplete } = usePowerOn();
	const { locked, off } = useLock();
	const location = useLocation();
	const [open, setOpen] = useState(false);
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';

	useEffect(() => {
		if (!powerOnComplete || locked || !isHome || motionChoice() || !needsIOSMotionPermission()) return undefined;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
		// Half a second after the home screen has arrived. After unlocking, the icons are still flying
		// in, so wait for those animations to land first.
		const screen = document.querySelector('.iphoneContent');
		const flying = (screen?.getAnimations?.({ subtree: true }) || []).filter((a) => /lkFlyIn|lkDockUp/.test(a.animationName));
		let alive = true;
		let t = 0;
		Promise.all(flying.map((a) => a.finished.catch(() => {}))).then(() => {
			if (alive) t = setTimeout(() => setOpen(true), ARRIVAL_PAUSE_MS);
		});
		return () => {
			alive = false;
			clearTimeout(t);
		};
	}, [powerOnComplete, locked, isHome]);

	if (!open || off || locked) return null;

	const close = (choice) => {
		setOpen(false);
		if (choice === 'allow') requestMotion();
		else remember('later');
	};

	return (
		<div className="mpScrim" role="alertdialog" aria-labelledby="mpTitle" aria-describedby="mpBody">
			<div className="mpBox">
				<div id="mpTitle" className="mpTitle">
					Enable iPhone Tilt
				</div>
				<div id="mpBody" className="mpBody">
					Tap Allow to enable tilt.
				</div>
				<div className="mpButtons">
					<button type="button" className="mpBtn" onClick={() => close('later')}>
						Not Now
					</button>
					<button type="button" className="mpBtn mpBtnPrimary" onClick={() => close('allow')}>
						Allow
					</button>
				</div>
			</div>
		</div>
	);
};

export default MotionPrompt;
