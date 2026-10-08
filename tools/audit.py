"""No dependencies required. Audit links, IDs and assignment invariants."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
ROOT=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(); self.ids=[];self.links=[];self.counts={};self.slides=0;self.indicators=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.counts[tag]=self.counts.get(tag,0)+1
  if 'id' in a:self.ids.append(a['id'])
  for attr in ['src','href']:
   if attr in a:self.links.append(a[attr])
  if 'carousel-item' in a.get('class','').split():self.slides+=1
  if 'data-bs-slide-to' in a:self.indicators+=1
  if tag=='img' and not a.get('alt'):raise AssertionError('Image without alt text')
pages=0
for edition in [ROOT]:
 for file in edition.glob('*.html'):
  text=file.read_text();p=Parser();p.feed(text);pages+=1
  assert len(p.ids)==len(set(p.ids)),f'{file}: duplicate IDs'
  assert p.counts.get('main')==1 and p.counts.get('footer')==1,f'{file}: main/footer count'
  assert 'Symbat Abdirakhman' in text and 'Akerke Zulpubek' in text,f'{file}: authors'
  for link in p.links:
   parsed=urlsplit(link)
   if parsed.scheme or link.startswith('#'):continue
   target=file.parent/unquote(parsed.path)
   assert target.exists(),f'{file}: missing {target}'
  assert 'vendor/bootstrap.min.css' in text and 'vendor/bootstrap.bundle.min.js' in text
index=Parser();index.feed((ROOT/'index.html').read_text())
assert index.slides==9 and index.indicators==9
print(f'PASS: {pages} pages, local links/assets, IDs, author names, Bootstrap imports, and 9-slide carousel.')
