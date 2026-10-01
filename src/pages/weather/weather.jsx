import React from "react";
import "./weather.css";

/* iPhone OS 1 Weather: one glossy card (blue by day, purple by night), city + high/low,
   big current temperature, six-day forecast; the ⓘ button flips the card to pick a city. */

const CACHE_KEY = "weather:current:v5";
const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_PLACE = { lat: 45.5152, lon: -122.6784, label: "Portland" };

/** Open-Meteo weather code → glossy icon kind */
function iconKind(code, isDay = true) {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([45, 48].includes(code)) return "fog";
  if (code === 3) return "cloud";
  if (code === 1 || code === 2) return isDay ? "partly" : "partlyNight";
  return isDay ? "sun" : "moon";
}

const LABELS = {
  sun: "Sunny", moon: "Clear", partly: "Partly cloudy", partlyNight: "Partly cloudy",
  cloud: "Cloudy", rain: "Rain", snow: "Snow", storm: "Thunderstorms", fog: "Fog",
};

/** Glossy weather glyphs in the spirit of the 2007 icons (drawn, not emoji) */
function WeatherIcon({ kind, size = 30 }) {
  const id = React.useId().replace(/:/g, "");
  const sun = (cx, cy, r) => (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.55} fill={`url(#${id}glow)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}sun)`} />
      <ellipse cx={cx} cy={cy - r * 0.45} rx={r * 0.7} ry={r * 0.38} fill="#fff" opacity="0.45" />
    </g>
  );
  const moon = (cx, cy, r) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}moon)`} />
      <circle cx={cx + r * 0.45} cy={cy - r * 0.3} r={r * 0.85} fill={`url(#${id}moonCut)`} />
    </g>
  );
  const cloud = (dx = 0, dy = 0, dark = false) => (
    <g transform={`translate(${dx} ${dy})`}>
      <path
        d="M9 27 a6.5 6.5 0 0 1 1.5 -12.8 a9 9 0 0 1 17 -2.2 a6.5 6.5 0 0 1 4.5 15 z"
        fill={dark ? `url(#${id}cloudDark)` : `url(#${id}cloud)`}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="0.6"
      />
      <path d="M11 17 a8 8 0 0 1 15 -3" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-label={LABELS[kind]} role="img">
      <defs>
        <radialGradient id={`${id}sun`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff6a8" />
          <stop offset="55%" stopColor="#ffd21f" />
          <stop offset="100%" stopColor="#f39a00" />
        </radialGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset="55%" stopColor="#ffe066" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}moon`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="100%" stopColor="#d8d2a8" />
        </linearGradient>
        <linearGradient id={`${id}moonCut`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3170" />
          <stop offset="100%" stopColor="#4c4288" />
        </linearGradient>
        <linearGradient id={`${id}cloud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c9d3df" />
        </linearGradient>
        <linearGradient id={`${id}cloudDark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3e7ec" />
          <stop offset="100%" stopColor="#8f9aa8" />
        </linearGradient>
      </defs>
      {kind === "sun" && sun(20, 20, 10)}
      {kind === "moon" && moon(19, 20, 10)}
      {kind === "partly" && (<>{sun(15, 15, 8)}{cloud(3, 6)}</>)}
      {kind === "partlyNight" && (<>{moon(14, 14, 7.5)}{cloud(3, 6)}</>)}
      {kind === "cloud" && (<>{cloud(-3, 2, true)}{cloud(3, 6)}</>)}
      {kind === "rain" && (
        <>
          {cloud(0, -2, true)}
          {[13, 20, 27].map((x, i) => (
            <path key={x} d={`M${x} ${29 + (i % 2) * 2} q-1.6 3 0 4.4 q1.6 -1.4 0 -4.4 z`} fill="#5cb8ff" stroke="#2a7fd0" strokeWidth="0.4" />
          ))}
        </>
      )}
      {kind === "snow" && (
        <>
          {cloud(0, -2, true)}
          {[13, 20, 27].map((x, i) => (
            <g key={x} stroke="#fff" strokeWidth="1.1" strokeLinecap="round" transform={`translate(${x} ${31 + (i % 2) * 2})`}>
              <line x1="-2" y1="0" x2="2" y2="0" />
              <line x1="-1" y1="-1.7" x2="1" y2="1.7" />
              <line x1="-1" y1="1.7" x2="1" y2="-1.7" />
            </g>
          ))}
        </>
      )}
      {kind === "storm" && (
        <>
          {cloud(0, -2, true)}
          <path d="M21 26 l-5 7 h4 l-2 6 l7 -9 h-4 l2 -4 z" fill="#ffd21f" stroke="#c98a00" strokeWidth="0.5" />
        </>
      )}
      {kind === "fog" && (
        <>
          {cloud(0, -3, true)}
          {[28, 32, 36].map((y) => (
            <line key={y} x1="8" y1={y} x2="32" y2={y} stroke="#e8edf3" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
          ))}
        </>
      )}
    </svg>
  );
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  } catch {
    return null;
  }
}

function writeCache(v) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(v));
  } catch {}
}

/** City from the visitor's connection – no permission prompt */
async function getLocationByIP() {
  try {
    const res = await fetch("https://geo.kamero.ai/api/geo");
    if (!res.ok) return null;
    const json = await res.json();
    const lat = parseFloat(json.latitude);
    const lon = parseFloat(json.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, label: json.city || "Your City" };
    return null;
  } catch {
    return null;
  }
}

function getPosition(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    const t = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(t);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(t);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

async function reverseGeocode(lat, lon) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString(), { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const a = (await res.json())?.address;
    return a?.city || a?.town || a?.village || a?.municipality || a?.county || null;
  } catch {
    return null;
  }
}

async function fetchWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("current", "temperature_2m,weather_code,is_day");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("forecast_days", "6");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("weather fetch failed");
  return res.json();
}

async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query.trim());
    url.searchParams.set("count", 6);
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).map((r) => ({
      lat: r.latitude,
      lon: r.longitude,
      label: r.name,
      detail: [r.admin1, r.country].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}

export default function Weather() {
  const cached = React.useMemo(readCache, []);
  const [data, setData] = React.useState(cached?.data || null);
  const [place, setPlace] = React.useState(cached?.place || null);
  const [flipped, setFlipped] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const load = React.useCallback(async (p) => {
    setBusy(true);
    setFailed(false);
    try {
      const json = await fetchWeather(p.lat, p.lon);
      setData(json);
      setPlace(p);
      writeCache({ data: json, place: p, when: Date.now(), chosen: !!p.chosen });
      setFlipped(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    const fresh = cached?.data && cached?.place && Date.now() - cached.when < CACHE_TTL_MS;
    if (fresh) return;
    let alive = true;
    (async () => {
      // A city the visitor picked stays; otherwise use their connection's city, then Portland
      const p = cached?.chosen ? cached.place : (await getLocationByIP()) || DEFAULT_PLACE;
      if (alive) load(p);
    })();
    return () => {
      alive = false;
    };
  }, [cached, load]);

  const runSearch = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setResults(await searchCities(query));
    setBusy(false);
  };

  const useMyLocation = async () => {
    setBusy(true);
    const pos = await getPosition();
    if (!pos) {
      setBusy(false);
      setFailed(true);
      return;
    }
    const label = (await reverseGeocode(pos.lat, pos.lon)) || "My Location";
    load({ ...pos, label, chosen: true });
  };

  const isDay = data ? data.current.is_day === 1 : true;
  const days = data
    ? data.daily.time.slice(0, 6).map((iso, i) => ({
        key: iso,
        name: i === 0 ? "Today" : new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }),
        kind: iconKind(data.daily.weather_code[i]),
        hi: Math.round(data.daily.temperature_2m_max[i]),
        lo: Math.round(data.daily.temperature_2m_min[i]),
      }))
    : [];

  return (
    <div className="weatherPage">
      <div className={`wxFlip${flipped ? " wxFlip-back" : ""}`}>
        {/* Front: the forecast card */}
        <section className={`wxCard wxFront ${isDay ? "wxDay" : "wxNight"}`} aria-hidden={flipped}>
          {data ? (
            <>
              <header className="wxHead">
                <div className="wxPlace">
                  <h1 className="wxCity">{place?.label}</h1>
                  <div className="wxHiLo">
                    H: {days[0]?.hi}° L: {days[0]?.lo}°
                  </div>
                </div>
                <div className="wxNow">
                  <WeatherIcon kind={iconKind(data.current.weather_code, isDay)} size={34} />
                  <span className="wxTemp">{Math.round(data.current.temperature_2m)}°</span>
                </div>
              </header>
              <ul className="wxDays">
                {days.map((d) => (
                  <li key={d.key} className="wxDay-row">
                    <span className="wxDayName">{d.name}</span>
                    <span className="wxDayIcon">
                      <WeatherIcon kind={d.kind} size={26} />
                    </span>
                    <span className="wxDayHi">{d.hi}</span>
                    <span className="wxDayLo">{d.lo}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="wxLoading">{failed ? "Weather unavailable" : "Updating…"}</div>
          )}
          <footer className="wxFoot">
            <a className="wxCredit" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
            <span className="wxDots" aria-hidden="true">
              <i className="wxDotOn" />
            </span>
            <button type="button" className="wxInfo" onClick={() => setFlipped(true)} aria-label="Change city">
              i
            </button>
          </footer>
        </section>

        {/* Back: choose a city */}
        <section className="wxCard wxBack" aria-hidden={!flipped}>
          <div className="wxBackBar">
            <span className="wxBackTitle">Weather</span>
            <button type="button" className="wxDone" onClick={() => setFlipped(false)}>
              Done
            </button>
          </div>
          <form className="wxSearch" onSubmit={runSearch}>
            <input
              type="search"
              className="wxSearchInput"
              placeholder="City"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
            />
          </form>
          <ul className="wxList">
            {place && (
              <li className="wxListRow wxListCurrent">
                <span>{place.label}</span>
                <span className="wxCheck">✓</span>
              </li>
            )}
            {results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button type="button" className="wxListRow" onClick={() => load({ lat: r.lat, lon: r.lon, label: r.label, chosen: true })}>
                  <span>{r.label}</span>
                  <span className="wxListDetail">{r.detail}</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="wxListRow wxListAction" onClick={useMyLocation}>
                Use My Location
              </button>
            </li>
          </ul>
          {busy && <div className="wxBusy">Updating…</div>}
          {failed && !busy && <div className="wxBusy">Couldn't get that – try a city name.</div>}
        </section>
      </div>
    </div>
  );
}
