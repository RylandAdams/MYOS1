// src/App.js
import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { PowerOnProvider } from "./context/PowerOnContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import AnimatedRoutes from "./components/animatedRoutes";
import PowerOnOverlay from "./components/PowerOnOverlay";
import HomeButton from "./components/homeButton/homeButton";
import PowerButton from "./components/powerButton/powerButton";
import TopBar from "./components/topBar/topBar";
import { MAINAPPS, FOOTERAPPS, EXTRAS_APPS } from "./assets/apps";

import phone from "./assets/imgs/Iphone.webp"; // 1200px Lanczos upscale of the original 800px frame

import "./App.css";

const App = () => {
  const frameRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const id = requestAnimationFrame(() => {
      frame.classList.add("myos-frame-visible");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Desktop only: the phone tilts a few degrees toward the cursor and the glare follows.
  // Touch devices never get the 3D transform – it makes Safari rasterize the screen text soft.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !window.matchMedia) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;
    frame.classList.add("tiltEnabled");
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        frame.style.setProperty("--tilt-x", `${(-ny * 4).toFixed(2)}deg`);
        frame.style.setProperty("--tilt-y", `${(nx * 5).toFixed(2)}deg`);
        // Direction the light travels (from the cursor across the phone), -1..1 – drives the depth shading
        frame.style.setProperty("--light-x", (-nx * 2).toFixed(3));
        frame.style.setProperty("--light-y", (-ny * 2).toFixed(3));
        frame.style.setProperty("--glare-x", `${(50 - nx * 40).toFixed(1)}%`);
        frame.style.setProperty("--glare-y", `${(50 - ny * 40).toFixed(1)}%`);
      });
    };
    const onLeave = () => {
      ["--tilt-x", "--tilt-y", "--glare-x", "--glare-y", "--light-x", "--light-y"].forEach((k) => frame.style.removeProperty(k));
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      frame.classList.remove("tiltEnabled");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
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
    const MIN_BOOT_BAR_RAMP_MS = 2800;

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
      <div className="Frame" ref={frameRef}>
        <Router>
          <PowerOnProvider>
            <WallpaperProvider>
          <PowerButton />
          <HomeButton />

          <div className="wallpaper" />

          <div className="iphoneContent">
            <TopBar />
            <AnimatedRoutes />
            <PowerOnOverlay />
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
          </WallpaperProvider>
          </PowerOnProvider>
        </Router>
      </div>
    </div>
  );
};

export default App;
