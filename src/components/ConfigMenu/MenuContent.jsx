import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Pane,
  Text,
  Button,
  Menu,
  Tablist,
  Switch,
  SidebarTab,
  SegmentedControl,
  InlineAlert,
} from 'evergreen-ui';
import styled from 'styled-components';
import { requestDataConsent } from '../../utils/networkConsent';
import {
  DEFAULT_COLOR_NAME_SIZE,
  DEFAULT_FONT,
  SEARCH_ENGINES,
  WAVES,
} from '../../constants/appConstants';
import Legal from './Legal';
import Personalization from './Personalization';
import SaveBgMenuItem from './SaveBgMenuItem';

const SizeSlider = styled.input`
  width: 100%;
  height: 4px;
  accent-color: #1070ca;
  margin: 10px 0 4px;
`;

const SwitchWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SegmentedControlWrapper = styled.div`
  margin-left: 16px;
`;

const MenuContent = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openFontPicker, setOpenFontPicker] = useState('');

  const {
    isPlaying,
    onPlayPauseSelect,
    showSearchBarChecked,
    onShowSearchBarChange,
    defaultPlayChecked,
    verticalVersesChecked,
    onVerticalVersesChange,
    onDefaultPlayChange,
    colorStayChecked,
    onColorStayChange,
    selected,
    onBgOptionChange,
    engineOption,
    onEngineOptionChange,
    colorMode,
    onColorModeOptionChange,
    fontName,
    onFontTypeChange,
    personalization,
    onPersonalizationChange,
    waveColor,
  } = props;

  const bgOptions = [
    { label: 'Waves', value: 'waves' },
    { label: 'Blobs', value: 'blobs' },
  ];

  const colorModeOptions = [
    {
      label: '白天',
      value: 'light',
    },
    {
      label: '黑夜',
      value: 'dark',
    },
    {
      label: '跟随系统',
      value: 'os',
    },
  ];

  const fontGroups = [
    {
      title: '简体优先',
      options: [
        { label: '江西拙楷体', value: 'JXZhuoKai' },
        { label: '字体圈欣意吉祥宋', value: 'JiXiangSong' },
        { label: '霞鹜臻楷', value: 'zhenkai' },
        { label: '马善政毛笔楷书', value: 'mashan' },
        { label: '站酷小薇宋体', value: 'xiaowei' },
      ],
    },
    {
      title: '繁體優先',
      options: [{ label: 'Noto Serif TC 繁體宋體', value: 'notoseriftc' }],
    },
    {
      title: '简繁皆可',
      options: [
        { label: '香萃刻宋', value: 'kesong' },
        { label: '朱雀仿宋', value: 'zhuque' },
        { label: '霞鹜文楷', value: 'wenkai' },
      ],
    },
    { title: '女书', options: [{ label: '女书凤栖 · nvshu', value: 'nvshu' }] },
  ];

  const fontOptions = fontGroups.flatMap(({ options }) => options);
  const originalFontOptions = fontOptions.filter(({ value }) => value !== 'nvshu');
  const followsPoemFont = personalization.followPoemFont ?? !personalization.colorFont;
  const colorFont = followsPoemFont ? fontName : personalization.colorFont || DEFAULT_FONT;
  const usesNvshuColor = colorFont === 'nvshu';
  const renderFontGroups = (selectedFont, onChange) =>
    fontGroups.map(({ title, options }) => (
      <Menu.Group key={title} title={title}>
        <Menu.OptionsGroup options={options} selected={selectedFont} onChange={onChange} />
      </Menu.Group>
    ));

  const renderFontPicker = (title, key, options, fallback) => {
    const selected = personalization[key] || fallback;
    const option = options.find(({ value }) => value === selected);
    const isOpen = openFontPicker === key;
    return (
      <Menu.Group title={title}>
        <Pane marginX={16}>
          <Button
            width="100%"
            aria-expanded={isOpen}
            onClick={() => setOpenFontPicker(isOpen ? '' : key)}
          >
            {option ? option.label : options[0].label}
          </Button>
        </Pane>
        {isOpen && (
          <Pane maxHeight={160} overflowY="auto">
            <Menu.OptionsGroup
              options={options}
              selected={selected}
              onChange={(value) => {
                onPersonalizationChange(key, value);
                setOpenFontPicker('');
              }}
            />
          </Pane>
        )}
      </Menu.Group>
    );
  };

  const switchOptions = [
    // {
    //   name: '黑夜模式',
    //   checkedState: darkModeChecked,
    //   onChangeFunc: onDarkModeChange,
    // },
    {
      name: '竖版诗词',
      checkedState: verticalVersesChecked,
      onChangeFunc: onVerticalVersesChange,
    },
    {
      name: '默认播放动画',
      checkedState: defaultPlayChecked,
      onChangeFunc: onDefaultPlayChange,
    },
    {
      name: '显示常用网址',
      checkedState: personalization.showShortcuts === true,
      onChangeFunc: (event) => onPersonalizationChange('showShortcuts', event.target.checked),
    },
    {
      name: '显示搜索框',
      checkedState: showSearchBarChecked,
      onChangeFunc: onShowSearchBarChange,
    },
    {
      name: '保留颜色名称',
      checkedState: colorStayChecked,
      onChangeFunc: onColorStayChange,
    },
  ];

  const tabs = [
    {
      tabName: '设置',
      tabContent: (
        <>
          <Menu.Group title="偏好">
            {switchOptions.map((option) => {
              if (selected !== WAVES && option.name === '保留颜色名称') return;
              return (
                <Menu.Item key={option.name}>
                  <SwitchWrapper>
                    {option.name}
                    <Switch checked={option.checkedState} onChange={option.onChangeFunc} />
                  </SwitchWrapper>
                </Menu.Item>
              );
            })}
          </Menu.Group>
          <Menu.Divider />

          {personalization.showShortcuts === true && (
            <>
              <Menu.Group title="常用网址">
                <Pane marginX={16} marginBottom={10}>
                  <SwitchWrapper>
                    <label htmlFor="online-shortcut-icons">联网加载网站图标</label>
                    <Switch
                      id="online-shortcut-icons"
                      checked={personalization.onlineShortcutIcons === true}
                      onChange={async (event) => {
                        const checked = event.target.checked;
                        const allowed = checked && (await requestDataConsent('browsingActivity'));
                        onPersonalizationChange('onlineShortcutIcons', allowed);
                      }}
                    />
                  </SwitchWrapper>
                  <Text size={300}>开启后，浏览器会向你固定的网站请求其图标。</Text>
                </Pane>
              </Menu.Group>
              <Menu.Divider />
            </>
          )}
          <Menu.Group title="搜索引擎">
            <SegmentedControlWrapper>
              <SegmentedControl
                width={280}
                options={SEARCH_ENGINES}
                value={engineOption}
                onChange={onEngineOptionChange}
              />
            </SegmentedControlWrapper>
          </Menu.Group>
        </>
      ),
    },
    {
      tabName: '背景',
      tabContent: (
        <>
          <Menu.Group title="动画效果">
            <Menu.OptionsGroup
              options={bgOptions}
              selected={selected}
              onChange={onBgOptionChange}
            />
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group title="颜色模式">
            <SegmentedControlWrapper>
              <SegmentedControl
                width={280}
                options={colorModeOptions}
                value={colorMode}
                onChange={onColorModeOptionChange}
              />
            </SegmentedControlWrapper>
          </Menu.Group>
        </>
      ),
    },
    {
      tabName: '操作',
      tabContent: (
        <Menu.Group>
          <SaveBgMenuItem />
          <Menu.Item
            icon={isPlaying ? 'pause' : 'play'}
            intent="success"
            onSelect={onPlayPauseSelect}
            secondaryText="Space"
          >
            {isPlaying ? '暂停动画' : '播放动画'}
          </Menu.Item>
          <InlineAlert intent="none" marginRight={15} marginLeft={15}>
            <p>波纹背景下使用左右键可以随机切换颜色</p>
          </InlineAlert>
        </Menu.Group>
      ),
    },

    {
      tabName: '字体',
      tabContent: (
        <>
          <Menu.Group title="诗句字号">
            <Pane marginX={16}>
              <Text size={300} is="label" htmlFor="verse-size">
                {personalization.size || 30}
              </Text>
              <SizeSlider
                id="verse-size"
                aria-label="诗句字号"
                type="range"
                min={18}
                max={48}
                value={personalization.size || 30}
                onChange={(event) => onPersonalizationChange('size', Number(event.target.value))}
              />
            </Pane>
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group title="颜色名字号">
            <Pane marginX={16}>
              <Text size={300} is="label" htmlFor="color-name-size">
                {personalization.colorNameSize || DEFAULT_COLOR_NAME_SIZE}
              </Text>
              <SizeSlider
                id="color-name-size"
                aria-label="颜色名字号"
                type="range"
                min={40}
                max={160}
                value={personalization.colorNameSize || DEFAULT_COLOR_NAME_SIZE}
                onChange={(event) =>
                  onPersonalizationChange('colorNameSize', Number(event.target.value))
                }
              />
            </Pane>
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group title="诗词字形">
            <Pane marginX={16}>
              <SegmentedControl
                width="100%"
                options={[
                  { value: 'original', label: '保留原文' },
                  { value: 'simplified', label: '简体' },
                  { value: 'traditional', label: '繁體' },
                ]}
                value={personalization.script || 'original'}
                onChange={(value) => onPersonalizationChange('script', value)}
              />
            </Pane>
          </Menu.Group>
          <Menu.Divider />
          {fontName === 'nvshu' && (
            <>
              <Menu.Group title="女书">
                <Pane marginX={16} paddingY={4}>
                  <SwitchWrapper>
                    <label htmlFor="show-nvshu-original">显示诗句、作者和篇名原文</label>
                    <Switch
                      id="show-nvshu-original"
                      checked={!!personalization.showNvshuOriginal}
                      onChange={(event) =>
                        onPersonalizationChange('showNvshuOriginal', event.target.checked)
                      }
                    />
                  </SwitchWrapper>
                </Pane>
              </Menu.Group>
              <Menu.Divider />
            </>
          )}
          <Menu.Group title="诗词字体" />
          {renderFontGroups(fontName, onFontTypeChange)}
          <Menu.Divider />
          <Menu.Group title="颜色名字体">
            <Pane marginX={16} paddingY={4}>
              <SwitchWrapper>
                <label htmlFor="follow-poem-font">与诗词字体相同</label>
                <Switch
                  id="follow-poem-font"
                  checked={followsPoemFont}
                  onChange={(event) =>
                    onPersonalizationChange('followPoemFont', event.target.checked)
                  }
                />
              </SwitchWrapper>
            </Pane>
          </Menu.Group>
          {!followsPoemFont &&
            renderFontGroups(colorFont, (value) => onPersonalizationChange('colorFont', value))}
          {usesNvshuColor && (
            <Pane marginX={16} paddingY={8}>
              <SwitchWrapper>
                <label htmlFor="show-nvshu-color-original">显示颜色名原文</label>
                <Switch
                  id="show-nvshu-color-original"
                  checked={!!personalization.showNvshuColorOriginal}
                  onChange={(event) =>
                    onPersonalizationChange('showNvshuColorOriginal', event.target.checked)
                  }
                />
              </SwitchWrapper>
            </Pane>
          )}
          {(fontName === 'nvshu' || usesNvshuColor) && (
            <>
              <Menu.Group title="原文字形（诗句和色名）">
                <Pane marginX={16}>
                  <SegmentedControl
                    width="100%"
                    options={[
                      { value: 'simplified', label: '简体' },
                      { value: 'traditional', label: '繁體' },
                    ]}
                    value={personalization.nvshuOriginalScript || 'traditional'}
                    onChange={(value) => onPersonalizationChange('nvshuOriginalScript', value)}
                  />
                </Pane>
              </Menu.Group>
              {renderFontPicker(
                '原文字体（诗句和色名）',
                'nvshuOriginalFont',
                originalFontOptions,
                'wenkai'
              )}
            </>
          )}
          <Menu.Divider />
          {fontName === 'nvshu' && (
            <InlineAlert intent="none" margin={12}>
              凤栖会逐字显示诗句。没有女书对应字形的字会显示为汉字。
            </InlineAlert>
          )}
        </>
      ),
    },
    {
      tabName: '个性化',
      tabContent: <Personalization settings={personalization} onChange={onPersonalizationChange} />,
    },
    { tabName: '关于', tabContent: <Legal waveColor={waveColor} selected={selected} /> },
  ];

  return (
    <Pane display="flex" height={300}>
      <Tablist width={80} margin={10}>
        {tabs.map(({ tabName }, index) => (
          <SidebarTab
            key={tabName}
            id={tabName}
            onSelect={() => setSelectedIndex(index)}
            isSelected={index === selectedIndex}
            aria-controls={`panel-${tabName}`}
          >
            {tabName}
          </SidebarTab>
        ))}
      </Tablist>
      <Pane width={350} background="tint1" overflowY="auto">
        {tabs.map(({ tabName, tabContent }, index) => (
          <Pane
            key={tabName}
            id={`panel-${tabName}`}
            role="tabpanel"
            aria-labelledby={tabName}
            aria-hidden={index !== selectedIndex}
            display={index === selectedIndex ? 'block' : 'none'}
          >
            {tabContent}
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
};

MenuContent.propTypes = {
  children: PropTypes.any,
  showSearchBarChecked: PropTypes.bool,
  onShowSearchBarChange: PropTypes.func,
  onPlayPauseSelect: PropTypes.func.isRequired,
  onVerticalVersesChange: PropTypes.func.isRequired,
  verticalVersesChecked: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  defaultPlayChecked: PropTypes.bool.isRequired,
  onDefaultPlayChange: PropTypes.func.isRequired,
  colorStayChecked: PropTypes.bool.isRequired,
  onColorStayChange: PropTypes.func.isRequired,
  selected: PropTypes.string,
  onBgOptionChange: PropTypes.func,
  engineOption: PropTypes.string,
  onEngineOptionChange: PropTypes.func,
  colorMode: PropTypes.string,
  onColorModeOptionChange: PropTypes.func,
  fontName: PropTypes.string,
  onFontTypeChange: PropTypes.func,
  personalization: PropTypes.object.isRequired,
  onPersonalizationChange: PropTypes.func.isRequired,
  waveColor: PropTypes.object,
};

export default MenuContent;
