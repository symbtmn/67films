"""Generate all final pages, keeping the 34 film pages and earlier interactions."""
from pathlib import Path
import importlib.util
import runpy
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('pages',root/'tools/build_pages.py')
pages=importlib.util.module_from_spec(spec);spec.loader.exec_module(pages)
pages.build(root,True)
for file,title in [('signup','Тіркелу'),('login','Кіру'),('profile','Жеке профиль'),('discover','Сериалдар')]:
    pages.page(root,file+'.html',title,(root/('data/'+file+'.tpl')).read_text(),True)
    if file=='discover':
        path=root/'discover.html';path.write_text(path.read_text().replace('</head>','<script src="js/tvmaze-client.js?v=final-1" defer></script><script src="js/discover.js?v=final-1" defer></script></head>'))
runpy.run_path(str(root/'tools/build_assignment6.py'))
print('Generated',len(list(root.glob('*.html'))),'final-project pages')
