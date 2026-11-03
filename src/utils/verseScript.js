import OpenCC from 'opencc-js';

const profiles = {
  simplified: { from: 'tw', to: 'cn' },
  traditional: { from: 'cn', to: 'tw' },
};
const converters = {};

export function convertScript(text, script) {
  if (script !== 'simplified' && script !== 'traditional') return text;
  if (!converters[script]) converters[script] = OpenCC.Converter(profiles[script]);
  return converters[script](text);
}

export function displayVerse(verse, script) {
  if (script !== 'simplified' && script !== 'traditional') return verse;
  const convert = (text) => convertScript(text, script);
  return {
    ...verse,
    content: convert(verse.content),
    origin: {
      ...verse.origin,
      author: convert(verse.origin.author),
      title: convert(verse.origin.title),
    },
  };
}
