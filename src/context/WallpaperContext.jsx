import React, { createContext, useContext, useState } from 'react';
import { WALLPAPERS } from '../assets/wallpapers';

// v2: only a wallpaper the visitor actually picked is saved (v1 saved the default on every visit).
const STORAGE_KEY = 'myos1-wallpaper-v2';
const DEFAULT_WALLPAPER = 'clownfish';

const WallpaperContext = createContext(null);

export function WallpaperProvider({ children }) {
	const [wallpaperId, setWallpaperIdState] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) || DEFAULT_WALLPAPER;
		} catch {
			return DEFAULT_WALLPAPER;
		}
	});

	const setWallpaperId = (id) => {
		setWallpaperIdState(id);
		try {
			localStorage.setItem(STORAGE_KEY, id);
		} catch {
			// Ignore
		}
	};

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
