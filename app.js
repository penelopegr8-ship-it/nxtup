/**
 * nxtup — Boston Underground Live Music Discovery
 * Complete Local Application Logic (100% Local / Zero External Server Dependencies)
 */

// =============================================================================
// 1. Web Audio API Engine — Real Local Synthesizer (No external audio files)
// =============================================================================
class LocalAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.analyser = null;
    this.dataArray = null;
    this.timerId = null;
    this.step = 0;
    this.bpm = 138;
    this.initContext();
  }

  initContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  ensureContext() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate punchy bass drum
  playKick(time) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // Generate crisp lo-fi snare
  playSnare(time) {
    if (this.isMuted || !this.ctx) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);

    // Snare tone body
    const osc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
    toneGain.gain.setValueAtTime(0.5, time);
    toneGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(toneGain);
    toneGain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Generate hi-hat
  playHiHat(time, isOpen = false) {
    if (this.isMuted || !this.ctx) return;
    const dur = isOpen ? 0.18 : 0.04;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.25 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(time);
    noise.stop(time + dur);
  }

  // Generate garage rock fuzzy bass riff note
  playBass(freq, time, dur = 0.22) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + dur);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + dur);
  }

  // Generate guitar power chord synth tone
  playGuitarStab(freqs, time) {
    if (this.isMuted || !this.ctx) return;
    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  // Lo-Fi Indie Rock Pattern Sequencer
  startLoop() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    const stepTimeMs = (60 / this.bpm / 4) * 1000; // 16th notes
    // Garage rock chord roots: A (110Hz), C (130.81Hz), D (146.83Hz), F (87.31Hz)
    const bassNotes = [
      110, 110, 0, 110,  130.81, 0, 110, 0,
      146.83, 146.83, 0, 130.81,  87.31, 87.31, 98.0, 110
    ];

    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const beat16 = this.step % 16;

      // Drums
      if (beat16 === 0 || beat16 === 8 || beat16 === 10) {
        this.playKick(now);
      }
      if (beat16 === 4 || beat16 === 12) {
        this.playSnare(now);
      }
      if (beat16 % 2 === 0) {
        this.playHiHat(now, beat16 === 14);
      }

      // Bassline
      const note = bassNotes[beat16];
      if (note > 0) {
        this.playBass(note, now, 0.18);
      }

      // Chords on beat 0 and 8
      if (beat16 === 0) {
        this.playGuitarStab([220, 277.18, 329.63], now); // A major
      } else if (beat16 === 8) {
        this.playGuitarStab([174.61, 220, 261.63], now); // F major
      }

      this.step++;
    }, stepTimeMs);

    updatePlaybackUI(true);
  }

  stopLoop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    updatePlaybackUI(false);
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopLoop();
      showToast('Live audio track paused');
    } else {
      this.startLoop();
      showToast('Playing Velvet Static: "Neon Basement (Live at O\'Brien\'s)" 🎸⚡');
    }
  }

  // Interactive Sound Effects
  playStampSound() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playUnlockSound() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 660, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.3, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.13);
    });
  }

  playTipChime() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      if (this.isMuted) {
        btn.classList.remove('sound-on');
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
        showToast('Sound Muted');
      } else {
        btn.classList.add('sound-on');
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
        showToast('Sound FX & Synth Enabled');
      }
    }
  }
}

const audio = new LocalAudioEngine();

// =============================================================================
// 2. Data Store & State
// =============================================================================
const initialEvents = [
  {
    id: 'allston-01',
    category: 'allston punk',
    title: 'MYSTERY LINEUP #04',
    artist: 'Velvet Static + Special Guests',
    neighborhood: 'ALLSTON BASEMENT // SECRET SET',
    time: 'TONIGHT 9:30 PM',
    genre: 'INDIE / POST-PUNK',
    price: '$7 ADV',
    priceNum: 7,
    spotsLeft: 14,
    tapeType: 'dark',
    clueLabel: 'SECRET LOCATION • CLUE 1/2',
    clueText: '3 mins from Harvard Ave T-Stop — behind the vintage laundromat.',
    unlockedText: '142 Harvard Ave (Basement Door B) • Code: #8821',
    isUnlocked: false,
    coords: { x: 0.38, y: 0.52, name: 'Allston Basements' }
  },
  {
    id: 'fenway-02',
    category: 'fenway rnb',
    title: 'GOLDEN HOUR SESSIONS',
    artist: 'Kai & The Tides + Neo-Soul Trio',
    neighborhood: 'FENWAY ROOFTOP // UNPLUGGED',
    time: 'SAT 6:30 PM',
    genre: 'ALT-R&B / NEO-SOUL',
    price: '$8 ADV',
    priceNum: 8,
    spotsLeft: 8,
    tapeType: 'acid',
    clueLabel: 'SECRET LOCATION • CLUE 1/2',
    clueText: 'Red brick walk-up near Lansdowne street overlooking park...',
    unlockedText: '84 Peterborough St Roof Deck • Buzz #04',
    isUnlocked: false,
    coords: { x: 0.52, y: 0.62, name: 'Fenway Rooftop' }
  },
  {
    id: 'central-03',
    category: 'cambridge punk',
    title: 'DARKWAVE PRESSING PARTY',
    artist: 'Sub Rosa + Neon Alley',
    neighborhood: 'CENTRAL SQ // DIY PRINTSHOP',
    time: 'FRI 10:00 PM',
    genre: 'SYNTH / DARKWAVE',
    price: '$6 ADV',
    priceNum: 6,
    spotsLeft: 22,
    tapeType: 'dark',
    clueLabel: 'SECRET LOCATION • CLUE 1/2',
    clueText: 'Alleyway behind Mass Ave vintage thrift shop near graffiti wall...',
    unlockedText: '482 Mass Ave (Alley Door C) • Knock 3x',
    isUnlocked: false,
    coords: { x: 0.48, y: 0.36, name: 'Central Square DIY' }
  },
  {
    id: 'somerville-04',
    category: 'somerville shoegaze',
    title: 'BOW MARKET BASEMENT JAM',
    artist: 'The Silk Cuts + Local Opener',
    neighborhood: 'SOMERVILLE // UNDERGROUND LOFT',
    time: 'SUN 4:00 PM',
    genre: 'GARAGE SHOEGAZE',
    price: '$5 ADV',
    priceNum: 5,
    spotsLeft: 19,
    tapeType: 'acid',
    clueLabel: 'SECRET LOCATION • CLUE 1/2',
    clueText: 'Corner wooden house near Bow Market courtyard garden gate...',
    unlockedText: '19 Somerville Ave Garden Gate • Direct Walk-in',
    isUnlocked: false,
    coords: { x: 0.44, y: 0.22, name: 'Somerville Loft' }
  }
];

let eventsState = [...initialEvents];
let currentFilter = 'all';

// Wristband Tiers
const wristbands = [
  {
    class: 'wristband-acid',
    title: 'VIP / EARLY ENTRY — ACID LIME WRISTBAND',
    sub: 'Verified at Door • Soundcheck + Basement Access'
  },
  {
    class: 'wristband-violet',
    title: 'GENERAL ADMISSION — SONIC VIOLET PASS',
    sub: 'Verified at Door • Allston Basement Main Floor'
  },
  {
    class: 'wristband-coral',
    title: 'GUESTLIST / ARTIST CREW — SIGNAL CORAL',
    sub: 'All-Access Backstage + Green Room Wristband'
  }
];
let wristbandIndex = 0;

// Loyalty Stamps
let currentStamps = 7;
let selectedTip = 3;
let isFollowing = false;
let collabOpen = false;

// =============================================================================
// 3. UI Helpers & Global Toast
// =============================================================================
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('globalToast');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.add('active');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}

// =============================================================================
// 4. Render Discovery Feed Cards
// =============================================================================
function renderDiscoveryFeed() {
  const container = document.getElementById('discoveryFeedGrid');
  if (!container) return;

  const filtered = eventsState.filter(ev => {
    if (currentFilter === 'all') return true;
    return ev.category.includes(currentFilter);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; background: var(--ink-card); border-radius: 1.5rem; border: 1px dashed var(--border-medium);">
        <p class="font-druk" style="color: var(--acid); font-size: 1.1rem;">NO SECRET SHOWS IN THIS CATEGORY RIGHT NOW</p>
        <p style="color: rgba(242, 239, 233, 0.7); margin-top: 0.5rem; font-size: 0.85rem;">Be the first to list a pop-up basement gig or switch categories.</p>
        <button class="btn btn-acid" style="margin-top: 1rem;" onclick="setFilter('all')">View All Shows</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(ev => {
    const isDark = ev.tapeType === 'acid';
    const unlockedClass = ev.isUnlocked ? 'unlocked' : '';
    const currentLabel = ev.isUnlocked ? 'COORDINATES UNLOCKED // BOSTON' : ev.clueLabel;
    const currentText = ev.isUnlocked ? ev.unlockedText : ev.clueText;
    const btnText = ev.isUnlocked ? 'Coordinates Active ✓' : 'Unlock Coordinates';
    const btnClass = ev.isUnlocked ? 'btn-violet' : 'btn-acid';

    return `
      <article class="event-card ${isDark ? 'card-dark' : ''}" data-id="${ev.id}">
        <!-- Tape strips -->
        <div class="gaffer-tape-dark" style="position: absolute; top: -8px; left: 24px; width: 68px; height: 16px; transform: rotate(-3deg); z-index: 10;"></div>
        <div class="acid-tape" style="position: absolute; top: -6px; right: 28px; width: 50px; height: 14px; transform: rotate(5deg); z-index: 10;"></div>

        <!-- Risograph Vector Poster Graphic -->
        <div class="event-card-art">
          <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="240" fill="#13131A"/>
            <!-- Halftone gradient effect -->
            <circle cx="200" cy="120" r="140" fill="#7000FF" fill-opacity="0.25"/>
            <circle cx="280" cy="80" r="90" fill="#CCFF00" fill-opacity="0.18"/>
            <path d="M-20 260L160 40L240 180L420 10" stroke="#CCFF00" stroke-width="4" stroke-opacity="0.3"/>
            <path d="M50 260L210 90L290 220L440 60" stroke="#FF3B30" stroke-width="3" stroke-opacity="0.35"/>
            <!-- Stylized band silhouettes & amp blocks -->
            <rect x="60" y="110" width="45" height="70" fill="#0D0D11" stroke="#F2EFE9" stroke-width="1.5"/>
            <circle cx="82" cy="130" r="12" fill="#242432"/>
            <circle cx="82" cy="160" r="12" fill="#242432"/>
            <!-- Guitarist silhouette -->
            <path d="M150 180L165 110L185 105L195 180Z" fill="#CCFF00" fill-opacity="0.85"/>
            <circle cx="178" cy="95" r="9" fill="#F2EFE9"/>
            <path d="M140 135L220 150L205 160L135 142Z" fill="#FF3B30"/>
            <!-- Bass / Drummer silhouette -->
            <rect x="240" y="130" width="60" height="50" rx="6" fill="#1E1E28" stroke="#CCFF00" stroke-width="1.5"/>
            <circle cx="270" cy="155" r="18" fill="#0D0D11" stroke="#FF3B30" stroke-width="2"/>
            <circle cx="270" cy="105" r="10" fill="#F2EFE9"/>
          </svg>
          <div class="event-art-overlay"></div>

          <div class="art-tag-top">
            <span class="badge badge-coral">● ${ev.time}</span>
            <span class="badge badge-violet">${ev.genre}</span>
          </div>

          <div class="art-price-tag">${ev.price}</div>

          <div class="art-info-bottom">
            <p class="art-venue-kicker">${ev.neighborhood}</p>
            <h3 class="art-event-title">${ev.title}</h3>
            <p style="font-size: 0.75rem; color: rgba(242, 239, 233, 0.85); font-weight: 600; margin-top: 2px;">
              ${ev.artist}
            </p>
          </div>
        </div>

        <!-- Clue / Coordinates Reveal Box -->
        <div class="clue-box ${unlockedClass}" id="clueBox-${ev.id}">
          <div class="clue-header">
            <div class="clue-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <span class="clue-tag" id="clueLabel-${ev.id}">${currentLabel}</span>
              <p class="clue-body-text" id="clueText-${ev.id}">${currentText}</p>
            </div>
          </div>

          <div class="clue-action-row">
            <button class="btn ${btnClass}" style="flex: 1; padding: 0.45rem 0.75rem; font-size: 0.72rem;" onclick="toggleClue('${ev.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span id="clueBtnText-${ev.id}">${btnText}</span>
            </button>

            <button class="btn btn-newsprint" style="padding: 0.45rem 0.85rem; font-size: 0.72rem;" onclick="openRsvpModal('${ev.id}')">
              RSVP ${ev.price}
            </button>

            <button class="btn btn-outline" style="padding: 0.45rem 0.65rem;" title="Share this secret show link" onclick="shareEvent('${ev.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function setFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.getAttribute('data-cat') === cat) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderDiscoveryFeed();
}

function toggleClue(id) {
  const ev = eventsState.find(e => e.id === id);
  if (!ev) return;
  ev.isUnlocked = !ev.isUnlocked;

  audio.playUnlockSound();

  const clueBox = document.getElementById(`clueBox-${id}`);
  const labelEl = document.getElementById(`clueLabel-${id}`);
  const textEl = document.getElementById(`clueText-${id}`);
  const btnText = document.getElementById(`clueBtnText-${id}`);

  if (ev.isUnlocked) {
    if (clueBox) clueBox.classList.add('unlocked');
    if (labelEl) labelEl.textContent = 'COORDINATES UNLOCKED // BOSTON';
    if (textEl) textEl.textContent = ev.unlockedText;
    if (btnText) btnText.textContent = 'Coordinates Active ✓';
    showToast(`Unlocked: ${ev.unlockedText}`);
  } else {
    if (clueBox) clueBox.classList.remove('unlocked');
    if (labelEl) labelEl.textContent = ev.clueLabel;
    if (textEl) textEl.textContent = ev.clueText;
    if (btnText) btnText.textContent = 'Unlock Coordinates';
    showToast('Secret coordinates locked');
  }
}

// =============================================================================
// 5. Waveform Visualizer Canvas
// =============================================================================
class WaveformVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.animId = null;
    this.start();
  }

  start() {
    const draw = () => {
      this.drawWave();
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }

  drawWave() {
    if (!this.canvas) return;
    const w = this.canvas.width = this.canvas.offsetWidth;
    const h = this.canvas.height = this.canvas.offsetHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (audio.isPlaying && audio.analyser) {
      audio.analyser.getByteFrequencyData(audio.dataArray);
      const barCount = audio.dataArray.length;
      const barWidth = (w / barCount) * 1.5;

      for (let i = 0; i < barCount; i++) {
        const val = audio.dataArray[i];
        const barHeight = (val / 255) * h * 0.9;
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        ctx.fillStyle = i % 2 === 0 ? '#CCFF00' : '#7000FF';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      // Idle stylized wave bars
      const barCount = 32;
      const barWidth = w / barCount - 2;
      for (let i = 0; i < barCount; i++) {
        const barHeight = 4 + Math.sin(i * 0.4) * 3;
        ctx.fillStyle = 'rgba(242, 239, 233, 0.15)';
        ctx.fillRect(i * (barWidth + 2), h - barHeight - 4, barWidth, barHeight);
      }
    }
  }
}

let waveformInstance = null;

function updatePlaybackUI(isPlaying) {
  const centerBtn = document.getElementById('playerCenterBtn');
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const eqBars = document.querySelectorAll('.eq-bar');
  const timerEl = document.getElementById('playerTimer');
  const progEl = document.getElementById('waveformProgress');

  if (centerBtn) {
    centerBtn.innerHTML = isPlaying
      ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  }

  if (heroPlayBtn) {
    heroPlayBtn.innerHTML = isPlaying
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>Pause Sound</span>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Preview Boston Sound</span>`;
  }

  eqBars.forEach(bar => {
    if (isPlaying) {
      bar.style.animationPlayState = 'running';
    } else {
      bar.style.animationPlayState = 'paused';
    }
  });

  if (progEl) {
    progEl.style.width = isPlaying ? '72%' : '0%';
  }
}

// Track changer
const trackList = [
  { title: 'Neon Basement (Live at O\'Brien\'s)', artist: 'Velvet Static', bpm: 138 },
  { title: 'Brighton Fog (Shoegaze Demo)', artist: 'Velvet Static', bpm: 120 },
  { title: 'Allston Sunrise (Unplugged)', artist: 'Kai & The Tides', bpm: 105 }
];
let trackIndex = 0;
function nextTrack() {
  trackIndex = (trackIndex + 1) % trackList.length;
  const trk = trackList[trackIndex];
  audio.bpm = trk.bpm;
  const titleEl = document.getElementById('spotlightTrackTitle');
  if (titleEl) titleEl.textContent = trk.title;
  showToast(`Switched track: ${trk.title}`);
}

// =============================================================================
// 7. Pass Wallet, Wristband Tiers & Micro-Tipping Modal
// =============================================================================
function cycleWristband() {
  wristbandIndex = (wristbandIndex + 1) % wristbands.length;
  const wb = wristbands[wristbandIndex];
  const banner = document.getElementById('wristbandBanner');
  const titleEl = document.getElementById('wristbandTitle');
  const subEl = document.getElementById('wristbandSub');

  if (banner) {
    banner.className = `wristband-banner ${wb.class}`;
  }
  if (titleEl) titleEl.textContent = wb.title;
  if (subEl) subEl.textContent = wb.sub;

  audio.playStampSound();
  showToast(`Pass Tier: ${wb.title.split('—')[0].trim()}`);
}

function openTipModal() {
  const modal = document.getElementById('tipModal');
  if (modal) modal.classList.add('active');
}

function closeTipModal() {
  const modal = document.getElementById('tipModal');
  if (modal) modal.classList.remove('active');
}

function selectTip(amount, btnEl) {
  selectedTip = amount;
  document.querySelectorAll('.tip-preset-btn').forEach(b => {
    b.classList.remove('active');
  });
  if (btnEl) btnEl.classList.add('active');
  const cta = document.getElementById('sendTipCtaText');
  if (cta) cta.textContent = `Send $${amount}.00 Instant Tip`;
}

function submitTip() {
  closeTipModal();
  audio.playTipChime();
  showToast(`Sent $${selectedTip}.00 directly to Velvet Static! 100% delivered to band 🎸⚡`);
}

// =============================================================================
// 8. 10th Show Free Loyalty Stamp Card
// =============================================================================
function renderStampGrid() {
  const grid = document.getElementById('stampGrid');
  const counter = document.getElementById('stampBadgeCounter');
  const helper = document.getElementById('stampHelperText');
  const stampBtn = document.getElementById('addStampBtn');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const isStamped = i <= currentStamps;
    const isTenth = i === 10;
    const slot = document.createElement('div');

    if (isStamped) {
      slot.className = `stamp-slot stamped ${isTenth ? 'tenth-stamped' : ''}`;
      slot.innerHTML = isTenth
        ? `<span class="font-druk" style="font-size: 8px;">FREE</span><span class="font-syne" style="font-weight: 800; font-size: 11px;">PASS!</span>`
        : `<span class="font-druk" style="font-size: 7px;">NXT</span><span class="font-syne" style="font-weight: 800; font-size: 13px;">#${i}</span>`;
    } else {
      slot.className = `stamp-slot empty ${isTenth ? 'tenth' : ''}`;
      slot.innerHTML = isTenth
        ? `<span class="font-druk" style="font-size: 7px;">10TH</span><span class="font-druk" style="font-size: 8px;">FREE</span>`
        : `<span>${i}</span>`;
    }
    grid.appendChild(slot);
  }

  if (counter) counter.textContent = `${currentStamps} / 10 STAMPED`;
  if (helper) {
    if (currentStamps >= 10) {
      helper.textContent = '🎉 10/10 Complete! You have 1 Free Basement/Rooftop Ticket unlocked!';
      if (stampBtn) stampBtn.textContent = 'Reset Stamp Card';
    } else {
      const remaining = 10 - currentStamps;
      helper.textContent = `${remaining} more check-in${remaining === 1 ? '' : 's'} until your next free underground show ticket!`;
      if (stampBtn) stampBtn.textContent = '+ Check-In Stamp';
    }
  }
}

function addLoyaltyStamp() {
  if (currentStamps >= 10) {
    currentStamps = 7;
    showToast('Loyalty card reset to 7/10');
  } else {
    currentStamps++;
    audio.playStampSound();
    if (currentStamps === 10) {
      audio.playTipChime();
      showToast('🔥 10/10 STAMPED! Your next Boston pop-up ticket is 100% FREE!');
    } else {
      showToast(`Show check-in stamped! (${currentStamps}/10 toward free entry)`);
    }
  }
  renderStampGrid();
}

// =============================================================================
// 9. RSVP & Ticket Modal
// =============================================================================
let activeRsvpEvent = null;
function openRsvpModal(eventId) {
  const ev = eventsState.find(e => e.id === eventId);
  if (!ev) return;
  activeRsvpEvent = ev;

  const modal = document.getElementById('rsvpModal');
  const titleEl = document.getElementById('rsvpShowTitle');
  const detailsEl = document.getElementById('rsvpShowDetails');
  const priceEl = document.getElementById('rsvpPrice');

  if (titleEl) titleEl.textContent = ev.title;
  if (detailsEl) detailsEl.textContent = `${ev.neighborhood} • ${ev.time}`;
  if (priceEl) priceEl.textContent = ev.price;

  if (modal) modal.classList.add('active');
}

function closeRsvpModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) modal.classList.remove('active');
}

function confirmRsvp() {
  closeRsvpModal();
  audio.playTipChime();
  showToast(`RSVP Confirmed for ${activeRsvpEvent.title}! Your door wristband is ready.`);
}

// =============================================================================
// 10. Follow Artist & Collab Mode
// =============================================================================
function toggleFollow() {
  isFollowing = !isFollowing;
  const btn = document.getElementById('artistFollowBtn');
  if (btn) {
    if (isFollowing) {
      btn.className = 'btn btn-acid';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span>Following ✓</span>`;
      showToast('Following Velvet Static! You will receive secret drop notifications.');
    } else {
      btn.className = 'btn btn-outline';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> <span>Follow Artist</span>`;
      showToast('Unfollowed Velvet Static');
    }
  }
}

function toggleCollab() {
  collabOpen = !collabOpen;
  const drawer = document.getElementById('collabDrawer');
  const toggleBtn = document.getElementById('collabToggleBtn');
  if (drawer) {
    drawer.style.display = collabOpen ? 'block' : 'none';
  }
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-checked', collabOpen);
    toggleBtn.style.backgroundColor = collabOpen ? 'var(--acid)' : 'var(--ink-elevated)';
    toggleBtn.style.borderColor = collabOpen ? 'var(--acid)' : 'var(--border-medium)';
    const knob = toggleBtn.querySelector('span');
    if (knob) {
      knob.style.transform = collabOpen ? 'translateX(20px)' : 'translateX(0)';
      knob.style.backgroundColor = collabOpen ? 'var(--ink)' : 'var(--newsprint)';
    }
  }
  if (collabOpen) showToast('Collaboration & Open Bill mode enabled');
}

function submitCollabPitch(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('collabDemoLink');
  if (input) input.value = '';
  audio.playStampSound();
  showToast('Bill pitch sent to Velvet Static! Band manager will review within 24h.');
}

// =============================================================================
// 11. Submit a Gig / Host a Secret Show
// =============================================================================
function handleGigSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('gigTitle').value;
  const artist = document.getElementById('gigArtist').value;
  const neighborhood = document.getElementById('gigNeighborhood').value;
  const genre = document.getElementById('gigGenre').value;
  const time = document.getElementById('gigTime').value;
  const price = document.getElementById('gigPrice').value;
  const clue = document.getElementById('gigClue').value;
  const address = document.getElementById('gigAddress').value;

  const newGig = {
    id: `gig-${Date.now()}`,
    category: 'allston punk',
    title: title.toUpperCase(),
    artist: artist,
    neighborhood: neighborhood.toUpperCase(),
    time: time.toUpperCase(),
    genre: genre.toUpperCase(),
    price: price,
    priceNum: parseInt(price.replace(/[^0-9]/g, '')) || 7,
    spotsLeft: 30,
    tapeType: 'acid',
    clueLabel: 'SECRET LOCATION • CLUE 1/2',
    clueText: clue,
    unlockedText: address,
    isUnlocked: false,
    coords: { x: 0.42 + Math.random() * 0.1, y: 0.4 + Math.random() * 0.2, name: neighborhood }
  };

  eventsState.unshift(newGig);
  renderDiscoveryFeed();

  // Reset form
  e.target.reset();
  audio.playTipChime();
  showToast(`⚡ Show Drop Created! "${title}" is now LIVE on the Boston feed.`);

  // Scroll to Discovery Feed
  const feed = document.getElementById('feed');
  if (feed) feed.scrollIntoView({ behavior: 'smooth' });
}

// =============================================================================
// 12. Share Modal, Deep-Linking & Clipboard Sharing
// =============================================================================
let currentShareUrl = window.location.href;

function getBaseShareUrl() {
  if (window.location.protocol === 'file:') {
    return 'http://192.168.7.46:3000';
  }
  return window.location.origin + window.location.pathname;
}

function openShareModal(customUrl, title) {
  const modal = document.getElementById('shareModal');
  const input = document.getElementById('shareUrlInput');
  const titleEl = document.getElementById('shareModalTitle');
  const copyBtn = document.getElementById('copyShareBtn');

  const shareTarget = customUrl || getBaseShareUrl();
  currentShareUrl = shareTarget;

  if (input) input.value = shareTarget;
  if (titleEl) titleEl.textContent = title ? `SHARE: ${title.toUpperCase()}` : 'SHARE NXTUP';
  if (copyBtn) copyBtn.innerHTML = `<span>Copy Link</span>`;

  if (modal) modal.classList.add('active');
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('active');
}

function shareEvent(id) {
  const ev = eventsState.find(e => e.id === id);
  const title = ev ? ev.title : 'Secret Show';
  const url = `${getBaseShareUrl()}?show=${id}`;

  if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    navigator.share({
      title: `nxtup: ${title}`,
      text: `Check out ${title} at ${ev ? ev.neighborhood : 'Boston'} on nxtup!`,
      url: url
    }).catch(() => {
      openShareModal(url, title);
    });
  } else {
    openShareModal(url, title);
  }
}

function copyShareUrl() {
  const input = document.getElementById('shareUrlInput');
  const copyBtn = document.getElementById('copyShareBtn');
  const textToCopy = input ? input.value : currentShareUrl;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      onCopySuccess(copyBtn);
    }).catch(() => {
      fallbackCopy(textToCopy, copyBtn);
    });
  } else {
    fallbackCopy(textToCopy, copyBtn);
  }
}

function fallbackCopy(text, btn) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  onCopySuccess(btn);
}

function onCopySuccess(btn) {
  if (btn) btn.innerHTML = `<span>Copied! ✓</span>`;
  audio.playStampSound();
  showToast('Shareable link copied to clipboard!');
}

function triggerDeviceShare() {
  if (navigator.share) {
    navigator.share({
      title: 'nxtup — Boston Underground Live Music Discovery',
      text: 'Find secret basement shows and pop-ups in Boston on nxtup!',
      url: currentShareUrl
    }).catch(() => {
      showToast('Share cancelled');
    });
  } else {
    copyShareUrl();
  }
}

// Deep Linking Check
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const showId = params.get('show') || params.get('event');
  const view = params.get('view');
  const artist = params.get('artist');
  const rsvpId = params.get('rsvp');

  if (showId) {
    setTimeout(() => {
      const card = document.querySelector(`.event-card[data-id="${showId}"]`);
      if (card) {
        card.classList.add('highlight-card');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const ev = eventsState.find(e => e.id === showId);
        showToast(`Viewing shared show: ${ev ? ev.title : showId}`);
      }
    }, 400);
  }

  if (view === 'showcase') {
    setTimeout(() => toggleShowcaseModal(), 500);
  }

  if (artist) {
    setTimeout(() => {
      const spot = document.getElementById('spotlight');
      if (spot) spot.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  }

  if (rsvpId) {
    setTimeout(() => openRsvpModal(rsvpId), 600);
  }
}

// =============================================================================
// 13. 3-Phone Prototype Showcase Modal Switcher
// =============================================================================
function toggleShowcaseModal() {
  const modal = document.getElementById('showcaseModal');
  if (modal) {
    const isActive = modal.classList.toggle('active');
    if (isActive) {
      showToast('Opening 3-Phone Interactive Mobile App Showcase');
    }
  }
}

// =============================================================================
// 14. Initialization on DOM Load
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderDiscoveryFeed();
  renderStampGrid();
  handleDeepLink();

  waveformInstance = new WaveformVisualizer('waveformCanvas');

  // Filter click handlers
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.getAttribute('data-cat'));
    });
  });

  // Sound toggle
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => audio.toggleMute());
  }

  // Player center play button
  const playBtn = document.getElementById('playerCenterBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => audio.togglePlayback());
  }

  const heroPlayBtn = document.getElementById('heroPlayBtn');
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => audio.togglePlayback());
  }

  // Host form
  const gigForm = document.getElementById('hostGigForm');
  if (gigForm) {
    gigForm.addEventListener('submit', handleGigSubmit);
  }
});
