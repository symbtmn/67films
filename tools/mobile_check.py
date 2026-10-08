"""Regression check for compact posters and drawer stacking on mobile.
Requires Playwright; pass the Chromium/headless-shell path as the only argument.
"""
import asyncio,functools,json,sys,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def check(chrome):
 class QuietHandler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(QuietHandler,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=chrome,args=['--no-sandbox','--single-process','--no-zygote','--disable-gpu','--disable-dev-shm-usage'])
  context=await browser.new_context()
  await context.route('**/www.youtube.com/**',lambda route:route.abort())
  page=await context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  for width,height in [(320,568),(375,812),(390,844),(430,932),(768,1024),(1440,1000)]:
   await page.set_viewport_size({'width':width,'height':height})
   for file in ['zchelovekpauk.html','avengers.html','odyssey.html']:
    await page.goto('http://127.0.0.1:8766/'+file,wait_until='load')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,file)
    poster=await page.locator('.detail-poster').bounding_box()
    if width<576:assert poster['width']<=180 and poster['height']<=270,(width,file,poster)
    results.append({'page':file,'width':width,'poster_width':round(poster['width'],1),'poster_height':round(poster['height'],1)})
    if width==375 and file=='zchelovekpauk.html':
     await page.locator('.page-title').scroll_into_view_if_needed()
     await page.screenshot(path=str(ROOT/'evidence/mobile-small-poster.png'))
   for file in ['index.html','contact.html','zchelovekpauk.html']:
    await page.goto('http://127.0.0.1:8766/'+file,wait_until='load')
    panel=page.locator('#trendingPanel')
    if width<992:
     assert not await panel.is_visible()
     trigger=page.get_by_role('button',name='Трендтегілер',exact=True)
     await trigger.click()
     await page.wait_for_function("document.querySelector('#trendingPanel').classList.contains('show')&&!document.querySelector('#trendingPanel').classList.contains('showing')")
     # Real paint/hit-test order, including the carousel/card transform layers.
     assert await panel.evaluate("p=>[100,innerHeight/2,innerHeight-30].every(y=>p.contains(document.elementFromPoint(p.getBoundingClientRect().width/2,y)))"),(width,file,'drawer covered')
     box=await panel.bounding_box()
     assert box['width']<=width-47 and abs(box['height']-height)<1,(width,file,box)
     if width==375 and file=='index.html':await page.screenshot(path=str(ROOT/'evidence/mobile-trending-fixed.png'))
     await page.get_by_role('button',name='Панельді жабу').click()
     await page.wait_for_function("!document.querySelector('#trendingPanel').classList.contains('show')&&!document.querySelector('#trendingPanel').classList.contains('hiding')")
     assert await page.locator('.offcanvas-backdrop').count()==0
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    else:
     assert await panel.is_visible()
     assert await page.locator('.grid-sidebar').evaluate("x=>getComputedStyle(x).display!=='contents'")
  await page.set_viewport_size({'width':375,'height':812})
  await page.goto('http://127.0.0.1:8766/zchelovekpauk.html')
  await page.evaluate("document.querySelector('link[href^=\"css/style.css\"]').disabled=true")
  assert await page.locator('.detail-poster').evaluate('p=>p.getBoundingClientRect().width<innerWidth/2')
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  await browser.close()
 (ROOT/'evidence/mobile-fix-results.json').write_text(json.dumps({'poster_checks':results,'drawer_checks':18,'mobile_drawer_open_close_checks':15,'drawer_hit_test':'Passed at top, middle and bottom of each open panel','javascript_errors':errors,'bootstrap_only_poster_fallback':'passed'},indent=2))
 print('PASS: compact posters, drawer paint order/open/close, desktop sidebar, and Bootstrap fallback.')
 server.shutdown()
if __name__=='__main__':asyncio.run(check(sys.argv[1]))
