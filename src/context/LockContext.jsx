import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Lock + power state for the original-iPhone lock screen. Both are overlays (not routes), so
 * locking, unlocking and power never add or pop browser history – swipe gestures in in-app
 * browsers can't navigate "back" through them.
 *
 * Locked: on a visitor's first arrival at the home screen each session, and every time the
 * phone wakes from the Power button. Deep links into an app skip it.
 */
const UNLOCKED_KEY = 'myos-unlocked';
const LockContext = createContext({ locked: false, off: false, unlock: () => {}, togglePower: () => {}, wake: () => {} });

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
	const navigate = useNavigate();
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';
	const [locked, setLocked] = useState(() => isHome && !seenUnlock());
	const [off, setOff] = useState(false);
	const [waking, setWaking] = useState(false);
	const prevPath = useRef(location.pathname);

	useEffect(() => {
		const from = prevPath.current;
		prevPath.current = location.pathname;
		// legacy /off route (old links): waking from it locks too
		if (from === '/off' && isHome) setLocked(true);
		else if (!isHome && !off) setLocked(false);
	}, [location.pathname, isHome, off]);

	const unlock = () => {
		setLocked(false);
		try {
			sessionStorage.setItem(UNLOCKED_KEY, '1');
		} catch {}
	};

	const powerOff = () => {
		document.querySelectorAll('audio').forEach((a) => {
			try {
				a.pause();
			} catch {}
		});
		window.dispatchEvent(new CustomEvent('closeFolder'));
		setOff(true);
	};

	const wake = () => {
		if (!isHome) navigate('/', { replace: true });
		setLocked(true);
		setWaking(true);
		setOff(false);
		setTimeout(() => setWaking(false), 900);
	};

	const togglePower = () => (off ? wake() : powerOff());

	return (
		<LockContext.Provider value={{ locked, off, waking, unlock, togglePower, wake }}>{children}</LockContext.Provider>
	);
};
