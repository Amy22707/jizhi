"""Build extension data from the pinned source files documented in docs/data-sources.md."""
import hashlib
import json
import re
from pathlib import Path
from collections import Counter

WORK = Path('.data-work')
OUT = Path('src/constants')
def load(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))
def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

song_titles = load(Path(__file__).with_name('song-ci-titles.json'))

themes = {
    'spring': '春|桃花|柳|芳草|燕子|東風|东风',
    'landscape': '山|江|湖|溪|瀑|泉|峰|嶺|岭',
    'autumn': '秋|落葉|落叶|霜|楓|枫|菊',
    'night': '月|夜|星|銀河|银河',
    'snow': '雪|冰|寒梅|銀裝|银装',
}
def tags(text):
    return [name for name, pattern in themes.items() if re.search(pattern, text)]

def han(text):
    return bool(re.fullmatch(r'[㐀-䶿一-鿿]+', text))

def extract(works, dynasty, tier, source):
    for work in works:
        author = work.get('author', '').strip()
        title = (work.get('title') or work.get('rhythmic') or '').strip()
        if not han(author) or len(author) > 12 or not title or len(title) > 36 or re.search('[□�<>〈〉]', title):
            continue
        if dynasty == '宋':
            title = song_titles['tunes'].get(title, title)
            paragraphs = work.get('paragraphs', [])
            if paragraphs:
                opening = paragraphs[0].strip()
                subtitle = song_titles['subtitles'].get(f'{author}|{opening}')
                if not subtitle:
                    first_line = re.split(r'[，。！？；：,.!?;:]', opening, maxsplit=1)[0]
                    subtitle = re.sub(r'\s+', '', first_line)
                if subtitle:
                    title = f'{title}·{subtitle}'
        candidates = []
        for paragraph in work.get('paragraphs', []):
            text = re.sub(r'\s+', '', paragraph)
            if dynasty == '唐':
                m = re.fullmatch(r'([㐀-䶿一-鿿]{5}|[㐀-䶿一-鿿]{7})，([㐀-䶿一-鿿]+)[。！？]', text)
                if not m or len(m[1]) != len(m[2]):
                    continue
            elif not re.fullmatch(r'[㐀-䶿一-鿿，、]{10,25}[。！？]', text):
                continue
            if '□□' in text or '其一' in text:
                continue
            candidates.append(text)
        # Prefer self-contained images, then use a stable tie-breaker.
        candidates.sort(key=lambda x: (-len(tags(x)), hashlib.sha256(x.encode()).digest()))
        for text in candidates[:(2 if tier == 'featured' else 1)]:
            key = re.sub('[，、。！？]', '', text)
            yield key, dict(id=hashlib.sha256(key.encode()).hexdigest()[:20], content=text,
                            author=author, title=title, dynasty=dynasty, source=source,
                            tier=tier, tags=tags(text))

verses = {}
works_seen = set()
for file, dynasty, tier, source in [
    ('featured-tang.json', '唐', 'featured', 'chinese-poetry:唐诗三百首'),
    ('featured-song.json', '宋', 'featured', 'chinese-poetry:宋词三百首'),
    *[(f'tang-{i}.json', '唐', 'extended', f'chinese-poetry:poet.tang.{i}000') for i in range(1, 10)]
]:
    for key, verse in extract(load(WORK / file), dynasty, tier, source):
        work = (verse['dynasty'], verse['author'], verse['title'])
        if tier == 'extended' and work in works_seen:
            continue
        if key not in verses:
            verses[key] = verse
            works_seen.add(work)
verses = list(verses.values())[:8500]
# Keep a reviewed second excerpt from the already represented work.
# 《全唐诗》卷五 lists the title as 《如意娘》.
ruyiniang = next(
    work for work in load(WORK / 'tang-2.json')
    if work['author'] == '則天皇后' and work['title'] == '雜曲歌辭 如意娘'
)
couplet = '不信比來長下淚，開箱驗取石榴裙。'
assert couplet in ruyiniang['paragraphs']
key = re.sub('[，、。！？]', '', couplet)
reviewed_id = hashlib.sha256(key.encode()).hexdigest()[:20]
if not any(verse['id'] == reviewed_id for verse in verses):
    verses.append(dict(
        id=reviewed_id, content=couplet, author=ruyiniang['author'],
        title='如意娘', dynasty='唐', source='chinese-poetry:poet.tang.2000',
        tier='extended', tags=tags(couplet),
    ))
# Use the familiar author name while retaining stable IDs.
for verse in verses:
    if verse['author'] in ('則天皇后', '则天皇后'):
        verse['author'] = '武则天'

# Replace reviewed variants and other extracts from the same work with its
# representative excerpt. Keep the retired IDs for previously fixed verses.
featured = load(Path(__file__).with_name('featured-excerpts.json'))
replaced = [old_id for entry in featured for old_id in entry.get('replaces', [])]
assert len(replaced) == len(set(replaced))
assert set(replaced) <= {verse['id'] for verse in verses}
verses = [verse for verse in verses if verse['id'] not in replaced]
for entry in featured:
    content = entry['content']
    key = re.sub('[，、。！？]', '', content)
    verse_id = hashlib.sha256(key.encode()).hexdigest()[:20]
    assert all(verse['id'] != verse_id for verse in verses), content
    previous_ids = [old for old in entry.get('replaces', []) if old != verse_id]
    verse = {k: v for k, v in entry.items() if k != 'replaces'}
    verse.update(id=verse_id, tier='featured', tags=tags(content))
    if previous_ids:
        verse['previousIds'] = previous_ids
    verses.append(verse)

gushiwen = load(Path(__file__).with_name('gushiwen-versions.json'))
reviews = gushiwen['versions']
aliases = gushiwen['aliases']
by_id = {verse['id']: verse for verse in verses}
assert (reviews.keys() | aliases.keys() | set(aliases.values())) <= by_id.keys()
assert not (aliases.keys() & set(aliases.values()))
for verse in verses:
    review = reviews.get(verse['id'])
    if review:
        verse.update(review)
        if 'content' in review:
            verse['tags'] = tags(verse['content'])
for old_id, kept_id in aliases.items():
    old = by_id[old_id]
    kept = by_id[kept_id]
    kept.setdefault('previousIds', []).extend([old_id, *old.get('previousIds', [])])
    if old['tier'] == 'featured':
        kept['tier'] = 'featured'
# Publish only excerpts with a matching reference from Gushiwen.
verses = [
    verse for verse in verses
    if verse['id'] not in aliases and verse['source'].startswith(
        ('https://www.guwendao.net/', 'gushiwen:')
    )
]

assert 5000 <= len(verses) <= 10000
save(OUT / 'enhanced-verses.json', verses)

def moods(hex):
    r,g,b = [int(hex[i:i+2],16) for i in (1,3,5)]
    return [key for key, test in {
        'spring': g >= r or (r > g and b > g and r > 170),
        'landscape': g > r or b > r,
        'autumn': r > g + 15 and g > b,
        'night': b >= r and max(r,g,b) < 165,
        'snow': min(r,g,b) > 160 and max(r,g,b)-min(r,g,b) < 50,
    }.items() if test]

old = load(OUT / 'wavesColors.json')
known = {(c['name'], c['hex'].lower()): c for c in old}
colors, names, hexes, conflicts = [], set(), set(), []
def add(color, source):
    name, hex = color['name'].strip(), color['hex'].lower()
    if not name or not re.fullmatch(r'#[0-9a-f]{6}', hex):
        conflicts.append([source, name, hex, 'invalid'])
        return
    if name in names or hex in hexes:
        conflicts.append([source, name, hex, 'same-name or same-hex'])
        return
    preset = known.get((name, hex))
    if preset:
        light, dark = preset['lightSuitable'], preset['darkSuitable']
    else:
        r,g,b = [int(hex[i:i+2],16) for i in (1,3,5)]
        luma = .2126*r + .7152*g + .0722*b
        light, dark = luma < 207, luma > 60
    colors.append(dict(name=name, hex=hex, source=source, lightSuitable=light, darkSuitable=dark, moods=moods(hex)))
    names.add(name)
    hexes.add(hex)

for family in load(WORK / 'colors.json'):
    for color in family['colors']:
        add(color, 'zerosoul/chinese-colors')
# Preserve existing wave palette coverage; bring no new records in from unlicensed references.
for color in old:
    add(color, 'jizhi:original-wave-palette')
save(OUT / 'enhanced-colors.json', colors)
save(Path('docs/color-conflicts.json'), conflicts)
print('verses', len(verses), Counter(v['tier'] for v in verses), Counter(v['dynasty'] for v in verses))
print('colors', len(colors), Counter(c['source'] for c in colors), 'excluded records', len(conflicts))

# Record cross-reference by exact HEX; an identical number does not establish a matching name.
if (WORK / 'reorx-colors.json').exists() and (WORK / 'zhongguose.html').exists():
    reference = {
        'reorx/cht-colors': set(load(WORK / 'reorx-colors.json').values()),
        'zhongguose.com': set(re.findall(r'#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])',
                                         (WORK / 'zhongguose.html').read_text(encoding='utf8'))),
    }
    matches = {source: sorted({c['hex'] for c in colors} & {hex.lower() for hex in values})
               for source, values in reference.items()}
    save(Path('docs/color-crosscheck.json'), matches)
    print('cross-reference exact HEX matches', {source: len(values) for source, values in matches.items()})
