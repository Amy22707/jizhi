"""Convert official TTFs in .data-work to renamed WOFF2 subsets for the offline library."""
import json
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path('src/static/fonts')
records = [record for name in ('verses', 'colors') for record in
           json.loads(Path(f'src/constants/enhanced-{name}.json').read_text(encoding='utf8'))]
chars = set('红豆生南国，春来发几枝。王维相思自定义色「」')
for record in records:
    for key in ('content', 'title', 'author', 'name'):
        chars.update(record.get(key, ''))
chars.update(chr(code) for code in range(32, 127))
chars.update(Path('.data-work/converted-charset.txt').read_text(encoding='utf8'))
for source, name in [
    ('LXGWWenKai-Regular', 'JizhiLiterary'),
    ('MaShanZheng-Regular', 'JizhiBrush'),
    ('ZCOOLXiaoWei-Regular', 'JizhiSong'),
    ('XiangcuiKesong', 'JizhiWoodcut'),
    ('ZhuqueFangsong-Regular', 'JizhiBookSerif'),
    ('LXGWZhenKaiSlabGB-Regular', 'JizhiRegularScript'),
    ('NyushuFengQi-1.003', 'JizhiFengqi'),
]:
    if sys.argv[1:] and name not in sys.argv[1:]:
        continue
    font = TTFont(Path('.data-work') / (source + '.ttf'))
    if name == 'JizhiFengqi':
        # Han-to-nvshu glyph selection is encoded in cmap. The source layout tables
        # cannot be parsed by fontTools and are unnecessary for the poem display.
        for table in ('GSUB', 'GPOS', 'GDEF', 'DSIG'):
            if table in font:
                del font[table]
    opts = subset.Options()
    opts.name_IDs = ['*']
    tool = subset.Subsetter(options=opts)
    font_chars = chars | {chr(code) for code in range(0x1B170, 0x1B2FC)} if name == 'JizhiFengqi' else chars
    tool.populate(text=''.join(sorted(font_chars)))
    tool.subset(font)
    if name == 'JizhiFengqi':
        # Upright nvshu glyphs have near-zero advances, and title brackets
        # have negative top bearings that push the ink into adjacent cells.
        cmap = font.getBestCmap()
        title_brackets = {cmap.get(ord(char)) for char in '「」'}
        for glyph_name, (advance, _) in font['vmtx'].metrics.items():
            glyph = font['glyf'][glyph_name]
            if (advance > 1 and glyph_name not in title_brackets) or not hasattr(glyph, 'yMax'):
                continue
            height = glyph.yMax - glyph.yMin
            cell = max(font['head'].unitsPerEm, height + font['head'].unitsPerEm // 10)
            font['vmtx'][glyph_name] = (cell, (cell - height) // 2)
    for record in font['name'].names[:]:
        values = {1: name, 2: 'Regular', 3: name + '-Regular', 4: name + ' Regular',
                  6: name + '-Regular', 16: name, 17: 'Regular', 21: name, 22: 'Regular'}
        if record.nameID in values:
            font['name'].setName(values[record.nameID], record.nameID, record.platformID, record.platEncID, record.langID)
    font.flavor = 'woff2'
    font.save(root / (name + '.woff2'))
