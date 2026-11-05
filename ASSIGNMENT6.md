# Assignment 6 - jQuery criterion map

Team: 67Films. Members: Symbat Abdirakhman and Akerke Zulpubek. Group: SE-2503.

| PDF task | Website | Source and verification |
|---|---|---|
| 0. CDN, ready, console | All three new pages | head CDN 4.0.0, local outage fallback, `$(document).ready` and exact log in external `js/jquery-assignment.js` |
| 1. Real-time filtering | jquery.html | `.on('input')`, `.filter`, all 34 catalogue entries, title/genre/description, count and empty state |
| 2. Autocomplete | jquery.html | Up to six suggestions; click/Enter selection, arrow wrapping, Escape/outside close |
| 3. Highlighting | jquery.html | Every matching occurrence in displayed titles, metadata and descriptions; inert text nodes and mark elements |
| 4. Scroll progress | jquery-ux.html | Fixed colored gradient; scroll/resize/content update; clamped 0-100 and no-scroll guard |
| 5. Number counters | jquery-ux.html | jQuery animate, intermediate values, exact target, run once on entering viewport, reduced motion |
| 6. Submit spinner | jquery-ux.html | Trim and validate, spinner + Please wait, disabled/busy, duplicate-submit guard, delayed restoration |
| 7. Temporary notification | jquery-tools.html / club form | Fade in/out, cancel stale timers, actual saved/removable watchlist and confirmed demo completion |
| 8. Copy with feedback | jquery-tools.html | Actual clipboard write; checkmark + tooltip only on success; timed reset and rejection message |
| 9. Image lazy loading | jquery-tools.html | One image per film; data-src placeholder until viewport intersection; jQuery offset/filter/attr; load/error handling |
| Deployment | GitHub Pages | Shared repository main branch; direct links below |
| Report | Submission PDF | Objective, task-by-task steps, readable code captures, real browser result captures, tests, reflection and team/group |
| Defense (40%) | Individual practice lesson | Each member must explain and modify the code; the project does not assign this grade |

## Published pages

- https://symbtmn.github.io/67films/jquery.html
- https://symbtmn.github.io/67films/jquery-ux.html
- https://symbtmn.github.io/67films/jquery-tools.html

## Build and checks

Run `python3 tools/build_assignment6.py` after generating the shared pages. The full catalogue used by the new pages is in `js/jquery-catalog.js`, derived from `data/catalog.json`. `npm test` checks all static pages. The optional `tools/assignment6_check.cjs` requires Playwright and a Chromium executable; it starts its own preview server and writes evidence to `evidence/assignment6`. Run `node tools/assignment6_check.cjs --browser /path/to/chromium`.

## Defense practice

1. Show input, filter and all matching mark nodes. Explain why `.text`/text nodes prevent markup injection.
2. Change the number of suggestions and demonstrate keyboard selection.
3. Explain the scroll formula and the zero-distance guard.
4. Change a counter duration; explain `.animate` step and complete callbacks.
5. Submit spaces, then valid values. Show disabled state and duplicate-submit guard.
6. Add/remove a movie, refresh, and explain localStorage and fade timings.
7. Copy the share text and paste it; explain the failure branch.
8. Inspect data-src before scrolling and src after the image becomes visible.

The club form is explicitly a simulation, as permitted by Task 6. No backend account or server message is claimed.
