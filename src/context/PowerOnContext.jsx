import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const POWER_ON_KEY = 'homeScreenPowerOnSeen';

const PowerOnContext = createContext(null);

export const usePowerOn = () => {
	const ctx = useContext(PowerOnContext);
	if (!ctx) return { powerOnComplete: true, setPowerOnComplete: () => {} };
	return ctx;
};

export const PowerOnProvider = ({ children }) => {
	const location = useLocation();
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';

	const [powerOnComplete, setPowerOnComplete] = useState(() => {
		const seen = sessionStorage.getItem(POWER_ON_KEY) === '1';
		return seen || !isHome;
	});

	useEffect(() => {
		if (!isHome) {
			setPowerOnComplete(true);
			return;
		}
		const seen = sessionStorage.getItem(POWER_ON_KEY);
		if (seen) setPowerOnComplete(true);
	}, [isHome]);

	const handleComplete = () => {
		setPowerOnComplete(true);
		sessionStorage.setItem(POWER_ON_KEY, '1');
	};

	return (
		<PowerOnContext.Provider value={{ powerOnComplete, setPowerOnComplete: handleComplete }}>
			{children}
		</PowerOnContext.Provider>
	);
};
