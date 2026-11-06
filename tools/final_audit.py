"""Validate final-project deliverables without relying on browser constraint APIs."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
root=Path(__file__).resolve().parents[1]
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.forms=0;self.ids=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for key in ['href','src']:
   if key in a:self.links.append(a[key])
  if tag=='form':self.forms+=1;assert 'novalidate' in a,'Form missing novalidate'
  if tag in ['input','textarea','select']:
   assert not set(a).intersection({'required','pattern','minlength','maxlength','min','max'}),'Native validation constraint'
   assert a.get('type')!='email','Native email type'
graph={};forms=0
for page in root.glob('*.html'):
 p=Audit();p.feed(page.read_text());forms+=p.forms;graph[page.name]=[]
 assert len(p.ids)==len(set(p.ids)),page
 for link in p.links:
  url=urlsplit(link)
  if url.scheme or link.startswith('#'):continue
  file=unquote(url.path)
  if file.endswith('.html'):graph[page.name].append(file)
visited=set();queue=['index.html']
while queue:
 page=queue.pop()
 if page in visited:continue
 visited.add(page);queue.extend(name for name in graph.get(page,[]) if name in graph)
core=['index.html','jquery.html','discover.html','about.html','contact.html','signup.html','login.html','profile.html']
assert set(core)<=visited,'Core pages disconnected'
for name in ['script.js','validation.js','jquery-assignment.js','movie-night.js']:
 s=(root/'js'/name).read_text();assert not re.search(r'\.(?:checkValidity|reportValidity|setCustomValidity)\s*\(',s),name
for file in core:
 s=(root/file).read_text();assert 'js/theme-init.js' in s and 'js/auth.js' in s and 'css/final.css' in s,file
assert 'fetcher(' in (root/'js/tvmaze-client.js').read_text()
assert 'localStorage.setItem(ACCOUNT_KEY' in (root/'js/auth.js').read_text()
print(f'PASS: {len(graph)} pages; {forms} custom-validated forms; 8 core pages connected; theme/auth assets and API client present.')
