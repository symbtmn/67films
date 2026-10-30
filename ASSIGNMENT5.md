# Assignment 5 - Advanced JavaScript and DOM Manipulation

Team: **67Films**  
Members: **Symbat Abdirakhman, Akerke Zulpubek**  
Live feature: https://symbtmn.github.io/67films/movie-night.html  
Repository: https://github.com/symbtmn/67films

## Objective

Extend our existing cinema catalogue with a movie-night planner. Visitors choose a film, rate it, navigate with the keyboard, and make a three-step plan. The new features use custom JavaScript; Bootstrap provides layout and visual styles. Existing Bootstrap navigation, carousel and drawer are retained.

## Complete requirement mapping

| Requirement | Actual implementation | Source |
|---|---|---|
| Select individual elements and groups | `querySelector`, `querySelectorAll`, `getElementById` | `js/movie-night.js`: `select`, `selectAll`; sound script |
| Change displayed content | Titles, counts, summaries and personalized greeting use `textContent`; lists use `replaceChildren` | `renderSelection`, `renderCards`, `renderReview` |
| Dynamic styles / Day-Night | Shared custom theme button changes `data-bs-theme` and `dark-mode`; selected filters, cards and stars change CSS classes | `js/script.js`: `applyTheme`; `renderRating` |
| Attribute manipulation option: thumbnail gallery | Clicking a poster changes the large image's `src`, `alt`, the detail link's `href`, and `aria-pressed` | `renderSelection`, `chooseMovie` |
| Additional Read More and greeting | Toggle extra description and `aria-expanded`; show the host's name on review | `#readMore` click handler, `renderReview` |
| Button listeners | Filtering, recommendation, rating, reset, navigation, confirm and sound use `addEventListener('click', ...)` | `js/movie-night.js`, `js/night-sound.js` |
| Keyboard navigation menu | Arrow keys move focus between real section links; wrapping, Home and End are supported | `#nightMenu` keydown handler |
| Callback option: multi-step form | `goToStep(nextStep, onChange)` validates the current step, updates state, then calls the passed callback `renderStep` | `goToStep`, Next/Back handlers |
| Switch statement | `catalog.byCategory` filters science, family and anime; keyboard handlers also use `switch` | `catalog.byCategory` |
| Objects and methods | `catalog` groups movies with `find` and `byCategory`; `state` stores selections, ratings and step | `js/movie-night.js` |
| Arrays and loops | Eight movie objects; `for...of` generates cards; indexed `for` updates stars | `js/night-data.js`, `renderCards`, `renderRating` |
| Higher-order functions | `filter`, `find`, `forEach` and explicit callback function `goToStep` | `catalog`, filters, `fillDetails` |
| Sound effect | User enables audio and previews a short generated two-tone Web Audio chime; rating and confirmation can also trigger it | `js/night-sound.js` |
| No overlapping audio | A new request stops the previous oscillator; request IDs cancel pending resume calls; nodes disconnect after ending | `play`, `stopTone` |
| Event-triggered animation | Film selection, filtering, step changes, star rating and ticket confirmation trigger CSS animation classes | `animate`; `css/movie-night.css` |
| Separation of concerns | Semantic HTML template; scoped CSS; separate data, audio and application JS; no inline handlers or scripts | `data/movie-night.tpl`, `css/movie-night.css`, three JS files |
| Theme and UX | Existing films/posters/detail links, local rating persistence, compact mobile layout, mute and reduced motion | `movie-night.html` |
| Deployment | Changes committed to shared main branch and served by GitHub Pages | Published URL above |
| Report | PDF with team, member names, group field, objective, task steps, code/result screenshots, URL, tests and reflection | Submission report |
| Defense | Questions, source map and live-change practice | `DEFENSE_Assignment5.md` |

## Usage

1. Open `movie-night.html` from the **Кино кеші** navigation item.
2. Select a category, then click a movie thumbnail; the selected detail panel changes.
3. Choose 1-5 stars. The rating is stored for that film in this browser. Clear it with **Бағаны тазалау**.
4. Use arrows in the numbered section menu. Use arrows/Home/End in the rating group.
5. Optionally enable sound and click **Дыбысты тыңдау**. Mute immediately stops the active chime.
6. Enter a name and 1-12 guests. Choose a date from today onward, a time and a snack. Review, then confirm the plan. Back preserves entries.
7. A plan summary appears on the page; it is not a purchased ticket or a reservation. A new plan resets the fields. Choosing a different film invalidates an old summary.

## Local run and tests

`npm start` serves the complete site at http://localhost:8080. `npm test` audits local paths and HTML invariants. `npm run build` creates `dist/`.

The optional browser check needs Playwright and an installed Chromium:

```bash
npm install --no-save playwright
npx playwright install chromium
npm run test:assignment5
```

For an existing browser executable: `npm run test:assignment5 -- --browser /absolute/path/to/chromium`.
The runner starts its own preview server on port 8095. Results and actual webpage screenshots are stored in `evidence/assignment5/`. Cross-browser execution is not claimed by this check.

## Scope and storage

Movie data is shipped locally, so filtering does not require an API or an account. Only ratings and existing display preferences use `localStorage`, guarded with `try/catch`. Planner name, guest count, date and time are not persisted. Form input is inserted as text, never interpreted as HTML. Sound has no external file dependency and never autoplays on page load.

## Verified test results

Chromium 153 passed 51 functional scenarios and 207 page/viewport checks (69 pages at 375, 768 and 1440 px), with zero uncaught JavaScript errors. Sound monitoring recorded six starts, peak concurrency of one, and no active tones after completion. The tests also cover invalid names/guest counts/dates, Back/Next state, final-step revalidation, theme and rating persistence, reduced motion, blocked storage, corrupted saved ratings, and the Assignment 4 form regression. Full results: `evidence/assignment5/qa-results.json`.

## Submission

Each team member submits the full project ZIP and PDF report, then defends the code individually. Fill in the report's editable **Group** field with your actual group number. The practical defense is worth 40 points and is assessed by the instructor.


## Updated feature locations

- Movie filtering and selection: `movie-night.html`.
- Explicit thumbnail gallery with dynamic large-image src/alt: `gallery.html`.
- Star ratings: `movie-rating.html`.
- Three-step form, callback and Reset: `planner.html`.
- Site-wide interface language selector and switch: `js/i18n.js`, dictionary in `js/translations.js`.
- Shared selected movie and interface language persist between pages.
- Initial single-page test instructions and screenshots describe the original submission; the current four-page implementation is covered by `tools/revision_check.cjs`.
