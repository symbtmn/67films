"""Assignment 4 behavior/evidence checks. Requires Playwright and a browser.
Example: python3 tools/assignment4_check.py --browser /path/to/headless-shell
Use --engine firefox or webkit with the matching executable for cross-engine checks.
"""
import argparse,asyncio,functools,json,os,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'evidence/assignment4';OUT.mkdir(parents=True,exist_ok=True)
async def run(args):
 class Quiet(SimpleHTTPRequestHandler):
  def log_message(self,*a):pass
 port={'chromium':8767,'firefox':8768,'webkit':8769}[args.engine]
 server=ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  options={'executable_path':args.browser,'timeout':20000}
  if args.engine=='chromium':options['args']=['--no-sandbox','--single-process','--no-zygote','--disable-gpu','--disable-dev-shm-usage']
  if args.engine=='firefox':
   options['env']={**os.environ,'MOZ_DISABLE_CONTENT_SANDBOX':'1','MOZ_DISABLE_RDD_SANDBOX':'1','MOZ_DISABLE_GMP_SANDBOX':'1'}
   options['firefox_user_prefs']={'security.sandbox.content.level':0,'dom.ipc.processCount':1,'fission.autostart':False}
  browser=await getattr(p,args.engine).launch(**options)
  context=await browser.new_context(viewport={'width':1440,'height':1100},timezone_id='Asia/Almaty')
  await context.route('**/www.youtube.com/**',lambda route:route.abort())
  page=await context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  async def visit(file):await page.goto(f'http://127.0.0.1:{port}/'+file,wait_until='load')
  async def snap(name,locator=None):
   if args.engine=='chromium':
    if locator:await locator.screenshot(path=str(OUT/(name+'.png')))
    else:await page.screenshot(path=str(OUT/(name+'.png')))
  await visit('club.html');await snap('overview')
  member=page.locator('#member-form');submit=member.locator('button[type=submit]')
  await submit.click();assert await member.locator('.is-invalid').count()==5
  assert await member.locator('[data-error-summary]').is_visible()
  await page.locator('#memberName').fill('Film Viewer')
  await page.locator('#memberEmail').fill('wrong-email')
  await page.locator('#memberPassword').fill('short')
  await page.locator('#memberConfirm').fill('other')
  await page.locator('#memberConsent').check();await submit.click()
  assert await member.locator('.is-invalid').count()==3
  assert 'email' in await page.locator('#memberEmail-error').inner_text()
  assert '8' in await page.locator('#memberPassword-error').inner_text()
  assert 'бірдей' in await page.locator('#memberConfirm-error').inner_text()
  await snap('task1-errors',page.locator('#joinClub .card'))
  await page.locator('#memberEmail').fill('viewer@example.com')
  await page.locator('#memberPassword').fill('MoviePass2026!')
  await page.locator('#memberConfirm').fill('Different2026!');await submit.click()
  assert await member.locator('.is-invalid').count()==1
  await page.locator('#memberConfirm').fill('MoviePass2026!');await submit.click()
  assert 'сәтті' in await member.locator('[data-form-status]').inner_text()
  assert await page.locator('#memberPassword').input_value()==''
  assert await page.locator('#memberConfirm').input_value()==''
  assert 'MoviePass' not in await page.evaluate('JSON.stringify(localStorage)')
  assert not await member.locator('[data-error-summary]').is_visible()
  await snap('task1-success',page.locator('#joinClub .card'))
  await member.locator('button[type=reset]').click()
  assert await member.locator('[data-form-status]').inner_text()==''
  assert await page.locator('#memberName').input_value()==''
  # Task 2: default state, smooth opening, closing, rapid toggling, keyboard.
  await visit('faq.html');buttons=page.locator('[data-faq-toggle]');panels=page.locator('.faq-panel')
  assert await buttons.count()==5
  assert await panels.evaluate_all('ps=>ps.every(p=>p.hidden)')
  faq=page.locator('.faq-list');await snap('task2-closed',faq)
  await buttons.first.click();assert await buttons.first.get_attribute('aria-expanded')=='true'
  await page.wait_for_function("document.querySelector('.faq-panel').getBoundingClientRect().height>20")
  assert await panels.first.evaluate("p=>getComputedStyle(p).transitionDuration.includes('0.25')")
  await page.wait_for_timeout(300);await snap('task2-open',faq)
  await buttons.first.click();await page.wait_for_function("document.querySelector('.faq-panel').hidden")
  for _ in range(3):await buttons.first.click()
  await page.wait_for_timeout(300);assert not await panels.first.evaluate('p=>p.hidden')
  await buttons.nth(1).focus();await page.keyboard.press('Enter')
  assert await buttons.nth(1).get_attribute('aria-expanded')=='true'
  # Task 3: closed by default, focus confinement, validation and all close paths.
  await visit('club.html');dialog=page.locator('#newsletter-dialog')
  assert not await dialog.is_visible()
  trigger=page.locator('[data-newsletter-open]').first;await trigger.click()
  assert await dialog.is_visible()
  for _ in range(9):
   await page.keyboard.press('Tab')
   assert await dialog.evaluate('d=>d.contains(document.activeElement)')
  await snap('task3-popup-desktop',dialog)
  form=page.locator('#newsletter-form');await form.locator('button[type=submit]').click()
  assert await form.locator('.is-invalid').count()==3
  await page.locator('#newsletterName').fill('Film Viewer')
  await page.locator('#newsletterEmail').fill('viewer@example.com')
  await page.locator('#newsletterConsent').check();await form.locator('button[type=submit]').click()
  assert 'тексерілді' in await form.locator('[data-form-status]').inner_text()
  await page.locator('[data-newsletter-close]').click();assert not await dialog.is_visible()
  assert await trigger.evaluate('b=>document.activeElement===b')
  await trigger.click();await page.mouse.click(2,2);assert not await dialog.is_visible()
  await trigger.click();await page.keyboard.press('Escape');assert not await dialog.is_visible()
  await page.wait_for_function("!document.body.classList.contains('newsletter-open')")
  # Task 4: cycle all four colors, persist selection, remain readable in dark mode.
  await visit('club.html');background=page.locator('#background-toggle')
  first=await page.locator('body').evaluate('b=>b.style.backgroundColor');seen=[]
  await snap('task4-before')
  for i in range(4):
   await background.click();seen.append(await page.locator('body').evaluate('b=>b.style.backgroundColor'))
   if i==0:
    await page.wait_for_timeout(300);await snap('task4-after')
  assert len(set(seen))==4 and seen[-1]==first
  await background.click();chosen=await page.locator('body').evaluate('b=>b.style.backgroundColor')
  await visit('about.html');assert chosen==await page.locator('body').evaluate('b=>b.style.backgroundColor')
  await page.locator('#theme-toggle').click()
  await page.wait_for_function("old=>document.documentElement.dataset.bsTheme==='dark'&&document.body.style.backgroundColor!==old",arg=chosen)
  assert chosen!=await page.locator('body').evaluate('b=>b.style.backgroundColor')
  await page.locator('#theme-toggle').click()
  # Task 5: parseable machine datetime and a real interval update in local time.
  await visit('club.html');clock=page.locator('main [data-live-clock]')
  assert 'Asia/Almaty' in await page.locator('main [data-clock-zone]').inner_text()
  assert await clock.evaluate('c=>Math.abs(Date.now()-Date.parse(c.dateTime))<2000')
  await snap('task5-clock-first',page.locator('.clock-card'))
  previous=await clock.get_attribute('datetime')
  await page.wait_for_function("old=>document.querySelector('main [data-live-clock]').dateTime!==old",arg=previous)
  await snap('task5-clock-updated',page.locator('.clock-card'))
  # Responsive behavior: real popup and validation at three phone/tablet sizes.
  for width,height in [(320,568),(375,812),(768,1024)]:
   await page.set_viewport_size({'width':width,'height':height});await visit('club.html')
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await page.locator('[data-newsletter-open]').first.click()
   assert await dialog.is_visible()
   box=await dialog.bounding_box();assert box['x']>=0 and box['width']<=width and box['height']<=height
   if width==375:await snap('task3-popup-mobile')
   await page.keyboard.press('Escape');assert not await dialog.is_visible()
   await member.locator('button[type=submit]').click();assert await member.locator('.is-invalid').count()==5
   if width==375:await snap('task1-mobile',page.locator('#joinClub .card'))
  # Existing Bootstrap drawer and compact poster must keep working.
  await page.set_viewport_size({'width':375,'height':1000});await visit('index.html')
  await page.get_by_role('button',name='Трендтегілер',exact=True).click()
  await page.wait_for_function("document.querySelector('#trendingPanel').classList.contains('show')&&!document.querySelector('#trendingPanel').classList.contains('showing')")
  assert await page.locator('#trendingPanel').evaluate("p=>[200,500,800].every(y=>p.contains(document.elementFromPoint(150,y)))")
  await page.get_by_role('button',name='Панельді жабу').click()
  await visit('zchelovekpauk.html');box=await page.locator('.detail-poster').bounding_box()
  assert box['width']<=180 and box['height']<=270
  # HTML/JS imports and horizontal overflow on every complete page.
  widths=[375,768,1440] if args.engine=='chromium' else [375,1440]
  pages=sorted(ROOT.glob('*.html'))
  for width in widths:
   await page.set_viewport_size({'width':width,'height':1000})
   for file in pages:
    await visit(file.name)
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(args.engine,width,file.name)
    assert await page.locator('footer').count()==1
    assert await page.locator('[data-live-clock]').first.get_attribute('datetime')
  assert not errors,errors
  version=browser.version;await browser.close()
  result={'engine':args.engine,'version':version,'pages':len(pages),'page_viewport_checks':len(pages)*len(widths),'form_validation':'required fields, email, password length, mismatch, success, live correction, reset and no password storage passed','accordion':'default hidden, open, close, rapid clicks, keyboard and smooth transition passed','popup':'default hidden, trigger, validation, close button, outside click, Escape and focus confinement passed','background':'four-color cycle, persistence and dark-mode palette passed','clock':'Date datetime, local timezone and interval update passed','mobile':'320, 375 and 768 px interactive checks passed','regressions':'compact detail posters and trending panel paint order passed','javascript_errors':errors}
  (OUT/(args.engine+'-results.json')).write_text(json.dumps(result,indent=2))
  print(json.dumps(result),flush=True)
 server.shutdown()
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--browser',required=True);parser.add_argument('--engine',default='chromium',choices=['chromium','firefox','webkit']);asyncio.run(run(parser.parse_args()))
