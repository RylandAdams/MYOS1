import React, { useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useLock } from '../../context/LockContext';
import { usePowerOn } from '../../context/PowerOnContext';
import { playSound } from '../../utils/uiSound';
import './LockOverlay.css';

/* Original iPhone lock screen: glossy black clock panel on top, "slide to unlock" well at the
   bottom, wallpaper showing through. The knob is dragged with pointer capture and native
   non-passive touch handlers, so the browser never treats the drag as a page swipe/scroll. */

const UNLOCK_AT = 0.86; // fraction of travel that unlocks

const LockOverlay = () => {
	const { locked, unlock } = useLock();
	const { powerOnComplete } = usePowerOn();
	const [now, setNow] = useState(() => new Date());
	const [x, setX] = useState(0); // knob travel, px
	const [leaving, setLeaving] = useState(false);
	const trackRef = useRef(null);
	const knobRef = useRef(null);
	const drag = useRef(null);
	const xRef = useRef(0);

	useEffect(() => {
		if (!locked) return undefined;
		const t = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(t);
	}, [locked]);

	// Mark the screen so the status bar swaps its clock for the lock glyph
	useEffect(() => {
		const screen = document.querySelector('.iphoneContent');
		const show = locked && powerOnComplete && !leaving;
		screen?.classList.toggle('isLocked', show);
		return () => screen?.classList.remove('isLocked');
	}, [locked, powerOnComplete, leaving]);

	useEffect(() => {
		if (locked) {
			setX(0);
			xRef.current = 0;
			setLeaving(false);
		}
	}, [locked]);

	const maxTravel = () => {
		const t = trackRef.current;
		const k = knobRef.current;
		return t && k ? t.clientWidth - k.offsetWidth - 8 : 200;
	};

	const finish = () => {
		const done = xRef.current >= maxTravel() * UNLOCK_AT;
		drag.current = null;
		if (done) {
			setX(maxTravel());
			playSound('home');
			setLeaving(true);
			setTimeout(unlock, 380);
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

	if (!locked || !powerOnComplete) return null;

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
		<div className={`lkRoot${leaving ? ' lkLeaving' : ''}`} aria-label="Lock screen">
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
