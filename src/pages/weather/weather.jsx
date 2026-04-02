import React from "react";
import "./weather.css";
import AppHeaderBar from "../../components/AppHeaderBar/AppHeaderBar";

const CACHE_KEY = "weather:current:v4";
const CACHE_TTL_MS = 15 * 60 * 1000;

const CODES = {
  0:["☀️","Clear sky"],1:["🌤️","Mainly clear"],2:["⛅","Partly cloudy"],3:["☁️","Overcast"],
  45:["🌫️","Fog"],48:["🌫️","Depositing rime fog"],
  51:["🌦️","Light drizzle"],53:["🌦️","Drizzle"],55:["🌧️","Dense drizzle"],
  61:["🌦️","Slight rain"],63:["🌧️","Rain"],65:["🌧️","Heavy rain"],
  66:["🌧️","Freezing rain"],67:["🌧️","Freezing rain"],
  71:["🌨️","Snow"],73:["🌨️","Snow"],75:["❄️","Heavy snow"],77:["🌨️","Snow grains"],
  80:["🌦️","Rain showers"],81:["🌧️","Rain showers"],82:["⛈️","Violent showers"],
  85:["🌨️","Snow showers"],86:["🌨️","Snow showers"],
  95:["⛈️","Thunderstorm"],96:["⛈️","Thunder w/ hail"],99:["⛈️","Thunder w/ hail"]
};
const codeToIcon = (c) => {
  const [icon, label] = CODES[c] || ["❓", "Unknown"];
  return { icon, label };
};

function getBackgroundClass(code, isDay) {
  const partlyCloudy = code === 2;
  const overcast = code === 3;
  const fog = [45, 48].includes(code);
  const rain = [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  const snow = [71, 73, 75, 77, 85, 86].includes(code);
  const storm = [95, 96, 99].includes(code);
  const night = !isDay;
  if (storm) return "weatherBg-storm";
  if (snow) return night ? "weatherBg-snowNight" : "weatherBg-snow";
  if (rain) return night ? "weatherBg-rainNight" : "weatherBg-rain";
  if (fog) return "weatherBg-fog";
  if (overcast) return night ? "weatherBg-overcastNight" : "weatherBg-overcast";
  if (partlyCloudy) return night ? "weatherBg-partlyNight" : "weatherBg-partly";
  return night ? "weatherBg-clearNight" : "weatherBg-clear";
}

function formatTime(iso) {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
}

function useLocalStorage(key, initial) {
  const [v, setV] = React.useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  React.useEffect(() => {
    if (v !== undefined) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV];
}

function getPosition(timeoutMs = 7000) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve({ ok: false, reason: "nogeo" });
    const t = setTimeout(() => resolve({ ok: false, reason: "timeout" }), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(t); resolve({ ok: true, lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      () => { clearTimeout(t); resolve({ ok: false, reason: "denied" }); },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

async function getLocationByIP() {
  try {
    const res = await fetch("https://geo.kamero.ai/api/geo");
    if (!res.ok) return null;
    const json = await res.json();
    const lat = parseFloat(json.latitude);
    const lon = parseFloat(json.longitude);
    const city = json.city;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, label: city || `${lat.toFixed(1)}, ${lon.toFixed(1)}` };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("current", "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,precipitation_probability");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset");
  url.searchParams.set("forecast_days", "16");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("weather fetch failed");
  return res.json();
}

async function reverseGeocode(lat, lon) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en", "User-Agent": "MYOS1-Weather/1.0" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const addr = json?.address;
    return addr?.city || addr?.town || addr?.village || addr?.municipality || addr?.county || null;
  } catch {
    return null;
  }
}

async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query.trim());
    url.searchParams.set("count", 8);
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).map((r) => ({
      name: r.name,
      admin1: r.admin1 || "",
      country: r.country || "",
      lat: r.latitude,
      lon: r.longitude,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}

export default function Weather() {
  const [cache, setCache] = useLocalStorage(CACHE_KEY, null);
  const [data, setData] = React.useState(cache?.data || null);
  const [place, setPlace] = React.useState(cache?.place || null);
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState(null);
  const [searchMode, setSearchMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);

  const loadWeather = React.useCallback(async (lat, lon, label) => {
    const json = await fetchWeather(lat, lon);
    const payload = { data: json, place: { lat, lon, label }, when: Date.now() };
    setData(json); setPlace(payload.place); setCache(payload); setLoading(false); setSearchMode(false);
  }, [setCache]);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const now = Date.now();
        const hasValidCache = cache?.data && cache?.place && now - cache.when < CACHE_TTL_MS;
        if (hasValidCache) {
          setData(cache.data); setPlace(cache.place); setLoading(false); return;
        }
        let lat, lon, label;
        const pos = await getPosition();
        if (pos.ok) {
          lat = pos.lat;
          lon = pos.lon;
          const city = await reverseGeocode(lat, lon);
          label = city || "Your location";
        } else {
          const ipLoc = await getLocationByIP();
          if (!ipLoc) {
            setLoading(false);
            setSearchMode(true);
            setSearchQuery("");
            return;
          }
          lat = ipLoc.lat;
          lon = ipLoc.lon;
          label = ipLoc.label;
        }
        if (!alive) return;
        const json = await fetchWeather(lat, lon);
        if (!alive) return;
        const payload = { data: json, place: { lat, lon, label }, when: Date.now() };
        setData(json); setPlace(payload.place); setCache(payload); setLoading(false);
      } catch {
        if (!alive) return;
        setError("Could not load weather.");
        setLoading(false);
        setSearchMode(true);
      }
    }
    load();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setSearching(false);
  }, [searchQuery]);

  const handleSelectCity = React.useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    try {
      await loadWeather(loc.lat, loc.lon, loc.label);
    } catch {
      setError("Could not load weather.");
      setLoading(false);
    }
  }, [loadWeather]);

  if (loading && !searchMode) return (
    <div className="weatherPage weatherBg-loading">
      <AppHeaderBar title="Weather" />
      <div className="weatherContent">
        <div className="weatherCard">Loading weather…</div>
      </div>
    </div>
  );
  if (searchMode || (error && !data)) {
    return (
      <div className="weatherPage weatherBg-loading">
        <AppHeaderBar title="Weather" />
        <div className="weatherContent">
          <div className="weatherCard weatherSearchCard">
          <div className="weatherSearchTitle">Search for your city</div>
          <div className="weatherSearchRow">
            <input
              type="text"
              className="weatherSearchInput"
              placeholder="e.g. Portland, Eugene..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
            />
            <button type="button" className="weatherSearchBtn" onClick={handleSearch} disabled={searching || searchQuery.trim().length < 2}>
              {searching ? "…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <ul className="weatherSearchResults">
              {searchResults.map((loc) => (
                <li key={`${loc.lat}-${loc.lon}`}>
                  <button type="button" onClick={() => handleSelectCity(loc)}>{loc.label}</button>
                </li>
              ))}
            </ul>
          )}
          {!data && <div className="weatherSearchHint">{error || "Location access was denied or unavailable. Search above to get your weather."}</div>}
          {data && <button type="button" className="weatherSearchCancel" onClick={() => { setSearchMode(false); setError(null); }}>Cancel</button>}
          </div>
        </div>
      </div>
    );
  }

  const cur = data.current;
  const daily = data.daily;
  const curIcon = codeToIcon(cur.weather_code);
  const isDay = cur.is_day === 1;
  const weatherCode = cur.weather_code;
  const bgClass = getBackgroundClass(weatherCode, isDay);

  // Sunrise/sunset today (ISO strings)
  const sunrise = daily.sunrise?.[0] ? formatTime(daily.sunrise[0]) : null;
  const sunset = daily.sunset?.[0] ? formatTime(daily.sunset[0]) : null;

  // All upcoming days (up to 15, excluding today)
  const items = [];
  for (let i = 1; i < daily.time.length; i++) {
    const iso = daily.time[i];
    const day = new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
    const { icon, label } = codeToIcon(daily.weather_code[i]);
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    items.push({ key: iso, day, icon, label, max, min });
  }

  return (
    <div className={`weatherPage ${bgClass}`}>
      <AppHeaderBar title="Weather" />
      <div className="weatherContent">
        <div className="weatherCard weatherScaled">
        <div className="weatherHeader">
          <div className="place">
            <button type="button" className="placeBtn" onClick={() => { setSearchMode(true); setSearchQuery(""); setSearchResults([]); }} title="Change location">
              {place?.label || "Weather"}
            </button>
            <div className="sub">
              {new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
          <div className="current">
            <div className="temp">{Math.round(cur.temperature_2m)}°</div>
            <div className="cond">
              <span className="condMain">
                <span className="emoji">{curIcon.icon}</span>
                <span className="label">{curIcon.label}</span>
              </span>
              <span className="condDetails">
                {[
                  cur.apparent_temperature != null && Math.round(cur.apparent_temperature) !== Math.round(cur.temperature_2m) && `Feels ${Math.round(cur.apparent_temperature)}°`,
                  cur.precipitation_probability != null && cur.precipitation_probability > 0 && `${cur.precipitation_probability}% rain`,
                  `${Math.round(cur.wind_speed_10m)} mph`,
                ].filter(Boolean).join(" · ")}
              </span>
            </div>
          </div>
        </div>
        {(sunrise || sunset) && (
          <div className="sunTimes">
            {sunrise && <span>Sunrise {sunrise}</span>}
            {sunrise && sunset && " · "}
            {sunset && <span>Sunset {sunset}</span>}
          </div>
        )}

        <div className="forecastV">
          {items.map((it) => (
            <div className="weekItem" key={it.key} title={it.label}>
              <div className="w-day">{it.day}</div>
              <div className="w-icon">{it.icon}</div>
              <div className="w-temps">
                <span className="max">{it.max}°</span>
                <span className="min">{it.min}°</span>
              </div>
            </div>
          ))}
        </div>

        <div className="footer">
          Weather by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          {" · "}
          Location by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
        </div>
      </div>
      </div>
    </div>
  );
}
