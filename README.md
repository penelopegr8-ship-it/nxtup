# nxtup — Boston Underground Live Music Discovery
**Class Project Submission // Interactive Web Platform & Mobile Prototype**

> **Tagline:** Find Your Next Fave.  
> **Concept:** A subterranean discovery platform connecting Boston music lovers with secret DIY basement gigs, rooftop sessions, and independent local artists. Features 100% direct door/tip splits to bands, secret location clue unlocks, digital wristbands, and a "10th Show Free" scene loyalty card.

---

## ⚡ Quick Start / How to Run for Grading

This project is **100% self-contained and offline-ready**. It contains **zero external CDN dependencies, zero Google Fonts tracking, and zero external server calls**.

### Option A: Direct Open (Easiest — No Server Required)
Simply **double-click** or open `index.html` in any modern web browser (Safari, Chrome, Firefox, Edge).
- Path: `index.html`
- All styles, images, synthesizer audio, and scripts will load immediately from local files.

### Option B: Local HTTP Server (For Wi-Fi & Device Testing)
To test across phones, tablets, or other computers on the same Wi-Fi network:
1. Open Terminal in this folder.
2. Run:
   ```bash
   perl server.pl 3000
   ```
3. Open `http://localhost:3000` on your laptop, or open the displayed local IP address (e.g. `http://<your-ip>:3000`) on any smartphone or tablet on the same Wi-Fi network.

---

## 🎸 Core Features & Interactivity

1. **Brand Identity & Zine Aesthetics**:
   - Official circular stamp logo (`nxtup-logo.png`) featured prominently in the navbar, hero showcase, and mobile prototypes.
   - Risograph grain textures, tactile gaffer tape strips, halftone patterns, and high-contrast underground color palette (Subterranean Ink, Electric Acid Lime, Sonic Violet, Signal Coral, Newsprint).

2. **Live Discovery Feed ("WHO'S NXT? TONIGHT")**:
   - Filter by neighborhood and genre: *All Shows, Allston Basements, Fenway Rooftops, Cambridge/Somerville, Indie & Post-Punk, Alt-R&B & Neo-Soul, Shoegaze & Noise*.
   - **Secret Location Clue Unlock**: Interactive clue button reveals exact street coordinates, door codes (e.g. `#8821`), and entrance instructions.
   - **RSVP Checkout Modal**: Reserves a door pass with instant confirmation receipt.

3. **Artist Spotlight & Native Web Audio Synthesizer**:
   - Features Allston DIY shoegaze band **Velvet Static**.
   - **Procedural Audio Engine**: Built directly on the HTML5 `AudioContext` API. When clicking "Play" or "Preview Boston Sound", it synthesizes authentic lo-fi post-punk drums (kick, snare, hi-hat) and fuzzy garage bass riffs locally without downloading external audio files.
   - **Live Waveform & Equalizer**: Real-time canvas frequency visualizer reacting to the synthesized audio.
   - **Open Bill Pitch Drawer**: Form for local musicians to apply for open 50/50 door split bill slots.

4. **Pass Wallet, Micro-Tipping & Loyalty Card**:
   - **Dynamic Wristband Status**: Switch between VIP Acid Lime, General Admission Sonic Violet, and Artist Crew Signal Coral with animated live pulse.
   - **Tactile Concert Ticket Stub**: Perforated tear notches, simulated barcode, and quick tipping button.
   - **Direct Micro-Tipping Modal**: Direct band tip jar ($1, $3, $5, $10) with celebratory audio chime.
   - **"10th Show Free" Loyalty Stamp Card**: 10-stamp interactive punch card with tactile ink-stamp animations and free ticket reward unlock.

5. **Host a Show / List Your Pop-Up**:
   - Organizers can submit a basement show or rooftop pop-up; newly submitted gigs immediately inject dynamically into the live feed with a "NEW DROP" badge.

6. **Shareable Deep Links**:
   - Direct links to specific shows: `?show=allston-01`, `?show=fenway-02`, etc.
   - Direct link to artist: `?artist=velvet-static`
   - Direct link to mobile showcase: `?view=showcase`
   - Header **Share** button with one-click clipboard copy and Web Share API.

7. **3-Phone Mobile App Showcase Mode**:
   - View the 3 iPhone 15 Pro hardware frames side-by-side (`nxtup_boston_live_music_discovery_mobile_app_ui_showcase.html` or via the "3-Phone App View" modal in `index.html`).

---

## 📁 File Structure

- `index.html` — Primary responsive web application.
- `styles.css` — Complete local design system and risograph stylesheet.
- `app.js` — Client-side application logic and Web Audio synthesizer engine.
- `nxtup-logo.png` — Official high-resolution circular stamp brand logo.
- `lucide.js` — Local offline SVG icon library.
- `tailwind-local.css` — Offline utility styles for the mobile showcase view.
- `nxtup_boston_live_music_discovery_mobile_app_ui_showcase.html` — Standalone 3-phone mobile app prototype.
- `server.pl` — Zero-dependency Perl static server.
