import React, { createContext, useContext, useState, useEffect } from 'react';
import { WALLPAPERS } from '../assets/wallpapers';

const STORAGE_KEY = 'myos1-wallpaper';

const WallpaperContext = createContext(null);

export function WallpaperProvider({ children }) {
	const [wallpaperId, setWallpaperId] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) || 'default';
		} catch {
			return 'default';
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, wallpaperId);
		} catch {
			// Ignore
		}
	}, [wallpaperId]);

	const wallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) || WALLPAPERS[0];

	return (
		<WallpaperContext.Provider value={{ wallpaper, wallpaperId, setWallpaperId, wallpapers: WALLPAPERS }}>
			{children}
		</WallpaperContext.Provider>
	);
}

export function useWallpaper() {
	const ctx = useContext(WallpaperContext);
	if (!ctx) throw new Error('useWallpaper must be used within WallpaperProvider');
	return ctx;
}
