# 67Films — responsive cinema catalogue

67Films is our team project about movies, series, anime and dramas. Visitors can browse genres, open a film's details and trailer, search the catalogue, and save a personal watch status and rating. It combines the Flexbox/Grid techniques from Assignment 2 and the responsive Bootstrap components from Assignment 3 in **one website**.

**Team:** Symbat Abdirakhman and Akerke Zulpubek.

**Website URL:** https://symbtmn.github.io/67films/

**Repository:** https://github.com/symbtmn/67films

This repository contains the corrected final project combining Assignment 2 and Assignment 3. The GitHub Pages URL above is the website link for submission.

## Pages and content

The project contains 66 separate HTML files, including 34 film/detail pages and 22 genre pages. Each file contains its complete header, sidebar, main content, footer and Bootstrap imports. Images and Bootstrap are included locally. All original film descriptions, information tables, image filenames and trailer URLs are preserved.

Main pages: `index.html`, `categories.html`, `about.html`, `contact.html`, `movies.html`, `premieres.html`, `announcements.html`, `responsive-cards.html` and `404.html`. Each film and genre has its own HTML file, such as `avengers.html` and `xboevik.html`.

## Where the technologies are used

| Technology | Actual use | Files to explain |
|---|---|---|
| Semantic HTML | header, nav, aside, main, sections, forms, labels and footer | Every HTML page |
| CSS Grid | Named header/sidebar/main/footer areas and nine-poster image gallery | `css/style.css`: `.page-layout-wrapper`, `.image-gallery` |
| Flexbox | Header alignment, wrapping film rows and column-based card bodies | `css/style.css`: `.top-bar`, `.movie-grid`, `.movie-card .card-body` |
| Media queries | Font sizes, mobile layout and an isolated 1/2/3-card exercise | `css/style.css`, `responsive-cards.html` |
| Bootstrap grid | Two `col-lg-6` sections, three `col-lg-4` sections, 2/4-card catalogue rows | `about.html`, `contact.html`, `categories.html`, genre pages |
| Bootstrap components | Collapsing navbar, genre dropdowns, cards, buttons, form, mobile offcanvas and carousel | All pages; carousel on home; form on contact |
| JavaScript | Search, saved theme, watch status, rating and CSV download | `js/script.js` |

The custom Grid layout targets only the project wrapper. Bootstrap classes remain in the HTML, so disabling `css/style.css` preserves the main structure and form. Do not remove the Bootstrap stylesheet when demonstrating this fallback.

## Features

- Exactly nine carousel slides, one image per slide. Each image opens its matching film page. Indicators and previous/next controls work; autoplay is off.
- Four film cards per row on desktop, two on mobile/tablet. Card contents use Flexbox and action links align at the bottom.
- Desktop trending sidebar; a closed-by-default side drawer on mobile.
- Responsive two-column author/contact sections and three-column feature/category sections.
- Separate nine-image Grid gallery with hover/focus captions and visible touch-screen captions.
- Search with live matching and an empty-results message.
- Persistent light/dark mode, movie watch status and five-point rating.
- Labeled, responsive feedback form with validation, input group, select, radios and checkbox. It downloads a CSV locally; it does not send mail or store data on a server.
- Full-width footer containing both team members on every page.

## Final project requirements — 60 points

| Criterion | Points | Evidence / final action |
|---|---:|---|
| Responsiveness | 15 | Shared responsive layout; browser checks at mobile, tablet and desktop widths; working hamburger and side drawer |
| Hosting | 10 | Existing GitHub Pages URL above; upload the corrected source and verify the updated site; this README belongs in the repository |
| Design quality | 20 | Valid local links/assets, readable colors, consistent components and full-width footer; separate HTML pages for both students |
| Theme and cohesion | 15 | Genres, trailers, search, recommendations, watch status and rating all support the cinema catalogue |

There are enough separate pages for each member to work on at least two. The table below is a **suggested defense allocation**, not a claim about who originally authored a file. Each student must review, contribute to and explain their selected pages before submission.

| Member | Suggested pages to review and defend |
|---|---|
| Symbat Abdirakhman | `index.html`, `categories.html`, `avengers.html` |
| Akerke Zulpubek | `about.html`, `contact.html`, `zetikigenmysyq.html` |

## Run locally

Open the folder with VS Code Live Server, open `index.html` directly, or run:

```bash
npm start
```

Visit http://localhost:8080. No npm installation is needed: the preview/build use Node's built-in modules. YouTube trailers need internet; their playback also depends on the video owner's embed settings.

```bash
npm test
npm run build
```

The test checks HTML IDs, page/image/script links, author names, imports and carousel structure. The build copies all 66 HTML files and assets to `dist/`. Optional full browser tests are in `tools/browser_check.py` and require Playwright plus Chromium. Test results are in `evidence/qa-results.json`. The final version passed 198 page/viewport checks (66 pages at 375, 768 and 1440 px), with no horizontal overflow or JavaScript errors. All 37 supplied JPEG files were verified; local image/link targets exist. External YouTube playback was not tested.

## Edit and add content

Edit a page directly if you only need a local change. For consistent repeated changes, edit `tools/build_pages.py` and `data/catalog.json`, then run `python3 tools/build_pages.py`. This regenerates the static HTML; put permanent changes in the generator/data before running it, because direct edits will be overwritten.

A new film needs a unique page filename, poster, title, information table, plot and trailer. Add its card to home/relevant genres, and use a unique `data-movie` value so its saved rating is separate. Keep Bootstrap imports and both member names in the footer.

## Host on GitHub Pages

1. Back up the existing repository or use a new branch.
2. Copy this complete project's contents into the repository root, including every HTML page, `img/`, `css/`, `js/`, `vendor/` and `README.md`.
3. Run the local checks. Commit and push the reviewed files through your GitHub account.
4. In repository Settings → Pages, keep/select **Deploy from a branch → main → /(root)**. If your current Pages publishing source differs, update that actual source instead.
5. Open https://symbtmn.github.io/67films/ and verify the new home page, carousel destinations, genre/movie links and contact form on your phone.
6. Paste this verified URL into the LMS online text section. Both team members must upload their project files individually.

GitHub's official publishing-source instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Defense — 40 points

Open the website and its code. Explain the technologies in the mapping above, demonstrate at least two of your own pages, and practise changing the layout or content live. `DEFENSE.md` includes concrete code explanations and modification exercises. A complete site does not replace the live defense: each student needs to understand and modify their own code.
