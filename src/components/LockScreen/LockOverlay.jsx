import React, { useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useLock } from '../../context/LockContext';
import { usePowerOn } from '../../context/PowerOnContext';
import { useWallpaper } from '../../context/WallpaperContext';
import { useLocation } from 'react-router-dom';
import { playSound } from '../../utils/uiSound';
import './LockOverlay.css';

/* Original iPhone lock screen: glossy black clock panel on top, "slide to unlock" well at the
   bottom, wallpaper showing through. The knob is dragged with pointer capture and native
   non-passive touch handlers, so the browser never treats the drag as a page swipe/scroll. */

const UNLOCK_AT = 0.86; // fraction of travel that unlocks

const LockOverlay = () => {
	const { locked, unlock, off, waking } = useLock();
	const { powerOnComplete } = usePowerOn();
	const { wallpaper } = useWallpaper();
	const { pathname } = useLocation();
	const overApp = pathname !== '/' && pathname !== '/homeScreen';
	const [now, setNow] = useState(() => new Date());
	const [x, setX] = useState(0); // knob travel, px
	const [leaving, setLeaving] = useState(false);
	const trackRef = useRef(null);
	const knobRef = useRef(null);
	const drag = useRef(null);
	const xRef = useRef(0);
	// Entrance chosen once per appearance (waking from Power rises out of the dark, otherwise a soft
	// fade) – never switched mid-animation, which restarted it and caused a second blink.
	const [entry, setEntry] = useState(waking ? 'lkWaking' : 'lkAppear');
	const wasShown = useRef(false);
	const shown = locked && powerOnComplete && !off;
	if (shown && !wasShown.current) {
		wasShown.current = true;
		const want = waking ? 'lkWaking' : 'lkAppear';
		if (want !== entry) setEntry(want);
	} else if (!shown && wasShown.current) {
		wasShown.current = false;
	}

	useEffect(() => {
		if (!locked) return undefined;
		// fresh time the moment the lock shows (no stale clock after a long sleep), then per minute
		const tick = () => {
			const d = new Date();
			setNow((prev) => (prev.getMinutes() === d.getMinutes() && prev.getHours() === d.getHours() && prev.getDate() === d.getDate() ? prev : d));
		};
		tick();
		const t = setInterval(tick, 1000);
		window.addEventListener('myos:wake', tick);
		document.addEventListener('visibilitychange', tick);
		return () => {
			clearInterval(t);
			window.removeEventListener('myos:wake', tick);
			document.removeEventListener('visibilitychange', tick);
		};
	}, [locked]);

	// Mark the screen so the status bar swaps its clock for the lock glyph
	useEffect(() => {
		const screen = document.querySelector('.iphoneContent');
		const show = locked && powerOnComplete && !leaving && !off;
		screen?.classList.toggle('isLocked', show);
		return () => screen?.classList.remove('isLocked');
	}, [locked, powerOnComplete, leaving, off]);

	const maxTravel = () => {
		const t = trackRef.current;
		const k = knobRef.current;
		return t && k ? t.clientWidth - k.offsetWidth - 8 : 200;
	};

	/** Give every home icon a vector pointing out past its nearest screen edge, then reveal */
	const prepareFlyIn = () => {
		const screen = document.querySelector('.iphoneContent');
		if (!screen) return;
		const sr = screen.getBoundingClientRect();
		const cx = sr.left + sr.width / 2;
		const cy = sr.top + sr.height * 0.45;
		const scale = sr.width / screen.offsetWidth || 1; // css zoom/scale of the phone
		screen.querySelectorAll('.apps > div, .footerApps > div').forEach((el) => {
			const r = el.getBoundingClientRect();
			const dx = (r.left + r.width / 2 - cx) / scale;
			const dy = (r.top + r.height / 2 - cy) / scale;
			const len = Math.hypot(dx, dy) || 1;
			const push = 150; // px beyond where it sits
			el.style.setProperty('--fx', `${((dx / len) * push + dx * 0.6).toFixed(1)}px`);
			el.style.setProperty('--fy', `${((dy / len) * push + dy * 0.6).toFixed(1)}px`);
			el.style.setProperty('--fd', `${Math.round(len * 0.12)}ms`);
		});
		screen.classList.add('lkReveal');
	};

	const finish = () => {
		const done = xRef.current >= maxTravel() * UNLOCK_AT;
		drag.current = null;
		if (done) {
			setX(maxTravel());
			playSound('home');
			prepareFlyIn();
			setLeaving(true);
			setTimeout(() => {
				unlock();
				// reset for the next lock right away, so a later wake never starts from the slid-away state
				setLeaving(false);
				setX(0);
				xRef.current = 0;
			}, 440);
			setTimeout(() => document.querySelector('.iphoneContent')?.classList.remove('lkReveal'), 1100);
		} else {
			setX(0);
			xRef.current = 0;
		}
	};

	// Native touch listeners (non-passive) stop iOS treating the slide as a swipe or scroll
	useEffect(() => {
		const k = knobRef.current;
		const t = trackRef.current;
		if (!k || !t) return undefined;
		const stop = (e) => {
			if (drag.current) e.preventDefault();
		};
		const block = (e) => e.preventDefault();
		t.addEventListener('touchmove', stop, { passive: false });
		k.addEventListener('touchstart', block, { passive: false });
		return () => {
			t.removeEventListener('touchmove', stop);
			k.removeEventListener('touchstart', block);
		};
	});

	if (!locked || !powerOnComplete || off) return null;

	const onDown = (e) => {
		e.preventDefault();
		drag.current = { start: e.clientX - xRef.current };
		knobRef.current.setPointerCapture?.(e.pointerId);
	};
	const onMove = (e) => {
		if (!drag.current) return;
		const v = Math.max(0, Math.min(maxTravel(), e.clientX - drag.current.start));
		xRef.current = v;
		setX(v);
	};

	const onKey = (e) => {
		if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
			e.preventDefault();
			xRef.current = maxTravel();
			finish();
		}
	};

	const travel = maxTravel();
	const textFade = travel > 0 ? Math.max(0, 1 - (x / travel) * 2.2) : 1;
	const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
	const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

	return (
		<>
		{!leaving && (
			<span className="lkLock" aria-hidden>
				<FaLock />
			</span>
		)}
		<div className={`lkRoot ${entry}${leaving ? ' lkLeaving' : ''}`} aria-label="Lock screen">
			{overApp && (
				// Locked over an app: show the wallpaper like the real lock screen; it dissolves on unlock
				<div
					className="lkWall"
					style={wallpaper.type === 'image' ? { backgroundImage: `url(${wallpaper.value})` } : { background: wallpaper.value }}
				/>
			)}
			<div className="lkTop">
				<div className="lkTime">{time}</div>
				<div className="lkDate">{date}</div>
			</div>
			<div className="lkBottom">
				<div className="lkTrack" ref={trackRef}>
					<span className="lkLabel" style={{ opacity: textFade }}>
						slide to unlock
					</span>
					<button
						type="button"
						ref={knobRef}
						className="lkKnob"
						style={{ transform: `translateX(${x}px)`, transition: drag.current ? 'none' : 'transform 0.25s ease-out' }}
						onPointerDown={onDown}
						onPointerMove={onMove}
						onPointerUp={finish}
						onPointerCancel={finish}
						onKeyDown={onKey}
						aria-label="Slide to unlock"
					>
						<span className="lkArrow" />
					</button>
				</div>
			</div>
		</div>
		</>
	);
};

export default LockOverlay;
