/* Apply the saved scheme before CSS paints; script.js keeps controls synchronized. */
try { document.documentElement.dataset.bsTheme = localStorage.getItem('67films-theme') === 'dark' ? 'dark' : 'light'; } catch { /* Light is the default. */ }
