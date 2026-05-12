// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { PowerOnProvider } from "./context/PowerOnContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import AnimatedRoutes from "./components/animatedRoutes";
import PowerOnOverlay from "./components/PowerOnOverlay";
import HomeButton from "./components/homeButton/homeButton";
import PowerButton from "./components/powerButton/powerButton";
import TopBar from "./components/topBar/topBar";
import { MAINAPPS, FOOTERAPPS, EXTRAS_APPS } from "./assets/apps";

import phone from "./assets/imgs/Iphone.png";

import "./App.css";

const App = () => {
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
      <div className="Frame">
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
          </div>

          <div className="backLit" />

          <img src={phone} className="phone" alt="phone" />
          </WallpaperProvider>
          </PowerOnProvider>
        </Router>
      </div>
    </div>
  );
};

export default App;
