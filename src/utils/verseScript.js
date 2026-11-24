import OpenCC from 'opencc-js';

const profiles = {
  simplified: { from: 'tw', to: 'cn' },
  traditional: { from: 'cn', to: 'tw' },
};
const converters = {};

export const resolveScript = (script) => (script === 'traditional' ? 'traditional' : 'simplified');

export function convertScript(text, script) {
  script = resolveScript(script);
  if (!converters.simplified) converters.simplified = OpenCC.Converter(profiles.simplified);
  const simplified = converters.simplified(text);
  if (script === 'simplified') return simplified;
  if (!converters[script]) converters[script] = OpenCC.Converter(profiles[script]);
  return converters[script](simplified);
}

export function displayVerse(verse, script) {
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
