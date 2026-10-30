<div class="night-app" id="nightApp"><nav id="nightMenu" class="night-section-nav mb-4" aria-label="Кино кеші бөлімдері"><a href="movie-night.html">Кино таңдау</a><a href="gallery.html">Галерея</a><a href="movie-rating.html">Бағалау</a><a href="planner.html">Кешті жоспарлау</a></nav><h1 class="page-title mb-3">Кино кешін жоспарлау</h1><p class="intro-text text-body-secondary mb-4">Киноны таңдаңыз. Қонақтар мен уақытты үш қадамда жоспарлаңыз.</p><label for="featureMovie" class="form-label">Кино таңдаңыз</label><select id="featureMovie" class="form-select mb-4"></select><section aria-labelledby="plannerHeading" class="card" id="nightPlanner">
<div class="card-body p-3 p-sm-4">

<h2 class="h4" id="plannerHeading">Кино кешін жоспарлаңыз</h2>
<p class="small text-body-secondary">Жеке жоспарыңыз осы бетте көрсетіледі. Билет сатып алу қажет емес.</p>
<ol aria-label="Жоспарлау қадамдары" class="night-steps" id="nightSteps">
<li aria-current="step">1. Қонақтар</li><li>2. Уақыт</li><li>3. Тексеру</li>
</ol>
<form id="nightPlanForm" novalidate="">
<fieldset data-night-step="0">
<legend class="h6" tabindex="-1">Кімді шақырамыз?</legend>
<div class="mb-3"><label class="form-label" for="nightName">Атыңыз</label><input autocomplete="name" class="form-control" id="nightName" maxlength="60" minlength="2" name="host" placeholder="Мысалы: Сымбат" required="" type="text"/></div>
<div class="mb-3"><label class="form-label" for="nightGuests">Адам саны (өзіңізді қосқанда)</label><input class="form-control" id="nightGuests" max="12" min="1" name="guests" required="" step="1" type="number" value="2"/><div class="form-text">1–12 адам</div></div>
</fieldset>
<fieldset data-night-step="1" disabled="" hidden="">
<legend class="h6" tabindex="-1">Қашан көреміз?</legend>
<div class="mb-3"><label class="form-label" for="nightDate">Күні</label><input class="form-control" id="nightDate" name="date" required="" type="date"/></div>
<div class="mb-3"><label class="form-label" for="nightTime">Басталу уақыты</label><input class="form-control" id="nightTime" name="time" required="" type="time" value="19:00"/></div>
<div class="mb-3"><label class="form-label" for="nightSnack">Киноға не аламыз?</label><select class="form-select" id="nightSnack" name="snack"><option value="Попкорн">Попкорн</option><option value="Шай мен тәтті">Шай мен тәтті</option><option value="Жемістер">Жемістер</option><option value="Таңдаусыз">Таңдаусыз</option></select></div>
</fieldset>
<fieldset data-night-step="2" disabled="" hidden="">
<legend class="h6" tabindex="-1">Жоспарды тексеріңіз</legend>
<p class="fw-semibold" id="nightGreeting"></p><dl class="night-review" id="nightReview"></dl>
</fieldset>
<p class="text-danger small" hidden="" id="nightPlanError" role="alert"></p>
<div class="d-flex flex-wrap gap-2 mt-3">
<button class="btn btn-outline-secondary" hidden="" id="nightBack" type="button">Артқа</button>
<button class="btn btn-danger" id="nightNext" type="button">Келесі →</button>
<button class="btn btn-danger" hidden="" id="nightSubmit" type="submit">Жоспарды дайындау</button>
</div>
<button class="btn btn-outline-secondary mt-3" id="nightReset" type="reset">Reset</button></form>
<p class="small text-body-secondary mt-3 mb-0" id="stepStatus" role="status">1 / 3 қадам</p>
<section aria-labelledby="ticketHeading" class="night-ticket mt-4" hidden="" id="nightTicket">
<span class="badge text-bg-success mb-2">Жоспар дайын</span><h3 class="h5" id="ticketHeading" tabindex="-1">Кино кешіңіз сәтті өтсін!</h3><p id="ticketMessage"></p><dl class="night-review" id="ticketDetails"></dl><button class="btn btn-outline-danger btn-sm" id="nightRestart" type="button">Жаңа жоспар</button>
</section>
</div>
</section><section class="card mt-4"><div class="card-body"><h2 class="h6">Кино кешінің дыбысы</h2><button id="soundToggle" type="button" class="btn btn-outline-secondary btn-sm" aria-pressed="false">Дыбыс: өшірулі</button> <button id="soundPreview" type="button" class="btn btn-outline-secondary btn-sm" disabled>Дыбысты тыңдау</button><p id="soundStatus" class="small mt-2" role="status">Дыбысты қаласаңыз қосыңыз.</p></div></section></div>