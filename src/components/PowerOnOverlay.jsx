import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePowerOn } from '../context/PowerOnContext';
import './PowerOnOverlay.css';

/**
 * Full iPhone screen power-on overlay – covers TopBar + content.
 * Only shows on home screen when power-on hasn't completed.
 */
const PowerOnOverlay = () => {
	const { powerOnComplete, setPowerOnComplete } = usePowerOn();
	const [progress, setProgress] = useState(() => window.__myosBootProgress || 0.08);
	const [ready, setReady] = useState(() => Boolean(window.__myosBootReady));
	const location = useLocation();
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';
	const showOverlay = isHome && !powerOnComplete;

	useEffect(() => {
		if (ready) setPowerOnComplete();
	}, [ready, setPowerOnComplete]);

	useEffect(() => {
		const onProgress = (e) => {
			const value = e?.detail?.progress;
			if (typeof value === 'number' && !Number.isNaN(value)) {
				setProgress(Math.max(0.06, Math.min(1, value)));
			}
		};
		const onReady = () => {
			// Ensure users see a full bar before it disappears.
			setProgress(1);
			setTimeout(() => setReady(true), 1000);
		};

		window.addEventListener('myos:boot-progress', onProgress);
		window.addEventListener('myos:app-ready', onReady);

		// Handle late mount (events may have already fired)
		if (typeof window.__myosBootProgress === 'number') {
			onProgress({ detail: { progress: window.__myosBootProgress } });
		}
		if (window.__myosBootReady) {
			onReady();
		}

		return () => {
			window.removeEventListener('myos:boot-progress', onProgress);
			window.removeEventListener('myos:app-ready', onReady);
		};
	}, []);

	if (!showOverlay) return null;

	return (
		<div className="powerOnOverlay">
			<div className="powerOnBootWrap">
				<div className="powerOnBootTrack">
					<div
						className="powerOnBootFill"
						style={{ transform: `scaleX(${Math.max(0.06, Math.min(1, progress))})` }}
					/>
				</div>
			</div>
		</div>
	);
};

export default PowerOnOverlay;
