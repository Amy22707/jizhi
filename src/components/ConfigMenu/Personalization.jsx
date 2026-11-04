import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, Pane, SegmentedControl, Text, TextInput } from 'evergreen-ui';
import { colorOptions, verseOptions } from '../../utils/enhanced';
import { convertScript } from '../../utils/verseScript';

const favorites = [
  '38f07d0b930f342a9c6e', // 白日依山尽
  '2d84faf60c2a8a0a2a98', // 明月几时有
  'eeb19389c0b1cb6b07ad', // 春眠不觉晓
  '24832b65d8b5b4c48300', // 蓦然回首
  '966afd565bcaf7a3e969', // 海上生明月
  '83d33cbf03e99db8abbc', // 无可奈何花落去
  'd1f2b7bc29c8ce1cc742', // 会当凌绝顶
  'b6ec3ea24093f3f82865', // 人有悲欢离合
  '270e9119c805ccbd8eda', // 劝君更尽一杯酒
  '1f28d2302d5c488e1118', // 月落乌啼霜满天
  '679ef932b8542254ca7d', // 夕阳无限好
]
  .map((id) => verseOptions.find((verse) => verse.id === id))
  .filter(Boolean);

const colorModes = [
  { value: 'random', label: '随机' },
  { value: 'palette', label: '传统色' },
  { value: 'custom', label: '自定义' },
];

let searchableVerses;
function searchVerses(query) {
  const term = convertScript(query.trim(), 'simplified');
  if (!term) return favorites;
  if (!searchableVerses) {
    searchableVerses = verseOptions.map((verse) => ({
      verse,
      text: convertScript([verse.content, verse.author, verse.title].join(' '), 'simplified'),
    }));
  }
  return searchableVerses
    .filter(({ text }) => text.includes(term))
    .slice(0, 30)
    .map(({ verse }) => verse);
}

export default function Personalization({ settings, onChange }) {
  const [query, setQuery] = useState('');
  const [colorQuery, setColorQuery] = useState('');
  const [colorListOpen, setColorListOpen] = useState(false);
  const current = verseOptions.find((verse) => verse.id === settings.verse);
  const matches = useMemo(() => searchVerses(query), [query]);
  const choices = current && !matches.includes(current) ? [current, ...matches] : matches;
  const script = settings.script || 'simplified';
  const verseChoices = choices.map(({ id, content, author }) => ({
    value: id,
    label: convertScript(content + ' · ' + author, script),
  }));
  const color = colorOptions.find(({ hex }) => hex === settings.color);
  const mode =
    settings.color === 'custom' ? 'custom' : color || colorListOpen ? 'palette' : 'random';
  const colors = colorOptions.filter(({ name, hex }) =>
    (name + ' ' + hex).toLowerCase().includes(colorQuery.trim().toLowerCase())
  );

  return (
    <>
      <Menu.Group title="固定诗句">
        <Pane marginX={16}>
          <TextInput
            width="100%"
            aria-label="搜索诗句"
            placeholder="搜索诗句、作者或篇名"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Pane>
        <Menu.OptionsGroup
          options={[{ value: '', label: '随机诗句' }]}
          selected={settings.verse || ''}
          onChange={(value) => onChange('verse', value)}
        />
        <Pane maxHeight={154} overflowY="auto">
          <Menu.OptionsGroup
            title={query.trim() ? '搜索结果' : '唐诗宋词名句'}
            options={verseChoices}
            selected={settings.verse || ''}
            onChange={(value) => onChange('verse', value)}
          />
          {query.trim() && !matches.length && <Text marginLeft={16}>没有找到匹配的诗句</Text>}
        </Pane>
      </Menu.Group>
      <Menu.Divider />
      <Menu.Group title="波浪颜色">
        <Pane marginX={16}>
          <SegmentedControl
            width="100%"
            options={colorModes}
            value={mode}
            onChange={(value) => {
              setColorListOpen(value === 'palette');
              if (value !== 'palette') onChange('color', value === 'custom' ? 'custom' : '');
            }}
          />
          {mode === 'palette' && (
            <Button marginTop={8} width="100%" onClick={() => setColorListOpen(!colorListOpen)}>
              {color ? color.name + ' · ' + color.hex.toUpperCase() : '选择传统色'}
            </Button>
          )}
          {mode === 'custom' && (
            <>
              <Pane display="flex" alignItems="center" marginTop={8}>
                <input
                  aria-label="自定义波浪底色"
                  type="color"
                  value={settings.custom || '#547689'}
                  onChange={(event) => onChange('custom', event.target.value)}
                />
                <Text marginLeft={8}>{(settings.custom || '#547689').toUpperCase()}</Text>
              </Pane>
              <TextInput
                marginTop={8}
                width="100%"
                aria-label="自定义色名称"
                placeholder="给这个颜色起个名字"
                maxLength={16}
                value={settings.customColorName || ''}
                onChange={(event) => onChange('customColorName', event.target.value)}
              />
            </>
          )}
        </Pane>
        {mode === 'palette' && colorListOpen && (
          <Pane marginTop={8}>
            <Pane marginX={16}>
              <TextInput
                width="100%"
                aria-label="搜索传统色"
                placeholder="搜索色名或 HEX"
                value={colorQuery}
                onChange={(event) => setColorQuery(event.target.value)}
              />
            </Pane>
            <Pane maxHeight={140} overflowY="auto">
              <Menu.OptionsGroup
                options={colors.map(({ name, hex }) => ({
                  value: hex,
                  label: (
                    <>
                      <Pane
                        is="span"
                        display="inline-block"
                        width={12}
                        height={12}
                        borderRadius={3}
                        backgroundColor={hex}
                        marginRight={8}
                      />
                      {name} · {hex.toUpperCase()}
                    </>
                  ),
                }))}
                selected={settings.color}
                onChange={(value) => {
                  onChange('color', value);
                  setColorListOpen(false);
                }}
              />
              {!colors.length && <Text marginLeft={16}>没有找到匹配的传统色</Text>}
            </Pane>
          </Pane>
        )}
      </Menu.Group>
    </>
  );
}

Personalization.propTypes = {
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
