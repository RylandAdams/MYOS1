import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { BsFillPlayFill, BsFillPauseFill, BsSkipBackwardFill, BsSkipForwardFill } from 'react-icons/bs';
import './FilesAudioPlayer.css';
import { useDarkStatusBar } from '../../utils/useDarkStatusBar';

/* Files → song: the original iPhone's black Now Playing screen. Glossy black top bar with an
   arrow-shaped back button, a black-glass "cover" drawn from the song's real waveform (tap or
   drag it to jump), a reflection, and a glossy control deck with scrubber and ⏮ ⏯ ⏭. */

const BINS = 120;

function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const m = Math.floor(seconds / 60);
	return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

/** Neutral, deterministic waveform for tracks without precomputed peaks */
function fallbackPeaks(seedStr, count) {
	let seed = [...seedStr].reduce((acc, ch) => acc + ch.charCodeAt(0), 1);
	return Array.from({ length: count }, (_, i) => {
		seed = (seed * 1103515245 + 12345) >>> 0;
		const envelope = 0.55 + 0.45 * Math.sin((i / count) * Math.PI);
		return Math.max(0.12, Math.min(1, envelope * (0.35 + (seed % 65) / 100)));
	});
}

export default function FilesAudioPlayer({ track, tracks = [track], audioRef, onClose, onSwitch }) {
	useDarkStatusBar();
	const [, redraw] = useReducer((x) => x + 1, 0);
	const waveRef = useRef(null);
	const scrubRef = useRef(null);
	const dragRef = useRef(null);

	const a = audioRef.current;
	const duration = Number.isFinite(a?.duration) ? a.duration : 0;
	const time = a && Number.isFinite(a.currentTime) ? a.currentTime : 0;
	const playing = Boolean(a && !a.paused);
	const progress = duration > 0 ? Math.min(1, time / duration) : 0;
	const peaks = useMemo(() => (track.peaks?.length ? track.peaks : fallbackPeaks(track.id, BINS)), [track]);
	const index = tracks.findIndex((t) => t.id === track.id);

	// Repaint on playback events and ~4x a second while playing
	useEffect(() => {
		const el = audioRef.current;
		if (!el) return undefined;
		const events = ['timeupdate', 'play', 'pause', 'loadedmetadata', 'durationchange', 'ended', 'seeked'];
		events.forEach((ev) => el.addEventListener(ev, redraw));
		return () => events.forEach((ev) => el.removeEventListener(ev, redraw));
	}, [audioRef]);

	const toggle = useCallback(() => {
		const el = audioRef.current;
		if (!el) return;
		if (el.paused) el.play().catch(() => {});
		else el.pause();
	}, [audioRef]);

	const step = (dir) => {
		const el = audioRef.current;
		if (dir < 0 && el && el.currentTime > 3) {
			el.currentTime = 0;
			return;
		}
		const next = tracks[index + dir];
		if (next && onSwitch) onSwitch(next);
		else if (dir < 0 && el) el.currentTime = 0;
	};

	// Space toggles, Escape closes
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === ' ') {
				e.preventDefault();
				toggle();
			} else if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [toggle, onClose]);

	/** Seek by pointer on the waveform or the scrubber (drag to scrub) */
	const seekAt = (clientX, el) => {
		const audio = audioRef.current;
		if (!audio || !el || !(audio.duration > 0)) return;
		const r = el.getBoundingClientRect();
		audio.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * audio.duration;
		redraw();
	};
	const dragHandlers = (ref) => ({
		onPointerDown: (e) => {
			dragRef.current = ref.current;
			e.currentTarget.setPointerCapture?.(e.pointerId);
			seekAt(e.clientX, ref.current);
		},
		onPointerMove: (e) => {
			if (dragRef.current === ref.current) seekAt(e.clientX, ref.current);
		},
		onPointerUp: () => {
			dragRef.current = null;
		},
		onPointerCancel: () => {
			dragRef.current = null;
		},
	});

	const subtitle = [track.modifiedTime, track.storage || 'On My Phone'].filter(Boolean).join(' · ');
	const playedBins = Math.round(progress * peaks.length);

	return (
		<div className="fpRoot" role="dialog" aria-label={`Now playing: ${track.title}`}>
			<header className="fpTop">
				<button type="button" className="fpBack" onClick={onClose}>
					<span className="fpBackLabel">Files</span>
				</button>
				<div className="fpMeta">
					<span className="fpTitle">{track.title}</span>
					<span className="fpSub">{subtitle}</span>
				</div>
			</header>

			<div className="fpArtWrap">
				<div
					className="fpArt"
					ref={waveRef}
					{...dragHandlers(waveRef)}
					role="slider"
					aria-label="Seek"
					aria-valuemin={0}
					aria-valuemax={Math.round(duration)}
					aria-valuenow={Math.round(time)}
				>
					<div className="fpArtLabel">{track.title}</div>
					<div className="fpWave" aria-hidden>
						{peaks.map((h, i) => (
							<span key={i} className={i < playedBins ? 'fpBar fpBarOn' : 'fpBar'} style={{ height: `${Math.round(h * 100)}%` }} />
						))}
						{/* the playhead appears once the song is under way (at 0:00 it read as a stray mark) */}
						<span className="fpHead" style={{ left: `${progress * 100}%`, opacity: time > 0.15 ? 1 : 0 }} />
					</div>
					<div className="fpArtFoot">RYLAND</div>
				</div>
			</div>

			<div className="fpDeck">
				<div className="fpScrub">
					<span className="fpTime">{formatTime(time)}</span>
					<div className="fpRail" ref={scrubRef} {...dragHandlers(scrubRef)}>
						<span className="fpRailFill" style={{ width: `${progress * 100}%` }} />
						<span className="fpKnob" style={{ left: `${progress * 100}%` }} />
					</div>
					<span className="fpTime">-{formatTime(Math.max(0, duration - time))}</span>
				</div>
				<div className="fpButtons">
					<button type="button" className="fpBtn" onClick={() => step(-1)} aria-label="Previous / restart">
						<BsSkipBackwardFill />
					</button>
					<button type="button" className="fpBtn fpBtnMain" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
						{playing ? <BsFillPauseFill /> : <BsFillPlayFill />}
					</button>
					<button type="button" className="fpBtn" onClick={() => step(1)} disabled={index >= tracks.length - 1} aria-label="Next">
						<BsSkipForwardFill />
					</button>
				</div>
			</div>
		</div>
	);
}
