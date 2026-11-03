const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { Converter } = require('opencc-js');
const verses = require('../src/constants/enhanced-verses.json');
const han = new Set(JSON.parse(execFileSync('python', ['-c', [
  'import json, sys',
  'from fontTools.ttLib import TTFont',
  'cmap = TTFont(sys.argv[1]).getBestCmap()',
  'nushu = {glyph for code, glyph in cmap.items() if 0x1B170 <= code <= 0x1B2FF}',
  'print(json.dumps([code for code, glyph in cmap.items() if 0x3400 <= code <= 0x9FFF and glyph in nushu]))',
].join('\n'), process.argv[2]], { encoding: 'utf8' })));
const profiles = {
  original: (text) => text,
  simplified: Converter({ from: 'tw', to: 'cn' }),
  traditional: Converter({ from: 'cn', to: 'tw' }),
};
const coverage = {};
for (const [script, convert] of Object.entries(profiles)) {
  coverage[script] = verses.filter(({ content }) =>
    [...convert(content)].every((char) => /[，、。！？\s]/u.test(char) || han.has(char.codePointAt(0)))
  ).map(({ id }) => id);
  console.log(script, coverage[script].length);
}
fs.writeFileSync('src/constants/fengqi-covered-verses.json', JSON.stringify(coverage) + '\n');
