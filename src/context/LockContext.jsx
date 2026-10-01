import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lock state for the original-iPhone lock screen. The lock is an overlay on the home screen
 * (not a route), so unlocking never adds or pops browser history – swipe gestures in
 * in-app browsers can't navigate "back" through it.
 *
 * Locked: on a visitor's first arrival at the home screen each session, and again after the
 * phone is switched back on with the Power button (/off → home). Deep links into an app skip it.
 */
const UNLOCKED_KEY = 'myos-unlocked';
const LockContext = createContext({ locked: false, unlock: () => {} });

export const useLock = () => useContext(LockContext);

const seenUnlock = () => {
	try {
		return sessionStorage.getItem(UNLOCKED_KEY) === '1';
	} catch {
		return false;
	}
};

export const LockProvider = ({ children }) => {
	const location = useLocation();
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';
	const [locked, setLocked] = useState(() => isHome && !seenUnlock());
	const prevPath = useRef(location.pathname);

	useEffect(() => {
		const from = prevPath.current;
		prevPath.current = location.pathname;
		if (from === '/off' && isHome) setLocked(true);
		else if (!isHome) setLocked(false);
	}, [location.pathname, isHome]);

	const unlock = () => {
		setLocked(false);
		try {
			sessionStorage.setItem(UNLOCKED_KEY, '1');
		} catch {}
	};

	return <LockContext.Provider value={{ locked, unlock }}>{children}</LockContext.Provider>;
};
