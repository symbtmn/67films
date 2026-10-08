# Қорғау — 40 балл

Әр студент сайт пен кодты ашып, өзі жұмыс істеген кемінде екі HTML бетін көрсетеді. README-дегі беттер бөлуі — ұсыныс; нақты үлесіңмен сәйкестендір.

## Нені кодтан көрсету керек?

| Сұрақ | Қай кодты ашасың? | Қалай түсіндіресің? |
|---|---|---|
| HTML қайда? | `index.html`, өз кино/форма бетің | header/nav/main/aside/footer, link, image, form және labels |
| CSS не істейді? | `css/style.css` | Тақырып өлшемі, суретті қию, hover/focus, экранға бейімделу |
| Grid қайда? | `.page-layout-wrapper` | `header header / sidebar main / footer footer` — жалпы бет құрылымы |
| Flexbox қайда? | `.top-bar`, `.movie-grid`, `.movie-card .card-body` | Қатарды орналастыру, орау, карточка мазмұнын бағанға қою |
| Bootstrap қайда? | Әр HTML head/footer маңы; navbar/form/card | CSS/bundle қосылымы және компонент кластары |
| 12-column grid қалай? | `about.html`, `contact.html` | `col-lg-6` — екі баған; `col-lg-4` — үш баған |
| Карусель қалай? | `index.html`: `#movieCarousel` | 9 `.carousel-item`, бір `.active`, индикатор мен батырма target-тері бір ID-ге жалғанған |
| Телефондағы трендтер? | `#trendingPanel` | Bootstrap offcanvas; жабық кезде каталогтан орын алмайды |
| Іздеу/рейтинг қалай? | `js/script.js` | input оқиғасы, деректерді тексеру, localStorage, жоқ элементке кірмеу |
| Форма не істейді? | `contact.html` және submit handler | Браузердің validation тексеруі, CSV файлын жүктеу; backend жоқ |
| Футер неге дұрыс? | Grid footer аймағы және Bootstrap fallback | Толық енде, main ішінен тыс, мазмұннан кейін; fixed емес |

`style.css` өшірілгенде негізгі қаңқаны Bootstrap сақтайды. Бұл екі тәсілді бірге қолданғанымызды көрсетуге мүмкіндік береді. CSS-only галерея мен арнайы media-query жаттығуының безендірілуі сол CSS файлына тәуелді.

## Live modification жаттығулары

1. `index.html` ішіндегі «Кино әлеміне қош келдіңіз» мәтінін өзгерт.
2. Киноның `href` сілтемесін ауыстырып, браузерде қай бет ашылатынын тексер.
3. `.movie-grid` контейнеріндегі `row-cols-lg-4` мәнін `row-cols-lg-3` етіп өзгерт: компьютерде үш кино бір қатарға келеді.
4. `css/style.css` ішіндегі desktop Grid areas қатарын `"main sidebar"` етіп ауыстыр: sidebar оңға өтеді. Қалған header/footer толық енде қалсын.
5. Карусельге оныншы `.carousel-item` және `data-bs-slide-to="9"` индикаторын қос. Дәл бір `.active` қалсын.
6. Формаға label/name/id бар жаңа өріс қосып, JavaScript `columns` массивіне оның name мәнін енгіз.
7. `.page-title` desktop font-size мәнін өзгерт; телефондағы мәтін өлшемі өзгермейтінін көрсет.
8. `about.html` екі бағанын бір бағанға ауыстыр: `col-lg-6` орнына `col-lg-12` қолдан.

Әр өзгерісті сақта, бетті жаңарт және нәтижесін түсіндір. Генераторды қайта іске қоссаң, тікелей HTML өзгерістер қайта жазылады; қорғау кезінде жеке HTML файлдарын өзгерткен оңай.

English opening: “67Films is a responsive cinema catalogue. We combined CSS Grid for the page structure, Flexbox for navigation and cards, and Bootstrap for responsive components. Each film has its own HTML page. I will show my pages, explain the code, and demonstrate a small change.”
