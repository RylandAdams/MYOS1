#!/usr/bin/env python3
"""Build public/about/index.html from the sync pitch page design.

Source: public/ryland/bodega-sync/index.html (the newest sync page).
Keeps the look (hero portrait, play-the-songs list, the night-car bio, a section
per song with preview player and lyrics) and drops everything that is only for
licensing: Best for, Energy, ISRC, the file table, the sync pitch line.

Shared assets are copied to public/site/ because everything under /ryland/ is
served with X-Robots-Tag: noindex, which would keep the photos out of Google.

Run from the repo root:  python3 scripts/build-about-page.py
"""
import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/ryland/bodega-sync/index.html"
SRC_ASSETS = ROOT / "public/ryland/assets"
OUT = ROOT / "public/about/index.html"
SITE = ROOT / "public/site"

src = SRC.read_text()
lines = src.split("\n")


def block(start_pat, end_pat):
    """Lines from the first line matching start_pat up to (not incl.) end_pat."""
    s = next(i for i, l in enumerate(lines) if re.search(start_pat, l))
    e = next(i for i, l in enumerate(lines) if i > s and re.search(end_pat, l))
    return lines[s:e]


# ---- pieces lifted from the sync page -------------------------------------
tracks = block(r'<ol class="tracks tracks--catalog"', r'<div class="hero__photo')
# drop the closing </div> of hero__text that precedes hero__photo
while tracks and tracks[-1].strip() == "</div>":
    tracks.pop()
tracks = "\n".join(tracks).replace('aria-label="Songs for Bodega Sync"', 'aria-label="Songs by RYLAND"')

def song_slug(title):
    # same as slug() in build-lyrics-page.js
    t = html.unescape(re.sub(r"<[^>]+>", "", title)).lower().replace("'", "").replace("’", "")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


# The About page lists the songs to play but skips the per-song pitch sections.
# Each row's pitch tags become "RYLAND · <year>", and the title is no longer a
# link to a song section that isn't there.
songs_src = "\n".join(block(r'<section class="song" id="song-btga"', r'<section class="clear"'))
years = dict(re.findall(
    r'<section class="song" id="song-([^"]+)".*?<p class="song__meta">RYLAND · (\d{4})', songs_src, re.S))
tracks = re.sub(
    r'<a class="track__link" href="#song-([^"]+)">(.*?)</a>(\s*)<span class="track__frag">.*?</span>(?=\s*</div>)',
    lambda m: f'<a class="track__link" href="/lyrics/{song_slug(m.group(2))}/">{m.group(2)}</a>{m.group(3)}'
              f'<span class="track__frag">RYLAND · {years[m.group(1)]}</span>',
    tracks, flags=re.S)
assert "#song-" not in tracks and tracks.count("RYLAND · ") == len(years)

# Only the three songs the bio says to start with, in that order.
KEEP = ["btga", "denial", "looking-for-you"]
items = {re.search(r'data-play="([^"]+)"', li).group(1): li
         for li in re.findall(r'\s*<li class="track">.*?</li>', tracks, re.S)}
head_ol = tracks[:tracks.index("<li")].rstrip()
tracks = head_ol + "".join(items[k] for k in KEEP) + "\n        </ol>"

dock = "\n".join(block(r'<section class="dock"', r'<script type="application/json" id="data">'))

data = json.loads(re.search(r'<script type="application/json" id="data">(.*?)</script>', src, re.S).group(1))
data.pop("outlet", None)
by_id = {s["id"]: s for s in data["songs"]}
data["songs"] = [by_id[k] for k in KEEP]
data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

n = len(data["songs"])

body_parts = "\n".join([tracks, dock, data_json])
assert "Bodega" not in body_parts, "outlet name leaked into the About page"

# ---- page -----------------------------------------------------------------
TITLE = "About RYLAND | Portland singer, songwriter and producer"
DESC = ("RYLAND is a singer, songwriter and producer from Portland, Oregon. "
        "Start with be that girl again, Denial and looking for you.")
PHOTO = "https://myphone.digital/site/photos/sticker-wall-color.jpg"

ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://myphone.digital/about/#page",
    "url": "https://myphone.digital/about/",
    "name": "About RYLAND",
    "primaryImageOfPage": {"@type": "ImageObject", "url": PHOTO, "width": 1600, "height": 1600},
    "mainEntity": {
        "@type": "Person",
        "@id": "https://myphone.digital/#ryland",
        "name": "RYLAND",
        "url": "https://myphone.digital/",
        "image": PHOTO,
        "jobTitle": "Singer, songwriter and producer",
        "homeLocation": {"@type": "Place", "name": "Portland, Oregon, United States"},
    },
}

page = f"""<!doctype html>
<html lang="en" data-framing="artist">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(TITLE)}</title>
<meta name="description" content="{html.escape(DESC)}">
<link rel="canonical" href="https://myphone.digital/about/">
<meta name="theme-color" content="#0e0d0c">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="32x32" href="/fish-tab-32.png">
<link rel="apple-touch-icon" href="/fish-icon.png">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="RYLAND">
<meta property="og:title" content="About RYLAND">
<meta property="og:description" content="Singer, songwriter and producer from Portland, Oregon.">
<meta property="og:url" content="https://myphone.digital/about/">
<meta property="og:image" content="https://myphone.digital/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="RYLAND in front of a sticker-covered wall at night">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://myphone.digital/og-image.jpg">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fragment+Mono&amp;family=Schibsted+Grotesk:wght@400..900&amp;display=swap">
<link rel="stylesheet" href="/site/site.css">
<style>
  .hero .about__bio {{ margin-top: 1em; }}
  .hero .about__links {{ margin-top: 1.5em; }}
  .hero {{ min-height: 0; }}
  main section.start {{ min-height: 0; }}
  @media (max-width: 760px) {{ main section.start {{ padding-top: 8px; }} .start .about__photo {{ display: none; }} }}
  .hero .hero__photo {{ aspect-ratio: 1 / 1; align-self: start; max-height: none; height: auto; }}
  .hero .hero__photo img {{ object-position: 50% 50%; }}
  .start .tracks {{ min-height: 0; max-height: none; }}
  .start .hero__actions {{ margin: 16px 0; }}
</style>
<script src="/site/site.js" defer></script>
</head>
<body>
<header class="top">
  <div class="wrap top__row">
    <a class="skip" href="#songs">Skip to the songs</a>
    <a class="wordmark" href="/" translate="no" style="color:inherit;text-decoration:none">RYLAND</a>
    <div class="top__meta">
      <a class="btn btn--secondary top__btn" href="/">Open the phone</a>
    </div>
  </div>
</header>
<main id="main">
  <section class="hero" aria-labelledby="hero-h">
    <div class="wrap grid hero__grid">
      <div class="hero__text">
        <p class="eyebrow">Singer, songwriter, producer<span class="eyebrow__sep"> · </span><span class="eyebrow__date">Portland, Oregon</span></p>
        <h1 id="hero-h">About <span class="nw-wide">RYLAND</span></h1>
        <p class="lede">RYLAND is a singer, songwriter and producer from Portland, Oregon. His songs read like journal entries, and his home on the internet is an old iPhone you can open at <a class="link" href="/">myphone.digital</a>.</p>
        <p class="about__bio">Fully independent, his music moves between alt-pop, indie and electronic. Start with “be that girl again,” “Denial” and “looking for you.”</p>
        <p class="about__bio">He released the album <em>*Showing Friends</em> on his birthday, September 29, 2024: ten short songs, each titled with the date it was made. 2026 brought “everlasting,” “be that girl again” and “a couple nights ago.”</p>
        <ul class="about__links">
          <li><a class="link" href="https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ" rel="noopener">Spotify</a></li>
          <li><a class="link" href="https://music.apple.com/us/artist/ryland/1620591111" rel="noopener">Apple Music</a></li>
          <li><a class="link" href="https://soundcloud.com/rylandofficialmusic" rel="noopener">SoundCloud</a></li>
          <li><a class="link" href="https://www.youtube.com/@RYLANDOfficial" rel="noopener">YouTube</a></li>
          <li><a class="link" href="https://www.instagram.com/ryland.wav" rel="noopener">Instagram</a></li>
          <li><a class="link" href="https://www.tiktok.com/@ryland.wav" rel="noopener">TikTok</a></li>
        </ul>
      </div>
      <div class="hero__photo frame">
        <img src="/site/photos/sticker-wall-color.jpg" width="1600" height="1600" fetchpriority="high" decoding="async" alt="RYLAND in a black T-shirt and jeans in front of a wall covered in stickers at night">
      </div>
    </div>
  </section>
  <section class="about start" aria-labelledby="start-h">
    <div class="wrap grid about__grid">
      <div class="about__photo frame">
        <img src="/site/photos/night-car.jpg" width="1024" height="1024" alt="RYLAND in the passenger seat of a car at night, smiling down at his phone, in black and white" loading="lazy" decoding="async">
      </div>
      <div class="about__text">
        <h2 id="start-h">Start here</h2>
        <div class="hero__actions">
          <button class="btn btn--primary" type="button" data-play-all data-label="Play all three" data-label-pause="Pause"><svg class="ico" data-icon="play" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.5 2.9v10.2c0 .6.6.9 1.1.6l8-5.1a.7.7 0 0 0 0-1.2l-8-5.1c-.5-.3-1.1 0-1.1.6z"/></svg><svg class="ico" data-icon="pause" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect fill="currentColor" x="3.5" y="2.5" width="3" height="11" rx="1"/><rect fill="currentColor" x="9.5" y="2.5" width="3" height="11" rx="1"/></svg><span data-play-all-label>Play all three</span></button>
          <a class="link hero__mail" href="/lyrics/">Songs and lyrics</a>
        </div>
{tracks}
      </div>
    </div>
  </section>
</main>
<footer class="foot">
  <div class="wrap foot__row">
    <p class="wordmark wordmark--xl" translate="no" aria-hidden="true">RYLAND</p>
    <p class="foot__line">RYLAND · Portland, Oregon · <a class="link" href="/">myphone.digital</a> · <a class="link" href="/lyrics/">Lyrics</a> · <a class="link" href="/press/">Press</a> · <a class="link" href="/contact/">Contact</a></p>
  </div>
</footer>
{dock}
<div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
<script type="application/json" id="data">{data_json}</script>
</body>
</html>
"""

page = page.replace("../assets/", "/site/")
OUT.write_text(page)

# ---- assets ----------------------------------------------------------------
# Only what this page uses: the shared CSS/JS, the three songs' covers and
# previews, and the colour sticker-wall photo (square, from the Mexico set).
from PIL import Image
# Adds files only: public/site/ is shared with the song pages (build-lyrics-page.js).
for sub in ("photos", "covers", "audio"):
    (SITE / sub).mkdir(parents=True, exist_ok=True)
for name in ("site.css", "site.js"):
    shutil.copy2(SRC_ASSETS / name, SITE / name)
for song in data["songs"]:
    for key in ("cover", "audio"):
        rel = song[key].replace("../assets/", "")
        shutil.copy2(SRC_ASSETS / rel, SITE / rel)
shutil.copy2(SRC_ASSETS / "photos/night-car.jpg", SITE / "photos/night-car.jpg")
Image.open(ROOT / "public/photos/mexico/036.jpg").save(
    SITE / "photos/sticker-wall-color.jpg", quality=86)
print(f"wrote {OUT.relative_to(ROOT)} ({len(page):,} bytes, {n} songs) and public/site/")
