"""Build the illustrated Assignment 4 submission report from real browser evidence.
Run after assignment4_check.py; the report includes the team and member names.
"""
from pathlib import Path
import json
from datetime import datetime,timezone,timedelta
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,Table,TableStyle,PageBreak,Flowable,Preformatted
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'evidence/assignment4'
OUT=ROOT.parent/'output';OUT.mkdir(exist_ok=True)
PDF=OUT/'67Films_Assignment4_Report.pdf'
for name,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Mono','DejaVuSansMono.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
BRAND=colors.HexColor('#8b1538');INK=colors.HexColor('#17202a');MUTED=colors.HexColor('#526171')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyA4',fontName='Body',fontSize=9.2,leading=13.4,textColor=INK,spaceAfter=8))
styles.add(ParagraphStyle(name='TitleA4',fontName='Bold',fontSize=28,leading=33,textColor=BRAND,spaceAfter=14))
styles.add(ParagraphStyle(name='HeadingA4',fontName='Bold',fontSize=16,leading=21,textColor=BRAND,spaceAfter=12))
styles.add(ParagraphStyle(name='SubA4',fontName='Bold',fontSize=10.5,leading=14,textColor=INK,spaceBefore=6,spaceAfter=6))
styles.add(ParagraphStyle(name='CaptionA4',fontName='Body',fontSize=8,leading=11,textColor=MUTED,spaceAfter=9,alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CodeA4',fontName='Mono',fontSize=8,leading=11,textColor=INK,backColor=colors.HexColor('#f3f5f7'),borderPadding=8,spaceBefore=5,spaceAfter=10))
P=lambda t:Paragraph(t,styles['BodyA4'])
H=lambda t:Paragraph(t,styles['HeadingA4'])
S=lambda t:Paragraph(t,styles['SubA4'])
C=lambda t:Preformatted(t,styles['CodeA4'])
flow=[]
def add(*items):flow.extend(items)
def image(name,w=490,h=480):
 im=Image(str(E/name));im._restrictSize(w,h);im.hAlign='CENTER';return im
def caption(t):return Paragraph(t,styles['CaptionA4'])
def steps(items):
 for i,t in enumerate(items,1):add(P(f'<b>{i}.</b> {t}'))
def table(rows,widths):
 formatted=[[P(str(x)) for x in row] for row in rows]
 t=Table(formatted,colWidths=widths,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#f4e9ee')),('LINEBELOW',(0,0),(-1,0),1,BRAND),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,1),(-1,-1),.35,colors.HexColor('#d8dce0'))]))
 return t
def footer(c,doc):
 c.setStrokeColor(BRAND);c.setLineWidth(.7);c.line(42,807,553,807)
 c.setFont('Bold',8);c.setFillColor(BRAND);c.drawString(42,817,'67FILMS  /  ASSIGNMENT 4')
 c.setFont('Body',7);c.setFillColor(MUTED);c.drawString(42,25,'Symbat Abdirakhman  |  Akerke Zulpubek');c.drawRightString(553,25,str(doc.page))
# 1: team, objective and complete rubric.
add(Paragraph('Introduction to<br/>JavaScript',styles['TitleA4']),P('<b>Assignment 4 - Cinema catalogue project</b>'),P('<b>Team:</b> 67Films<br/><b>Members:</b> Symbat Abdirakhman and Akerke Zulpubek'),S('Objective'),P('Extend the existing responsive cinema catalogue with five custom JavaScript components: form validation, an animated FAQ, a subscription popup, a background-color control, and a live local clock. Preserve the existing film pages, Bootstrap layout and mobile fixes.'),P('<b>Deployed demonstration:</b> <link href="https://symbtmn.github.io/67films/club.html" color="#8b1538">https://symbtmn.github.io/67films/club.html</link>'),table([['Criterion','Points','Evidence in this report'],['Form validation','15','Pages 2-3'],['FAQ accordion','15','Page 4'],['Popup form','10','Page 5'],['Background color','5','Page 6'],['Current date and time','5','Page 7'],['Report','10','Steps, screenshots, tests and reflection'],['Individual practice defense','40','Preparation and live-change checklist, page 9']],[180,48,283]),Spacer(1,12),P('<b>Project structure:</b> 68 complete HTML pages, shared local Bootstrap assets, separate JavaScript files for each task, and complete author footers. The club and FAQ pages are new; film content remains available.'),P('<b>Scope:</b> membership and subscription forms are transparent frontend demos. They validate inputs but create no accounts, send no email and store no passwords.'))
# 2: invalid form input, at readable screenshot size.
add(PageBreak(),H('Task 1 / Form validation'),P('<b>Files:</b> club.html, js/validation.js. <b>Criterion:</b> required input, email format, password length, password confirmation and clear errors.'),S('Implementation steps'))
steps(['Create labeled name, email, password, confirmation and consent fields with HTML required/type/minlength attributes.','Listen for submit and call preventDefault(). Check each field with errorMessage(); display a text error, an invalid style and aria-invalid.','Reject blank values, malformed email, passwords shorter than eight characters and mismatched confirmation. Focus the first invalid field.'])
add(image('task1-errors.png',w=418,h=510),caption('Actual browser result: malformed email, a short password and different confirmation produce three distinct errors.'))
# 3: correction and successful validation.
add(PageBreak(),H('Task 1 / Correction and success'),S('Successful and incomplete submissions'))
steps(['Submitting the empty form marks all five required inputs. The error summary reports the number of fields to correct.','The input listener updates errors while typing. Changing the password also rechecks its confirmation.','After valid input, show success and clear the two password inputs. Reset clears the form and messages. No credentials are saved or sent.'])
add(C("const MIN_PASSWORD_LENGTH = 8;\nif (!validate(memberForm)) return;\npassword.value = '';\ndocument.getElementById('memberConfirm').value = '';"),image('task1-success.png',w=418,h=449),caption('Successful validation after the inputs were corrected. Password fields are cleared. The UI explicitly states that no real account was created.'),P('<b>Tests passed:</b> blank form; invalid email; short password; mismatched confirmation; live correction; valid input; reset; no password value in localStorage.'))
# 4: two real accordion states.
add(PageBreak(),H('Task 2 / Animated FAQ accordion'),P('<b>Files:</b> faq.html, club.html, js/accordion.js, css/style.css. Five cinema-related questions use native buttons and associated answer regions.'),S('Implementation steps'))
steps(['Give each button a unique aria-controls target and aria-expanded="false". Set answers hidden by default.','On click, toggle the state and the is-open class. CSS animates grid-template-rows from 0fr to 1fr and changes opacity.','On close, hide the answer after the animation. Cancel old timers during rapid clicks; respect reduced-motion settings. Native buttons also support keyboard activation.'])
add(image('task2-closed.png',w=500,h=180),caption('Default state: all five answers are hidden.'),image('task2-open.png',w=500,h=205),caption('After clicking the first question: its answer is visible and the other questions remain available.'),C("const open = button.getAttribute('aria-expanded') !== 'true';\nbutton.setAttribute('aria-expanded', String(open));\npanel.classList.add('is-open');"),P('<b>Tests passed:</b> initial hidden state, open, second-click close, animation duration, repeated rapid clicks, Enter-key activation.'))
# 5: popup on desktop and mobile.
add(PageBreak(),H('Task 3 / Subscription popup'),P('<b>Files:</b> data/newsletter.tpl, every generated HTML page, js/newsletter.js. The popup starts closed and appears only after clicking a subscription button.'),S('Implementation steps'))
steps(['Use a labeled native dialog so it appears in the top layer. Bind header and club buttons to showModal().','Close with the X button, an outside click or Escape. Restore focus to the original trigger and remove the scroll-lock class.','Keep Tab focus inside the popup and reuse the validator for name, email and consent. Display a demo success message after valid input.'])
left=image('task3-popup-desktop.png',w=238,h=350);right=image('task3-popup-mobile.png',w=230,h=498)
t=Table([[left,right]],colWidths=[255,256]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]));add(t,caption('Left: desktop dialog. Right: the same popup in a 375 px phone viewport.'),P('<b>Tests passed:</b> default closed, opening, internal keyboard focus, invalid/valid form input, X close, outside-click close, Escape close and restored scrolling/focus.'))
# 6: background before/after, palette and implementation.
add(PageBreak(),H('Task 4 / Change background color'),P('<b>File:</b> js/background.js. The header button cycles through four predefined options. Light and dark variants preserve readable contrast.'),S('Implementation steps'))
steps(['Store named light/dark colors in a palettes array and read a valid saved numeric index if storage is available.','On click, calculate the next index with modulo and assign document.body.style.backgroundColor. Update the button label.','Save the numeric choice. Observe data-bs-theme so changing the theme applies the matching light/dark variant. CSS provides the smooth color transition.'])
add(image('task4-before-crop.png',w=500,h=100),caption('Before: classic light background.'),image('task4-after-crop.png',w=500,h=100),caption('After one click: the page background changes to the warm palette.'),C("index = (index + 1) % palettes.length;\ndocument.body.style.backgroundColor = dark\n  ? palettes[index].dark : palettes[index].light;"),table([['Palette','Light color','Dark color'],['Classic','#ffffff','#212529'],['Warm','#fff1e6','#30251f'],['Blue','#e7f1ff','#17283d'],['Purple','#f1eaff','#2b203d']],[180,165,166]),Spacer(1,8),P('<b>Tests passed:</b> four distinct colors, full cycle back to the initial color, persistence between pages and a different readable palette after dark mode is enabled. Storage failures are caught so the button still works.'))
# 7: actual clock frames and code.
add(PageBreak(),H('Task 5 / Current date and time'),P('<b>File:</b> js/clock.js. A live clock appears in every footer and in a prominent card on the cinema-club page.'),S('Implementation steps'))
steps(['Create a fresh Date object inside updateClock(). Format it with Intl.DateTimeFormat using the viewer\'s local timezone.','Write readable text to each time element and set its datetime attribute to an ISO string. Show the resolved timezone next to the clock.','Call the function immediately, then use setInterval(updateClock, 1000). Refresh again when the page becomes visible after being in the background.'])
add(image('task5-clock-first.png',w=445,h=165),caption('First captured clock state; timezone is Asia/Almaty in the test browser.'),image('task5-clock-updated.png',w=445,h=165),caption('Later captured state: the visible seconds and machine-readable datetime update.'),C("function updateClock() {\n  const now = new Date();\n  clock.textContent = formatter.format(now);\n  clock.dateTime = now.toISOString();\n}\nsetInterval(updateClock, 1000);"),P('<b>Tests passed:</b> readable output, parseable ISO datetime close to Date.now(), correct configured local timezone, and a real interval tick that changes the displayed time. Formatting follows the browser\'s supported locale data.'))
# 8: tests and actual deployment record, refreshed after publication.
chromium=json.loads((E/'chromium-results.json').read_text());firefox=json.loads((E/'firefox-results.json').read_text())
deployment=json.loads((E/'deployment.json').read_text()) if (E/'deployment.json').exists() else {}
add(PageBreak(),H('Deployment and verification'),S('Shared repository and deployed website'),P('<b>Repository:</b> <link href="https://github.com/symbtmn/67films">https://github.com/symbtmn/67films</link><br/><b>Website:</b> <link href="https://symbtmn.github.io/67films/">https://symbtmn.github.io/67films/</link><br/><b>Assignment demonstration:</b> <link href="https://symbtmn.github.io/67films/club.html">https://symbtmn.github.io/67films/club.html</link>'))
if deployment:
 add(P('<b>Deployment:</b> '+escape(deployment.get('conclusion','pending'))+'<br/><b>Published commit:</b> '+escape(deployment.get('sha',''))),P('<b>Live verification:</b> '+escape(deployment.get('verification','Pending'))))
else:add(P('<b>Deployment status:</b> final live verification is pending in this preparation copy.'))
steps(['Commit the generated HTML, five custom scripts, stylesheet, sources and documentation to the shared main branch.','Let the existing GitHub Pages workflow rebuild the site. Confirm its successful conclusion.','Check the live club/FAQ pages, updated stylesheet and all five JavaScript files against the tested source. Include the deployed URL in the report and LMS submission.'])
add(S('Browser and responsiveness evidence'),table([['Engine','Version','Page/viewport checks'],['Chromium',chromium['version'],str(chromium['page_viewport_checks'])],['Firefox',firefox['version'],str(firefox['page_viewport_checks'])]],[155,155,201]),Spacer(1,10),P('Every one of the 68 complete HTML pages was loaded at 375, 768 and 1440 px in Chromium, and at 375 and 1440 px in Firefox. Interactive forms and popup behavior were additionally tested at 320, 375 and 768 px. No horizontal overflow or JavaScript page errors were found.'),P('The existing small film posters and mobile trending-drawer paint order also passed regression checks. This is browser viewport simulation, not a claim of physical-device testing. Safari on a physical iPhone was not tested here.'),S('Reproduce the checks'),C('npm test\nnpm run build\npython3 tools/assignment4_check.py --browser /path/to/chrome\npython3 tools/assignment4_check.py --engine firefox \\\n  --browser /path/to/firefox'),P('Evidence: evidence/assignment4/chromium-results.json and firefox-results.json; real browser screenshots accompany the project archive. The source-tree hash was compared before publication so the published files match the tested version.'))
# 9: reflection and defense, no fabricated ownership claims.
add(PageBreak(),H('Reflection and practice defense'),S('Project reflection'),P('The main challenge was coordinating several interactions across a large static site. Shared scripts must work on pages that do not contain every component, so each script checks for its target before binding events. Reusable validation prevents the membership and popup forms from producing inconsistent errors.'),P('The popup required particular attention to keyboard focus and closing behavior. Browser tests caught differences in event timing and focus navigation. The solution combines native dialog behavior with an explicit Tab loop and cleanup through the close event. The FAQ also needs cancelled timers so rapid clicks do not hide an answer that has just reopened.'),P('The result is a more interactive cinema catalogue with consistent feedback and readable color choices. Future production work would require a server for real accounts and subscriptions. This assignment deliberately keeps those forms as frontend demos and avoids storing passwords.'),S('Component responsibilities to confirm'),table([['Member','Suggested components to review and defend'],['Symbat Abdirakhman','Form validation and subscription popup'],['Akerke Zulpubek','FAQ accordion, background colors and live clock']],[180,331]),Spacer(1,7),P('This table is a preparation allocation, not a claim about unverified individual authorship. Each student must confirm actual contributions, understand teammates\' components and adapt this reflection to their own experience.'),S('Live modification practice'),P('1. Change MIN_PASSWORD_LENGTH from 8 to 10 and test both boundaries.<br/>2. Add a new FAQ with unique matching button/panel IDs.<br/>3. Add a genre option in the popup form.<br/>4. Add a fifth light/dark palette object.<br/>5. Change the clock refresh interval and demonstrate the effect.'),S('Final submission checklist'),P('Each member submits the report and ZIP before the LMS deadline. Open the deployed site and source code during practice, explain the event handlers and DOM updates, and complete the instructor\'s live task. The 40-point defense is assessed individually.'),S('References'),P('Course handout: Frontend Assignment 4 - Introduction to JavaScript.<br/>MDN: HTMLDialogElement.showModal(), client-side form validation, and JavaScript Date.<br/><link href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal">developer.mozilla.org - showModal</link> · <link href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation">form validation</link> · <link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date">Date</link>'))
doc=SimpleDocTemplate(str(PDF),pagesize=(595.28,841.89),rightMargin=42,leftMargin=42,topMargin=47,bottomMargin=43,title='67Films - Assignment 4 JavaScript Report',author='67Films: Symbat Abdirakhman and Akerke Zulpubek')
doc.build(flow,onFirstPage=footer,onLaterPages=footer)
print(PDF)
