import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, Pane, SegmentedControl, Text, Textarea, TextInput } from 'evergreen-ui';
import { colorOptions, findVerse, verseOptions } from '../../utils/enhanced';
import { convertScript } from '../../utils/verseScript';

const favorites = [
  '38f07d0b930f342a9c6e', // 白日依山尽
  '24f8331f0cabcd94ddb9', // 但愿人长久
  'eeb19389c0b1cb6b07ad', // 春眠不觉晓
  '24832b65d8b5b4c48300', // 蓦然回首
  '966afd565bcaf7a3e969', // 海上生明月
  '83d33cbf03e99db8abbc', // 无可奈何花落去
  'd1f2b7bc29c8ce1cc742', // 会当凌绝顶
  '1c71bd5ec97d91b87d88', // 大漠孤烟直
  '270e9119c805ccbd8eda', // 劝君更尽一杯酒
  '5f22ba40975eb95c5bf5', // 月落乌啼霜满天
  '679ef932b8542254ca7d', // 夕阳无限好
  'a631d8a119f2ac7578d1', // 山重水复疑无路
  '8b4a89c851c641b53b45', // 知否，知否
  'f6140e0d188b7b741ed0', // 花影压重门
  '927e005b3f42070eaf9f', // 小楼一夜听春雨
  'bf880ad7517ff331b63b', // 桃李春风一杯酒
]
  .map((id) => verseOptions.find((verse) => verse.id === id))
  .filter(Boolean);

const colorModes = [
  { value: 'random', label: '随机' },
  { value: 'palette', label: '传统色' },
  { value: 'custom', label: '自定义' },
];

const versePools = [
  { value: 'builtin', label: '只随机显示内置诗句' },
  { value: 'mixed', label: '与内置诗库一起随机' },
  { value: 'custom', label: '只随机显示我的句库' },
];

let searchableVerses;
const emptyCustomVerses = [];
const emptyDraft = { content: '', author: '', title: '' };
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
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState('');
  const [colorQuery, setColorQuery] = useState('');
  const [colorListOpen, setColorListOpen] = useState(false);
  const customVerses = settings.customVerses || emptyCustomVerses;
  const current = findVerse(settings.verse, customVerses);
  const usesLegacyPool = !settings.versePool && customVerses.some((verse) => verse.random);
  const matches = useMemo(() => {
    const term = convertScript(query.trim(), 'simplified');
    const customMatches = customVerses.filter(({ content, author, title }) =>
      convertScript([content, author, title].join(' '), 'simplified').includes(term)
    );
    return [...customMatches, ...searchVerses(query)].slice(0, 30);
  }, [customVerses, query]);
  const choices = current && !matches.includes(current) ? [current, ...matches] : matches;
  const script = settings.script || 'simplified';
  const verseChoices = choices.map(({ id, content, author, title, custom }) => ({
    value: id,
    label: convertScript(
      [content, author, custom && title, custom && !author && !title && '自定义']
        .filter(Boolean)
        .join(' · '),
      script
    ),
  }));
  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId('');
  };
  const saveCustomSentence = () => {
    const content = draft.content.trim();
    if (!content) return;
    const title = draft.title.trim();
    const author = draft.author.trim();
    const existing = editingId
      ? customVerses.find((verse) => verse.id === editingId)
      : customVerses.find(
          (verse) => verse.content === content && verse.title === title && verse.author === author
        );
    const entry = {
      ...existing,
      id: existing ? existing.id : 'custom:' + crypto.randomUUID(),
      content,
      title,
      author,
      custom: true,
    };
    onChange({
      customVerses: existing
        ? customVerses.map((verse) => (verse.id === entry.id ? entry : verse))
        : [...customVerses, entry],
    });
    resetDraft();
  };
  const removeCustomSentence = (id) => {
    const remaining = customVerses.filter((item) => item.id !== id);
    const changes = { customVerses: remaining };
    if (settings.verse === id) changes.verse = '';
    if (!remaining.length && settings.versePool === 'custom') changes.versePool = 'builtin';
    onChange(changes);
    if (editingId === id) resetDraft();
  };
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
      <Menu.Group title="自定义句库">
        <Pane marginX={16} paddingBottom={8}>
          <Textarea
            aria-label="自定义句子"
            placeholder="写下想在新标签页看到的句子"
            value={draft.content}
            maxLength={80}
            rows={2}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
          />
          <Pane display="flex" marginTop={8} gap={8}>
            <TextInput
              width="50%"
              aria-label="作者（选填）"
              placeholder="作者（选填）"
              maxLength={16}
              value={draft.author}
              onChange={(event) => setDraft({ ...draft, author: event.target.value })}
            />
            <TextInput
              width="50%"
              aria-label="作品名（选填）"
              placeholder="作品名（选填）"
              maxLength={32}
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Pane>
          <Pane display="flex" marginTop={8}>
            <Button disabled={!draft.content.trim()} onClick={saveCustomSentence}>
              {editingId ? '保存修改' : '添加到我的句库'}
            </Button>
            {editingId && (
              <Button marginLeft={8} onClick={resetDraft}>
                取消
              </Button>
            )}
          </Pane>
          {customVerses.length > 0 && (
            <Pane maxHeight={176} overflowY="auto" marginTop={8}>
              {customVerses.map((verse) => (
                <Pane key={verse.id} paddingY={8} borderBottom="muted">
                  <Text display="block" overflowWrap="anywhere" size={300}>
                    {[verse.content, verse.author, verse.title].filter(Boolean).join(' · ')}
                  </Text>
                  <Pane display="flex" gap={8} marginTop={4}>
                    <Button
                      disabled={settings.verse === verse.id}
                      onClick={() => onChange('verse', verse.id)}
                    >
                      {settings.verse === verse.id ? '已固定' : '固定这句'}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(verse.id);
                        setDraft({
                          content: verse.content,
                          author: verse.author,
                          title: verse.title,
                        });
                      }}
                    >
                      编辑
                    </Button>
                    <Button onClick={() => removeCustomSentence(verse.id)}>移除</Button>
                  </Pane>
                </Pane>
              ))}
            </Pane>
          )}
        </Pane>
        <Menu.OptionsGroup
          title="随机范围"
          options={customVerses.length ? versePools : versePools.slice(0, 1)}
          selected={settings.verse || usesLegacyPool ? '' : settings.versePool || 'builtin'}
          onChange={(value) => onChange({ versePool: value, verse: '' })}
        />
        {usesLegacyPool && !settings.verse && (
          <Text marginLeft={16} size={300}>
            正在沿用之前的随机设置，可选择新的随机范围。
          </Text>
        )}
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
