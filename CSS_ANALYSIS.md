# iOS 1 Emulation – CSS Layout Analysis

## Layout Hierarchy

```
.App (flex center)
  └── .Frame (361px × calc(var(--doc-height) - 20px))
        ├── PowerButton, HomeButton (position: absolute)
        ├── .wallpaper (empty div)
        ├── .iphoneContent (89% width ≈ 321px, 65% height, padding-top 2%)
        │     ├── TopBar (absolute, 100% width)
        │     └── AnimatedRoutes (LockScreen, HomeScreen, etc.)
        ├── .backLit (empty div)
        ├── .hand (image)
        └── .phone (iPhone frame image, 109% width, z-index 15)
```

**Effective screen area:** ~321px wide (89% of 361px) inside the Frame.

---

## Issues Found

### 1. **Conflicting padding/margin**
- **lockScreenPicture / homeScreenPicture:** `left: 1.75%` + `right: 0%` – these can conflict with `width: 100%`; `right: 0` can override `left` when both are set.
- **slideToUnlock #page-wrap:** `padding-left: 9.5%` (mobile: 9%) – different from other components; uses padding for positioning.
- **topBar lockIcon:** `padding-left: 48.75%` – using padding for positioning instead of `left`/`transform`.

### 2. **Inconsistent centering**
- **apps:** `left: 3.07%`, `max-width: 305px` – asymmetric left offset.
- **dock / footerApps:** `left: 50%`, `transform: translateX(-50%)`, `max-width: 310px` – centered.
- **footerApps:** `left: 50.5%` – slightly different from dock (50%).

### 3. **topBar bug**
- **cellularBars:** `left: 108.5%` – places the icon outside the container (likely typo; should be ~8.5% or next to carrier name).

### 4. **Invalid CSS**
- **app.css .Apps:hover:** `width: -20px !important; height: -20px !important` – negative dimensions are invalid.

### 5. **Mixed max-widths**
- 305px (apps)
- 310px (dock, footerApps, lockScreenPicture, homeScreenPicture)
- 330px (cameraRollPage)
- 400px (flappybird game)

### 6. **Repeated page patterns**
- lockScreenPage, settingsPage, messagesPage, weatherPage, ipod, photosPage, etc. all repeat:
  - `height: 105%`, `max-height: 490px`, `margin-top: -3%`
  - Same background gradient

---

## Logic / JS Overview

- **App.js:** Router wrapper, Frame, TopBar, AnimatedRoutes; power/home buttons; `--doc-height`/`--doc-width` CSS vars.
- **animatedRoutes.js:** Routes with AnimatePresence; `*` catches all and renders HomeScreen (route order matters).
- **PowerButton:** Toggles `/` (lock) ↔ `/off` (off screen).
- **HomeButton:** Links to `/homeScreen`.
- **TopBar:** Switches between lock vs home styles based on `location.pathname`.
- **LockScreen:** Clock, date, slide-to-unlock; notification (commented out).
- **HomeScreen:** Background image, apps grid, footer apps, dock image.
- **Apps:** Links to external URLs or internal routes.
