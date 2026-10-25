<div class="night-app" id="nightApp">
  <noscript><div class="alert alert-warning">Кино таңдау мен жоспарлау үшін JavaScript қосыңыз. <a href="categories.html">Жанрлар каталогы</a> JavaScript-сіз де ашылады.</div></noscript>
  <section class="night-hero mb-4" aria-labelledby="nightTitle">
    <div>
      <p class="night-eyebrow">67FILMS / КИНО КЕШІ</p>
      <h1 id="nightTitle">Бүгін не көреміз?</h1>
      <p class="mb-3">Көңіл күйге сай кино таңдаңыз.<br>Кеш жоспарын үш қадамда дайындаңыз.</p>
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-light" href="#nightCatalog">Кино таңдау <span aria-hidden="true">↗</span></a>
        <button class="btn night-ghost" type="button" id="surpriseFilm">Маған кино ұсын</button>
      </div>
    </div>
    <div class="night-hero-note" aria-hidden="true"><span class="night-reel">67</span><span>БІР КЕШ.<br>ЖАҚСЫ КИНО.</span></div>
  </section>

  <div class="night-toolbar mb-4">
    <nav id="nightMenu" class="night-section-nav" aria-label="Кино кеші бөлімдері">
      <a href="#nightCatalog">01 Таңдау</a>
      <a href="#nightSelection">02 Бағалау</a>
      <a href="#nightPlanner">03 Жоспарлау</a>
    </nav>
    <div class="d-flex flex-wrap gap-2 align-items-center">
      <button id="soundToggle" class="btn btn-outline-secondary btn-sm" type="button" aria-pressed="false">Дыбыс: өшірулі</button>
      <button id="soundPreview" class="btn btn-outline-secondary btn-sm" type="button" disabled>Дыбысты тыңдау</button>
    </div>
  </div>
  <p id="soundStatus" class="small text-body-secondary" role="status">Дыбысты қаласаңыз қосыңыз. Ол тек әрекет жасағанда ойнайды.</p>
  <p class="visually-hidden" id="nightAnnouncement" role="status" aria-live="polite"></p>

  <section id="nightCatalog" class="mb-5" aria-labelledby="catalogHeading">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
      <div><p class="night-eyebrow text-danger">01 / ТАҢДАУ</p><h2 id="catalogHeading" class="h4 mb-0">Кешке лайық туындылар</h2></div>
      <p id="nightCount" class="small text-body-secondary mb-0" role="status"></p>
    </div>
    <div id="nightFilters" class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Киноны санат бойынша сүзу">
      <button type="button" class="btn btn-sm night-filter is-active" data-night-filter="all" aria-pressed="true">Барлығы</button>
      <button type="button" class="btn btn-sm night-filter" data-night-filter="science" aria-pressed="false">Ғарыш пен қиял</button>
      <button type="button" class="btn btn-sm night-filter" data-night-filter="family" aria-pressed="false">Отбасымен</button>
      <button type="button" class="btn btn-sm night-filter" data-night-filter="anime" aria-pressed="false">Аниме</button>
    </div>
    <div class="night-film-grid" id="nightFilmGrid"></div>
  </section>

  <div class="night-workspace">
    <section id="nightSelection" class="card night-selection" aria-labelledby="selectedTitle">
      <div class="card-body p-3 p-sm-4">
        <p class="night-eyebrow text-danger">02 / СІЗДІҢ ТАҢДАУЫҢЫЗ</p>
        <div class="night-selected-film">
          <img id="selectedPoster" class="night-selected-poster rounded" src="img/5307683948785770049.jpg" alt="Интерстеллар постері" width="180" height="270">
          <div><span id="selectedCategory" class="badge text-bg-secondary mb-2"></span><h2 id="selectedTitle" class="h4"></h2><p id="selectedMeta" class="small text-body-secondary"></p><a id="selectedLink" href="zintersteller.html" class="btn btn-outline-danger btn-sm">Киноның жеке беті ↗</a></div>
        </div>
        <p class="mt-3 mb-2" id="selectedDescription"></p>
        <p class="small text-body-secondary" id="selectedExtra" hidden></p>
        <button id="readMore" type="button" class="btn btn-link text-danger p-0 mb-4" aria-expanded="false" aria-controls="selectedExtra">Толығырақ оқу</button>
        <div class="night-rating-box">
          <h3 class="h6" id="ratingLabel">Осы туындыға баға беріңіз</h3>
          <div id="nightStars" class="night-stars" role="radiogroup" aria-labelledby="ratingLabel">
            <button type="button" class="night-star" role="radio" data-night-star="1" aria-label="1 жұлдыз" aria-checked="false" tabindex="0">★</button>
            <button type="button" class="night-star" role="radio" data-night-star="2" aria-label="2 жұлдыз" aria-checked="false" tabindex="-1">★</button>
            <button type="button" class="night-star" role="radio" data-night-star="3" aria-label="3 жұлдыз" aria-checked="false" tabindex="-1">★</button>
            <button type="button" class="night-star" role="radio" data-night-star="4" aria-label="4 жұлдыз" aria-checked="false" tabindex="-1">★</button>
            <button type="button" class="night-star" role="radio" data-night-star="5" aria-label="5 жұлдыз" aria-checked="false" tabindex="-1">★</button>
          </div>
          <p id="nightRatingText" class="small mb-2" role="status"></p>
          <button id="clearNightRating" type="button" class="btn btn-outline-secondary btn-sm">Бағаны тазалау</button>
        </div>
      </div>
    </section>

    <section id="nightPlanner" class="card" aria-labelledby="plannerHeading">
      <div class="card-body p-3 p-sm-4">
        <p class="night-eyebrow text-danger">03 / КЕШ ЖОСПАРЫ</p>
        <h2 id="plannerHeading" class="h4">Кино кешін жоспарлаңыз</h2>
        <p class="small text-body-secondary">Жеке жоспарыңыз осы бетте көрсетіледі. Билет сатып алу қажет емес.</p>
        <ol id="nightSteps" class="night-steps" aria-label="Жоспарлау қадамдары">
          <li aria-current="step">1. Қонақтар</li><li>2. Уақыт</li><li>3. Тексеру</li>
        </ol>
        <form id="nightPlanForm" novalidate>
          <fieldset data-night-step="0">
            <legend class="h6" tabindex="-1">Кімді шақырамыз?</legend>
            <div class="mb-3"><label class="form-label" for="nightName">Атыңыз</label><input class="form-control" type="text" id="nightName" name="host" autocomplete="name" required minlength="2" maxlength="60" placeholder="Мысалы: Сымбат"></div>
            <div class="mb-3"><label class="form-label" for="nightGuests">Адам саны (өзіңізді қосқанда)</label><input class="form-control" type="number" id="nightGuests" name="guests" min="1" max="12" step="1" value="2" required><div class="form-text">1–12 адам</div></div>
          </fieldset>
          <fieldset data-night-step="1" hidden disabled>
            <legend class="h6" tabindex="-1">Қашан көреміз?</legend>
            <div class="mb-3"><label class="form-label" for="nightDate">Күні</label><input class="form-control" type="date" id="nightDate" name="date" required></div>
            <div class="mb-3"><label class="form-label" for="nightTime">Басталу уақыты</label><input class="form-control" type="time" id="nightTime" name="time" value="19:00" required></div>
            <div class="mb-3"><label class="form-label" for="nightSnack">Киноға не аламыз?</label><select class="form-select" id="nightSnack" name="snack"><option value="Попкорн">Попкорн</option><option value="Шай мен тәтті">Шай мен тәтті</option><option value="Жемістер">Жемістер</option><option value="Таңдаусыз">Таңдаусыз</option></select></div>
          </fieldset>
          <fieldset data-night-step="2" hidden disabled>
            <legend class="h6" tabindex="-1">Жоспарды тексеріңіз</legend>
            <p id="nightGreeting" class="fw-semibold"></p><dl id="nightReview" class="night-review"></dl>
          </fieldset>
          <p id="nightPlanError" class="text-danger small" role="alert" hidden></p>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <button id="nightBack" class="btn btn-outline-secondary" type="button" hidden>Артқа</button>
            <button id="nightNext" class="btn btn-danger" type="button">Келесі →</button>
            <button id="nightSubmit" class="btn btn-danger" type="submit" hidden>Жоспарды дайындау</button>
          </div>
        </form>
        <p class="small text-body-secondary mt-3 mb-0" id="stepStatus" role="status">1 / 3 қадам</p>
        <section id="nightTicket" class="night-ticket mt-4" aria-labelledby="ticketHeading" hidden>
          <span class="badge text-bg-success mb-2">Жоспар дайын</span><h3 id="ticketHeading" class="h5" tabindex="-1">Кино кешіңіз сәтті өтсін!</h3><p id="ticketMessage"></p><dl id="ticketDetails" class="night-review"></dl><button id="nightRestart" type="button" class="btn btn-outline-danger btn-sm">Жаңа жоспар</button>
        </section>
      </div>
    </section>
  </div>
  <p class="small text-body-secondary mt-4">Кеңес: бөлім мәзірінде ← → пернелерін қолданыңыз. Баға жұлдыздарын да пернетақтамен таңдауға болады.</p>
</div>
