"""Install regular Noto Serif TC WOFF2 webfont slices from Fontsource's npm archive."""
import json
import re
import tarfile
from pathlib import Path

work = Path('.data-work')
font_dir = Path('src/static/fonts/noto-serif-tc')
font_dir.mkdir(parents=True, exist_ok=True)
with tarfile.open(work / 'fontsource-noto-serif-tc-5.3.1.tgz', 'r:gz') as archive:
    def read(name):
        with archive.extractfile('package/' + name) as resource:
            return resource.read()
    css = read('400.css').decode('utf8')
    css = re.sub(r", url\(\./files/[^)]+\.woff\) format\('woff'\)", '', css)
    for name in re.findall(r'url\(\./files/([^)]*\.woff2)\)', css):
        (font_dir / name).write_bytes(read('files/' + name))
    css = css.replace('url(./files/', 'url(./static/fonts/noto-serif-tc/')
    Path('src/constants/noto-serif-tc-css.json').write_text(json.dumps(css) + '\n', encoding='utf8')
    Path('src/static/licenses/noto-serif-tc.txt').write_bytes(read('LICENSE'))
