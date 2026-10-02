// src/App.js
import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { PowerOnProvider } from "./context/PowerOnContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import AnimatedRoutes from "./components/animatedRoutes";
import PowerOnOverlay from "./components/PowerOnOverlay";
import MotionPrompt, { motionChoice, requestMotion } from "./components/MotionPrompt";
import LockOverlay from "./components/LockScreen/LockOverlay";
import ScreenOff from "./components/ScreenOff";
import MailSheet from "./components/MailSheet";
import { LockProvider } from "./context/LockContext";
import HomeButton from "./components/homeButton/homeButton";
import PowerButton from "./components/powerButton/powerButton";
import TopBar from "./components/topBar/topBar";
import { MAINAPPS, FOOTERAPPS, EXTRAS_APPS } from "./assets/apps";

import phone from "./assets/imgs/Iphone.webp"; // 1200px Lanczos upscale of the original 800px frame

import "./App.css";
import "./darkTheme.css";
import { applyTheme } from "./utils/theme";

const App = () => {
  const frameRef = useRef(null);

  // Dark Mode, if the visitor turned it on
  useEffect(() => {
    applyTheme();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const id = requestAnimationFrame(() => {
      frame.classList.add("myos-frame-visible");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // The phone tilts a few degrees and the light on the screen and device follows.
  // Desktop: toward the cursor. Phones: with the motion sensor (iPhone asks once, on the first tap).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !window.matchMedia) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = window.matchMedia("(orientation: portrait)");
    if (reduced.matches) return;
    const VARS = ["--tilt-x", "--tilt-y", "--glare-x", "--glare-y", "--light-x", "--light-y"];

    /** nx, ny in -0.5..0.5 – where the light comes from relative to the phone's centre */
    // Phones get a much stronger tilt than desktop – at ±5° it was too subtle to notice on a small screen
    const touch = !fine.matches;
    const TILT = touch ? [28, 34] : [9.6, 12]; // max rotation ×2: phones ±14° / ±17°, desktop ±4.8° / ±6°
    const apply = (nx, ny) => {
      frame.style.setProperty("--tilt-x", `${(-ny * TILT[0]).toFixed(2)}deg`);
      frame.style.setProperty("--tilt-y", `${(nx * TILT[1]).toFixed(2)}deg`);
      // Direction the light travels (from the source across the phone), -1..1 – drives the depth shading
      frame.style.setProperty("--light-x", (-nx * 2).toFixed(3));
      frame.style.setProperty("--light-y", (-ny * 2).toFixed(3));
      frame.style.setProperty("--glare-x", `${(50 - nx * 80).toFixed(1)}%`);
      frame.style.setProperty("--glare-y", `${(50 - ny * 80).toFixed(1)}%`);
    };
    const reset = () => VARS.forEach((k) => frame.style.removeProperty(k));
    let raf = 0;
    const cleanups = [];

    if (fine.matches) {
      frame.classList.add("tiltEnabled");
      const onMove = (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => apply(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5));
      };
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", reset);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", reset);
      });
    } else if (typeof window.DeviceOrientationEvent !== "undefined") {
      // Whatever angle the phone is first held at counts as level; tilting from there moves it
      let base = null;
      let target = [0, 0];
      let current = [0, 0];
      let running = false;
      const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
      const tick = () => {
        current = [current[0] + (target[0] - current[0]) * 0.32, current[1] + (target[1] - current[1]) * 0.32];
        apply(current[0], current[1]);
        raf = Math.abs(target[0] - current[0]) + Math.abs(target[1] - current[1]) > 0.002 ? requestAnimationFrame(tick) : ((running = false), 0);
      };
      const onOrient = (e) => {
        if (e.beta == null || e.gamma == null || !portrait.matches) return;
        if (!base) base = [e.beta, e.gamma];
        // ~9° of tilt from the starting angle = full effect
        target = [clamp(-(e.gamma - base[1]) / 18), clamp(-(e.beta - base[0]) / 18)];
        if (!running) {
          running = true;
          raf = requestAnimationFrame(tick);
        }
      };
      const syncOrientation = () => {
        if (portrait.matches) frame.classList.add("tiltEnabled", "tiltTouch");
        else {
          frame.classList.remove("tiltEnabled", "tiltTouch");
          reset();
          base = null;
        }
      };
      const start = () => {
        syncOrientation();
        window.addEventListener("deviceorientation", onOrient);
        portrait.addEventListener?.("change", syncOrientation);
        cleanups.push(() => {
          window.removeEventListener("deviceorientation", onOrient);
          portrait.removeEventListener?.("change", syncOrientation);
        });
      };
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (isIOS && typeof window.DeviceOrientationEvent.requestPermission === "function") {
        // iPhone: permission needs a tap. First visit: MotionPrompt's "Allow" asks and fires
        // 'myos:motion-granted'. Return visits that already allowed: the first tap re-confirms silently.
        const onGranted = () => start();
        window.addEventListener("myos:motion-granted", onGranted, { once: true });
        cleanups.push(() => window.removeEventListener("myos:motion-granted", onGranted));
        if (motionChoice() === "granted") {
          const resume = () => requestMotion();
          window.addEventListener("click", resume, { once: true });
          cleanups.push(() => window.removeEventListener("click", resume));
        }
      } else {
        start();
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      frame.classList.remove("tiltEnabled", "tiltTouch");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const doc = document.documentElement;
      const w = window.innerWidth;
      const h = window.innerHeight;
      doc.style.setProperty("--doc-height", `${h}px`);
      doc.style.setProperty("--doc-width", `${w}px`);
      const verticalPadding = 48; // 24px top + 24px bottom
      const scale = Math.min(w / 361, (h - verticalPadding) / 690);
      doc.style.setProperty("--scale", String(scale));
    };
    window.addEventListener("resize", updateViewport);
    updateViewport();
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const preloadImage = (src) =>
      new Promise((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const gatherIconSources = () => {
      const main = MAINAPPS.flatMap((app) =>
        app.isFolder ? (app.apps || []).map((a) => a.appImage) : [app.appImage]
      );
      const footer = FOOTERAPPS.map((a) => a.appImage);
      const extras = EXTRAS_APPS.map((a) => a.appImage);
      return Array.from(new Set([...main, ...footer, ...extras, phone].filter(Boolean)));
    };

    /** Icons often resolve from cache in parallel — without a cap the bar jumps to ~70%+ on first paint */
    const MIN_BOOT_BAR_RAMP_MS = 3600;

    let cancelled = false;
    const startedAt = Date.now();
    window.__myosBootStartedAt = startedAt;

    let peakRaw = 0.01;

    const emitCappedProgress = (raw) => {
      peakRaw = Math.max(peakRaw, Math.min(1, raw));
      const elapsed = Date.now() - startedAt;
      const maxByTime = Math.min(
        1,
        0.01 + (elapsed / MIN_BOOT_BAR_RAMP_MS) * 0.99
      );
      const shown = Math.min(peakRaw, maxByTime);
      window.__myosBootProgress = shown;
      window.dispatchEvent(
        new CustomEvent("myos:boot-progress", {
          detail: { progress: shown },
        })
      );
    };

    const emitProgressFinal = () => {
      peakRaw = 1;
      window.__myosBootProgress = 1;
      window.dispatchEvent(
        new CustomEvent("myos:boot-progress", { detail: { progress: 1 } })
      );
    };

    const run = async () => {
      window.__myosBootReady = false;
      const sources = gatherIconSources();
      const total = sources.length || 1;
      let loaded = 0;

      emitCappedProgress(0.01);
      await Promise.all(
        sources.map(async (src) => {
          await preloadImage(src);
          loaded += 1;
          const ratio = loaded / total;
          emitCappedProgress(0.01 + ratio * 0.99);
        })
      );

      if (cancelled) return;

      while (!cancelled) {
        const elapsed = Date.now() - startedAt;
        const maxByTime = Math.min(
          1,
          0.01 + (elapsed / MIN_BOOT_BAR_RAMP_MS) * 0.99
        );
        emitCappedProgress(peakRaw);
        if (peakRaw >= 1 - 1e-9 && maxByTime >= 1 - 1e-9) break;
        await new Promise((r) => setTimeout(r, 24));
      }

      if (!cancelled) {
        emitProgressFinal();
        window.__myosBootReady = true;
        window.dispatchEvent(new Event("myos:app-ready"));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="App">
      <div className="rotateHint" aria-live="polite">
        <span className="rotateGlyph" aria-hidden="true" />
        <span>Turn your phone upright</span>
      </div>
      <div className="Frame" ref={frameRef}>
        <Router>
          <PowerOnProvider>
            <LockProvider>
            <WallpaperProvider>
          <PowerButton />
          <HomeButton />

          <div className="wallpaper" />

          <div className="iphoneContent">
            <TopBar />
            <AnimatedRoutes />
            <PowerOnOverlay />
            <LockOverlay />
            <MotionPrompt />
            <MailSheet />
            <ScreenOff />
            {/* Thin film overlay – apps look recessed behind glass */}
            <div className="screenFilm" aria-hidden="true" />
            <div className="screenGlare" aria-hidden="true" />
          </div>

          <div className="backLit" />

          <img src={phone} className="phone" alt="phone" />
          {/* Light on the device itself: a sheen shaped by the phone image, and the Home button's own reflection */}
          <div className="phoneSheen" aria-hidden="true" style={{ "--phone-mask": `url(${phone})` }} />
          <div className="homeSheen" aria-hidden="true" />
          <div className="speakerSheen" aria-hidden="true" />
          <div className="screenRim" aria-hidden="true" />
          </WallpaperProvider>
            </LockProvider>
          </PowerOnProvider>
        </Router>
      </div>
    </div>
  );
};

export default App;
