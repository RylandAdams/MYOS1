/* RYLAND outlet pages, v2.
   One <audio preload="none"> shared by every control: the hero's play-all button, the track
   list, each song's play button, cover and waveform seek bar, and the docked player.
   Also: Save as PDF with a fallback toast. No framework, no network calls of its own. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  /* Open at the top. The claude.ai viewer carried the dashboard's scroll offset into the page.
     Without a #song link, start at the top, and once more after load, but never after the
     visitor has scrolled, touched, clicked or pressed a key. */
  if (!location.hash) {
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (err) { /* ignore */ }
    var userMoved = false;
    var noteMove = function () { userMoved = true; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (t) {
      window.addEventListener(t, noteMove, { passive: true, capture: true });
    });
    var toTop = function () { if (!userMoved && !location.hash && window.scrollY) window.scrollTo(0, 0); };
    toTop();
    window.addEventListener('pageshow', function (e) { if (!e.persisted) toTop(); });
    window.addEventListener('load', function () { toTop(); setTimeout(toTop, 250); });
  }

  /* Inside a frame (a preview, a claude.ai artifact) printing is blocked, so the
     Save as PDF button is removed there. A hosted page, opened on its own, keeps it. */
  var framed = true;
  try { framed = window.self !== window.top; } catch (err) { framed = true; }
  if (framed) {
    Array.prototype.forEach.call(doc.querySelectorAll('button[data-print]'), function (b) {
      b.parentNode.removeChild(b);
    });
  }

  var toastEl = doc.querySelector('.toast');
  var toastTimer = 0;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4500);
  }

  /* Save as PDF: window.print(), and a toast when printing is blocked or does nothing. */
  var PRINT_MSG = 'Printing is blocked here. Use your browser’s print menu to save a PDF.';
  doc.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('button[data-print]');
    if (!btn) return;
    var fired = false;
    var mark = function () { fired = true; };
    window.addEventListener('beforeprint', mark);
    try {
      window.print();
    } catch (err) {
      window.removeEventListener('beforeprint', mark);
      toast(PRINT_MSG);
      return;
    }
    setTimeout(function () {
      window.removeEventListener('beforeprint', mark);
      if (!fired) toast(PRINT_MSG);
    }, 900);
  });

  var data = {};
  try {
    var dataEl = doc.getElementById('data');
    data = JSON.parse(dataEl ? dataEl.textContent : '{}') || {};
  } catch (err) {
    data = {};
  }
  var songs = Array.isArray(data.songs) ? data.songs : [];
  var audio = doc.getElementById('audio');
  var dock = doc.querySelector('.dock');

  /* Hide lyrics at the end of a long lyric: close it and bring its summary back into view. */
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lyrics-close]');
    var d = b && b.closest('details');
    if (!d) return;
    d.open = false;
    var s = d.querySelector('summary');
    if (s) { s.focus({ preventScroll: true }); s.scrollIntoView({ block: 'center' }); }
  });

  if (!songs.length || !audio || !dock) return;

  var PREVIEW_FALLBACK = 30;
  var cur = -1;
  var raf = 0;
  var pendingSeek = null;
  var dragging = null;

  var dockCover = dock.querySelector('[data-dock-cover]');
  var dockTitle = dock.querySelector('[data-dock-title]');
  var dockBy = dock.querySelector('[data-dock-by]');
  var dockSpotify = dock.querySelectorAll('[data-dock-spotify]');
  var dockPlay = dock.querySelector('[data-dock-play]');
  var dockPrev = dock.querySelector('[data-prev]');
  var dockNext = dock.querySelector('[data-next]');
  var dockSeek = dock.querySelector('[data-dock-seek]');
  var dockFill = dock.querySelector('[data-dock-fill]');
  var dockNow = dock.querySelector('[data-dock-now]');
  var dockTotal = dock.querySelector('[data-dock-total]');
  var playAll = doc.querySelector('[data-play-all]');
  var playAllLabel = playAll ? playAll.querySelector('[data-play-all-label]') : null;
  var playBtns = Array.prototype.slice.call(doc.querySelectorAll('[data-play]'));

  var waves = {};
  Array.prototype.forEach.call(doc.querySelectorAll('[data-wave]'), function (el) {
    var id = el.getAttribute('data-wave');
    waves[id] = {
      el: el,
      played: el.querySelector('.wave__played'),
      input: el.querySelector('[data-seek]'),
      time: doc.querySelector('[data-time="' + id + '"]')
    };
  });

  function indexOf(id) {
    for (var i = 0; i < songs.length; i++) if (songs[i].id === id) return i;
    return -1;
  }

  function fmt(t) {
    t = Math.max(0, Math.floor(isFinite(t) ? t : 0));
    var s = t % 60;
    return Math.floor(t / 60) + ':' + (s < 10 ? '0' : '') + s;
  }

  /* Totals round to the nearest second (29.99 s and 30.02 s previews both read 0:30), and the
     current time reads the same total at the end, so a finished preview shows 0:30 / 0:30. */
  function fmtTotal(d) { return fmt(Math.round(d)); }

  function clamp(x) { return Math.min(1, Math.max(0, x || 0)); }

  function duration() {
    return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : PREVIEW_FALLBACK;
  }

  function isPlaying() { return cur >= 0 && !audio.paused && !audio.ended; }

  /* Draw one song's waveform, seek bar and time. */
  function paintWave(id, p, t, d) {
    var w = waves[id];
    if (!w) return;
    var now = p >= 0.999 ? Math.round(d) : t;
    if (w.played) w.played.style.clipPath = 'inset(0 ' + (100 - p * 100).toFixed(3) + '% 0 0)';
    if (w.input) {
      if (dragging !== w.input) w.input.value = String(Math.round(p * 1000));
      w.input.setAttribute('aria-valuetext', fmt(now) + ' of ' + fmtTotal(d));
    }
    if (w.time) w.time.textContent = fmt(now) + ' / ' + fmtTotal(d);
  }

  function render(frac) {
    if (cur < 0) return;
    var d = duration();
    var p = frac != null ? clamp(frac) : clamp(audio.currentTime / d);
    var t = p * d;
    var now = p >= 0.999 ? Math.round(d) : t;
    paintWave(songs[cur].id, p, t, d);
    if (dockFill) dockFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (dockSeek) {
      if (dragging !== dockSeek) dockSeek.value = String(Math.round(p * 1000));
      dockSeek.setAttribute('aria-valuetext', fmt(now) + ' of ' + fmtTotal(d));
    }
    if (dockNow) dockNow.textContent = fmt(now);
    if (dockTotal) dockTotal.textContent = fmtTotal(d);
  }

  function loop() {
    render();
    raf = isPlaying() ? requestAnimationFrame(loop) : 0;
  }

  function sync() {
    var playing = isPlaying();
    var curId = cur >= 0 ? songs[cur].id : null;
    playBtns.forEach(function (b) {
      var id = b.getAttribute('data-play');
      var s = songs[indexOf(id)];
      var on = playing && id === curId;
      b.classList.toggle('is-playing', on);
      if (s) b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + s.title);
    });
    Object.keys(waves).forEach(function (id) {
      waves[id].el.classList.toggle('is-current', id === curId);
    });
    if (playAll) {
      playAll.classList.toggle('is-playing', playing);
      if (playAllLabel) {
        playAllLabel.textContent = playAll.getAttribute(playing ? 'data-label-pause' : 'data-label');
      }
    }
    if (dockPlay) {
      dockPlay.classList.toggle('is-playing', playing);
      if (curId) dockPlay.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + songs[cur].title);
    }
    /* Previous always works once a song is loaded: on the first song, or after 3 seconds,
       it restarts the song. Only Next runs out. */
    if (dockPrev) dockPrev.setAttribute('aria-disabled', String(cur < 0));
    if (dockNext) dockNext.setAttribute('aria-disabled', String(cur >= songs.length - 1));
    root.classList.toggle('is-playing', playing);
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (err) { /* older browsers */ }
    }
  }

  /* The page keeps room for the bar at its real height (safe area included), so nothing
     ends up under it when a title or a narrow screen makes it taller than planned. */
  function measureDock() {
    if (dock.hidden) return;
    var h = Math.ceil(dock.getBoundingClientRect().height);
    if (h > 0) root.style.setProperty('--dock-real', h + 'px');
  }

  function showDock() {
    if (!dock.hidden) return;
    dock.hidden = false;
    root.classList.add('dock-on');
    measureDock();
    if (typeof window.ResizeObserver === 'function') {
      try { new window.ResizeObserver(measureDock).observe(dock); } catch (err) { /* resize below */ }
    }
    window.addEventListener('resize', measureDock);
  }

  function absolute(url) {
    try { return new URL(url, location.href).href; } catch (err) { return url; }
  }

  function load(i) {
    var prev = cur;
    var s = songs[i];
    cur = i;
    pendingSeek = null;
    audio.src = s.audio;
    if (prev >= 0 && prev !== i) paintWave(songs[prev].id, 0, 0, PREVIEW_FALLBACK);
    if (dockCover) dockCover.src = s.cover;
    if (dockTitle) dockTitle.textContent = s.title;
    if (dockBy) dockBy.textContent = 'RYLAND · ' + s.preview;
    Array.prototype.forEach.call(dockSpotify, function (a) {
      a.href = s.spotify;
      a.setAttribute('aria-label', 'Full song on Spotify: ' + s.title);
    });
    if ('mediaSession' in navigator && typeof window.MediaMetadata === 'function') {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: s.title,
          artist: 'RYLAND',
          artwork: [{ src: absolute(s.cover), sizes: '600x600', type: 'image/jpeg' }]
        });
      } catch (err) { /* ignore */ }
    }
    render(0);
    sync();
  }

  function seekTo(frac) {
    frac = clamp(frac);
    if (isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = frac * audio.duration;
      pendingSeek = null;
    } else {
      pendingSeek = frac;
    }
    render(frac);
  }

  function play(i, frac) {
    if (i < 0 || i >= songs.length) return;
    if (i !== cur) load(i);
    if (frac != null) seekTo(frac);
    showDock();
    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function (err) {
        if (err && err.name === 'AbortError') return;
        sync();
        toast('This preview did not play. The Spotify link plays the full song.');
      });
    }
  }

  function toggle(i) {
    if (i === cur && isPlaying()) audio.pause();
    else play(i);
  }

  /* Audio events */
  audio.addEventListener('loadedmetadata', function () {
    if (pendingSeek != null) {
      audio.currentTime = pendingSeek * audio.duration;
      pendingSeek = null;
    }
    render();
  });
  audio.addEventListener('play', function () { sync(); if (!raf) raf = requestAnimationFrame(loop); });
  audio.addEventListener('pause', function () { sync(); render(); });
  audio.addEventListener('timeupdate', function () { if (!raf) render(); });
  audio.addEventListener('seeked', function () { render(); sync(); });
  audio.addEventListener('ended', function () {
    if (cur < songs.length - 1) play(cur + 1);
    else { sync(); render(1); }
  });
  audio.addEventListener('error', function () {
    if (!audio.getAttribute('src')) return;
    sync();
    toast('This preview did not load. The Spotify link plays the full song.');
  });

  /* Clicks */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest('[data-play]');
    if (b) { toggle(indexOf(b.getAttribute('data-play'))); return; }
    if (t.closest('[data-play-all]')) {
      /* After the last song has ended, the list starts again at song 1. */
      if (cur < 0 || (audio.ended && cur === songs.length - 1)) play(0);
      else toggle(cur);
      return;
    }
    var c = t.closest('[data-cover-play]');
    if (c) { toggle(indexOf(c.getAttribute('data-cover-play'))); return; }
    if (t.closest('[data-dock-play]')) { if (cur >= 0) toggle(cur); return; }
    if (t.closest('[data-prev]')) {
      if (cur < 0) return;
      if (audio.currentTime > 3 || cur === 0) { seekTo(0); if (!isPlaying()) play(cur); }
      else play(cur - 1);
      return;
    }
    if (t.closest('[data-next]')) {
      if (cur >= 0 && cur < songs.length - 1) play(cur + 1);
    }
  });

  /* Seek bars: every waveform and the dock. Pointer drags, clicks and keys. */
  function seekIndex(input) {
    if (input === dockSeek) return cur;
    return indexOf(input.getAttribute('data-seek'));
  }

  function bindSeek(input) {
    if (!input) return;
    input.addEventListener('pointerdown', function () { dragging = input; });
    var release = function () { if (dragging === input) dragging = null; };
    input.addEventListener('pointerup', release);
    input.addEventListener('pointercancel', release);
    input.addEventListener('blur', release);
    input.addEventListener('input', function () {
      var i = seekIndex(input);
      if (i < 0) return;
      var frac = Number(input.value) / 1000;
      if (i !== cur) play(i, frac);
      else seekTo(frac);
    });
    input.addEventListener('change', release);
    input.addEventListener('keydown', function (e) {
      var i = seekIndex(input);
      if (i < 0) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(i);
        return;
      }
      var step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 }[e.key];
      var home = e.key === 'Home';
      var end = e.key === 'End';
      if (step == null && !home && !end) return;
      e.preventDefault();
      var d = i === cur ? duration() : PREVIEW_FALLBACK;
      var now = i === cur ? audio.currentTime : 0;
      var target = home ? 0 : end ? d - 1 : now + step;
      var frac = clamp(target / d);
      if (i !== cur) play(i, frac);
      else seekTo(frac);
    });
  }

  Object.keys(waves).forEach(function (id) { bindSeek(waves[id].input); });
  bindSeek(dockSeek);

  /* Space toggles play once the player is open, unless focus is in a control. */
  doc.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== ' ' && e.code !== 'Space') return;
    if (dock.hidden || cur < 0) return;
    var t = e.target;
    if (t && t.closest && t.closest('a, button, input, select, textarea, summary, [contenteditable], [tabindex]')) return;
    e.preventDefault();
    toggle(cur);
  });

  /* Lock screen and headset keys */
  if ('mediaSession' in navigator) {
    var ms = navigator.mediaSession;
    var handlers = {
      play: function () { if (cur < 0 || (audio.ended && cur === songs.length - 1)) play(0); else play(cur); },
      pause: function () { audio.pause(); },
      previoustrack: function () { if (cur > 0) play(cur - 1); else seekTo(0); },
      nexttrack: function () { if (cur < songs.length - 1) play(cur + 1); },
      seekto: function (d) { if (d && isFinite(d.seekTime)) seekTo(d.seekTime / duration()); }
    };
    Object.keys(handlers).forEach(function (k) {
      try { ms.setActionHandler(k, handlers[k]); } catch (err) { /* not supported */ }
    });
  }

  sync();
})();
