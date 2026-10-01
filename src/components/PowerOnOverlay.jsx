import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePowerOn } from '../context/PowerOnContext';
import './PowerOnOverlay.css';

/** Must exceed .powerOnBootFill width transition if transitionend is missed */
const BOOT_BAR_FALLBACK_MS = 600;
/** Boot screen fade to black before the lock screen rises */
const FADE_OUT_MS = 700;
/** Then the black dissolves over the lock screen */
const REVEAL_MS = 1000;

/**
 * Full iPhone screen power-on overlay – covers TopBar + content.
 * Only shows on home screen when power-on hasn't completed.
 */
const PowerOnOverlay = () => {
	const { powerOnComplete, setPowerOnComplete } = usePowerOn();
	const [progress, setProgress] = useState(() =>
		typeof window.__myosBootProgress === 'number' ? window.__myosBootProgress : 0.01
	);
	const [ready, setReady] = useState(() => Boolean(window.__myosBootReady));
	const dismissTimeoutRef = useRef(null);
	const fillRef = useRef(null);
	const location = useLocation();
	const isHome = location.pathname === '/' || location.pathname === '/homeScreen';
	const showOverlay = isHome && !powerOnComplete;

	// Fade the boot screen down to black before handing over to the lock screen
	const [fading, setFading] = useState(false);
	// After the wordmark fades, the black itself dissolves so the lock screen rises out of it
	const [revealing, setRevealing] = useState(false);
	useEffect(() => {
		if (!ready) return undefined;
		setFading(true);
		const t1 = setTimeout(() => {
			setRevealing(true);
			setPowerOnComplete();
		}, FADE_OUT_MS);
		const t2 = setTimeout(() => setRevealing(false), FADE_OUT_MS + REVEAL_MS);
		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	}, [ready, setPowerOnComplete]);

	useEffect(() => {
		let alive = true;
		const clearDismissTimeout = () => {
			if (dismissTimeoutRef.current != null) {
				clearTimeout(dismissTimeoutRef.current);
				dismissTimeoutRef.current = null;
			}
		};

		const onProgress = (e) => {
			const value = e?.detail?.progress;
			if (typeof value === 'number' && !Number.isNaN(value)) {
				setProgress(Math.max(0.01, Math.min(1, value)));
			}
		};

		const onReady = () => {
			setProgress(1);

			const start =
				typeof window.__myosBootStartedAt === 'number'
					? window.__myosBootStartedAt
					: Date.now();
			// rhythm: ~0.9s of black, wordmark rises, bar fills, a held beat, fade out
			const minTotalMs = 4300;
			const holdFullBarMs = 650;

			const scheduleDismiss = () => {
				if (!alive) return;
				const elapsed = Date.now() - start;
				const remainingForMinTotal = Math.max(0, minTotalMs - elapsed);
				const waitMs = Math.max(holdFullBarMs, remainingForMinTotal);

				clearDismissTimeout();
				dismissTimeoutRef.current = setTimeout(() => {
					dismissTimeoutRef.current = null;
					if (alive) setReady(true);
				}, waitMs);
			};

			clearDismissTimeout();

			// Let width hit 100% and wait for the CSS transition to finish before starting the hold timer.
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (!alive) return;
					const el = fillRef.current;
					if (!el) {
						scheduleDismiss();
						return;
					}

					let settled = false;
					let fallbackId;
					const finish = () => {
						if (!alive || settled) return;
						settled = true;
						if (fallbackId != null) window.clearTimeout(fallbackId);
						el.removeEventListener('transitionend', onEnd);
						scheduleDismiss();
					};
					const onEnd = (e) => {
						if (e.target !== el) return;
						if (e.propertyName !== 'width') return;
						// Ignore bubbled / spurious ends with no real duration
						if (typeof e.elapsedTime === 'number' && e.elapsedTime < 0.05) return;
						finish();
					};

					el.addEventListener('transitionend', onEnd);
					fallbackId = window.setTimeout(finish, BOOT_BAR_FALLBACK_MS);
				});
			});
		};

		window.addEventListener('myos:boot-progress', onProgress);
		window.addEventListener('myos:app-ready', onReady);

		if (typeof window.__myosBootProgress === 'number') {
			onProgress({ detail: { progress: window.__myosBootProgress } });
		}
		if (window.__myosBootReady) {
			onReady();
		}

		return () => {
			alive = false;
			clearDismissTimeout();
			window.removeEventListener('myos:boot-progress', onProgress);
			window.removeEventListener('myos:app-ready', onReady);
		};
	}, []);

	if (!showOverlay && !revealing) return null;

	return (
		<div className={`powerOnOverlay${fading ? ' powerOnFading' : ''}${revealing ? ' powerOnRevealing' : ''}`}>
			<div className="powerOnBootWrap">
				{/* Same horizontal anchor as .clockIpod: left 50.5% + translateX(-50%) → +0.5% vs pure center */}
				<div className="powerOnBootInner">
					<div className="powerOnBootTitle">RYLAND</div>
					<div className="powerOnBootTrack">
						<div
							ref={fillRef}
							className="powerOnBootFill"
							style={{
								width: `${progress >= 1 ? 100 : Math.max(1, progress * 100)}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PowerOnOverlay;
