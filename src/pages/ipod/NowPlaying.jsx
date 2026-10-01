import React, { useState } from 'react';
import { BsFillPlayFill, BsFillPauseFill, BsMusicNote, BsSkipBackwardFill, BsSkipForwardFill } from 'react-icons/bs';

import './NowPlaying.css';

const formatTime = (s) => {
	if (!Number.isFinite(s) || s < 0) return '0:00';
	const m = Math.floor(s / 60);
	return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Full-screen Now Playing view in the style of the original iPhone iPod app. */
const NowPlaying = ({ track, isPlaying, loading, position, duration, error, onClose, onToggle, onPrev, onNext, onSeek }) => {
	const [scrub, setScrub] = useState(null);
	if (!track) return null;

	const art = track.artworkLarge || track.artwork;
	const shownPos = scrub ?? position;
	const fraction = duration > 0 ? Math.min(1, shownPos / duration) : 0;

	const commitScrub = () => {
		if (scrub == null) return;
		onSeek(duration > 0 ? scrub / duration : 0);
		setScrub(null);
	};

	return (
		<div className="npRoot" role="dialog" aria-label={`Now playing: ${track.title}`}>
			<div className="npTop">
				<button type="button" className="npBack" onClick={onClose} aria-label="Back to library">
					<span className="npBackArrow" />
				</button>
				<div className="npMeta">
					<span className="npArtist">{track.artist}</span>
					<span className="npTitle">{track.title}</span>
					<span className="npAlbum">{track.album}</span>
				</div>
			</div>

			<div className="npArtWrap">
				{art ? (
					<img className="npArt" src={art} alt={`${track.title} cover art`} />
				) : (
					<div className="npArt npArtEmpty">
						<BsMusicNote />
					</div>
				)}
				{error && (
					<div className="npError">
						Couldn't load this song.
						{track.soundcloudUrl && (
							<a href={track.soundcloudUrl} target="_blank" rel="noreferrer">
								Open on SoundCloud ›
							</a>
						)}
					</div>
				)}
			</div>

			<div className="npControls">
				<div className="npScrub">
					<span className="npTime">{formatTime(shownPos)}</span>
					<input
						type="range"
						className="npSlider"
						min={0}
						max={duration > 0 ? duration : 1}
						step={0.1}
						value={duration > 0 ? shownPos : 0}
						disabled={!(duration > 0)}
						style={{ '--fill': `${fraction * 100}%` }}
						onChange={(e) => setScrub(Number(e.target.value))}
						onPointerUp={commitScrub}
						onTouchEnd={commitScrub}
						onKeyUp={commitScrub}
						aria-label="Seek"
					/>
					<span className="npTime">-{formatTime(Math.max(0, duration - shownPos))}</span>
				</div>
				<div className="npButtons">
					<button type="button" className="npBtn" onClick={onPrev} aria-label="Previous song">
						<BsSkipBackwardFill />
					</button>
					<button
						type="button"
						className="npBtn npBtnMain"
						onClick={onToggle}
						aria-label={loading ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
					>
						{loading ? <span className="npSpinner" aria-hidden /> : isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
					</button>
					<button type="button" className="npBtn" onClick={onNext} aria-label="Next song">
						<BsSkipForwardFill />
					</button>
				</div>
			</div>
		</div>
	);
};

export default NowPlaying;
