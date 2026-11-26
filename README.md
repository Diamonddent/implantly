# Implantly — Case Compass (rebuilt)

Rebuilt from the saved pages of the original deployment
(finalversionofimplant1-xmlc-gdpedzer1.vercel.app). The UI, logic and catalog data
are recovered from the original production bundles, so it looks and behaves the same.

## What the app does
1. **Case Builder** (`/`): click teeth on an FDI chart (11–48, multi-select). For each tooth set
   clinical status, implant diameter/length and phase (Surgical, Prosthetic crown/abutment,
   Multi-unit full arch).
2. **Recommend**: the engine (`lib/recommend.js`) snaps the requested size to real catalog
   platforms across Astra Tech, Nobel Biocare, Straumann, MegaGen and ROOTT, scores each
   system by fit offset (100% = exact) and shows the top 3 with cover screw + healing abutment.
3. **Case Kit**: builds the parts list per tooth (implant, cover screw, healing abutment,
   or prosthetic / multi-unit components), with prices and an Edit button to swap any part.
4. **Cart**: "Order parts" or "Send to lab". The order is saved on the device (`lib/store.js`)
   and an order ID like `MD-XXXXXX` is returned. The cart is also kept in localStorage
   (`implantly_cart`), and the navbar cart icon shows the count.
5. **Marketplace** (`/marketplace`): browse/replace components by brand, system, platform,
   workflow (digital/conventional) and technique (open/closed tray).
6. **Tracking** (`/tracking`): enter an order ID to see status, timeline and ETA.
7. **Dashboard** (`/dashboard`): brand analytics. The original uses random demo
   numbers here, and so does this copy (they change on every load).

## Structure
```
app/page.jsx              Case Builder (tooth chart, steps, kit, cart)
app/marketplace/page.jsx  Marketplace / part replacement
app/tracking/page.jsx     Order tracking
app/dashboard/page.jsx    Brand analytics
app/manifest.js           Installable-app manifest (name, icons, colors)
public/sw.js              Service worker (offline support)
public/icons/             App icons (iPhone, Android, desktop)
components/Navbar.jsx     Top navigation + cart counter
lib/recommend.js          Recommendation + kit generation engine
lib/surgical-catalog.js   Catalog lookup helpers
lib/store.js              On-device store for cases and orders (see note)
data/*.json               Real catalog data (implants, multi-unit, prosthetic workflows)
app/globals.css           Original compiled Tailwind CSS (kept as-is for an identical look)
```

## Note on the backend
The server code was not inside the saved pages, so `lib/store.js` is a rebuilt replacement
with the same data shapes the UI expects, kept on each device. Order status advances by age:
pending → processing (1h) → shipped (24h, gets a tracking number) → delivered (72h).

## Note on the source
Variable names inside the big page files are still short (e, t, l…) because they come
from the minified build; the code, text and classes are otherwise identical to the original.


## Installable app (all devices) and live link

The app is a static, installable web app (PWA) hosted on GitHub Pages:
**https://diamonddent.github.io/implantly/**

- iPhone / iPad: open the link in Safari, tap Share, then "Add to Home Screen".
- Android: open in Chrome, tap the menu, then "Install app".
- Windows / Mac / Linux: open in Chrome or Edge and click the install icon in the address bar.

It opens full screen with its own icon and keeps working offline after the first visit.

Every push to `main` rebuilds and redeploys it (`.github/workflows/deploy.yml` builds with
`BASE_PATH=/implantly` and publishes `out/` to the `gh-pages` branch).

Cases and orders are saved on each device (`lib/store.js`, localStorage), because GitHub Pages
cannot run server code. The old `/api/*` routes were removed. To share orders between devices,
replace the functions in `lib/store.js` with calls to a database such as Supabase.

Local development: `npm install && npm run dev`. Static build: `BASE_PATH=/implantly npm run build`.
