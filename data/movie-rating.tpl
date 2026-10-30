<div class="night-app" id="nightApp"><nav id="nightMenu" class="night-section-nav mb-4" aria-label="Кино кеші бөлімдері"><a href="movie-night.html">Кино таңдау</a><a href="gallery.html">Галерея</a><a href="movie-rating.html">Бағалау</a><a href="planner.html">Кешті жоспарлау</a></nav><h1 class="page-title mb-3">Киноға баға беру</h1><p class="intro-text text-body-secondary mb-4">Туындыны таңдаңыз және өз бағаңызды қалдырыңыз.</p><label for="featureMovie" class="form-label">Кино таңдаңыз</label><select id="featureMovie" class="form-select mb-4"></select><section aria-labelledby="selectedTitle" class="card night-selection" id="nightSelection">
<div class="card-body p-3 p-sm-4">

<div class="night-selected-film">
<img alt="Интерстеллар постері" class="night-selected-poster rounded" height="270" id="selectedPoster" src="img/5307683948785770049.jpg" width="180"/>
<div><span class="badge text-bg-secondary mb-2" id="selectedCategory"></span><h2 class="h4" id="selectedTitle"></h2><p class="small text-body-secondary" id="selectedMeta"></p><a class="btn btn-outline-danger btn-sm" href="zintersteller.html" id="selectedLink">Киноның жеке беті ↗</a></div>
</div>
<p class="mt-3 mb-2" id="selectedDescription"></p>
<p class="small text-body-secondary" hidden="" id="selectedExtra"></p>
<button aria-controls="selectedExtra" aria-expanded="false" class="btn btn-link text-danger p-0 mb-4" id="readMore" type="button">Толығырақ оқу</button>
<div class="night-rating-box">
<h3 class="h6" id="ratingLabel">Осы туындыға баға беріңіз</h3>
<div aria-labelledby="ratingLabel" class="night-stars" id="nightStars" role="radiogroup">
<button aria-checked="false" aria-label="1 жұлдыз" class="night-star" data-night-star="1" role="radio" tabindex="0" type="button">★</button>
<button aria-checked="false" aria-label="2 жұлдыз" class="night-star" data-night-star="2" role="radio" tabindex="-1" type="button">★</button>
<button aria-checked="false" aria-label="3 жұлдыз" class="night-star" data-night-star="3" role="radio" tabindex="-1" type="button">★</button>
<button aria-checked="false" aria-label="4 жұлдыз" class="night-star" data-night-star="4" role="radio" tabindex="-1" type="button">★</button>
<button aria-checked="false" aria-label="5 жұлдыз" class="night-star" data-night-star="5" role="radio" tabindex="-1" type="button">★</button>
</div>
<p class="small mb-2" id="nightRatingText" role="status"></p>
<button class="btn btn-outline-secondary btn-sm" id="clearNightRating" type="button">Бағаны тазалау</button>
</div>
</div>
</section></div>