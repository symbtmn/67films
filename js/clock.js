/* Assignment 4, Task 5: local date/time, updated from a fresh Date every second. */
'use strict';
(() => {
  const clocks = document.querySelectorAll('[data-live-clock]');
  if (!clocks.length) return;
  const formatter = new Intl.DateTimeFormat('kk-KZ', { dateStyle: 'long', timeStyle: 'medium' });
  const zone = formatter.resolvedOptions().timeZone;
  document.querySelectorAll('[data-clock-zone]').forEach(node => { node.textContent = zone; });
  function updateClock() {
    const now = new Date();
    clocks.forEach(clock => {
      clock.textContent = formatter.format(now);
      clock.dateTime = now.toISOString();
    });
  }
  updateClock();
  setInterval(updateClock, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateClock();
  });
})();
