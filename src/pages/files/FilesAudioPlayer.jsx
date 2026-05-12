import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MdClose, MdPause, MdPlayArrow } from 'react-icons/md';
import '../../components/AppHeaderBar/AppHeaderBar.css';
import './FilesAudioPlayer.css';

function formatAudioTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, '0')}`;
}

/** Deterministic filler bars (shown while decoding fails or loads). Heights 14–92%. */
function waveBarHeights(seedStr, count) {
	let seed = [...seedStr].reduce((acc, ch) => acc + ch.charCodeAt(0), 1);
	return Array.from({ length: count }, () => {
		seed = (seed * 1103515245 + 12345) >>> 0;
		const raw = (12 + (seed % 58)) / 69;
		return Math.max(0.14, Math.min(0.94, raw));
	});
}

const SEEK_WAVE_BIN_COUNT = 140;

/** Max-abs peaks per slice, normalized 0–1 with a shallow floor so silence still reads visually. */
function peaksFromAudioBuffer(buffer, bins) {
	const channels = Math.min(buffer.numberOfChannels, 2);
	const len = buffer.length;
	const slice = len / bins;
	const merged = [];

	for (let i = 0; i < bins; i++) {
		const start = Math.floor(i * slice);
		const end = Math.floor((i + 1) * slice);
		let max = 0;
		for (let c = 0; c < channels; c++) {
			const ch = buffer.getChannelData(c);
			for (let j = start; j < end && j < len; j++) max = Math.max(max, Math.abs(ch[j]));
		}
		merged.push(max);
	}

	const peakMax = merged.reduce((acc, x) => Math.max(acc, x), 0) || 1;
	return merged.map((p) => Math.max(0.1, Math.min(1, p / peakMax)));
}

async function decodeTrackPeaks(audioUrl, bins, abortSignal) {
	const res = await fetch(audioUrl, { signal: abortSignal });
	if (!res.ok) throw new Error(`decode failed: ${res.status}`);
	const arrayBuffer = await res.arrayBuffer();

	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	const ctx = new AudioCtx();

	try {
		const copy = arrayBuffer.byteLength === 0 ? arrayBuffer : arrayBuffer.slice(0);
		const buffer = await ctx.decodeAudioData(copy);
		return peaksFromAudioBuffer(buffer, bins);
	} finally {
		try {
			await ctx.close();
		} catch {
			/* ignore */
		}
	}
}

export default function FilesAudioPlayer({ track, audioRef, onClose }) {
	const [, redraw] = useReducer((x) => x + 1, 0);
	const barRef = useRef(null);
	const draggingSeekRef = useRef(false);
	const wasPlayingBeforeSeekRef = useRef(false);
	const [seekPeaksFromAudio, setSeekPeaksFromAudio] = useState(null);
	const [seekScrubbing, setSeekScrubbing] = useState(false);

	const el = audioRef.current;
	const duration = Number.isFinite(el?.duration) ? el.duration : 0;
	const displayTime = el && Number.isFinite(el.currentTime) ? el.currentTime : 0;
	const isPlaying = Boolean(el && !el.paused);
	const showPauseTransport = seekScrubbing ? wasPlayingBeforeSeekRef.current : isPlaying;
	const pct = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

	const artHeights = useMemo(() => {
		const p = seekPeaksFromAudio;
		if (p && p.length >= 8) {
			const n = 36;
			return Array.from({ length: n }, (_, i) => {
				const idx = Math.min(p.length - 1, Math.floor((i / (n - 1)) * (p.length - 1)));
				return p[idx];
			});
		}
		return waveBarHeights(track.id, 36);
	}, [seekPeaksFromAudio, track.id]);

	const seekWaveHeights = useMemo(() => {
		if (seekPeaksFromAudio && seekPeaksFromAudio.length >= 8) return seekPeaksFromAudio;
		return waveBarHeights(track.id, SEEK_WAVE_BIN_COUNT);
	}, [seekPeaksFromAudio, track.id]);

	useEffect(() => {
		if (!track?.src) return undefined;
		const ac = new AbortController();
		let canceled = false;
		setSeekPeaksFromAudio(null);

		decodeTrackPeaks(track.src, SEEK_WAVE_BIN_COUNT, ac.signal)
			.then((peaks) => {
				if (canceled) return;
				setSeekPeaksFromAudio(peaks);
			})
			.catch((err) => {
				if (canceled || err?.name === 'AbortError') return;
				setSeekPeaksFromAudio(null);
			});

		return () => {
			canceled = true;
			ac.abort();
		};
	}, [track.id, track.src]);

	const seekFromClientX = useCallback(
		(clientX) => {
			const a = audioRef.current;
			const bar = barRef.current;
			if (!a || !bar || !Number.isFinite(a.duration) || a.duration <= 0) return;
			const r = bar.getBoundingClientRect();
			const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
			a.currentTime = p * a.duration;
			redraw();
		},
		[audioRef]
	);

	const togglePlay = useCallback(() => {
		const a = audioRef.current;
		if (!a) return;
		if (a.paused) void a.play();
		else a.pause();
		redraw();
	}, [audioRef]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return undefined;
		const bump = () => redraw();
		a.addEventListener('timeupdate', bump);
		a.addEventListener('loadedmetadata', bump);
		a.addEventListener('durationchange', bump);
		a.addEventListener('play', bump);
		a.addEventListener('pause', bump);
		a.addEventListener('ended', bump);
		return () => {
			a.removeEventListener('timeupdate', bump);
			a.removeEventListener('loadedmetadata', bump);
			a.removeEventListener('durationchange', bump);
			a.removeEventListener('play', bump);
			a.removeEventListener('pause', bump);
			a.removeEventListener('ended', bump);
		};
	}, [track.id, audioRef]);

	useEffect(() => {
		const end = () => {
			if (!draggingSeekRef.current) return;
			draggingSeekRef.current = false;
			setSeekScrubbing(false);
			const a = audioRef.current;
			if (a && wasPlayingBeforeSeekRef.current) void a.play();
			redraw();
		};
		const moveMouse = (e) => {
			if (!draggingSeekRef.current) return;
			seekFromClientX(e.clientX);
		};
		const moveTouch = (e) => {
			if (!draggingSeekRef.current || !e.touches[0]) return;
			e.preventDefault();
			seekFromClientX(e.touches[0].clientX);
		};
		window.addEventListener('mouseup', end);
		window.addEventListener('mousemove', moveMouse);
		window.addEventListener('touchend', end);
		window.addEventListener('touchcancel', end);
		window.addEventListener('touchmove', moveTouch, { passive: false });
		return () => {
			window.removeEventListener('mouseup', end);
			window.removeEventListener('mousemove', moveMouse);
			window.removeEventListener('touchend', end);
			window.removeEventListener('touchcancel', end);
			window.removeEventListener('touchmove', moveTouch);
		};
	}, [seekFromClientX]);

	const onSeekDown = (e) => {
		const a = audioRef.current;
		if (a && Number.isFinite(a.duration) && a.duration > 0) {
			wasPlayingBeforeSeekRef.current = !a.paused;
			if (!a.paused) a.pause();
		} else {
			wasPlayingBeforeSeekRef.current = false;
		}
		draggingSeekRef.current = true;
		setSeekScrubbing(true);
		const touchX = e.touches?.[0]?.clientX;
		const mouseX = e.nativeEvent.changedTouches?.[0]?.clientX ?? e.clientX;
		const x = typeof touchX === 'number' ? touchX : mouseX;
		if (typeof x === 'number') seekFromClientX(x);
	};

	const dm = Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 0;
	const durLabel = duration > 0 ? formatAudioTime(duration) : '--:--';

	return (
		<div className='filesPlayerRoot' role='dialog' aria-label='Audio player' aria-modal='true'>
			<header className='appHeaderBar'>
				<button type='button' className='filesPlayerBack' onClick={onClose} aria-label='Back'>
					<MdClose />
				</button>
				<h1 className='appHeaderTitle'>{track.title}</h1>
			</header>

			<div className='filesPlayerBody'>
				<div className='filesPlayerBodyMain'>
					<div className='filesPlayerArtCard'>
						<div className='filesPlayerWaveField' aria-hidden>
							{artHeights.map((h, i) => (
								<span
									key={`${track.id}-w-${i}`}
									className='filesPlayerWaveBar'
									style={{ height: `${h * 100}%` }}
								/>
							))}
						</div>
						<button
							type='button'
							className={`filesPlayerPlayInCard ${showPauseTransport ? 'filesPlayerPlayInCard-pause' : 'filesPlayerPlayInCard-play'}`}
							onClick={togglePlay}
							aria-label={showPauseTransport ? 'Pause' : 'Play'}
						>
							{showPauseTransport ? <MdPause /> : <MdPlayArrow />}
						</button>
					</div>
				</div>

				<section className='filesPlayerTransport' aria-label='Playback'>
					<div className='filesPlayerTimeRow'>
						<span className='filesPlayerTimeNow'>{formatAudioTime(displayTime)}</span>
						<span className='filesPlayerTimeSep'>/</span>
						<span className='filesPlayerTimeTotal'>{durLabel}</span>
					</div>

					<div
						ref={barRef}
						className='filesPlayerSeekTrack'
						onMouseDown={onSeekDown}
						onTouchStart={onSeekDown}
						role='slider'
						tabIndex={0}
						aria-valuemin={0}
						aria-valuemax={dm}
						aria-valuenow={Math.min(dm, Math.max(0, Math.round(displayTime)))}
						aria-valuetext={formatAudioTime(displayTime)}
					>
						<div className='filesPlayerSeekRail filesPlayerSeekRail--waves'>
							<div className='filesPlayerWaveSeekStack'>
								<div className='filesPlayerWaveSeekBars filesPlayerWaveSeekBars-muted' aria-hidden>
									{seekWaveHeights.map((nh, i) => (
										<span
											key={`${track.id}-sm-${i}`}
											className='filesPlayerWaveSeekBar'
											style={{ height: `${nh * 100}%` }}
										/>
									))}
								</div>
								<div
									className='filesPlayerWaveSeekBars filesPlayerWaveSeekBars-played'
									style={{ clipPath: `inset(0 ${(100 - pct).toFixed(3)}% 0 0)` }}
									aria-hidden
								>
									{seekWaveHeights.map((nh, i) => (
										<span
											key={`${track.id}-sp-${i}`}
											className='filesPlayerWaveSeekBar'
											style={{ height: `${nh * 100}%` }}
										/>
									))}
								</div>
							</div>
							<span className='filesPlayerSeekThumb filesPlayerSeekThumb--waves' style={{ left: `${pct}%` }} />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
