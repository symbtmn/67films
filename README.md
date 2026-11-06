# 67Films — Final Project

A responsive cinema catalogue for viewers who want to find a film, discover a series, save a watchlist and plan a movie night.

**Team:** Symbat Abdirakhman and Akerke Zulpubek · **Group:** SE-2503 · Astana IT University, Software Engineering, Year 2.

- **Live website:** https://symbtmn.github.io/67films/
- **Repository:** https://github.com/symbtmn/67films
- **Submission deadline:** 18 November 2026, 23:59 (Asia/Almaty).
- **Cut-off:** 19 November 2026, 08:59. Submit before the actual deadline.

## Start here

| Page | Purpose |
|---|---|
| `index.html` | Purpose, featured films, nine-slide carousel and clear next actions |
| `jquery.html` | Complete 34-title catalogue, live search, genre filter, suggestions and watchlist |
| `discover.html` | Live TVmaze series search, ratings, loading/error/empty states and save actions |
| `signup.html` | Custom-validated local account creation |
| `login.html` | Credential verification and redirect to the profile |
| `profile.html` | Stored account details, editing, personal watchlist and logout |
| `about.html` | Team, university, course, programme and contributions |
| `contact.html` | Validated feedback form and actual CSV download |
| `planner.html` | Three-step movie-night plan with custom validation and reset |

The site contains 79 connected HTML pages, including individual film pages and genre pages. The main navigation, footer and Cinema Club menu connect the core experiences.

## Run locally

No installation or API key is required.

```sh
npm start
```

Open the printed local URL. Use an HTTP server rather than opening HTML via `file://`; local storage and Web Crypto work consistently on localhost or HTTPS.

```sh
npm test                 # static audits + 52 behavioral unit assertions
npm run build:pages      # regenerate all final HTML pages
npm run build            # package public files into dist/
```

`tools/responsive-preview.html` is a development-only preview of real iframe viewports at 320, 375, 768 and 1280 px. It is a QA aid rather than a navigation destination.

## Final rubric map

| Criterion | Points | Implementation and demonstration |
|---|---:|---|
| Responsiveness | 10 | Bootstrap, Flexbox and Grid; fluid typography; mobile collapse/offcanvas; 8 core pages checked at 4 widths |
| Hosting | 5 | GitHub Pages, repository and live links above; local asset/link audit on all pages |
| Light/dark | 5 | Shared toggle; saved `67films-theme`; early `theme-init.js` prevents a wrong-theme flash |
| Design and UX | 20 | Consistent cinema identity, red accents, readable neutral dark palette, focused home page, relevant posters and clear feedback |
| Authentication | Part of 25 | Sign up stores name/email/phone/password representation; login verifies credentials, opens profile; details persist; logout and profile guard |
| Form validation | Part of 25 | `novalidate` on every form; no `required`, `pattern`, `minlength`, `maxlength`, `min`, `max` or `type=email` constraints in emitted HTML; JS rules and inline messages |
| Search/filter | Part of 25 | Dynamic title/genre/description search; stored filters; account-specific saved titles; API result saving |
| Button/UI effects | 5 | Hover transitions, counter animation, form spinner, fade notifications and reduced-motion handling |
| Public API | 10 | Real `fetch`/async-await TVmaze client; loading, abort/timeout, HTTP/network/schema errors, retry, empty state and optional labeled cache |
| Feature cohesion | 10 | Profiles, watchlists, recommendations, series discovery, trailers and movie-night planning all support choosing what to watch |
| Presentation | 5 | Rehearse the timed two-member demonstration in `DEFENSE_FINAL.md`; delivery is assessed live |
| Code quality | 5 | Organized HTML, CSS, JS, images, templates and tools; shared validation, authentication and API modules; comments on complex logic |

## Local authentication simulation

Accounts are stored under `67films.accounts.v1`. Each account stores `name`, `email`, `phone` and a `password` object containing a random salt and a PBKDF2-SHA-256 hash (120,000 iterations). The plaintext password is never saved. The session stores the account ID and sign-in time under `67films.session.v1` and lasts seven days.

Use made-up demo data. This is a browser-only simulation, not server authentication: local storage can be edited, another device cannot read the account, and clearing browser data removes it. The profile does not show a password. Invalid credentials use a generic inline message. Duplicate emails are rejected case-insensitively.

Passwords require 8–64 characters, uppercase and lowercase Latin letters, a digit and a symbol, without spaces. Kazakhstan phone numbers accept `+7` plus 10 digits; formatted spaces, parentheses and hyphens are normalized. An `8`-prefixed 11-digit number is normalized to `+7`.

## Public API and attribution

The series discovery page requests `https://api.tvmaze.com/search/shows?q=...`. TVmaze is a public key-free, CORS-enabled TV database: https://www.tvmaze.com/api . Requests contain only the series search term. No account data is sent to it.

TVmaze data is credited in the UI with a source link and CC BY-SA attribution. Descriptions retain the source language. API HTML summaries are converted to inert text; API URLs are restricted to HTTPS TVmaze domains. Requests are debounced, old requests are aborted, timeouts are handled, and missing posters use a local SVG.

## File organization

```text
67films/
├── index.html, about.html, contact.html
├── signup.html, login.html, profile.html, discover.html
├── jquery.html, planner.html, gallery.html, individual-film-pages.html
├── css/       # Bootstrap-compatible site and component styling
├── js/        # shared state, validation, auth, API and feature modules
├── images/    # local film posters, author photos and SVG fallback
├── vendor/    # local Bootstrap and jQuery fallback, with license notices
├── data/      # catalogue data and HTML templates
└── tools/     # generators, static server and checks
```

Historical assignment notes remain available, but this README and `DEFENSE_FINAL.md` describe the final project. To regenerate the final site use `build_final.py`, not an older assignment-only generator.

## Verification boundaries

The submission includes recorded browser scenarios, responsive viewport observations and unit results. CSS-width testing is not a claim that every physical device has been tested. External API availability and third-party video playback remain dependent on their providers. The five presentation points are awarded by the instructor during delivery; implementation alone does not guarantee a grade.
