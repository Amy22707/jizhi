import colors from '../constants/enhanced-colors.json';
import verses from '../constants/enhanced-verses.json';
import coverage from '../constants/fengqi-covered-verses.json';
import { persistentDraw } from './randomSelection';

const hexPattern = /^#[0-9a-f]{6}$/i;
export const colorOptions = colors.filter((color) => color.name && hexPattern.test(color.hex));
export const verseOptions = verses.filter(
  (verse) => verse.id && verse.content && verse.author && verse.title
);
export const fonts = {
  nvshu: 'JizhiFengqi, JizhiLiterary, serif',
  mashan: '"JizhiBrush", "JizhiLiterary", serif',
  xiaowei: '"JizhiSong", "JizhiLiterary", serif',
  notoseriftc: '"Noto Serif TC", "JizhiLiterary", serif',
  zhuque: 'JizhiBookSerif, JizhiLiterary, serif',
  kesong: 'JizhiWoodcut, JizhiLiterary, serif',
  zhenkai: 'JizhiRegularScript, JizhiLiterary, serif',
  JXZhuoKai: 'JizhiZhuokai, JizhiLiterary, serif',
  JiXiangSong: 'JizhiJixiangSong, JizhiSong, JizhiLiterary, serif',
  wenkai: '"JizhiLiterary", KaiTi, serif',
};

const legacyFonts = {
  nyushu: 'nvshu',
  nushu: 'nvshu',
  sourcehan: 'kesong',
  sourcehantc: 'notoseriftc',
  kai: 'zhenkai',
  song: 'notoseriftc',
  fang: 'zhuque',
};

export function resolveFont(name) {
  if (Object.prototype.hasOwnProperty.call(fonts, name)) return name;
  return Object.prototype.hasOwnProperty.call(legacyFonts, name) ? legacyFonts[name] : undefined;
}

export const findVerse = (id) => verseOptions.find((verse) => verse.id === id);
const fengqiPools = Object.fromEntries(
  Object.entries(coverage).map(([script, ids]) => {
    const allowed = new Set(ids);
    return [script, verseOptions.filter(({ id }) => allowed.has(id))];
  })
);
export const nextVerse = (fontName, script) =>
  persistentDraw(
    'verses',
    fontName === 'nvshu' ? fengqiPools[script] || fengqiPools.original : verseOptions,
    200,
    (verse) => verse.id,
    (verse) => (verse.tier === 'featured' ? 5 : 1)
  );

export const nextColor = (dark, verse, fixed, custom, customName) => {
  const chosen = colorOptions.find((color) => color.hex === fixed);
  if (fixed === 'custom') {
    return Promise.resolve({
      name: (typeof customName === 'string' && customName.trim()) || '自定义色',
      hex: typeof custom === 'string' && hexPattern.test(custom) ? custom : '#547689',
    });
  }
  if (chosen) return Promise.resolve(chosen);

  const suitable = colorOptions.filter((color) =>
    dark ? color.darkSuitable : color.lightSuitable
  );
  return persistentDraw(
    'colors',
    suitable,
    10,
    (color) => color.hex,
    (color) => (verse && verse.tags && verse.tags.some((tag) => color.moods.includes(tag)) ? 3 : 1)
  );
};
