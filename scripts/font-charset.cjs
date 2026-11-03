const fs = require('node:fs');
const { Converter } = require('opencc-js');
const toTraditional = Converter({ from: 'cn', to: 'tw' });
const toSimplified = Converter({ from: 'tw', to: 'cn' });
const entries = [...require('../src/constants/enhanced-verses.json'), ...require('../src/constants/enhanced-colors.json')];
const corpus = entries.flatMap((v) => [v.content, v.author, v.title, v.name]).filter(Boolean).join('\n');
fs.writeFileSync('.data-work/converted-charset.txt', [...new Set(toTraditional(corpus) + toSimplified(corpus))].sort().join(''));
