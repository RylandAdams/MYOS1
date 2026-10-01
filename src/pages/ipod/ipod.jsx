import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

import './ipod.css';
import { BsFillPlayFill, BsFillPauseFill, BsMusicNote } from 'react-icons/bs';

import { IPOD_TRACKS, ALBUM_NAMES } from '../../assets/ipodLibrary';
import { hostedAudioUrl } from '../../assets/ipodAudio';
import { playSound } from '../../utils/uiSound';

const FAVORITES_KEY = 'ipod-favorites';
const FAVORITES_VERSION = 7;
const FAVORITE_TRACKS_KEY = 'ipod-favorite-tracks'; // tracks favorited from search (not in library)
const DEFAULT_FAVORITES = ['3', 'btga', '2', '4', '7']; // Denial, be that girl again, glisan, Tough, get by rn
const NON_FAVORITABLE_IDS = new Set(['1']); // everlasting
const SEARCH_LIMIT_KEY = 'ipod-search-limit';
const SEARCH_LIMIT = 5;
const SEARCH_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours
const LOAD_TIMEOUT_MS = 15000; // show the "open on SoundCloud" fallback after this long without audio
const API_URL = '/api/soundcloud-tracks';
const EXCLUDED_TRACK_URL = 'wasnt-sad-interlude'; // empty track, no art – exclude from library
const EXCLUDED_TITLE_MATCHES = ['wasn’t sad', "wasn't sad"]; // filter legacy single variants
// Use direct Cloud Functions URL so search works in dev and prod (avoids proxy/rewrite returning HTML)
const SEARCH_API_URL =
	'https://us-central1-myos1-8e625.cloudfunctions.net/getSoundCloudSearch';
const WHEEL_STEP_DEG = 18; // one list step per 18° of wheel rotation
const SEEK_STEP_S = 5; // Now Playing: one wheel step scrubs 5 seconds

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
	try {
		localStorage.setItem(SEARCH_LIMIT_KEY, JSON.stringify(state));
	} catch {}
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

const formatTime = (s) => {
	if (!Number.isFinite(s) || s < 0) return '0:00';
	const m = Math.floor(s / 60);
	return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

const shuffled = (list) => {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

const Ipod = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchLimitMessage, setSearchLimitMessage] = useState(null);
	const [currentTrack, setCurrentTrack] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackLoading, setPlaybackLoading] = useState(false);
	const [tracksFromApi, setTracksFromApi] = useState(null);
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
	const [favoriteTracks, setFavoriteTracks] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem(FAVORITE_TRACKS_KEY) || '{}');
		} catch {
			return {};
		}
	});
	const [playError, setPlayError] = useState(null);
	const [timeInfo, setTimeInfo] = useState({ pos: 0, dur: 0 });
	/** iPod menu stack – each entry remembers its own highlighted row */
	const [stack, setStack] = useState([{ id: 'main', param: null, sel: 0 }]);
	const [navDir, setNavDir] = useState('none');
	const [wheelPressed, setWheelPressed] = useState(null);

	const widgetRef = useRef(null);
	const iframeRef = useRef(null);
	const audioRef = useRef(null);
	/** 'native' = self-hosted file in <audio>; 'soundcloud' = hidden SoundCloud widget */
	const engineRef = useRef('soundcloud');
	/** List the current song was started from – next/previous and auto-advance walk it */
	const queueRef = useRef([]);
	const stepTrackRef = useRef(() => {});
	/** Refs keep widget handlers aligned with the latest row + loading flag (avoid stale PLAY / batched state). */
	const currentTrackRef = useRef(null);
	const playbackLoadingRef = useRef(false);
	const loadingProgressFallbackUsedRef = useRef(false);
	const listRef = useRef(null);
	const wheelRef = useRef(null);
	const dragRef = useRef(null);
	const wheelCarry = useRef(0); // partial rotation carried into the next gesture
	const searchInputRef = useRef(null);
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
			if (!want || typeof w.getCurrentSound !== 'function') {
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
			if (engineRef.current !== 'soundcloud') return;
			setIsPlaying(true);
			tryClearLoadingForCurrentSound();
		});
		w.bind(window.SC.Widget.Events.FINISH, () => {
			if (engineRef.current !== 'soundcloud') return;
			setIsPlaying(false);
			setPlaybackLoading(false);
			stepTrackRef.current(1, true);
		});
		w.bind(window.SC.Widget.Events.PAUSE, () => {
			if (engineRef.current !== 'soundcloud') return;
			setIsPlaying(false);
		});
		w.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
			if (engineRef.current !== 'soundcloud') return;
			const pos =
				data.relativePosition ??
				(data.currentPosition != null && data.duration ? data.currentPosition / data.duration : null);
			// Some navigations never re-fire PLAY; once the stream advances, we're past buffering.
			if (playbackLoadingRef.current && pos > 0.008 && !loadingProgressFallbackUsedRef.current) {
				loadingProgressFallbackUsedRef.current = true;
				tryClearLoadingForCurrentSound();
			}
		});
	};

	// Poll position when playing through SoundCloud – PLAY_PROGRESS can be unreliable
	useEffect(() => {
		if (!isPlaying || !currentTrack || !widgetRef.current || engineRef.current !== 'soundcloud') return;
		const interval = setInterval(() => {
			const w = widgetRef.current;
			if (!w) return;
			w.getPosition((pos) => {
				w.getDuration((dur) => {
					if (dur > 0 && typeof pos === 'number') setTimeInfo({ pos: pos / 1000, dur: dur / 1000 });
				});
			});
		}, 250);
		return () => clearInterval(interval);
	}, [isPlaying, currentTrack]);

	useEffect(() => {
		if (!playbackLoading) return;
		const t = window.setTimeout(() => {
			setPlaybackLoading(false);
			setPlayError(currentTrackRef.current);
		}, LOAD_TIMEOUT_MS);
		return () => clearTimeout(t);
	}, [playbackLoading]);

	// Leaving the iPod: fully unload the song and clear the lock-screen media session.
	// (Only pausing left a loaded song behind with the session still "playing", so a system play –
	// AirPods, Control Center, a car, the end of a notification – could start it on the home screen.)
	useEffect(() => {
		const audio = audioRef.current;
		return () => {
			try {
				audio?.pause();
				audio?.removeAttribute('src');
				audio?.load();
			} catch (_) {}
			if ('mediaSession' in navigator) {
				try {
					navigator.mediaSession.metadata = null;
					navigator.mediaSession.playbackState = 'none';
				} catch (_) {}
				['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'].forEach((a) => {
					try {
						navigator.mediaSession.setActionHandler(a, null);
					} catch (_) {}
				});
			}
		};
	}, []);

	// Fetch tracks from SoundCloud API (artwork + metadata); the local library is complete without it
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
							return {
								...t,
								id,
								album,
								releaseDate,
								artwork: match?.artwork || t.artwork,
								artworkLarge: match?.artworkLarge || t.artwork,
							};
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
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// Persist favorites and version (version triggers migration on next load)
	useEffect(() => {
		try {
			localStorage.setItem('ipod-favorites-version', String(FAVORITES_VERSION));
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		} catch {}
	}, [favorites]);
	useEffect(() => {
		try {
			localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(favoriteTracks));
		} catch {}
	}, [favoriteTracks]);

	const allTracks = tracksFromApi ?? IPOD_TRACKS;

	const [favNote, setFavNote] = useState(null);
	const favNoteTimer = useRef(0);
	const toggleFavorite = (track) => {
		if (!track || isNonFavoritable(track)) return;
		const id = track.id;
		const isAdding = !favorites.includes(id);
		clearTimeout(favNoteTimer.current);
		setFavNote(isAdding ? 'Added to Favorites' : 'Removed from Favorites');
		favNoteTimer.current = setTimeout(() => setFavNote(null), 1400);
		if (isAdding && !allTracks.some((t) => t.id === id)) {
			setFavoriteTracks((ft) => ({ ...ft, [id]: track }));
		}
		if (!isAdding) {
			setFavoriteTracks((ft) => {
				const next = { ...ft };
				delete next[id];
				return next;
			});
		}
		setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
	};

	const favoriteList = () => {
		const fromLibrary = allTracks.filter((t) => favorites.includes(t.id));
		const libraryIds = new Set(fromLibrary.map((t) => t.id));
		const fromSearch = Object.values(favoriteTracks).filter((t) => favorites.includes(t.id) && !libraryIds.has(t.id));
		return [...fromLibrary, ...fromSearch].sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
	};

	/** Albums with 2+ songs first (newest first), then singles (newest first) – each opens its song list */
	const albumList = () => {
		const byAlbum = {};
		allTracks.forEach((t) => {
			const album = t.album || 'Other';
			if (!byAlbum[album]) byAlbum[album] = [];
			byAlbum[album].push(t);
		});
		const latest = (tracks) => tracks.reduce((max, t) => ((t.releaseDate || '') > max ? t.releaseDate : max), '');
		const albums = ALBUM_NAMES.filter((name) => byAlbum[name]?.length >= 2)
			.map((name) => ({ name, tracks: byAlbum[name], date: latest(byAlbum[name]) }))
			.sort((a, b) => (b.date > a.date ? 1 : -1));
		const singles = Object.entries(byAlbum)
			.filter(([name]) => !ALBUM_NAMES.includes(name))
			.map(([name, tracks]) => ({ name, tracks, date: latest(tracks) }))
			.sort((a, b) => (b.date > a.date ? 1 : -1));
		return [...albums, ...singles];
	};

	// Search – runs on Enter or the center button
	const runSearch = (q) => {
		const trimmed = q.trim().toLowerCase();
		if (!trimmed) {
			setSearchResults([]);
			setSearchLimitMessage(null);
			return;
		}
		// RYLAND first: whole-word / prefix match on his own catalogue, no network, not counted
		const words = trimmed.split(/\s+/);
		const own = allTracks.filter((t) => {
			const hay = `${t.title} ${t.album} ${t.artist}`.toLowerCase();
			return words.every((w) => hay.split(/[^a-z0-9']+/).some((h) => h.startsWith(w)) || hay.includes(w));
		});
		if (own.length || /^ryland\b/.test(trimmed)) {
			setSearchLimitMessage(null);
			setSearchResults(own.length ? own : allTracks);
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
		const localMatches = () =>
			allTracks
				.filter(
					(t) =>
						(t.title || '').toLowerCase().includes(trimmed) ||
						(t.artist || '').toLowerCase().includes(trimmed) ||
						(t.album || '').toLowerCase().includes(trimmed)
				)
				.slice(0, 10);
		fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(trimmed)}`)
			.then(async (res) => {
				const text = await res.text();
				if (!text.trim().startsWith('{')) throw new Error('Server returned HTML instead of JSON');
				return JSON.parse(text);
			})
			.then((data) => {
				const apiTracks = data.tracks || [];
				setSearchResults(apiTracks.length > 0 ? apiTracks : localMatches());
			})
			.catch(() => setSearchResults(localMatches()))
			.finally(() => setSearchLoading(false));
	};

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

	const stopNative = () => {
		const a = audioRef.current;
		if (!a) return;
		try {
			a.pause();
			a.removeAttribute('src');
			a.load();
		} catch (_) {}
	};

	const startSoundCloud = (track) => {
		engineRef.current = 'soundcloud';
		stopNative();
		const url = track.soundcloudUrl;
		if (!url) {
			setPlaybackLoading(false);
			setPlayError(track);
			return;
		}
		if (!loadUrlInWidget(url)) {
			setWidgetSrc(
				`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=true&show_comments=false`
			);
		}
	};

	const startNative = (url) => {
		engineRef.current = 'native';
		try {
			widgetRef.current?.pause();
		} catch (_) {}
		const a = audioRef.current;
		a.src = url;
		const p = a.play();
		if (p && typeof p.catch === 'function') {
			p.catch((err) => {
				if (err?.name === 'NotAllowedError') {
					setPlaybackLoading(false);
					setIsPlaying(false);
				}
			});
		}
	};

	const playTrack = (track, queue) => {
		if (queue) queueRef.current = queue;
		if (currentTrack?.id === track.id && !playError) {
			if (!isPlaying) handlePlayPause();
			return;
		}
		unlockAudio();
		currentTrackRef.current = track;
		loadingProgressFallbackUsedRef.current = false;
		flushSync(() => {
			setPlayError(null);
			setPlaybackLoading(true);
			setCurrentTrack(track);
			setTimeInfo({ pos: 0, dur: 0 });
			setIsPlaying(false);
		});
		const hosted = hostedAudioUrl(track);
		if (hosted) startNative(hosted);
		else startSoundCloud(track);
	};

	const handlePlayPause = () => {
		if (!currentTrack) return;
		if (playError) {
			const track = currentTrack;
			flushSync(() => setCurrentTrack(null));
			playTrack(track);
			return;
		}
		if (engineRef.current === 'native') {
			const a = audioRef.current;
			if (!a) return;
			if (a.paused) {
				unlockAudio();
				const p = a.play();
				if (p && typeof p.catch === 'function') p.catch(() => {});
			} else {
				a.pause();
			}
			return;
		}
		if (!widgetRef.current) return;
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

	const seekToSeconds = (seconds) => {
		if (engineRef.current === 'native') {
			const a = audioRef.current;
			if (a && Number.isFinite(a.duration)) a.currentTime = Math.min(a.duration, Math.max(0, seconds));
			return;
		}
		const w = widgetRef.current;
		if (!w) return;
		w.getDuration((d) => {
			if (d > 0) w.seekTo(Math.min(d, Math.max(0, seconds * 1000)));
		});
		setTimeInfo((t) => ({ ...t, pos: Math.max(0, seconds) }));
	};

	/** dir = 1 next, -1 previous. Previous restarts the song if it is more than 3 seconds in. */
	const stepTrack = (dir, auto = false) => {
		const cur = currentTrackRef.current;
		if (!cur) return;
		if (dir < 0 && timeInfo.pos > 3) {
			seekToSeconds(0);
			return;
		}
		const queue = queueRef.current.length ? queueRef.current : allTracks;
		const i = queue.findIndex((t) => t.id === cur.id);
		const next = i === -1 ? null : queue[i + dir];
		if (!next) {
			if (dir < 0) seekToSeconds(0);
			// the last song of the list finished: go back to the list it came from
			else if (auto) backFromNowPlayingRef.current();
			return;
		}
		playTrack(next);
	};
	const backFromNowPlayingRef = useRef(() => {});
	stepTrackRef.current = stepTrack;
	const handlePlayPauseRef = useRef(handlePlayPause);
	handlePlayPauseRef.current = handlePlayPause;

	// Lock-screen / headphone controls and artwork (Media Session API)
	useEffect(() => {
		if (!('mediaSession' in navigator) || !currentTrack) return;
		try {
			const art = currentTrack.artworkLarge || currentTrack.artwork;
			navigator.mediaSession.metadata = new window.MediaMetadata({
				title: currentTrack.title,
				artist: currentTrack.artist || 'RYLAND',
				album: currentTrack.album || '',
				artwork: art ? [{ src: new URL(art, window.location.origin).href, sizes: '500x500', type: 'image/jpeg' }] : [],
			});
			navigator.mediaSession.setActionHandler('play', () => handlePlayPauseRef.current());
			navigator.mediaSession.setActionHandler('pause', () => handlePlayPauseRef.current());
			navigator.mediaSession.setActionHandler('previoustrack', () => stepTrackRef.current(-1));
			navigator.mediaSession.setActionHandler('nexttrack', () => stepTrackRef.current(1));
			navigator.mediaSession.setActionHandler('seekto', (d) => {
				const a = audioRef.current;
				if (engineRef.current === 'native' && a && Number.isFinite(a.duration) && d.seekTime != null) a.currentTime = d.seekTime;
			});
		} catch (_) {}
	}, [currentTrack]);

	useEffect(() => {
		if ('mediaSession' in navigator) {
			try {
				navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
			} catch (_) {}
		}
	}, [isPlaying]);

	const nativeHandlers = {
		onPlaying: () => {
			if (engineRef.current !== 'native') return;
			setIsPlaying(true);
			setPlaybackLoading(false);
		},
		onPause: () => {
			if (engineRef.current === 'native') setIsPlaying(false);
		},
		onWaiting: () => {
			if (engineRef.current === 'native') setPlaybackLoading(true);
		},
		onTimeUpdate: (e) => {
			if (engineRef.current !== 'native') return;
			const a = e.currentTarget;
			setTimeInfo({ pos: a.currentTime, dur: Number.isFinite(a.duration) ? a.duration : 0 });
		},
		onLoadedMetadata: (e) => {
			if (engineRef.current !== 'native') return;
			const a = e.currentTarget;
			setTimeInfo({ pos: a.currentTime, dur: Number.isFinite(a.duration) ? a.duration : 0 });
		},
		onEnded: () => {
			if (engineRef.current !== 'native') return;
			setIsPlaying(false);
			stepTrackRef.current(1, true);
		},
		onError: () => {
			if (engineRef.current !== 'native' || !audioRef.current?.getAttribute('src')) return;
			const track = currentTrackRef.current;
			// Hosted file failed – fall back to SoundCloud for this song
			if (track?.soundcloudUrl) startSoundCloud(track);
			else {
				setPlaybackLoading(false);
				setPlayError(track);
			}
		},
	};

	// ——— iPod menus ———

	const view = stack[stack.length - 1];

	const push = (id, param = null) => {
		setNavDir('forward');
		setStack((s) => [...s, { id, param, sel: 0 }]);
	};
	const back = () => {
		if (stack.length <= 1) return;
		setNavDir('back');
		setStack((s) => s.slice(0, -1));
	};
	const setSel = (sel) => setStack((s) => s.map((v, i) => (i === s.length - 1 ? { ...v, sel } : v)));
	backFromNowPlayingRef.current = () => {
		if (view.id === 'nowplaying') back();
	};

	const openNowPlaying = () => {
		if (view.id !== 'nowplaying') push('nowplaying');
	};

	const songItems = (tracks) =>
		tracks.map((t) => ({
			key: t.id,
			label: t.title,
			playing: currentTrack?.id === t.id,
			action: () => {
				playTrack(t, tracks);
				openNowPlaying();
			},
		}));

	/** Rows for the current menu: { key, label, chevron, playing, disabled, action } */
	const menuFor = (v) => {
		switch (v.id) {
			case 'main':
				return {
					title: 'iPod',
					items: [
						{ key: 'music', label: 'Music', chevron: true, action: () => push('music') },
						{
							key: 'shuffle',
							label: 'Shuffle Songs',
							action: () => {
								const queue = shuffled(allTracks);
								if (!queue.length) return;
								flushSync(() => setCurrentTrack(null));
								playTrack(queue[0], queue);
								openNowPlaying();
							},
						},
						...(currentTrack
							? [{ key: 'np', label: 'Now Playing', chevron: true, action: openNowPlaying }]
							: []),
					],
				};
			case 'music':
				return {
					title: 'Music',
					items: [
						{ key: 'favorites', label: 'Favorites', chevron: true, action: () => push('favorites') },
						{ key: 'albums', label: 'Albums', chevron: true, action: () => push('albums') },
						{ key: 'songs', label: 'Songs', chevron: true, action: () => push('songs') },
						{ key: 'search', label: 'Search', chevron: true, action: () => push('search') },
					],
				};
			case 'songs':
				return { title: 'Songs', items: songItems(allTracks) };
			case 'favorites': {
				const favs = favoriteList();
				return {
					title: 'Favorites',
					items: favs.length
						? songItems(favs)
						: [{ key: 'none', label: 'No favorites yet', disabled: true }],
				};
			}
			case 'albums':
				return {
					title: 'Albums',
					items: albumList().map((a) => ({
						key: a.name,
						label: a.name,
						chevron: true,
						action: () => push('album', a.name),
					})),
				};
			case 'album': {
				const tracks = allTracks.filter((t) => (t.album || 'Other') === v.param);
				return { title: v.param, items: songItems(tracks) };
			}
			case 'search':
				return {
					title: 'Search',
					items: searchLimitMessage
						? [{ key: 'limit', label: searchLimitMessage, disabled: true }]
						: searchLoading
							? [{ key: 'loading', label: 'Searching…', disabled: true }]
							: songItems(searchResults),
				};
			default:
				return { title: 'Now Playing', items: [] };
		}
	};

	const menu = menuFor(view);
	const sel = Math.min(view.sel, Math.max(0, menu.items.length - 1));

	// Keep the highlighted row in view (scroll the list, never the page)
	useLayoutEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const row = list.querySelector(`[data-index="${sel}"]`);
		if (!row) return;
		if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
		else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
			// snap to whole rows so the top row is never cut in half, like the real iPod
			const rh = row.offsetHeight || 1;
			list.scrollTop = Math.ceil((row.offsetTop + rh - list.clientHeight) / rh) * rh;
		}
		updateBar();
	}, [sel, view.id, view.param, menu.items.length]);

	// iPod classic scroll bar: only on lists longer than the screen
	const [bar, setBar] = useState(null);
	function updateBar() {
		const list = listRef.current;
		if (!list || list.scrollHeight <= list.clientHeight + 1) return setBar(null);
		const h = list.clientHeight;
		const size = Math.max(14, (h / list.scrollHeight) * h);
		const top = (list.scrollTop / (list.scrollHeight - h)) * (h - size);
		setBar((b) => (b && Math.abs(b.top - top) < 0.5 && Math.abs(b.size - size) < 0.5 ? b : { top, size }));
	}

	useEffect(() => {
		if (view.id === 'search') searchInputRef.current?.focus({ preventScroll: true });
	}, [view.id]);

	const selectCurrent = () => {
		if (view.id === 'nowplaying') {
			toggleFavorite(currentTrack);
			return;
		}
		if (view.id === 'search' && document.activeElement === searchInputRef.current) {
			runSearch(searchQuery);
			searchInputRef.current?.blur();
			return;
		}
		const item = menu.items[sel];
		if (item && !item.disabled && item.action) item.action();
	};

	const rotate = (steps) => {
		if (view.id === 'nowplaying') {
			if (currentTrack && timeInfo.dur > 0) seekToSeconds(Math.min(timeInfo.dur - 1, timeInfo.pos + steps * SEEK_STEP_S));
			return;
		}
		const n = menu.items.length;
		if (!n) return;
		const next = Math.min(n - 1, Math.max(0, sel + steps));
		if (next !== sel) {
			setSel(next);
			playSound('tick');
		}
	};

	const press = (button) => {
		playSound('tick');
		setWheelPressed(button);
		window.setTimeout(() => setWheelPressed(null), 140);
		if (button === 'menu') back();
		else if (button === 'next') stepTrack(1);
		else if (button === 'prev') stepTrack(-1);
		else if (button === 'play') {
			if (currentTrack) handlePlayPause();
			else if (allTracks.length) {
				playTrack(allTracks[0], allTracks);
				openNowPlaying();
			}
		} else if (button === 'center') selectCurrent();
	};

	// Click wheel: drag around the ring to scroll; a short tap on the ring presses MENU / ⏭ / ⏯ / ⏮
	const wheelPoint = (e) => {
		const r = wheelRef.current.getBoundingClientRect();
		const x = e.clientX - (r.left + r.width / 2);
		const y = e.clientY - (r.top + r.height / 2);
		return { angle: (Math.atan2(y, x) * 180) / Math.PI, dist: Math.hypot(x, y) / (r.width / 2) };
	};
	const onWheelDown = (e) => {
		const p = wheelPoint(e);
		if (p.dist < 0.38 || p.dist > 1.04) return;
		e.preventDefault();
		dragRef.current = { last: p.angle, start: p.angle, acc: wheelCarry.current, moved: 0 };
		try {
			wheelRef.current.setPointerCapture(e.pointerId);
		} catch (_) {}
	};
	const onWheelMove = (e) => {
		const d = dragRef.current;
		if (!d) return;
		const p = wheelPoint(e);
		let delta = p.angle - d.last;
		if (delta > 180) delta -= 360;
		if (delta < -180) delta += 360;
		d.last = p.angle;
		d.acc += delta;
		d.moved += Math.abs(delta);
		let steps = 0;
		while (d.acc >= WHEEL_STEP_DEG) {
			d.acc -= WHEEL_STEP_DEG;
			steps += 1;
		}
		while (d.acc <= -WHEEL_STEP_DEG) {
			d.acc += WHEEL_STEP_DEG;
			steps -= 1;
		}
		if (steps) rotate(steps);
	};
	const onWheelUp = () => {
		const d = dragRef.current;
		dragRef.current = null;
		if (d) wheelCarry.current = d.acc;
		if (!d || d.moved > 10) return;
		const a = d.start; // screen angles: -90 top, 0 right, 90 bottom, ±180 left
		if (a >= -135 && a < -45) press('menu');
		else if (a >= -45 && a < 45) press('next');
		else if (a >= 45 && a < 135) press('play');
		else press('prev');
	};

	// Keyboard: arrows scroll, Enter selects, Escape/Backspace go back, Space plays/pauses
	const keyRef = useRef(() => {});
	keyRef.current = (e) => {
		const typing = e.target === searchInputRef.current;
		if (typing && e.key !== 'Enter' && e.key !== 'Escape' && e.key !== 'ArrowDown') return;
		if (e.key === 'ArrowDown') {
			if (typing) searchInputRef.current.blur();
			rotate(1);
		} else if (e.key === 'ArrowRight') {
			if (view.id === 'nowplaying') rotate(1);
			else selectCurrent();
		} else if (e.key === 'ArrowUp') rotate(-1);
		else if (e.key === 'Enter') selectCurrent();
		else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'ArrowLeft') back();
		else if (e.key === ' ') press('play');
		else return;
		e.preventDefault();
	};
	useEffect(() => {
		const onKey = (e) => keyRef.current(e);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	const queue = queueRef.current.length ? queueRef.current : allTracks;
	const queueIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
	const progress = timeInfo.dur > 0 ? Math.min(1, timeInfo.pos / timeInfo.dur) : 0;
	const art = currentTrack?.artworkLarge || currentTrack?.artwork;

	return (
		<div className="ipod ipodClassic">
			<div className="icScreen">
				<div className="icTitleBar">
					<span className="icTitleState" aria-hidden>
						{currentTrack ? isPlaying ? <BsFillPlayFill /> : <BsFillPauseFill /> : null}
					</span>
					<span className="icTitle">{menu.title}</span>
				</div>

				<div key={`${stack.length}-${view.id}-${view.param}`} className={`icPane icPane-${navDir}`}>
					{view.id === 'nowplaying' ? (
						currentTrack ? (
							<div className="icNowPlaying">
								{favNote && <div className="icFavNote">{favNote}</div>}
								<div className="icNpCount">
									{queueIndex >= 0 ? `${queueIndex + 1} of ${queue.length}` : ''}
								</div>
								<div className="icNpBody">
									<div className="icNpArt">
										{art ? <img src={art} alt={`${currentTrack.title} cover art`} /> : <BsMusicNote />}
									</div>
									<div className="icNpMeta">
										<span className="icNpTitle">
											{currentTrack.title}
											{favorites.includes(currentTrack.id) && <span className="icNpStar"> ★</span>}
										</span>
										<span className="icNpArtist">{currentTrack.artist || 'RYLAND'}</span>
										<span className="icNpAlbum">{currentTrack.album}</span>
									</div>
								</div>
								{playError && playError.id === currentTrack.id ? (
									<div className="icNpError">
										Couldn't load this song.{' '}
										{currentTrack.soundcloudUrl && (
											<a href={currentTrack.soundcloudUrl} target="_blank" rel="noreferrer">
												Open on SoundCloud ›
											</a>
										)}
									</div>
								) : (
									<div className="icNpProgress">
										<div className="icNpBar" aria-label="Song progress">
											<div className="icNpBarFill" style={{ width: `${progress * 100}%` }} />
										</div>
										<div className="icNpTimes">
											<span>{playbackLoading ? 'Loading…' : formatTime(timeInfo.pos)}</span>
											<span>-{formatTime(Math.max(0, timeInfo.dur - timeInfo.pos))}</span>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="icEmpty">Nothing playing</div>
						)
					) : (
						<>
							{view.id === 'search' && (
								<form
									className="icSearch"
									onSubmit={(e) => {
										e.preventDefault();
										runSearch(searchQuery);
										searchInputRef.current?.blur();
									}}
								>
									<input
										ref={searchInputRef}
										type="search"
										className="icSearchInput"
										placeholder="Search any song ever"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										enterKeyHint="search"
									/>
								</form>
							)}
							<div className={`icListWrap${bar ? ' icHasBar' : ''}`}>
							<ul className="icList" ref={listRef} role="listbox" aria-label={menu.title} onScroll={updateBar}>
								{menu.items.map((item, i) => (
									<li
										key={item.key}
										data-index={i}
										role="option"
										aria-selected={i === sel}
										aria-disabled={item.disabled || undefined}
										className={`icRow${i === sel ? ' icRow-sel' : ''}${item.disabled ? ' icRow-disabled' : ''}`}
										onClick={() => {
											if (item.disabled) return;
											playSound('tick');
											setSel(i);
											item.action?.();
										}}
									>
										<span className="icRowLabel">{item.label}</span>
										{item.playing && <span className="icRowSpeaker" aria-label="Now playing">♪</span>}
										{item.chevron && <span className="icRowChevron">›</span>}
									</li>
								))}
							</ul>
							{bar && (
								<div className="icBar" aria-hidden>
									<div className="icBarThumb" style={{ top: bar.top, height: bar.size }} />
								</div>
							)}
							</div>
						</>
					)}
				</div>
			</div>

			<div
				className="icWheel"
				ref={wheelRef}
				onPointerDown={onWheelDown}
				onPointerMove={onWheelMove}
				onPointerUp={onWheelUp}
				onPointerCancel={() => (dragRef.current = null)}
				role="group"
				aria-label="Click wheel"
			>
				<span className={`icWheelLabel icWheelMenu${wheelPressed === 'menu' ? ' icPressed' : ''}`} aria-hidden>
					MENU
				</span>
				<span className={`icWheelLabel icWheelNext${wheelPressed === 'next' ? ' icPressed' : ''}`} aria-hidden>
					<span className="icGlyphNext" />
				</span>
				<span className={`icWheelLabel icWheelPrev${wheelPressed === 'prev' ? ' icPressed' : ''}`} aria-hidden>
					<span className="icGlyphPrev" />
				</span>
				<span className={`icWheelLabel icWheelPlay${wheelPressed === 'play' ? ' icPressed' : ''}`} aria-hidden>
					<span className="icGlyphPlayPause" />
				</span>
				<button
					type="button"
					className={`icWheelCenter${wheelPressed === 'center' ? ' icPressed' : ''}`}
					onPointerDown={(e) => e.stopPropagation()}
					onClick={() => press('center')}
					aria-label="Select"
				/>
				{/* Screen-reader / keyboard access to the ring buttons */}
				<span className="icSrOnly">
					<button type="button" onClick={() => press('menu')}>Menu</button>
					<button type="button" onClick={() => press('prev')}>Previous song</button>
					<button type="button" onClick={() => press('play')}>Play or pause</button>
					<button type="button" onClick={() => press('next')}>Next song</button>
				</span>
			</div>

			{/* Built-in player for self-hosted songs */}
			<audio ref={audioRef} preload="none" playsInline {...nativeHandlers} />

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
