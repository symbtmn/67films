/* Assignment 5: one short Web Audio chime, created only after a user gesture. */
'use strict';
(() => {
  const toggle = document.getElementById('soundToggle');
  const preview = document.getElementById('soundPreview');
  const status = document.getElementById('soundStatus');
  if (!toggle || !preview || !status) return;
  let enabled = false;
  let context = null;
  let activeTone = null;
  let requestId = 0;

  function stopTone() {
    if (!activeTone) return;
    const previous = activeTone;
    activeTone = null;
    try { previous.stop(); } catch { /* It may already have ended. */ }
    previous.disconnect();
  }

  async function play() {
    if (!enabled) return;
    const currentRequest = ++requestId;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Audio unavailable');
      context ??= new AudioContextClass();
      if (context.state === 'suspended') await context.resume();
      // A rapid second click or mute cancels an older pending request.
      if (currentRequest !== requestId || !enabled) return;
      stopTone();
      const tone = context.createOscillator();
      const volume = context.createGain();
      const now = context.currentTime;
      tone.type = 'sine';
      tone.frequency.setValueAtTime(523.25, now);
      tone.frequency.setValueAtTime(659.25, now + 0.14);
      volume.gain.setValueAtTime(0, now);
      volume.gain.linearRampToValueAtTime(0.045, now + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      tone.connect(volume);
      volume.connect(context.destination);
      activeTone = tone;
      tone.onended = () => {
        tone.disconnect();
        volume.disconnect();
        if (activeTone === tone) activeTone = null;
      };
      tone.start(now);
      tone.stop(now + 0.34);
      status.textContent = 'Қысқа кино-кеш белгісі ойнатылды.';
    } catch {
      status.textContent = 'Бұл браузерде дыбыс ойнатылмады. Қалған функциялар жұмыс істейді.';
    }
  }

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? 'Дыбыс: қосулы' : 'Дыбыс: өшірулі';
    preview.disabled = !enabled;
    if (enabled) play();
    else {
      requestId++;
      stopTone();
      status.textContent = 'Дыбыс өшірілді.';
    }
  });
  preview.addEventListener('click', play);
  window.addEventListener('pagehide', () => {
    requestId++;
    stopTone();
    if (context && context.state !== 'closed') context.close().catch(() => {});
    context = null;
  });
  window.NightSound = { play };
})();
