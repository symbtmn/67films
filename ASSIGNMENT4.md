# Assignment 4 - 67Films

Team: 67Films. Members: Symbat Abdirakhman and Akerke Zulpubek.
Website: https://symbtmn.github.io/67films/
Main demonstration: https://symbtmn.github.io/67films/club.html
Repository: https://github.com/symbtmn/67films

## Submission checklist

- Submit the PDF report and the complete project ZIP individually for each student.
- Use the deployed club URL above in the report and LMS text section.
- Open the website and corresponding JavaScript files during the practice defense.
- Each member must review, contribute to and understand at least one JavaScript component, and understand teammates' components.

## Criterion mapping

1. Form validation, 15 points: club.html -> js/validation.js. Submit blank fields, invalid email, a short password and mismatched confirmation. Error messages appear below the inputs and in a summary. Correct the fields and submit. The success state clears passwords without sending or storing them.
2. Accordion, 15 points: faq.html and club.html -> js/accordion.js. Five answers start hidden. Click or use Enter/Space to open/close them. CSS transitions grid rows from 0fr to 1fr. Timers are cancelled during rapid toggles; reduced-motion preferences are respected.
3. Popup, 10 points: every page -> js/newsletter.js and data/newsletter.tpl. Buttons open a native modal dialog. Close with X, outside click or Escape. Keyboard Tab stays inside, focus returns to the trigger, and background scrolling is restored. Its name/email/consent fields reuse the validator.
4. Background color, 5 points: every page -> js/background.js. The header button cycles four palettes and sets document.body.style.backgroundColor. It saves only a numeric palette index. A theme observer chooses a readable light/dark variant.
5. Current date/time, 5 points: every footer and the club clock card -> js/clock.js. new Date() supplies the time, Intl.DateTimeFormat formats it in the viewer's local timezone, a time element receives an ISO datetime, and setInterval refreshes it every second.
6. Report, 10 points: the submission PDF includes objectives, team details, task steps, actual UI screenshots, deployment URL, test results and a project reflection. Review the reflection and responsibilities to reflect each student's actual work.
7. Defense, 40 points: individual explanation, understanding, questions and live changes. See DEFENSE_Assignment4.md. A working site alone does not demonstrate this criterion.

## Suggested component responsibilities to confirm

Symbat: form validation and subscription popup.
Akerke: FAQ accordion, background palette and clock.
This is a preparation plan; each student must confirm their actual contributions and practise all five components.

## Run and check

npm start                 # local site, http://localhost:8080
npm test                  # dependency-free audit of links, IDs and imports
npm run build             # copies all pages/assets to dist

Optional behavior suite (requires Python Playwright and a browser):
python3 tools/assignment4_check.py --browser /path/to/chrome-headless-shell
python3 tools/assignment4_check.py --engine firefox --browser /path/to/firefox

Evidence and results are in evidence/assignment4 in the submission ZIP. The browser suite tests required/malformed/success states, password non-storage, accordion animation and rapid clicks, popup focus/close paths, background cycle/persistence, ticking local time, small screens, existing mobile poster/drawer behavior and all 68 pages.

## Edit safely

For live practice, edit individual HTML/JS files directly. Shared page regeneration uses tools/build_pages.py and the readable HTML fragments in data/club.tpl, data/faq.tpl and data/newsletter.tpl. Running the generator overwrites direct HTML changes, so permanent content changes belong in these sources. The deployed website needs no Python or build tools.
