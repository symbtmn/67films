"""Generate complete static pages. Run: python3 tools/build_pages.py.

One final project combines Assignment 2 Flexbox/Grid and Assignment 3 Bootstrap.
The published HTML never depends on this generator or Python.
"""
from pathlib import Path
from html import escape as esc
from html.parser import HTMLParser
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/catalog.json').read_text())
MOVIES = DATA['movies']
BYFILE = {m['file']: m for m in MOVIES}
GENRES = [
    ('Фильмдер', [('xfantastika.html','Фантастика'),('xboevik.html','Боевик'),('xfentezi.html','Фэнтези'),('xprikliucheniya.html','Шытырман'),('xdrama.html','Драма'),('xtriller.html','Триллер'),('xdetektiv.html','Детектив')]),
    ('Сериалдар', [('xkomediya.html','Комедиялық сериалдар'),('xmelodrama.html','Мелодрамалар'),('xtarihy.html','Тарихи сериалдар')]),
    ('Мультфильмдер', [('xanimatsia.html','Толықметражды'),('xmultserial.html','Мультсериалдар'),('xotbasylyk.html','Отбасылық'),('xmuzikalik.html','Музыкалық')]),
    ('Аниме', [('xsionen.html','Сёнэн'),('xmistika.html','Мистика'),('xanimeboevik.html','Экшн және боевик'),('xskazka.html','Ертегі және фэнтези')]),
    ('Дорамалар', [('xdorama.html','Оңтүстік Кореялық'),('xromantika.html','Романтика'),('xdoramatriller.html','Триллер және қорқынышты'),('xdoramagistorya.html','Тарихи дорамалар')]),
]
GENRE_NAMES = {file: name for _, pairs in GENRES for file, name in pairs}
NAMES = 'Symbat Abdirakhman, Akerke Zulpubek'

class PrettyHTML(HTMLParser):
    """Readable static output without requiring a template library."""
    VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.lines=[]
        self.depth=0
        self.join_next=False
    def line(self,text):
        self.lines.append('  '*self.depth+text)
    def handle_decl(self,decl):
        self.line('<!'+decl+'>')
    def handle_starttag(self,tag,attrs):
        self.line(self.get_starttag_text())
        if tag not in self.VOID:
            self.depth+=1
    def handle_endtag(self,tag):
        self.depth=max(0,self.depth-1)
        self.line('</'+tag+'>')
    def handle_data(self,text):
        if text.strip():
            if self.join_next:
                self.lines[-1]+=text
                self.join_next=False
            else:
                self.line(text.strip('\n'))
    def handle_entityref(self,name):
        self.lines[-1]+='&'+name+';'
        self.join_next=True
    def handle_charref(self,name):
        self.lines[-1]+='&#'+name+';'
        self.join_next=True

def formatted_html(text):
    formatter=PrettyHTML()
    formatter.feed(text)
    return '\n'.join(formatter.lines)+'\n'

def header(bs, current):
    links = [('index.html','Басты бет'),('categories.html','Санаттар'),('about.html','Біз туралы'),('contact.html','Байланыс')]
    navlinks = ''.join(f'<li class="nav-item"><a class="nav-link{" active" if current == file else ""}" href="{file}" {"aria-current=\"page\"" if current == file else ""}>{name}</a></li>' for file,name in links)
    dropdowns = ''
    for name,pairs in GENRES:
        items = ''.join(f'<li><a class="dropdown-item" href="{file}">{label}</a></li>' for file,label in pairs)
        if bs:
            dropdowns += f'<li class="nav-item dropdown"><button class="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">{name}</button><ul class="dropdown-menu">{items}</ul></li>'
        else:
            dropdowns += f'<li><details class="genre-menu"><summary>{name}</summary><ul>{items}</ul></details></li>'
    search = '<form class="site-search input-group" action="index.html" method="get" role="search"><label class="visually-hidden" for="navSearch">Кино іздеу</label><input id="navSearch" name="q" type="search" class="form-control" placeholder="Кино атауын іздеу…" maxlength="100"><button class="btn btn-outline-danger" type="submit">Іздеу</button></form>'
    if bs:
        return f'''<header class="grid-header bg-body border-bottom">
  <div class="container-fluid px-3 px-lg-4 py-3 top-bar d-flex flex-wrap align-items-center justify-content-between gap-3">
    <a class="logo text-decoration-none fs-3 fw-bold text-body" href="index.html">67 <span class="text-danger">FILMS</span></a>
    {search}
    <button id="theme-toggle" type="button" class="btn btn-outline-secondary btn-sm" aria-pressed="false">Түнгі режим</button>
  </div>
  <nav class="navbar navbar-expand-lg bg-body-tertiary px-3 px-lg-4 py-2" aria-label="Негізгі навигация">
    <div class="container-fluid p-0">
      <button class="btn btn-outline-danger btn-sm d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#trendingPanel" aria-controls="trendingPanel">Трендтегілер</button>
      <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Мәзірді ашу"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="mainNavbar"><ul class="navbar-nav flex-wrap align-items-lg-center gap-lg-2 mb-0">{navlinks}{dropdowns}</ul></div>
    </div>
  </nav>
</header>'''
    return f'''<header class="grid-header"><div class="top-bar"><a class="logo" href="index.html">67 <span>FILMS</span></a><nav aria-label="Негізгі навигация"><ul class="custom-nav">{navlinks}</ul></nav></div><div class="header-tools">{search}<button id="theme-toggle" type="button" class="btn" aria-pressed="false">Түнгі режим</button><ul class="custom-nav">{dropdowns}</ul></div></header>'''

def sidebar(bs):
    items = ''.join(f'<a class="list-group-item list-group-item-action py-3 px-0 border-start-0 border-end-0" href="{m["href"]}"><span class="d-block fw-semibold">{esc(m["short"])}</span><small class="text-body-secondary">{esc(m["meta"])}</small></a>' for m in MOVIES[:8])
    body = f'<h2 class="h5 fw-bold mb-3" id="trendingTitle">Трендтегілер</h2><div class="list-group list-group-flush">{items}</div><section class="mt-4"><h3 class="h6">Кино әлемі</h3><p class="small text-body-secondary mb-2">Туындыларды жанр бойынша таңдаңыз, трейлер көріңіз және жеке бағаңызды сақтаңыз.</p><a class="btn btn-outline-danger btn-sm" href="premieres.html">Премьералар</a></section>'
    if bs:
        return f'''<aside class="col-lg-2 grid-sidebar p-0 p-lg-3" aria-label="Трендтегі туындылар"><div class="offcanvas-lg offcanvas-start bg-body" tabindex="-1" id="trendingPanel" aria-labelledby="trendingTitle"><div class="offcanvas-header d-lg-none"><span class="fw-bold">67FILMS</span><button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#trendingPanel" aria-label="Панельді жабу"></button></div><div class="offcanvas-body d-block p-3 p-lg-0">{body}</div></div></aside>'''
    return f'<aside class="grid-sidebar"><details class="trending-details" open><summary>Трендтегілер</summary><div>{body}</div></details></aside>'

def footer(bs):
    return f'''<footer class="grid-footer bg-body-tertiary border-top px-3 px-lg-4 py-4 mt-auto"><div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"><div><a class="fw-bold text-body text-decoration-none" href="index.html">67FILMS</a><p class="small text-body-secondary mb-0">Кино, сериал, аниме және дорама каталогы.</p></div><nav class="d-flex flex-wrap gap-3" aria-label="Футер навигациясы"><a href="about.html">Біз туралы</a><a href="contact.html">Байланыс</a><a href="categories.html">Санаттар</a></nav></div><p class="small mb-0 mt-3">Created by: <strong>{NAMES}</strong></p></footer>'''

def card(m,bs):
    alt = esc(m['short']); href=m['href']
    content = f'''<a href="{href}" class="poster-link ratio ratio-4x3"><img class="card-img-top object-fit-cover w-100 h-100" src="{m['image']}" alt="{alt} постері" width="480" height="360" loading="lazy"></a>
    <div class="card-body d-flex flex-column p-3"><span class="badge text-bg-danger align-self-start mb-2">{esc(m['kind'])}</span><h3 class="h6 card-title"><a class="text-body text-decoration-none" href="{href}">{alt}</a></h3><p class="card-text small text-body-secondary">{esc(m['meta'])}</p><a class="btn btn-outline-danger btn-sm mt-auto align-self-start" href="{href}">Толығырақ<span class="visually-hidden">: {alt}</span></a></div>'''
    article=f'<article class="card movie-card h-100 w-100">{content}</article>'
    return f'<div class="col d-flex movie-item" data-search="{esc(m["short"]+" "+m["title"]+" "+m["meta"],quote=True)}">{article}</div>' if bs else f'<article class="card movie-card movie-item" data-search="{esc(m["short"]+" "+m["title"]+" "+m["meta"],quote=True)}">{content}</article>'

def cards(files,bs):
    movies=[BYFILE[f] for f in files]
    return '<div class="row row-cols-2 row-cols-lg-4 g-3 movie-grid align-items-stretch">'+''.join(card(m,bs) for m in movies)+'</div><p id="noResults" class="alert alert-secondary mt-3" role="status" hidden>Бұл атаумен кино табылмады.</p>'

def gallery(bs):
    figures=''
    for m in MOVIES[:9]:
        figures+=f'<figure class="gallery-item m-0"><a href="{m["href"]}"><img class="img-fluid w-100" src="{m["image"]}" alt="{esc(m["short"])}" width="480" height="360" loading="lazy"><figcaption class="bg-dark text-white p-2">{esc(m["short"])}</figcaption></a></figure>'
    return f'<section class="mt-5" aria-labelledby="galleryTitle"><h2 id="galleryTitle" class="h4 mb-3">Постерлер галереясы</h2><div class="image-gallery gap-3">{figures}</div></section>'

def carousel():
    selection=[BYFILE[f] for f in ['avengers.html','zcherezvseleni.html','zgaryshsakshylary.html','ztemiradam.html','zragnarek.html','zdoctorstrang.html','zintersteller.html','zbastau.html','zqaraseri.html']]
    indicators=''.join(f'<button type="button" data-bs-target="#movieCarousel" data-bs-slide-to="{i}" {"class=\"active\" aria-current=\"true\"" if i==0 else ""} aria-label="Слайд {i+1}: {esc(m["short"])}"></button>' for i,m in enumerate(selection))
    slides=''.join(f'''<div class="carousel-item{' active' if i==0 else ''}"><a href="{m['href']}" class="d-block ratio ratio-21x9 bg-dark"><img src="{m['image']}" class="w-100 h-100 object-fit-cover" alt="{esc(m['short'])} — кино бетін ашу" width="1280" height="720"></a><div class="carousel-caption bg-dark bg-opacity-75 rounded p-2"><p class="fw-bold mb-0">{esc(m['short'])}</p><small>{i+1} / 9</small></div></div>''' for i,m in enumerate(selection))
    return f'''<section class="mb-4" aria-label="Ұсынылған тоғыз кино"><div class="row"><div class="col-12"><div id="movieCarousel" class="carousel slide" aria-roledescription="карусель" aria-label="Кино таңдауы"><div class="carousel-indicators">{indicators}</div><div class="carousel-inner rounded">{slides}</div><button class="carousel-control-prev" type="button" data-bs-target="#movieCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Алдыңғы кино</span></button><button class="carousel-control-next" type="button" data-bs-target="#movieCarousel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Келесі кино</span></button></div></div></div></section>'''

def homepage(bs):
    return f'''<h1 class="page-title mb-2">Кино әлеміне қош келдіңіз</h1><p class="intro-text text-body-secondary mb-4">Сүйікті туындыңызды табыңыз. Жанрды таңдаңыз, трейлерді көріңіз, әсеріңізді сақтаңыз.</p>{carousel() if bs else ''}<section aria-labelledby="catalogTitle"><div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h2 id="catalogTitle" class="h4 mb-0">Барлық туындылар</h2><a class="btn btn-danger btn-sm" href="categories.html">Жанр таңдау</a></div><p id="searchSummary" class="small text-body-secondary" role="status"></p>{cards([m['file'] for m in MOVIES],bs)}</section>{gallery(bs)}'''

def status(m):
    values=[('watching','Көріп жатырмын'),('watched','Қарадым'),('will_watch','Көремін'),('dropped','Тастадым'),('not_watched','Көрген жоқпын')]
    buttons=''.join(f'<button class="btn btn-outline-danger btn-sm status-btn" type="button" data-status="{key}" aria-pressed="false">{label}</button>' for key,label in values)
    radios=''.join(f'<input class="btn-check" type="radio" name="rating" value="{i}" id="rating{i}"><label class="btn btn-outline-danger" for="rating{i}">{i} ★<span class="visually-hidden"> — 5-тен {i} ұпай</span></label>' for i in range(1,6))
    return f'''<section class="mt-4" data-movie="{esc(m['file'])}" aria-labelledby="statusTitle"><h2 class="h5" id="statusTitle">Менің көру статусым</h2><div class="btn-toolbar gap-2" role="toolbar" aria-label="Көру статусын таңдау">{buttons}</div><p id="feedbackText" class="small mt-3" role="status"></p><fieldset id="ratingBox" class="border-0 p-0" hidden><legend class="h6">Фильмге баға беріңіз</legend><div class="btn-group" role="group" aria-label="Бес ұпайлық баға">{radios}</div><p id="ratingResult" class="small mt-2" role="status"></p></fieldset></section>'''

def detail(m,bs):
    rows=''.join(f'<tr><th scope="row">{esc(row[0])}</th><td>{esc(row[1])}</td></tr>' for row in m['details'] if len(row)==2 and row[0]!='Сапасы:')
    trailer=m['trailer']
    trailerblock=f'''<section class="mt-4"><h2 class="h5 mb-3">Трейлер</h2><div class="ratio ratio-16x9 video-responsive"><iframe src="{esc(trailer,quote=True)}" title="{esc(m['short'],quote=True)} трейлері" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="small mt-2 mb-0"><a href="{esc(trailer.replace('/embed/','/watch?v='),quote=True)}" target="_blank" rel="noopener noreferrer">Трейлерді YouTube сайтында ашу</a></p></section>''' if trailer else ''
    rec=[x['file'] for x in MOVIES if x['file']!=m['file']][:4]
    return f'''<nav aria-label="Бет жолы"><ol class="breadcrumb mb-3"><li class="breadcrumb-item"><a href="index.html">Басты бет</a></li><li class="breadcrumb-item active" aria-current="page">{esc(m['short'])}</li></ol></nav><h1 class="page-title mb-4">{esc(m['title'])}</h1><div class="row g-4 movie-details-flex"><div class="col-6 col-sm-4 col-lg-3 mx-auto mx-sm-0"><img class="img-fluid rounded detail-poster" src="{m['image']}" alt="{esc(m['short'])} постері" width="480" height="640"></div><div class="col-12 col-sm-8 col-lg-9"><div class="table-responsive"><table class="table align-middle"><caption class="visually-hidden">{esc(m['short'])} туралы ақпарат</caption><tbody>{rows}</tbody></table></div><h2 class="h5">Сюжет</h2><p class="intro-text">{esc(m['description'])}</p></div></div>{trailerblock}{status(m)}<section class="mt-5"><h2 class="h4 mb-3">Қарап шығуға кеңес береміз</h2>{cards(rec,bs)}</section>'''

def about(bs):
    authors=[('Әбдірахман Сымбат','img/5309935748599455000.jpg','Веб құрылымы, навигация және негізгі функциялар.'),('Зұлпубек Ақерке','img/5309935748599455006.jpg','Кино карточкалары, жанрлар және медиа мазмұны.')]
    columns=''.join(f'<div class="col-12 col-lg-6"><article class="card h-100"><div class="card-body p-4"><img src="{image}" alt="{name}" class="rounded-circle author-avatar mb-3" width="120" height="120"><h2 class="h4">{name}</h2><p>{bio}</p><span class="badge text-bg-secondary">HTML / CSS / JavaScript</span></div></article></div>' for name,image,bio in authors)
    highlights=[('Таңдау','34 туынды мен тақырыптық жанрлар.'),('Көру','Әр киноның сипаттамасы мен трейлері.'),('Сақтау','Жеке көру статусы мен 5 ұпайлық баға.')]
    three=''.join(f'<div class="col-12 col-sm-6 col-lg-4"><article class="card h-100"><div class="card-body p-3"><h3 class="h5">{a}</h3><p class="mb-0">{b}</p></div></article></div>' for a,b in highlights)
    group = '<section class="mt-5"><h2 class="h4 mb-3">Көруге арналған үш таңдау</h2><div class="card-group gap-3">'+''.join(card(m,False) for m in MOVIES[:3])+'</div></section>' if bs else ''
    return f'<h1 class="page-title mb-3">Біз туралы</h1><p class="intro-text mb-4">67Films — фильмдер, сериалдар, аниме және дорамаларды бір жерден табуға арналған оқу жобасы.</p><section class="row g-4 author-grid mt-3 mt-lg-4" aria-label="Жоба авторлары">{columns}</section><section class="mt-5" aria-labelledby="featuresTitle"><h2 class="h4 mb-3" id="featuresTitle">Сайт мүмкіндіктері</h2><div class="row g-3 feature-grid">{three}</div></section>{group}'

def contact(bs):
    return '''<h1 class="page-title mb-3">Байланыс және кері байланыс</h1><p class="intro-text mb-4">Кино ұсыныңыз немесе сайттағы қатені сипаттаңыз.</p><div class="row g-4 contact-layout mt-3 mt-lg-4"><section class="col-12 col-lg-6"><div class="card h-100"><div class="card-body p-4"><h2 class="h4">67Films командасы</h2><p>Symbat Abdirakhman және Akerke Zulpubek</p><p>Astana IT University, Астана.</p><a href="https://github.com/symbtmn/67films" class="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">Жоба репозиторийі</a><p id="formHelp" class="small text-body-secondary mt-4 mb-0">Бұл оқу формасы: хабарлама серверге жіберілмейді. Деректеріңіз CSV файлы ретінде құрылғыңызға жүктеледі.</p></div></div></section><section class="col-12 col-lg-6"><div class="card"><div class="card-body p-4"><h2 class="h4 mb-3">Кино ұсыну</h2><form id="contact-form" aria-describedby="formHelp"><div class="mb-3"><label class="form-label" for="username">Атыңыз</label><input class="form-control" id="username" name="username" type="text" autocomplete="name" minlength="2" maxlength="80" required></div><div class="mb-3"><label class="form-label" for="email">Электронды пошта</label><div class="input-group"><span class="input-group-text" aria-hidden="true">@</span><input class="form-control" id="email" name="email" type="email" autocomplete="email" maxlength="120" required></div></div><div class="mb-3"><label class="form-label" for="category">Санат</label><select class="form-select" id="category" name="category"><option value="suggest">Кино ұсыну</option><option value="bug">Қате хабарлау</option><option value="other">Басқа сұрақ</option></select></div><fieldset class="mb-3"><legend class="h6">Ұсынылатын туынды түрі</legend><div class="form-check"><input class="form-check-input" type="radio" name="contentType" id="typeMovie" value="movie" checked><label class="form-check-label" for="typeMovie">Фильм</label></div><div class="form-check"><input class="form-check-input" type="radio" name="contentType" id="typeSeries" value="series"><label class="form-check-label" for="typeSeries">Сериал / аниме / дорама</label></div></fieldset><div class="mb-3"><label class="form-label" for="message">Хабарламаңыз</label><textarea class="form-control" id="message" name="message" rows="5" minlength="10" maxlength="2000" required></textarea></div><div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="confirm" name="confirm" required><label class="form-check-label" for="confirm">CSV файлды өз құрылғыма сақтауға келісемін.</label></div><div class="d-flex flex-wrap gap-2"><button class="btn btn-danger btn-lg" type="submit">CSV сақтау</button><button class="btn btn-outline-secondary" type="reset">Тазалау</button></div><p id="formStatus" class="small mt-3 mb-0" role="status"></p><noscript><p>CSV сақтау үшін JavaScript қосыңыз.</p></noscript></form></div></div></section></div>'''

def categories(bs):
    groups=''
    for name,pairs in GENRES:
        groups+=f'<div class="col-12 col-sm-6 col-lg-4"><section class="card h-100"><div class="card-body p-3"><h2 class="h5">{name}</h2><ul class="list-unstyled mb-0">'+''.join(f'<li class="mb-2"><a href="{file}">{label}</a> <span class="text-body-secondary small">({len(DATA["genres"][file])})</span></li>' for file,label in pairs)+'</ul></div></section></div>'
    return f'<h1 class="page-title mb-3">Санаттар</h1><p class="intro-text mb-4">Көргіңіз келетін туындыны жанры бойынша таңдаңыз.</p><div class="row g-3 categories-grid">{groups}</div>'

def layout_lab(bs):
    # This three-card exercise deliberately has NO Bootstrap classes in its subtree.
    three=''.join(f'<article class="mq-card"><img src="{m["image"]}" alt="{esc(m["short"])}" width="480" height="360"><div><h2>{esc(m["short"])}</h2><p>{esc(m["meta"])}</p><a href="{m["href"]}">Киноны ашу</a></div></article>' for m in MOVIES[:3])
    return f'<h1 class="page-title mb-3">Кино таңдауы</h1><p class="intro-text mb-4">Классика, сериал және аниме: осы үш туындыдан бастаңыз.</p><section class="mq-card-group" aria-label="Үш кино таңдауы">{three}</section>'

def page(dest,file,title,body,bs):
    css='<link rel="stylesheet" href="vendor/bootstrap.min.css">' if bs else ''
    js='<script src="vendor/bootstrap.bundle.min.js" defer></script>' if bs else ''
    head=f'''<!DOCTYPE html>
<html lang="kk" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="67Films кино каталогы: жанрлар, сипаттамалар және трейлерлер.">
  <title>{esc(title)} | 67Films</title>
  {css}
  <link rel="stylesheet" href="css/style.css?v=mobile-2">
  {js}
  <script src="js/script.js" defer></script>
</head>
<body>
<a class="skip-link visually-hidden-focusable" href="#mainContent">Негізгі мазмұнға өту</a>
'''
    if bs:
        shell=f'''<div class="page-layout-wrapper min-vh-100 d-flex flex-column">{header(True,file)}<div class="content-shell container-fluid px-3 px-lg-4 py-4 flex-grow-1"><div class="row g-4">{sidebar(True)}<main class="col-12 col-lg-10 grid-main p-3 p-lg-4" id="mainContent" tabindex="-1">{body}</main></div></div>{footer(True)}</div>'''
    else:
        shell=f'<div class="page-layout-wrapper">{header(False,file)}{sidebar(False)}<main class="grid-main" id="mainContent" tabindex="-1">{body}</main>{footer(False)}</div>'
    (dest/file).write_text(formatted_html(head+shell+'\n</body>\n</html>\n'))

def build(dest,bs):
    dest.mkdir(exist_ok=True)
    page(dest,'index.html','Басты бет',homepage(bs),bs)
    page(dest,'about.html','Біз туралы',about(bs),bs)
    page(dest,'contact.html','Байланыс',contact(bs),bs)
    page(dest,'categories.html','Санаттар',categories(bs),bs)
    page(dest,'responsive-cards.html','Кино таңдауы',layout_lab(bs),bs)
    for file,name in GENRE_NAMES.items():
        page(dest,file,name,f'<h1 class="page-title mb-2">{name}</h1><p class="intro-text text-body-secondary mb-4">Жанрдағы туындылар: {len(DATA["genres"][file])}</p>{cards(DATA["genres"][file],bs)}',bs)
    for m in MOVIES:
        page(dest,m['file'],m['short'],detail(m,bs),bs)
    page(dest,'movies.html','Танымал туындылар','<h1 class="page-title mb-4">Танымал туындылар</h1>'+cards([m['file'] for m in MOVIES[:8]],bs),bs)
    page(dest,'premieres.html','Премьералар','<h1 class="page-title mb-4">Премьералар және жаңа таңдаулар</h1>'+cards(['odyssey.html','zhvataisonja.html','zopengamer.html'],bs),bs)
    page(dest,'announcements.html','Жаңалықтар','<h1 class="page-title mb-3">Кино әлеміндегі жаңалықтар</h1><p class="intro-text">Жанрлық каталогты қарап, көру тізіміңізге жаңа туынды қосыңыз.</p><a class="btn btn-danger" href="premieres.html">Премьераларды көру</a>',bs)
    page(dest,'chablon.html','Кино беті',detail(BYFILE['zetikigenmysyq.html'],bs),bs)
    page(dest,'404.html','Бет табылмады','<h1 class="page-title mb-3">404 — Бет табылмады</h1><p>Басты беттен киноны іздеп көріңіз.</p><a href="index.html" class="btn btn-danger">Басты бетке оралу</a>',bs)

if __name__=='__main__':
    build(ROOT,True)
    print('Generated',len(list(ROOT.glob('*.html'))),'combined project pages.')
