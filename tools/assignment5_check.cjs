/* End-to-end Assignment 5 checks. Requires Playwright and Chromium. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'evidence/assignment5');
fs.mkdirSync(output, { recursive: true });
const browserArg = process.argv.indexOf('--browser');
const executablePath = browserArg >= 0 ? process.argv[browserArg + 1] : undefined;
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8095/';
let server;

(async () => {
  if (!process.env.TEST_BASE_URL) {
    server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs')], { env: { ...process.env, PORT: '8095' } });
    await new Promise((resolve, reject) => {
      server.stdout.once('data', resolve);
      server.once('error', reject);
      server.once('exit', code => { if (code) reject(new Error('Preview server failed')); });
    });
  }
  const browser = await chromium.launch({ executablePath, headless: true,
    args: ['--no-sandbox', '--no-zygote', '--single-process', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, timezoneId: 'Asia/Almaty' });
  // YouTube playback is external to the assignment; block embeds during local QA.
  await context.route('**/www.youtube.com/**', route => route.abort());
  const errors = [];
  const checks = [];
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
  const shot = async (name, selector) => {
    const locator = selector ? page.locator(selector) : page;
    await locator.screenshot({ path: path.join(output, `${name}.png`), animations: 'disabled' });
  };
  await page.addInitScript(() => {
    // Observe real audio nodes; do not replace the sound implementation.
    window.audioAudit = { started: 0, running: false, peak: 0, live: 0 };
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return;
    const original = AudioClass.prototype.createOscillator;
    AudioClass.prototype.createOscillator = function (...args) {
      const node = original.apply(this, args);
      const start = node.start.bind(node);
      const stop = node.stop.bind(node);
      let active = false;
      const finish = () => { if (active) { window.audioAudit.live--; active = false; } };
      node.start = (...params) => {
        active = true;
        window.audioAudit.started++;
        window.audioAudit.live++;
        window.audioAudit.peak = Math.max(window.audioAudit.peak, window.audioAudit.live);
        window.audioAudit.running = this.state === 'running';
        return start(...params);
      };
      node.stop = (...params) => { if (!params.length) finish(); return stop(...params); };
      node.addEventListener('ended', finish);
      return node;
    };
  });
  await page.goto(base + 'movie-night.html');
  check('Eight movie cards render from the data array', await page.locator('[data-night-movie]').count() === 8);
  check('Initial film and poster match', (await page.locator('#selectedTitle').innerText()).includes('Интерстеллар'));
  check('No inline HTML event handlers or styling', await page.locator('#nightApp').evaluate(el => !el.querySelector('[style], [onclick], script')));
  await shot('01-overview');

  for (const [filter, count] of [['science', 3], ['family', 3], ['anime', 2], ['all', 8]]) {
    await page.locator(`[data-night-filter="${filter}"]`).click();
    check(`Category ${filter} filters to ${count} items`, await page.locator('[data-night-movie]').count() === count);
  }
  await page.locator('[data-night-filter="anime"]').click();
  await shot('02-filter', '#nightCatalog');
  const originalPoster = await page.locator('#selectedPoster').getAttribute('src');
  await page.locator('[data-night-movie="zruhtar"]').click();
  check('Thumbnail changes selected poster src and alt', originalPoster !== await page.locator('#selectedPoster').getAttribute('src') && (await page.locator('#selectedPoster').getAttribute('alt')).includes('Рухтар'));
  check('Selected movie link changes', await page.locator('#selectedLink').getAttribute('href') === 'zruhtar.html');
  await page.locator('#readMore').click();
  check('Read More expands extra text and aria-expanded', await page.locator('#selectedExtra').isVisible() && await page.locator('#readMore').getAttribute('aria-expanded') === 'true');
  await page.locator('#readMore').click();
  check('Read More collapses text', !await page.locator('#selectedExtra').isVisible());
  await page.locator('[data-night-star="4"]').click();
  check('Four stars change their class; one radio is checked', await page.locator('.night-star.is-filled').count() === 4 && await page.locator('.night-star[aria-checked="true"]').count() === 1);
  await shot('03-selection', '#nightSelection');
  await page.reload();
  await page.locator('[data-night-movie="zruhtar"]').click();
  check('Per-film rating persists after reload', await page.locator('.night-star.is-filled').count() === 4);
  await page.locator('[data-night-star="4"]').focus();
  await page.keyboard.press('ArrowRight');
  check('Rating arrow key updates focus and value', await page.locator('[data-night-star="5"]').evaluate(el => el === document.activeElement && el.getAttribute('aria-checked') === 'true'));
  await page.keyboard.press('Home');
  check('Rating Home key selects first star', await page.locator('.night-star.is-filled').count() === 1);
  await page.locator('#clearNightRating').click();
  check('Reset rating clears its saved value', await page.locator('.night-star.is-filled').count() === 0);
  await page.locator('[data-night-star="4"]').click();

  const links = page.locator('#nightMenu a');
  await links.first().focus();
  await page.keyboard.press('ArrowLeft');
  check('Navigation wraps left to last link', await links.last().evaluate(el => el === document.activeElement));
  await page.keyboard.press('ArrowRight');
  check('Navigation wraps right to first link', await links.first().evaluate(el => el === document.activeElement));
  await page.keyboard.press('End');
  await shot('04-keyboard', '#nightMenu');
  await page.keyboard.press('Home');
  check('Menu Home and End work', await links.first().evaluate(el => el === document.activeElement));

  await page.locator('#theme-toggle').click();
  check('Custom theme toggles to dark', await page.locator('html').getAttribute('data-bs-theme') === 'dark');
  await shot('05-dark-selection', '#nightSelection');
  await page.reload();
  check('Theme persists on reload', await page.locator('html').getAttribute('data-bs-theme') === 'dark');
  await page.locator('#theme-toggle').click();
  const initialId = await page.locator('.night-film-card.is-selected').getAttribute('data-night-movie');
  await page.locator('#surpriseFilm').click();
  check('Recommendation chooses a different film', initialId !== await page.locator('.night-film-card.is-selected').getAttribute('data-night-movie'));
  await page.locator('[data-night-movie="zintersteller"]').click();

  await page.locator('#nightNext').click();
  check('Empty name blocks Next and shows error', await page.locator('#nightPlanError').isVisible() && await page.locator('[data-night-step="0"]').isVisible());
  await page.locator('#nightName').fill('"@".');
  await page.locator('#nightNext').click();
  check('Punctuation-only name is rejected', await page.locator('#nightPlanError').isVisible());
  await page.locator('#nightName').fill('Сымбат');
  for (const invalid of ['0', '13', '2.5']) {
    await page.locator('#nightGuests').fill(invalid);
    await page.locator('#nightNext').click();
    check(`Invalid guest count ${invalid} is rejected`, await page.locator('#nightPlanError').isVisible());
  }
  await page.locator('#nightGuests').fill('4');
  await shot('06-step-one', '#nightPlanner');
  await page.locator('#nightNext').click();
  check('Valid first step invokes callback and opens time step', await page.locator('[data-night-step="1"]').isVisible());
  await page.locator('#nightDate').fill('2020-01-01');
  await page.locator('#nightNext').click();
  check('Past date is rejected', await page.locator('#nightPlanError').isVisible());
  await page.locator('#nightDate').fill('');
  await page.locator('#nightNext').click();
  check('Blank date is rejected', await page.locator('#nightPlanError').isVisible());
  const future = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate()+2); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); });
  await page.locator('#nightDate').fill(future);
  await page.locator('#nightTime').fill('20:30');
  await page.locator('#nightSnack').selectOption('Шай мен тәтті');
  await page.locator('#nightBack').click();
  check('Back preserves previous inputs', await page.locator('#nightName').inputValue() === 'Сымбат' && await page.locator('#nightGuests').inputValue() === '4');
  await page.locator('#nightNext').click();
  check('Time and snack survive Back/Next', await page.locator('#nightTime').inputValue() === '20:30' && await page.locator('#nightSnack').inputValue() === 'Шай мен тәтті');
  await shot('07-step-two', '#nightPlanner');
  await page.locator('#nightNext').click();
  check('Review greets the host and shows current film', (await page.locator('#nightGreeting').innerText()).includes('Сымбат') && (await page.locator('#nightReview').innerText()).includes('Интерстеллар'));
  await shot('08-review', '#nightPlanner');
  await page.locator('[data-night-movie="zruhtar"]').click();
  check('Review updates when film changes', (await page.locator('#nightReview').innerText()).includes('Рухтар'));

  // Real AudioContext is observed after a user gesture; rapid clicks never overlap.
  await page.locator('#soundToggle').click();
  await page.waitForFunction(() => window.audioAudit.started > 0);
  for (let i=0; i<5; i++) await page.locator('#soundPreview').click();
  await page.waitForTimeout(400);
  const audio = await page.evaluate(() => window.audioAudit);
  check('AudioContext runs and tones start after clicks', audio.started >= 6 && audio.running);
  check('Rapid sound clicks do not overlap; nodes finish', audio.peak === 1 && audio.live === 0);
  await shot('09-sound', '.night-toolbar');
  await page.locator('#soundToggle').click();
  check('Mute disables preview and changes aria state', await page.locator('#soundPreview').isDisabled() && await page.locator('#soundToggle').getAttribute('aria-pressed') === 'false');

  const beforeURL = page.url();
  await page.locator('#nightSubmit').click();
  check('Confirmation shows ticket without reload', page.url() === beforeURL && await page.locator('#nightTicket').isVisible());
  check('Ticket uses actual form values', (await page.locator('#ticketDetails').innerText()).includes('4 адам') && (await page.locator('#ticketDetails').innerText()).includes('20:30'));
  check('Ticket animation is applied', (await page.locator('#nightTicket').evaluate(el => getComputedStyle(el).animationName)) === 'night-ticket');
  await shot('10-ticket', '#nightTicket');
  await page.locator('[data-night-movie="avengers"]').click();
  check('Changing film invalidates previous ticket', !await page.locator('#nightTicket').isVisible() && await page.locator('#nightSubmit').isEnabled());
  await page.locator('#nightSubmit').click();
  await page.locator('#nightRestart').click();
  check('New plan resets form to step one', await page.locator('#nightName').inputValue() === '' && await page.locator('[data-night-step="0"]').isVisible());
  // Enter cannot bypass earlier steps; a hidden step is enabled during revalidation.
  await page.locator('#nightName').fill('Әлия-Мәрия');
  await page.locator('#nightPlanForm').evaluate(form => form.requestSubmit());
  check('Enter-style submission advances only one step', await page.locator('[data-night-step="1"]').isVisible() && !await page.locator('#nightTicket').isVisible());
  await page.locator('#nightNext').click();
  await page.locator('#nightName').evaluate(el => { el.value = '@'; });
  await page.locator('#nightSubmit').click();
  check('Final submit revalidates disabled earlier steps', await page.locator('[data-night-step="0"]').isVisible() && !await page.locator('#nightTicket').isVisible());

  // Regression: Assignment 4 forms still reject reported malformed credentials.
  await page.goto(base + 'club.html');
  await page.locator('#memberName').fill('"@".');
  await page.locator('#memberEmail').fill("'@'.'");
  await page.locator('#memberConsent').check();
  await page.locator('#member-form button[type=submit]').click();
  check('Assignment 4 invalid inputs remain rejected', await page.locator('#member-form .is-invalid').count() === 4);
  await page.locator('#memberName').fill('Әлия');
  await page.locator('#memberEmail').fill('aliya@example.com');
  await page.locator('#memberPassword').fill('DemoMovie2026!');
  await page.locator('#memberConfirm').fill('DemoMovie2026!');
  await page.locator('#member-form button[type=submit]').click();
  check('Assignment 4 valid demo submission still works', (await page.locator('#member-form [data-form-status]').innerText()).includes('сәтті'));

  // Responsive and asset regression checks cover every submitted HTML page.
  let pageViewportChecks = 0;
  let imageChecks = 0;
  const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const file of pages) {
      await page.goto(base + encodeURI(file), { waitUntil: 'load' });
      const result = await page.evaluate(async () => {
        await Promise.all([...document.images].filter(img => img.loading !== 'lazy').map(img => img.decode().catch(() => {})));
        return { overflow: document.documentElement.scrollWidth > innerWidth + 1,
          broken: [...document.images].filter(img => img.complete && !img.naturalWidth && img.loading !== 'lazy').map(img => img.src),
          images: [...document.images].filter(img => img.loading !== 'lazy').length };
      });
      assert.equal(result.overflow, false, `${file} overflows at ${width}px`);
      assert.deepEqual(result.broken, [], `${file} broken images`);
      imageChecks += result.images;
      pageViewportChecks++;
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(base + 'movie-night.html');
  await shot('11-mobile-top');
  await shot('12-mobile-selection', '#nightSelection');
  check('Mobile poster stays compact', await page.locator('#selectedPoster').evaluate(el => el.getBoundingClientRect().width <= 112));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-night-filter="family"]').click();
  check('Reduced-motion preference disables new animations', await page.locator('#nightFilmGrid').evaluate(el => getComputedStyle(el).animationName === 'none'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }));
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base + 'movie-night.html');
  await blockedPage.locator('[data-night-star="3"]').click();
  check('Blocked storage falls back to session ratings', await blockedPage.locator('.night-star.is-filled').count() === 3);
  // Keep this context until browser.close(); single-process Chromium shares a renderer.
  await context.addInitScript(() => localStorage.setItem('67films-night-ratings', '{"zintersteller":99,"zruhtar":"bad"}'));
  await page.reload();
  check('Corrupted rating values are ignored', await page.locator('.night-star.is-filled').count() === 0);
  check('No uncaught JavaScript errors', errors.length === 0);
  const result = { checkedAt: new Date().toISOString(), browser: await browser.version(), base,
    functionalChecks: checks.length, checks, pageViewportChecks, imageChecks, errors, soundAudit: audio };
  fs.writeFileSync(path.join(output, 'qa-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  server?.kill();
})().catch(error => { server?.kill(); console.error(error); process.exit(1); });
