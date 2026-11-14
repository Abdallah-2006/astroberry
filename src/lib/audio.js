/**
 * Small audio director for the game shell.
 *
 * Three jobs:
 *  - synthesized UI feedback (clicks, menu open/close, radio chirps),
 *  - the landing sequence (rocket -> theme crossfade),
 *  - weather ambience (the dust-storm bed).
 *
 * Every sound is bundled through Vite, so `assets/sounds/*.mp3` is the single
 * source of truth. `theme.mp3` is optional: drop it into that folder and the
 * theme starts automatically; without it the game simply stays quiet there.
 */

const soundFiles = import.meta.glob("../assets/sounds/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

const urlFor = (file) => {
  const hit = Object.entries(soundFiles).find(([path]) => path.endsWith(`/${file}`));
  return hit ? hit[1] : null;
};

const TRACK_GAIN = {
  rocket: 0.28,
  theme: 0.07,
  storm: 0.2,
};

/** The user-supplied walkie sample; louder than the synth because its mean
 *  level is about 6 dB below the music bed. */
const TALKIE_VOLUME = 0.55;

const tracks = new Map();
const pending = new Set();

let ctx = null;
let unlockInstalled = false;
let warnedTheme = false;
let talkieEl = null;
let talkieBroken = false;
/* --------------------------------------------------------------- Web Audio */

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Browsers only allow audio after a gesture; call this from a click/keydown. */
export function unlockAudio() {
  ensureContext();
  for (const name of [...pending]) {
    const track = tracks.get(name);
    if (track) resume(track);
  }
}

function tone(freq, duration, { type = "sine", gain = 0.04, slide = 0, delay = 0 } = {}) {
  const audio = ctx;
  if (!audio || audio.state !== "running") return;
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + duration);
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function radioNoise(duration = 0.08, gain = 0.03) {
  const audio = ctx;
  if (!audio || audio.state !== "running") return;
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 2);
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const amp = audio.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1650;
  filter.Q.value = 1.1;
  amp.gain.value = gain;
  source.connect(filter);
  filter.connect(amp);
  amp.connect(audio.destination);
  source.start();
}

/* ------------------------------------------------------------------- UI SFX */

/** Short, quiet interface feedback. Kinds: click | select | open | close | alert. */
export function playUi(kind = "click") {
  ensureContext();
  if (!ctx || ctx.state !== "running") return;

  switch (kind) {
    case "select":
      tone(560, 0.055, { type: "triangle", gain: 0.06, slide: 140 });
      tone(940, 0.075, { type: "triangle", gain: 0.048, delay: 0.045 });
      break;
    case "open":
      tone(430, 0.07, { type: "triangle", gain: 0.055, slide: 90 });
      tone(650, 0.11, { type: "triangle", gain: 0.045, delay: 0.06 });
      break;
    case "close":
      tone(620, 0.06, { type: "triangle", gain: 0.05, slide: -120 });
      tone(360, 0.09, { type: "triangle", gain: 0.04, delay: 0.05 });
      break;
    case "alert":
      tone(880, 0.08, { type: "triangle", gain: 0.05 });
      tone(1180, 0.1, { type: "triangle", gain: 0.045, delay: 0.1 });
      break;
    case "click":
    default:
      tone(720, 0.05, { type: "triangle", gain: 0.055, slide: -200 });
      break;
  }
}

/**
 * The "talkie" burst for a new NPC / PIP voice-chat bubble. Prefers the real
 * `talkie.mp3` sample and falls back to the synthesized radio squelch if the
 * clip is missing, still loading or blocked by autoplay.
 */
export function playVoiceStart() {
  ensureContext();
  duckTheme();
  if (!playTalkieSample()) playVoiceFallback();
}

function getTalkie() {
  if (talkieEl || talkieBroken) return talkieEl;
  const url = urlFor("talkie.mp3");
  if (!url) {
    talkieBroken = true;
    return null;
  }
  talkieEl = new Audio(url);
  talkieEl.preload = "auto";
  talkieEl.addEventListener("error", () => {
    talkieBroken = true;
    talkieEl = null;
  });
  return talkieEl;
}

function playTalkieSample() {
  const el = getTalkie();
  if (!el) return false;
  try {
    el.pause();
    el.currentTime = 0;
    el.volume = TALKIE_VOLUME;
    const promise = el.play();
    if (promise && typeof promise.catch === "function") {
      // A quick "Next" restarts the clip and aborts the previous play()
      // promise — that is expected. Only a genuine autoplay block should fall
      // back to the synth chirp.
      promise.catch((error) => {
        if (error?.name === "NotAllowedError") playVoiceFallback();
      });
    }
    return true;
  } catch {
    return false;
  }
}

function playVoiceFallback() {
  if (!ctx || ctx.state !== "running") return;
  radioNoise(0.12, 0.05);
  tone(760, 0.05, { type: "square", gain: 0.042 });
  tone(1180, 0.05, { type: "square", gain: 0.036, delay: 0.06 });
  tone(1520, 0.04, { type: "square", gain: 0.03, delay: 0.12 });
  tone(980, 0.06, { type: "triangle", gain: 0.038, delay: 0.2 });
}

/** Briefly lower the music so a voice-link squelch always cuts through. */
function duckTheme() {
  const track = tracks.get("theme");
  if (!track || !track.playing) return;
  window.clearTimeout(track.duckTimer);
  fadeTo(track, Math.max(0.02, (track.target || TRACK_GAIN.theme) * 0.35), 90);
  track.duckTimer = window.setTimeout(() => {
    if (track.playing) fadeTo(track, track.target || TRACK_GAIN.theme, 450);
  }, 340);
}

/* --------------------------------------------------------------- music beds */

function getTrack(name) {
  if (tracks.has(name)) return tracks.get(name);
  if (typeof window === "undefined") return null;

  const url = urlFor(`${name}.mp3`);
  if (!url) {
    if (name === "theme" && !warnedTheme) {
      warnedTheme = true;
      console.info(
        "[audio] theme.mp3 is missing — add it to src/assets/sounds/ to enable the game theme.",
      );
    }
    return null;
  }

  const el = new Audio(url);
  el.preload = "auto";
  el.loop = name !== "rocket";
  el.volume = 0;
  const track = { name, el, target: 0, timer: 0, duckTimer: 0, playing: false };
  tracks.set(name, track);
  return track;
}

function fadeTo(track, to, ms, done) {
  window.clearInterval(track.timer);
  const from = track.el.volume;
  const started = performance.now();
  const duration = Math.max(1, ms);
  track.timer = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - started) / duration);
    track.el.volume = Math.min(1, Math.max(0, from + (to - from) * progress));
    if (progress >= 1) {
      window.clearInterval(track.timer);
      track.timer = 0;
      done?.();
    }
  }, 40);
}

function resume(track) {
  if (track.playing) return;
  const promise = track.el.play();
  if (!promise || typeof promise.then !== "function") {
    track.playing = true;
    pending.delete(track.name);
    return;
  }
  promise
    .then(() => {
      track.playing = true;
      pending.delete(track.name);
    })
    .catch(() => {
      track.playing = false;
      track.el.volume = 0;
      pending.add(track.name);
    });
}

function playTrack(name, { volume = TRACK_GAIN[name] ?? 0.4, offset = 0, fade = 500, loop } = {}) {
  const track = getTrack(name);
  if (!track) return;

  window.clearTimeout(track.duckTimer);
  track.duckTimer = 0;
  track.target = volume;
  track.el.loop = loop ?? name !== "rocket";
  if (offset > 0) {
    try {
      if (Number.isFinite(track.el.duration) && track.el.duration > 0) {
        track.el.currentTime = Math.min(offset, track.el.duration - 0.05);
      } else {
        track.el.currentTime = offset;
      }
    } catch {
      /* metadata not ready yet; the element starts at 0. */
    }
  }

  if (!track.playing) {
    track.el.volume = 0;
    resume(track);
  }
  fadeTo(track, volume, fade);
}

function stopTrack(name, fade = 500) {
  const track = tracks.get(name);
  if (!track) return;
  window.clearTimeout(track.duckTimer);
  track.duckTimer = 0;
  pending.delete(name);
  fadeTo(track, 0, fade, () => {
    track.el.pause();
    track.playing = false;
  });
}

/** Rocket descent bed. The game restarts it at touchdown of the intro. */
export function playRocket(offset = 0) {
  playTrack("rocket", { volume: TRACK_GAIN.rocket, offset, fade: 350 });
}

export function stopRocket(fade = 1200) {
  stopTrack("rocket", fade);
}

/** The main theme loops for the rest of the session. */
export function startTheme() {
  playTrack("theme", { volume: TRACK_GAIN.theme, fade: 1800, loop: true });
}

export function hasTheme() {
  return Boolean(urlFor("theme.mp3"));
}

/** Dust-storm ambience. */
export function startStorm() {
  playTrack("storm", { volume: TRACK_GAIN.storm, fade: 1200, loop: true });
}

export function stopStorm(fade = 800) {
  stopTrack("storm", fade);
}

/**
 * One global click/keydown listener gives every button, menu item and choice
 * the same quiet feedback. Returns a cleanup function for the React effect.
 */
export function installUiSounds() {
  if (typeof document === "undefined") return () => {};
  if (unlockInstalled) return () => {};
  unlockInstalled = true;

  const onGesture = () => unlockAudio();
  const onClick = (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button, [role='button'], a, input[type='checkbox']")
      : null;
    if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return;
    unlockAudio();
    playUi(target.closest(".vn-choices") ? "select" : "click");
  };

  document.addEventListener("pointerdown", onGesture, true);
  document.addEventListener("keydown", onGesture, true);
  document.addEventListener("click", onClick, true);

  return () => {
    document.removeEventListener("pointerdown", onGesture, true);
    document.removeEventListener("keydown", onGesture, true);
    document.removeEventListener("click", onClick, true);
    unlockInstalled = false;
  };
}
