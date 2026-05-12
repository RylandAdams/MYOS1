import React, { useEffect, useReducer, useRef, useState } from 'react';
import { MdGraphicEq } from 'react-icons/md';
import './files.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import FilesAudioPlayer from './FilesAudioPlayer';
import { FILES_DEMO_TRACKS } from './demoTracks';

/** Bottom line label for each demo tile. */
const DEFAULT_STORAGE_LABEL = 'On My Phone';

export default function Files() {
	const [playerTrack, setPlayerTrack] = useState(null);
	const [, syncAudioUi] = useReducer((x) => x + 1, 0);
	const audioRef = useRef(null);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return undefined;
		const bump = () => syncAudioUi();
		a.addEventListener('pause', bump);
		a.addEventListener('playing', bump);
		a.addEventListener('ended', bump);
		return () => {
			a.removeEventListener('pause', bump);
			a.removeEventListener('playing', bump);
			a.removeEventListener('ended', bump);
		};
	}, []);

	useEffect(
		() => () => {
			const a = audioRef.current;
			if (!a) return;
			a.pause();
			a.removeAttribute('src');
		},
		[]
	);

	const openPlayerForTrack = (track) => {
		const a = audioRef.current;
		if (!a) return;
		setPlayerTrack(track);
		a.src = track.src;
		void a.play().catch(() => {});
		syncAudioUi();
	};

	const closePlayer = () => {
		setPlayerTrack(null);
		const a = audioRef.current;
		if (a) a.pause();
		syncAudioUi();
	};

	return (
		<div className={playerTrack ? 'filesPage filesPagePlayerOpen' : 'filesPage'}>
			<audio ref={audioRef} className='filesAudioHud' preload='metadata' />
			<AppHeaderBar title='Files' />
			<div className={`filesScroll filesScroll-demosOnly${playerTrack ? ' filesScroll-behindPlayer' : ''}`}>
				{FILES_DEMO_TRACKS.length > 0 ? (
					<ul className='filesIosAudioGrid' aria-label='Files'>
						{FILES_DEMO_TRACKS.map((track) => {
							const highlighted = playerTrack?.id === track.id;
							const storageShown = track.storage ?? DEFAULT_STORAGE_LABEL;

							return (
								<li key={track.id} className='filesIosAudioCell'>
									<button
										type='button'
										className={`filesIosAudioBtn ${highlighted ? 'filesIosAudioBtn-playing' : ''}`}
										onClick={() => openPlayerForTrack(track)}
										aria-label={`Play ${track.title}`}
										aria-pressed={highlighted}
									>
										<span className='filesIosAudioIconWrap' aria-hidden>
											<span className='filesIosAudioIconInner'>
												<MdGraphicEq className='filesIosAudioGlyph' />
											</span>
										</span>
										<span className='filesIosAudioName'>{track.title}</span>
										{track.modifiedTime ? (
											<span className='filesIosAudioMeta'>{track.modifiedTime}</span>
										) : null}
										<span className='filesIosAudioMeta'>{storageShown}</span>
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className='filesDemoHint'>
						Add demos to <code>public/files-demos/</code>, then register them in{' '}
						<code>src/pages/files/demoTracks.js</code>.
					</p>
				)}
			</div>

			{playerTrack ? (
				<FilesAudioPlayer track={playerTrack} audioRef={audioRef} onClose={closePlayer} />
			) : null}
		</div>
	);
}
