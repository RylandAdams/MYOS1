import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

import './ipod.css';
import { BsFillPlayFill, BsFillPauseFill, BsMusicNote } from 'react-icons/bs';
import { AiTwotoneStar, AiOutlineStar } from 'react-icons/ai';
import { HiOutlineSearch } from 'react-icons/hi';
import { MdOutlineFolder } from 'react-icons/md';

import { IPOD_TRACKS, ALBUM_NAMES } from '../../assets/ipodLibrary';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';

const FAVORITES_KEY = 'ipod-favorites';
const FAVORITES_VERSION = 7;
const FAVORITE_TRACKS_KEY = 'ipod-favorite-tracks'; // tracks favorited from search (not in library)
const DEFAULT_FAVORITES = ['3', 'btga', '2', '4', '7']; // Denial, be that girl again, glisan, Tough, get by rn
const NON_FAVORITABLE_IDS = new Set(['1']); // everlasting
const SEARCH_LIMIT_KEY = 'ipod-search-limit';
const SEARCH_LIMIT = 5;
const SEARCH_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours
const API_URL = '/api/soundcloud-tracks';
const EXCLUDED_TRACK_URL = 'wasnt-sad-interlude'; // empty track, no art – exclude from library
const EXCLUDED_TITLE_MATCHES = ['wasn’t sad', "wasn't sad"]; // filter legacy single variants
// Use direct Cloud Functions URL so search works in dev and prod (avoids proxy/rewrite returning HTML)
const SEARCH_API_URL =
	'https://us-central1-myos1-8e625.cloudfunctions.net/getSoundCloudSearch';

function normSoundcloudUrl(u) {
	if (!u || typeof u !== 'string') return '';
	try {
		return u.trim().split('?')[0].split('#')[0].toLowerCase().replace(/\/$/, '');
	} catch {
		return '';
	}
}

function isNonFavoritable(track) {
	return NON_FAVORITABLE_IDS.has(track?.id) || (track?.title || '').toLowerCase() === 'everlasting';
}

function isExcludedTrack(track, norm) {
	const title = (track?.title || '').toLowerCase();
	return (
		norm(track?.soundcloudUrl || '').includes(EXCLUDED_TRACK_URL) ||
		EXCLUDED_TITLE_MATCHES.some((needle) => title.includes(needle))
	);
}

function getSearchLimitState() {
	try {
		const raw = localStorage.getItem(SEARCH_LIMIT_KEY);
		if (!raw) return { count: 0, windowStart: Date.now() };
		const { count, windowStart } = JSON.parse(raw);
		const now = Date.now();
		if (now - windowStart >= SEARCH_WINDOW_MS) {
			return { count: 0, windowStart: now };
		}
		return { count, windowStart };
	} catch {
		return { count: 0, windowStart: Date.now() };
	}
}

function incrementSearchCount() {
	const state = getSearchLimitState();
	state.count += 1;
	localStorage.setItem(SEARCH_LIMIT_KEY, JSON.stringify(state));
	return state;
}

function getSearchLimitMessage() {
	const { count, windowStart } = getSearchLimitState();
	if (count < SEARCH_LIMIT) return null;
	const resetAt = windowStart + SEARCH_WINDOW_MS;
	const remainingMs = resetAt - Date.now();
	const remainingHours = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
	return `Search limit reached. Try again in ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}.`;
}

const Ipod = () => {
	const [activeTab, setActiveTab] = useState('library');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchLimitMessage, setSearchLimitMessage] = useState(null);
	const [currentTrack, setCurrentTrack] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackLoading, setPlaybackLoading] = useState(false);
	const [playProgress, setPlayProgress] = useState(0);
	const [tracksFromApi, setTracksFromApi] = useState(null);
	const [tracksLoading, setTracksLoading] = useState(true);
	const [favorites, setFavorites] = useState(() => {
		try {
			const ver = parseInt(localStorage.getItem('ipod-favorites-version') || '0', 10);
			if (ver < FAVORITES_VERSION) return DEFAULT_FAVORITES;
			const stored = localStorage.getItem(FAVORITES_KEY);
			if (!stored || stored === '[]') return DEFAULT_FAVORITES;
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITES;
		} catch {
			return DEFAULT_FAVORITES;
		}
	});
	const [expandedAlbum, setExpandedAlbum] = useState(null);
	const [expandedSingleId, setExpandedSingleId] = useState(null);
	const [favoriteTracks, setFavoriteTracks] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem(FAVORITE_TRACKS_KEY) || '{}');
		} catch {
			return {};
		}
	});
	const widgetRef = useRef(null);
	const iframeRef = useRef(null);
	/** Refs keep widget handlers aligned with the latest row + loading flag (avoid stale PLAY / batched state). */
	const currentTrackRef = useRef(null);
	const playbackLoadingRef = useRef(false);
	const loadingProgressFallbackUsedRef = useRef(false);
	const [widgetSrc, setWidgetSrc] = useState(
		'https://w.soundcloud.com/player/?url=https://soundcloud.com/rylandofficialmusic/tracks&auto_play=false&hide_related=true&show_comments=false'
	);

	// Unlock audio for Chrome autoplay – must run in same user gesture
	const unlockAudio = () => {
		try {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			if (Ctx) {
				const ctx = new Ctx();
				const buf = ctx.createBuffer(1, 1, 22050);
				const src = ctx.createBufferSource();
				src.buffer = buf;
				src.connect(ctx.destination);
				src.start(0);
			}
		} catch {}
	};

	useEffect(() => {
		currentTrackRef.current = currentTrack;
	}, [currentTrack]);
	useEffect(() => {
		playbackLoadingRef.current = playbackLoading;
	}, [playbackLoading]);

	const initWidget = () => {
		if (!window.SC || !iframeRef.current) return;
		const w = window.SC.Widget(iframeRef.current);
		widgetRef.current = w;
		const tryClearLoadingForCurrentSound = () => {
			const want = currentTrackRef.current?.soundcloudUrl;
			const done = () => setPlaybackLoading(false);
			if (!want) {
				queueMicrotask(done);
				return;
			}
			if (typeof w.getCurrentSound !== 'function') {
				queueMicrotask(done);
				return;
			}
			w.getCurrentSound((sound) => {
				if (!sound) {
					queueMicrotask(done);
					return;
				}
				const candidates = [
					sound.permalink_url,
					sound.stream_url,
					sound.uri && String(sound.uri).startsWith('http') ? sound.uri : null,
					sound.uri && !String(sound.uri).startsWith('http') ? `https://soundcloud.com${sound.uri}` : null,
				].filter(Boolean);
				const wantNorm = normSoundcloudUrl(want);
				if (candidates.some((c) => normSoundcloudUrl(c) === wantNorm)) done();
			});
		};
		w.bind(window.SC.Widget.Events.PLAY, () => {
			setIsPlaying(true);
			tryClearLoadingForCurrentSound();
		});
		w.bind(window.SC.Widget.Events.FINISH, () => {
			setIsPlaying(false);
			setPlayProgress(0);
			setPlaybackLoading(false);
		});
		w.bind(window.SC.Widget.Events.PAUSE, () => {
			setIsPlaying(false);
		});
		w.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
			const pos =
				data.relativePosition ??
				(data.currentPosition != null && data.duration ? data.currentPosition / data.duration : null);
			if (typeof pos === 'number' && !Number.isNaN(pos) && pos >= 0) setPlayProgress(Math.min(1, pos));
			// Some navigations never re-fire PLAY; once the stream advances, we're past buffering.
			if (playbackLoadingRef.current && pos > 0.008 && !loadingProgressFallbackUsedRef.current) {
				loadingProgressFallbackUsedRef.current = true;
				tryClearLoadingForCurrentSound();
			}
		});
	};

	// Poll position when playing – PLAY_PROGRESS can be unreliable
	useEffect(() => {
		if (!isPlaying || !currentTrack || !widgetRef.current) return;
		const interval = setInterval(() => {
			const w = widgetRef.current;
			if (!w) return;
			w.getPosition((pos) => {
				w.getDuration((dur) => {
					if (dur > 0 && typeof pos === 'number') setPlayProgress(Math.min(1, Math.max(0, pos / dur)));
				});
			});
		}, 200);
		return () => clearInterval(interval);
	}, [isPlaying, currentTrack]);

	useEffect(() => {
		if (!playbackLoading) return;
		const t = window.setTimeout(() => setPlaybackLoading(false), 45000);
		return () => clearTimeout(t);
	}, [playbackLoading]);

	// Fetch tracks from SoundCloud API (artwork + metadata)
	useEffect(() => {
		let cancelled = false;
		fetch(API_URL)
			.then((res) => res.json())
			.then((data) => {
				if (!cancelled && data.tracks?.length) {
					const norm = (u) => (u || '').toLowerCase().replace(/\/$/, '');
					const mapped = data.tracks
						.filter((t) => !isExcludedTrack(t, norm))
						.map((t) => {
							const urlMatch = IPOD_TRACKS.find((lib) => norm(lib.soundcloudUrl) === norm(t.soundcloudUrl));
							const titleMatch = IPOD_TRACKS.find((lib) => (lib.title || '').toLowerCase() === (t.title || '').toLowerCase());
							const match = urlMatch || titleMatch;
							const isBeThatGirlAgain = (t.title || '').toLowerCase() === 'be that girl again';
							const id = match ? match.id : (isBeThatGirlAgain ? 'btga' : String(t.id));
							const album = match ? match.album : (t.album || 'Library');
							const releaseDate = t.releaseDate || (match ? match.releaseDate : null);
							return { ...t, id, album, releaseDate };
						});
					const apiUrls = new Set(mapped.map((t) => norm(t.soundcloudUrl)));
					const apiTitles = new Set(mapped.map((t) => (t.title || '').toLowerCase()));
					const missing = IPOD_TRACKS.filter(
						(lib) =>
							!apiUrls.has(norm(lib.soundcloudUrl)) &&
							!apiTitles.has((lib.title || '').toLowerCase())
					);
					setTracksFromApi([...mapped, ...missing]);
				}
			})
			.catch(() => {
				if (!cancelled) setTracksFromApi(null);
			})
			.finally(() => {
				if (!cancelled) setTracksLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	// Reset album view when switching tabs (show list when entering Albums)
	useEffect(() => {
		setExpandedAlbum(null);
		setExpandedSingleId(null);
	}, [activeTab]);

	// Persist favorites and version (version triggers migration on next load)
	useEffect(() => {
		localStorage.setItem('ipod-favorites-version', String(FAVORITES_VERSION));
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
	}, [favorites]);
	useEffect(() => {
		localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(favoriteTracks));
	}, [favoriteTracks]);

	const toggleFavorite = (id, track) => {
		if (isNonFavoritable(track)) return;
		const isAdding = !favorites.includes(id);
		if (isAdding && track && !allTracks.some((t) => t.id === id)) {
			setFavoriteTracks((ft) => ({ ...ft, [id]: track }));
		}
		if (!isAdding) {
			setFavoriteTracks((ft) => {
				const next = { ...ft };
				delete next[id];
				return next;
			});
		}
		setFavorites((prev) =>
			prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
		);
	};

	const allTracks = tracksFromApi ?? IPOD_TRACKS;

	// Search – runs when user presses Enter or clicks Search button
	const runSearch = (q) => {
		const trimmed = q.trim().toLowerCase();
		if (!trimmed) {
			setSearchResults([]);
			setSearchLimitMessage(null);
			return;
		}
		const { count } = getSearchLimitState();
		if (count >= SEARCH_LIMIT) {
			setSearchLimitMessage(getSearchLimitMessage());
			return;
		}
		setSearchLimitMessage(null);
		incrementSearchCount();
		setSearchLoading(true);
		const url = `${SEARCH_API_URL}?q=${encodeURIComponent(trimmed)}`;
		fetch(url)
			.then(async (res) => {
				const text = await res.text();
				if (!text.trim().startsWith('{')) {
					throw new Error('Server returned HTML instead of JSON');
				}
				return JSON.parse(text);
			})
			.then((data) => {
				const apiTracks = data.tracks || [];
				if (apiTracks.length > 0) {
					setSearchResults(apiTracks);
					return;
				}
				// Fallback: search within your library
				const local = allTracks.filter(
					(t) =>
						(t.title || '').toLowerCase().includes(trimmed) ||
						(t.artist || '').toLowerCase().includes(trimmed) ||
						(t.album || '').toLowerCase().includes(trimmed)
				);
				setSearchResults(local.slice(0, 10));
			})
			.catch(() => {
				const local = allTracks.filter(
					(t) =>
						(t.title || '').toLowerCase().includes(trimmed) ||
						(t.artist || '').toLowerCase().includes(trimmed) ||
						(t.album || '').toLowerCase().includes(trimmed)
				);
				setSearchResults(local.slice(0, 10));
			})
			.finally(() => setSearchLoading(false));
	};


	// Filter tracks by tab
	const getTracks = () => {
		if (activeTab === 'favorites') {
			const fromLibrary = allTracks.filter((t) => favorites.includes(t.id));
			const libraryIds = new Set(fromLibrary.map((t) => t.id));
			const fromSearch = Object.values(favoriteTracks).filter(
				(t) => favorites.includes(t.id) && !libraryIds.has(t.id)
			);
			const combined = [...fromLibrary, ...fromSearch];
			combined.sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
			return combined;
		}
		if (activeTab === 'albums') {
			const byAlbum = {};
			allTracks.forEach((t) => {
				const album = t.album || 'Other';
				if (!byAlbum[album]) byAlbum[album] = [];
				byAlbum[album].push(t);
			});
			const getLatestDate = (tracks) =>
				tracks.reduce((max, t) => {
					const d = t.releaseDate || '0000-00-00';
					return d > max ? d : max;
				}, '0000-00-00');
			const albums = ALBUM_NAMES.filter((name) => byAlbum[name]?.length >= 2)
				.map((name) => ({ name, tracks: byAlbum[name], releaseDate: getLatestDate(byAlbum[name]) }))
				.sort((a, b) => (b.releaseDate > a.releaseDate ? 1 : -1));
			const singleTracks = Object.entries(byAlbum)
				.filter(([name]) => !ALBUM_NAMES.includes(name))
				.flatMap(([, tracks]) => tracks);
			const getDate = (t) => t.releaseDate || IPOD_TRACKS.find((lib) => lib.id === t.id)?.releaseDate || '0000-00-00';
			const singles = [...singleTracks].sort((a, b) => {
				const da = getDate(a);
				const db = getDate(b);
				return db.localeCompare(da);
			});
			return { albums, singles };
		}
		return allTracks;
	};

	const libraryTracks = getTracks();
	const tracks = activeTab === 'search' ? searchResults : (activeTab === 'albums' ? [] : libraryTracks);
	const albumData = activeTab === 'albums' ? libraryTracks : null;
	const expandedSingleTrack = expandedSingleId ? allTracks.find((t) => t.id === expandedSingleId) : null;

	/** SoundCloud often ignores auto_play until the stream is ready — kick play in the load callback + retries (still within the tap gesture on first nudge). */
	const nudgePlay = () => {
		const w = widgetRef.current;
		if (!w) return;
		try {
			w.play();
		} catch (_) {}
		requestAnimationFrame(() => {
			try {
				widgetRef.current?.play();
			} catch (_) {}
		});
		setTimeout(() => {
			try {
				widgetRef.current?.play();
			} catch (_) {}
		}, 120);
	};

	const loadUrlInWidget = (url) => {
		const w = widgetRef.current;
		if (!w) return false;
		w.load(url, {
			auto_play: true,
			callback: () => {
				nudgePlay();
				window.setTimeout(() => {
					if (!playbackLoadingRef.current) return;
					if (normSoundcloudUrl(currentTrackRef.current?.soundcloudUrl) !== normSoundcloudUrl(url)) return;
					setPlaybackLoading(false);
				}, 3200);
			},
		});
		nudgePlay();
		return true;
	};

	const playTrack = (track) => {
		const isSameTrack = currentTrack?.id === track.id;

		if (isSameTrack && isPlaying) {
			setPlaybackLoading(false);
			widgetRef.current?.pause();
			return;
		}
		if (isSameTrack && !isPlaying) {
			unlockAudio();
			loadingProgressFallbackUsedRef.current = false;
			flushSync(() => setPlaybackLoading(true));
			nudgePlay();
			return;
		}
		unlockAudio();
		currentTrackRef.current = track;
		loadingProgressFallbackUsedRef.current = false;
		flushSync(() => {
			setPlaybackLoading(true);
			setCurrentTrack(track);
			setPlayProgress(0);
			setIsPlaying(false);
		});
		const url = track.soundcloudUrl;
		if (!loadUrlInWidget(url)) {
			setWidgetSrc(
				`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=true&show_comments=false`
			);
		}
	};

	const handlePlayPause = () => {
		if (!widgetRef.current || !currentTrack) return;
		if (playbackLoading) {
			setPlaybackLoading(false);
			try {
				widgetRef.current.pause();
			} catch (_) {}
			return;
		}
		if (isPlaying) {
			setPlaybackLoading(false);
		} else {
			unlockAudio();
			loadingProgressFallbackUsedRef.current = false;
			flushSync(() => setPlaybackLoading(true));
		}
		widgetRef.current.toggle();
	};

	const bottomTabs = [
		{ id: 'library', label: 'Library', icon: BsMusicNote },
		{ id: 'favorites', label: 'Favorites', icon: AiTwotoneStar },
		{ id: 'albums', label: 'Albums', icon: MdOutlineFolder },
		{ id: 'search', label: 'Search', icon: HiOutlineSearch },
	];

	return (
		<div className="ipod">
			{/* SVG gradient for active tab icons – metallic silver to blue */}
			<svg width="0" height="0" aria-hidden="true">
				<defs>
					<linearGradient id="ipodIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#f0f5fc" />
						<stop offset="25%" stopColor="#d8e8f8" />
						<stop offset="50%" stopColor="#90c0f0" />
						<stop offset="100%" stopColor="#007AFF" />
					</linearGradient>
				</defs>
			</svg>
			<AppHeaderBar title="iPod" />

			{/* Scroll area – search bar or segmented control, then songs */}
			<div className="ipodScrollArea">
				{activeTab === 'search' ? (
					<div className="ipodSearchBar">
						<input
							type="text"
							className="ipodSearchInput"
							placeholder="Search any song ever"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									runSearch(searchQuery);
								}
							}}
						/>
						<button
							type="button"
							className="ipodSearchBtn"
							onClick={() => runSearch(searchQuery)}
						>
							Search
						</button>
					</div>
				) : (
					<div className="ipodSegmentedControl">
						<button
							className={`ipodSegment ${activeTab === 'library' ? 'active' : ''}`}
							onClick={() => setActiveTab('library')}
						>
							Library
						</button>
						<button
							className={`ipodSegment ${activeTab === 'favorites' ? 'active' : ''}`}
							onClick={() => setActiveTab('favorites')}
						>
							Favorites
						</button>
						<button
							className={`ipodSegment ${activeTab === 'albums' ? 'active' : ''}`}
							onClick={() => setActiveTab('albums')}
						>
							Albums
						</button>
					</div>
				)}

				<div className="songsListed">
				{activeTab === 'search' && searchLimitMessage ? (
					<div className="ipodEmpty ipodSearchLimit">{searchLimitMessage}</div>
				) : activeTab === 'search' && searchLoading ? (
					<div className="ipodEmpty">Searching…</div>
				) : activeTab === 'search' && !searchQuery.trim() ? null : activeTab === 'search' && tracks.length === 0 ? (
					<div className="ipodEmpty">No results found</div>
				) : tracksLoading ? (
					<div className="ipodEmpty">Loading tracks…</div>
				) : albumData ? (
					<>
						{expandedAlbum ? (
							<>
								<button type="button" className="ipodBackBtn" onClick={() => { setExpandedAlbum(null); setExpandedSingleId(null); }}>
									← All Albums
								</button>
								<div className="ipodAlbumHeader">{expandedSingleTrack ? expandedSingleTrack.title : expandedAlbum}</div>
								{(expandedSingleTrack ? [expandedSingleTrack] : (albumData.albums.find((a) => a.name === expandedAlbum)?.tracks ?? albumData.singles.filter((t) => t.album === expandedAlbum))).map((track, i) => {
									const isActive = currentTrack?.id === track.id;
									return (
										<div key={track.id} role="button" tabIndex={0} className={`songRow ${isActive ? 'active' : ''}`} onClick={() => playTrack(track)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playTrack(track); } }}>
											<div className="songRowArtwork">
												{track.artwork ? <img src={track.artwork} alt="" className="songImg" loading="lazy" /> : <div className="songImgPlaceholder"><BsMusicNote className="songImgPlaceholderIcon" /></div>}
												{isActive && (
													<button type="button" className={`progressDialOverlay${playbackLoading ? ' progressDialOverlay--loading' : ''}`} onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} aria-label={playbackLoading ? 'Loading audio' : isPlaying ? 'Pause' : 'Play'}>
														<svg className="progressDial" viewBox="0 0 36 36">
															<circle className="progressDialBg" cx="18" cy="18" r="15" />
															<circle className="progressDialFill" cx="18" cy="18" r="15" style={{ strokeDasharray: 94.2, strokeDashoffset: playbackLoading ? 94.2 : 94.2 - playProgress * 94.2 }} />
														</svg>
														{playbackLoading ? <span className="ipodBufferSpinner" aria-hidden /> : isPlaying ? <BsFillPauseFill className="progressDialPlayIcon" /> : <BsFillPlayFill className="progressDialPlayIcon" />}
													</button>
												)}
											</div>
											<div className="songRowInfo"><span className="songName">{i + 1}. {track.title}</span><span className="artistName">{track.artist}</span></div>
											<span className="songRowDuration">{track.duration || '—'}</span>
									<button type="button" className="favoriteBtn" disabled={isNonFavoritable(track)} onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id, track); }} aria-label={isNonFavoritable(track) ? 'Favoriting unavailable for this track' : (favorites.includes(track.id) ? 'Remove from favorites' : 'Add to favorites')}>
												{favorites.includes(track.id) ? <AiTwotoneStar className="starFilled" /> : <AiOutlineStar className="starOutline" />}
											</button>
										</div>
									);
								})}
							</>
						) : (
							<>
								{albumData.albums.length > 0 && (
									<>
										<h3 className="ipodSectionTitle">Albums</h3>
										{albumData.albums.map(({ name, tracks: albumTracks }) => (
											<button key={name} type="button" className="ipodAlbumRow" onClick={() => { setExpandedSingleId(null); setExpandedAlbum(name); }}>
												<div className="ipodAlbumRowArtwork">
													{albumTracks[0]?.artwork ? <img src={albumTracks[0].artwork} alt="" loading="lazy" /> : <BsMusicNote className="songImgPlaceholderIcon" />}
												</div>
												<div className="ipodAlbumRowInfo">
													<span className="ipodAlbumRowName">{name}</span>
													<span className="ipodAlbumRowMeta">{albumTracks.length} songs</span>
												</div>
												<span className="ipodAlbumRowChevron">›</span>
											</button>
										))}
									</>
								)}
								{albumData.singles.length > 0 && (
									<>
										<h3 className="ipodSectionTitle">Singles</h3>
										{albumData.singles.map((track) => (
											<button key={track.id} type="button" className="ipodAlbumRow" onClick={() => { setExpandedSingleId(track.id); setExpandedAlbum('__single__'); }}>
												<div className="ipodAlbumRowArtwork">
													{track.artwork ? <img src={track.artwork} alt="" loading="lazy" /> : <BsMusicNote className="songImgPlaceholderIcon" />}
												</div>
												<div className="ipodAlbumRowInfo">
													<span className="ipodAlbumRowName">{track.title}</span>
													<span className="ipodAlbumRowMeta">{track.artist}</span>
												</div>
												<span className="ipodAlbumRowChevron">›</span>
											</button>
										))}
									</>
								)}
								{albumData.albums.length === 0 && albumData.singles.length === 0 && (
									<div className="ipodEmpty">No tracks</div>
								)}
							</>
						)}
					</>
				) : tracks.length === 0 ? (
					<div className="ipodEmpty">
						{activeTab === 'favorites'
							? 'Tap the star on tracks to add favorites'
							: 'No tracks'}
					</div>
				) : (
					tracks.map((track, index) => {
						const isActive = currentTrack?.id === track.id;
						return (
							<div
								key={track.id + (activeTab === 'search' ? '-search' : '')}
								role="button"
								tabIndex={0}
								className={`songRow ${isActive ? 'active' : ''}`}
								onClick={() => playTrack(track)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										playTrack(track);
									}
								}}
							>
								<div className="songRowArtwork">
									{track.artwork ? (
										<img src={track.artwork} alt="" className="songImg" loading="lazy" />
									) : (
										<div className="songImgPlaceholder">
											<BsMusicNote className="songImgPlaceholderIcon" />
										</div>
									)}
									{isActive && (
										<button
											type="button"
											className={`progressDialOverlay${playbackLoading ? ' progressDialOverlay--loading' : ''}`}
											onClick={(e) => {
												e.stopPropagation();
												handlePlayPause();
											}}
											aria-label={playbackLoading ? 'Loading audio' : isPlaying ? 'Pause' : 'Play'}
										>
											<svg className="progressDial" viewBox="0 0 36 36">
												<circle className="progressDialBg" cx="18" cy="18" r="15" />
												<circle
													className="progressDialFill"
													cx="18"
													cy="18"
													r="15"
													style={{
														strokeDasharray: 94.2,
														strokeDashoffset: playbackLoading ? 94.2 : 94.2 - playProgress * 94.2,
													}}
												/>
											</svg>
											{playbackLoading ? (
												<span className="ipodBufferSpinner" aria-hidden />
											) : isPlaying ? (
												<BsFillPauseFill className="progressDialPlayIcon" />
											) : (
												<BsFillPlayFill className="progressDialPlayIcon" />
											)}
										</button>
									)}
								</div>
								<div className="songRowInfo">
									<span className="songName">{index + 1}. {track.title}</span>
									<span className="artistName">{track.artist}</span>
								</div>
								<span className="songRowDuration">{track.duration || '—'}</span>
								<button
									type="button"
									className="favoriteBtn"
									disabled={isNonFavoritable(track)}
									onClick={(e) => {
										e.stopPropagation();
										toggleFavorite(track.id, track);
									}}
									aria-label={isNonFavoritable(track) ? 'Favoriting unavailable for this track' : (favorites.includes(track.id) ? 'Remove from favorites' : 'Add to favorites')}
								>
									{favorites.includes(track.id) ? (
										<AiTwotoneStar className="starFilled" />
									) : (
										<AiOutlineStar className="starOutline" />
									)}
								</button>
							</div>
						);
					})
				)}
				</div>
			</div>

			{/* Bottom tab bar – iTunes style */}
			<nav className="ipodBottomBar">
				{bottomTabs.map((tab) => (
					<button
						key={tab.id}
						className={`ipodBottomTab ${activeTab === tab.id ? 'active' : ''} ipodBottomTab-${tab.id}`}
						onClick={() => setActiveTab(tab.id)}
					>
						<tab.icon className="ipodBottomIcon" />
						<span className="ipodBottomLabel">{tab.label}</span>
					</button>
				))}
			</nav>

			{/* Hidden SoundCloud widget */}
			<iframe
				ref={iframeRef}
				title="SoundCloud player"
				className="soundcloudWidget"
				src={widgetSrc}
				allow="encrypted-media; autoplay"
				onLoad={() => {
					widgetRef.current = null;
					const boot = () => {
						if (!iframeRef.current || !window.SC) return;
						initWidget();
					};
					if (window.SC) {
						boot();
					} else {
						const iv = setInterval(() => {
							if (window.SC) {
								clearInterval(iv);
								boot();
							}
						}, 30);
						setTimeout(() => clearInterval(iv), 8000);
					}
				}}
			/>
		</div>
	);
};

export default Ipod;
