import React, { useEffect, useRef, useState } from 'react';
import './voicememos.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { VOICE_MEMOS } from '../../assets/voiceMemos';

/* iPhone OS 3 Voice Memos: a chrome microphone over a cream analog level meter whose needle
   follows the memo actually playing (Web Audio analyser), and the list of recordings below.
   Tap a memo to play; tap again to pause; the playing row shows its progress. */

const fmt = (s) => (Number.isFinite(s) && s >= 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

function whenLabel(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
}
function timeLabel(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Analog VU meter – needle angle from -48° (rest) to +48° (peak) */
function Meter({ level }) {
	const angle = -48 + Math.min(1, level) * 96;
	return (
		<div className="vmMeter" aria-hidden>
			<svg viewBox="0 0 200 110" className="vmMeterFace">
				<defs>
					<radialGradient id="vmCream" cx="50%" cy="100%" r="100%">
						<stop offset="0%" stopColor="#fffbe8" />
						<stop offset="100%" stopColor="#e9dfb8" />
					</radialGradient>
				</defs>
				<rect x="0" y="0" width="200" height="110" rx="8" fill="url(#vmCream)" />
				{Array.from({ length: 11 }, (_, i) => {
					const a = ((-48 + i * 9.6) * Math.PI) / 180;
					const r1 = i % 2 ? 74 : 70;
					return (
						<line
							key={i}
							x1={100 + Math.sin(a) * r1}
							y1={104 - Math.cos(a) * r1}
							x2={100 + Math.sin(a) * 82}
							y2={104 - Math.cos(a) * 82}
							stroke={i >= 8 ? '#c8231b' : '#3a3428'}
							strokeWidth={i % 2 ? 1.2 : 2}
						/>
					);
				})}
				<path d="M 160 44 A 82 82 0 0 1 176 64" fill="none" stroke="#c8231b" strokeWidth="5" opacity="0.85" />
				<text x="100" y="66" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3a3428" fontFamily="Helvetica Neue, Helvetica, Arial">VU</text>
			</svg>
			<div className="vmNeedle" style={{ transform: `rotate(${angle}deg)` }} />
			<div className="vmPivot" />
		</div>
	);
}

const VoiceMemos = () => {
	const audioRef = useRef(null);
	const ctxRef = useRef(null);
	const analyserRef = useRef(null);
	const rafRef = useRef(0);
	const [playingId, setPlayingId] = useState(null);
	const [paused, setPaused] = useState(true);
	const [time, setTime] = useState({ pos: 0, dur: 0 });
	const [level, setLevel] = useState(0);

	// Needle: follow the playing memo; ease back to rest otherwise
	const levelRef = useRef(0);
	levelRef.current = level;
	useEffect(() => {
		let current = levelRef.current;
		const buf = new Uint8Array(512);
		const tick = () => {
			let target = 0;
			const an = analyserRef.current;
			if (an && !paused) {
				an.getByteTimeDomainData(buf);
				let sum = 0;
				for (let i = 0; i < buf.length; i++) {
					const v = (buf[i] - 128) / 128;
					sum += v * v;
				}
				target = Math.min(1, Math.sqrt(sum / buf.length) * 3.2);
			}
			// fast attack, slow release – like a real needle
			current += (target - current) * (target > current ? 0.35 : 0.08);
			// at rest and nothing playing: stop the loop (no idle re-renders)
			if (paused && current < 0.002) {
				setLevel(0);
				return;
			}
			setLevel(current);
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [paused]);

	useEffect(
		() => () => {
			try {
				audioRef.current?.pause();
				ctxRef.current?.close();
			} catch (_) {}
		},
		[]
	);

	const ensureAnalyser = () => {
		if (analyserRef.current || !audioRef.current) return;
		try {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			const ctx = new Ctx();
			const src = ctx.createMediaElementSource(audioRef.current);
			const an = ctx.createAnalyser();
			an.fftSize = 1024;
			src.connect(an);
			an.connect(ctx.destination);
			ctxRef.current = ctx;
			analyserRef.current = an;
		} catch (_) {
			/* meter stays at rest; audio still plays */
		}
	};

	const toggle = (memo) => {
		const a = audioRef.current;
		if (!a) return;
		ensureAnalyser();
		ctxRef.current?.resume?.();
		if (playingId === memo.id) {
			if (a.paused) a.play().catch(() => {});
			else a.pause();
			return;
		}
		a.src = memo.src;
		setPlayingId(memo.id);
		setTime({ pos: 0, dur: 0 });
		a.play().catch(() => {});
	};

	return (
		<div className="vmPage">
			<AppHeaderBar title="Voice Memos" />
			<div className="vmHero">
				<div className="vmMic" aria-hidden>
					<div className="vmMicHead" />
					<div className="vmMicBand" />
					<div className="vmMicYoke" />
					<div className="vmMicStem" />
				</div>
				<Meter level={level} />
			</div>
			<div className="vmListWrap">
				{VOICE_MEMOS.length === 0 ? (
					<div className="vmEmpty">No Voice Memos</div>
				) : (
					<ul className="vmList">
						{VOICE_MEMOS.map((m) => {
							const active = playingId === m.id;
							const pct = active && time.dur > 0 ? (time.pos / time.dur) * 100 : 0;
							return (
								<li key={m.id}>
									<button type="button" className={`vmRow${active ? ' vmRowActive' : ''}`} onClick={() => toggle(m)}>
										<span className={`vmPlay${active && !paused ? ' vmPlaying' : ''}`} aria-hidden />
										<span className="vmRowText">
											<span className="vmTitle">{m.title || timeLabel(m.recorded)}</span>
											<span className="vmDate">
												{whenLabel(m.recorded)} {timeLabel(m.recorded)}
											</span>
										</span>
										<span className="vmDur">{active ? fmt(Math.max(0, time.dur - time.pos)) : m.duration}</span>
									</button>
									{active && (
										<div className="vmProgress">
											<span style={{ width: `${pct}%` }} />
										</div>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>
			<audio
				ref={audioRef}
				preload="none"
				playsInline
				onPlay={() => setPaused(false)}
				onPause={() => setPaused(true)}
				onEnded={() => {
					setPaused(true);
					setPlayingId(null);
				}}
				onTimeUpdate={(e) => setTime({ pos: e.currentTarget.currentTime, dur: e.currentTarget.duration || 0 })}
			/>
		</div>
	);
};

export default VoiceMemos;
