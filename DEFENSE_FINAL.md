# 67Films final presentation — SE-2503

Team: Symbat Abdirakhman and Akerke Zulpubek.

## Four-minute demonstration

| Time | Presenter | Show and explain |
|---|---|---|
| 0:00–0:30 | Symbat | Home page, audience and purpose. We help viewers choose a film, save a list and plan a movie night. |
| 0:30–1:00 | Symbat | Resize using the responsive QA page. Show 375 and 768 px layouts. Toggle dark mode and open another page to show persistence. |
| 1:00–1:50 | Symbat | Sign up with made-up demo data. Trigger an invalid phone/password, correct them, log in and show profile details. Explain localStorage and password hashing. |
| 1:50–2:30 | Akerke | Search a catalogue title, use suggestions and genre filtering, save a film, then show it in the profile. |
| 2:30–3:15 | Akerke | Search the live TVmaze API. Show loading, a real result, source attribution, no-result message and save action. |
| 3:15–3:45 | Akerke | Movie-night steps, validation and reset; thumbnail gallery and rating if time permits. |
| 3:45–4:00 | Both | State testing results and the browser-only simulation limit. Give live and repository links. |

If the instructor sets a shorter limit, prioritize authentication, custom validation, API and responsiveness.

## Қысқа түсіндіру

**Сымбат:** «Біздің жобамыз — 67Films. Бұл фильм, сериал және аниме табуға, таңдауды сақтауға және кино кешін жоспарлауға арналған көпбетті сайт. Интерфейс Bootstrap, Flexbox және Grid арқылы әр экранға бейімделеді. Тақырып режимі localStorage ішінде сақталып, басқа бетте де қолданылады. Тіркелгенде пайдаланушының аты, email-і, телефоны және құпиясөздің хэші осы браузерге жазылады. Кіру кезінде деректер салыстырылып, профиль ашылады. Барлық валидацияны JavaScript орындайды, қателер форманың өзінде көрсетіледі.»

**Акерке:** «Каталогта 34 туынды бар. Іздеу енгізілген сайын нәтижелер жаңарады, жанр бойынша сүзуге және туындыны жеке көру тізіміне сақтауға болады. Сериалдар бетінде TVmaze API-іне fetch арқылы сұрау жібереміз. Жүктелу, қате және бос нәтиже күйлерін өңдедік. API-ден келген HTML-ді тікелей бетке қоспай, мәтінге айналдырамыз. Сайттағы галерея, бағалау және жоспарлау функциялары кино таңдау мақсатын толықтырады. Телефон, планшет және кең экран өлшемдерінде орналасуын тексердік.»

## Likely questions

- **Why `novalidate`?** It prevents browser validation from intercepting submit. JavaScript validates relevant fields and writes accessible inline errors.
- **How is email validated?** A regular expression checks the structure, not whether an actual mailbox exists.
- **Why hash a password?** The demo stores a salted PBKDF2 representation instead of plaintext. Login hashes the supplied value with the stored salt and compares it.
- **Is this production authentication?** No. A user can edit local storage. Real authentication requires a server and proper sessions.
- **How is duplicate email handled?** Trim and lowercase the email, search existing accounts, and show a field error.
- **Why use TVmaze?** It fits series discovery and does not need an API key in this frontend project.
- **What if the API fails?** Catch fetch/HTTP/schema errors, end the loading state, display a retry action and label cached results when available.
- **What prevents stale search responses?** Abort the previous request and compare request IDs before updating the interface.
- **Why use `textContent`?** It displays user/API text without interpreting it as executable HTML.
- **How do saved titles work?** Each account has a separate localStorage key; the profile reads that account’s list.
- **Does dark mode persist?** The shared toggle stores the mode; an early head script applies it on each new page.
- **How were screen sizes checked?** Real iframe viewports at 320, 375, 768 and 1280 px, checking content width and visual alignment.

## Small changes to practise

1. Change the password minimum in `validation.js` and its message; rerun tests.
2. Change the API result limit in `tvmaze-client.js`.
3. Add a catalogue item to `data/catalog.json` and regenerate its shared data.
4. Adjust a CSS breakpoint in `css/final.css` and open the responsive QA page.
5. Explain the storage failure branches and remove one saved title from the profile.

## Submission

Submit the live URL, repository URL and complete ZIP. The included PDF is a concise implementation and test guide. Submit before 18 November 2026, 23:59 Asia/Almaty; the cut-off is 19 November, 08:59.
