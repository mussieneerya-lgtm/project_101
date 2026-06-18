/**
 * Digital Clock — script.js
 * Updates the clock every second and handles all DOM updates.
 */

// Cache DOM references once
const els = {
  h1:           document.getElementById('h1'),
  h2:           document.getElementById('h2'),
  m1:           document.getElementById('m1'),
  m2:           document.getElementById('m2'),
  ampmBadge:    document.getElementById('ampmBadge'),
  secondsValue: document.getElementById('secondsValue'),
  secondsBar:   document.getElementById('secondsBar'),
  dateDisplay:  document.getElementById('dateDisplay'),
  timezoneInfo: document.getElementById('timezoneInfo'),
};

// Track previous values to trigger pulse animation only on change
const prev = { h1: null, h2: null, m1: null, m2: null };

/** Format a number as a zero-padded two-character string. */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Trigger a brief CSS pulse on a digit element when its value changes. */
function triggerPulse(el) {
  el.classList.remove('pulse');
  // Force reflow so the animation restarts even if it just finished
  void el.offsetWidth;
  el.classList.add('pulse');
}

/** Update the digit element, pulsing only if the value actually changed. */
function setDigit(el, key, value) {
  if (prev[key] !== value) {
    el.textContent = value;
    triggerPulse(el);
    prev[key] = value;
  }
}

/** Build a human-readable date string, e.g. "Friday, June 19, 2026" */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/** Derive a short timezone label from the environment. */
function getTimezoneLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Also grab the UTC offset abbreviation
    const offsetStr = new Date()
      .toLocaleTimeString('en-US', { timeZoneName: 'short' })
      .split(' ')
      .pop();
    return tz ? `${tz} · ${offsetStr}` : offsetStr;
  } catch {
    return '';
  }
}

/** Main tick function — called once per second. */
function tick() {
  const now     = new Date();
  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 12-hour conversion
  const isPM    = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;
  const hStr    = pad(hours12);
  const mStr    = pad(minutes);

  // Update hour digits
  setDigit(els.h1, 'h1', hStr[0]);
  setDigit(els.h2, 'h2', hStr[1]);

  // Update minute digits
  setDigit(els.m1, 'm1', mStr[0]);
  setDigit(els.m2, 'm2', mStr[1]);

  // AM / PM badge
  els.ampmBadge.textContent = isPM ? 'PM' : 'AM';

  // Seconds
  const secStr = pad(seconds);
  els.secondsValue.textContent = secStr;

  // Progress bar (0–59 → 0–100%)
  els.secondsBar.style.width = `${(seconds / 59) * 100}%`;

  // Date — update only once a minute (when seconds roll over)
  if (seconds === 0 || els.dateDisplay.textContent === 'Loading...') {
    els.dateDisplay.textContent = formatDate(now);
  }
}

/** One-time setup on page load. */
function init() {
  // Set timezone label
  els.timezoneInfo.textContent = getTimezoneLabel();

  // Set the date immediately
  els.dateDisplay.textContent = formatDate(new Date());

  // First tick is immediate so there's no 1-second blank flash
  tick();

  // Schedule subsequent ticks aligned to the next whole second
  const msUntilNextSecond = 1000 - (Date.now() % 1000);
  setTimeout(() => {
    tick();
    setInterval(tick, 1000);
  }, msUntilNextSecond);
}

document.addEventListener('DOMContentLoaded', init);
