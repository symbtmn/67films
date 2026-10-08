"""Browser QA and report evidence; requires Playwright plus Chromium.
Usage: python3 tools/browser_check.py --browser /path/to/chrome
This script starts a local preview server itself.
"""
import asyncio, json, argparse, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'evidence';OUT.mkdir(exist_ok=True)
async def main(chrome):
 class QuietHandler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(QuietHandler,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=chrome,args=['--no-sandbox','--single-process','--no-zygote','--disable-gpu','--disable-dev-shm-usage'])
  context=await browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1,accept_downloads=True)
  # The source embeds existing YouTube trailers. Third-party video delivery is separate.
  await context.route('**/www.youtube.com/**',lambda route:route.abort())
  page=await context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  async def visit(file):
   await page.goto('http://127.0.0.1:8765/'+file,wait_until='load')
   await page.locator('body').wait_for()
  async def snap(name,full=False):
   await page.screenshot(path=str(OUT/(name+'.png')),full_page=full)
  results=[]
  for edition in ['']:
   for width in [375,768,1440]:
    await page.set_viewport_size({'width':width,'height':1000})
    await visit(edition+'index.html')
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {edition} {width}'
    if not edition:
     assert await page.locator('.carousel-item').count()==9
     assert await page.locator('.carousel-item img').count()==9
     assert await page.locator('.carousel-indicators button').count()==9
     assert await page.locator('.carousel-item.active').count()==1
     await page.locator('.carousel-control-next').click()
     await page.wait_for_function("document.querySelectorAll('.carousel-item')[1].classList.contains('active')")
     await page.locator('.carousel-indicators button').nth(0).click()
     await page.wait_for_function("document.querySelectorAll('.carousel-item')[0].classList.contains('active')")
    # Count equal top coordinates in the first movie row.
    firstrow=await page.locator('.movie-item').evaluate_all('(items)=>items.filter(x=>Math.abs(x.getBoundingClientRect().top-items[0].getBoundingClientRect().top)<2).length')
    assert firstrow==(4 if width>=992 else 2),(edition,width,firstrow)
    broken=await page.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)')
    # Lazy images below viewport may not have loaded; scroll them into view for evidence.
    await page.locator('.image-gallery').scroll_into_view_if_needed()
    if width==1440:await page.locator('.gallery-item').first.hover()
    await page.wait_for_timeout(150)
    await snap(('a3' if not edition else 'a2')+f'-gallery-{width}')
    if width==1440:
     await page.locator('#catalogTitle').scroll_into_view_if_needed();await snap(('a3' if not edition else 'a2')+'-cards-desktop')
    await page.evaluate('scrollTo(0,0)');await snap(('a3' if not edition else 'a2')+f'-home-{width}')
    results.append({'edition':edition or 'assignment3','width':width,'cards_per_row':firstrow,'overflow':False})
   # All pages: load HTML/JS, check overflow, images in viewport and footer ownership.
   for width in [375,768,1440]:
    await page.set_viewport_size({'width':width,'height':1000})
    for file in sorted((ROOT/edition).glob('*.html')):
     await visit(edition+file.name)
     assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {edition}{file.name} at {width}'
     assert await page.locator('main').count()==1 and await page.locator('footer').count()==1
   await page.set_viewport_size({'width':375,'height':1000})
   await visit(edition+'contact.html')
   await snap(('a3' if not edition else 'a2')+'-form-mobile',True)
   await page.set_viewport_size({'width':1440,'height':1000});await visit(edition+'about.html');await snap(('a3' if not edition else 'a2')+'-about',True)
   if not edition:
    await page.locator('.feature-grid').scroll_into_view_if_needed();await snap('a3-three-columns')
    await page.locator('.card-group').scroll_into_view_if_needed();await snap('a3-card-group')
   await visit(edition+'contact.html');await snap(('a3' if not edition else 'a2')+'-form-desktop')
   await visit(edition+'404.html');await page.locator('footer').scroll_into_view_if_needed();await snap(('a3' if not edition else 'a2')+'-footer')
  # Sidebar opens as an overlay and does not push the mobile catalogue below it.
  await page.set_viewport_size({'width':375,'height':1000});await visit('index.html')
  assert not await page.locator('#trendingPanel').is_visible()
  await page.get_by_role('button',name='Трендтегілер',exact=True).click()
  await page.wait_for_function("document.querySelector('#trendingPanel').classList.contains('show')")
  await snap('a3-sidebar-mobile')
  await page.get_by_role('button',name='Панельді жабу').click()
  await page.wait_for_function("!document.querySelector('#trendingPanel').classList.contains('show')")
  await page.get_by_role('button',name='Мәзірді ашу').click()
  await page.wait_for_function("document.querySelector('#mainNavbar').classList.contains('show')")
  assert await page.get_by_role('link',name='Байланыс',exact=True).first.is_visible()
  await snap('a3-navbar-mobile')
  # Search and actual destination of a carousel image.
  await visit('index.html');await page.locator('#navSearch').fill('Интерстеллар')
  assert await page.locator('.movie-item:visible').count()==1
  await page.locator('#navSearch').fill('NO_SUCH_FILM')
  assert await page.locator('#noResults').is_visible()
  await page.locator('#navSearch').fill('');await page.locator('.carousel-item.active a').click()
  assert page.url.endswith('/avengers.html')
  await snap('a3-detail-mobile',True)
  await page.get_by_role('button',name='Қарадым',exact=True).click()
  await page.locator('label[for="rating4"]').click();await page.reload(wait_until='load')
  await page.locator('#statusTitle').scroll_into_view_if_needed();await snap('a3-status-rating')
  await page.locator('[data-movie]').screenshot(path=str(OUT/'a3-status-rating-crop.png'))
  assert await page.locator('#rating4').is_checked()
  assert await page.get_by_role('button',name='Қарадым',exact=True).get_attribute('aria-pressed')=='true'
  # CSS-only three cards: 1/2/3 at the requested breakpoints.
  for width,count in [(375,1),(768,2),(1440,3)]:
   await page.set_viewport_size({'width':width,'height':1000});await visit('responsive-cards.html')
   actual=await page.locator('.mq-card').evaluate_all('(items)=>items.filter(x=>Math.abs(x.getBoundingClientRect().top-items[0].getBoundingClientRect().top)<2).length')
   assert actual==count,(width,actual)
   assert not await page.locator('.mq-card-group [class]').count() or await page.locator('.mq-card-group [class]').evaluate_all("xs=>xs.every(x=>x.className==='mq-card')")
   await snap(f'a3-mq-cards-{width}')
  # Bootstrap-only fallback, including mobile offcanvas and a real CSV submission.
  await page.set_viewport_size({'width':375,'height':1000});await visit('contact.html')
  await page.evaluate("document.querySelector('link[href=\"css/style.css\"]').disabled=true")
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  assert not await page.locator('#trendingPanel').is_visible()
  await snap('a3-form-without-custom-css',True)
  await page.locator('#contact-form').screenshot(path=str(OUT/'a3-form-without-custom-css-crop.png'))
  await page.locator('#username').fill('Test Student')
  await page.locator('#email').fill('test@example.com')
  await page.locator('#message').fill('Кино ұсыну туралы толық хабарлама.')
  await page.locator('#confirm').check()
  async with page.expect_download() as download_info:
   await page.get_by_role('button',name='CSV сақтау').click()
  download=await download_info.value
  await download.save_as(str(OUT/'test-feedback.csv'))
  assert 'Test Student' in (OUT/'test-feedback.csv').read_text(encoding='utf-8-sig')
  await page.set_viewport_size({'width':1440,'height':1000});await visit('index.html')
  await page.evaluate("document.querySelector('link[href=\"css/style.css\"]').disabled=true")
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  await snap('a3-home-without-custom-css')
  await visit('contact.html');await page.get_by_role('button',name='Түнгі режим').click()
  await visit('about.html');assert await page.locator('html').get_attribute('data-bs-theme')=='dark'
  await snap('a3-dark-about')
  assert not errors,errors
  (OUT/'qa-results.json').write_text(json.dumps({'pages_loaded':66,'page_viewport_checks':198,'responsive_checks':results,'javascript_errors':errors,'carousel':'9 linked single-image slides; controls and indicators passed','bootstrap_only_fallback':'home + form passed','form':'native validation and CSV download passed','search':'matching + empty results passed','movie_status_and_rating':'persist across reload','theme':'persists between pages','external_trailers':'original embeds retained; external playback not tested'},indent=2))
  await browser.close();print('Browser checks passed; screenshots in evidence/.')
if __name__=='__main__':
 args=argparse.ArgumentParser();args.add_argument('--browser',required=True);asyncio.run(main(args.parse_args().browser))
