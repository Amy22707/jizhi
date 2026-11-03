import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import waves from './sketchs/waves';
import blobs from './sketchs/blobs';
import Verses from './components/Verses';
import ConfigMenu from './components/ConfigMenu';
import SearchInput from './components/SearchInput';
import ColorName from './components/ColorName';
import { saveBackground, isDarkModeEnabled } from './utils';
import Storager from './utils/storager';
import { findVerse, fonts, nextColor, nextVerse, resolveFont } from './utils/enhanced';
import {
  HORIZONTAL,
  VERTICAL,
  WAVES,
  GOOGLE_SEARCH,
  DEFAULT_SHICI,
  DEFAULT_FONT,
} from './constants/appConstants';
import GlobalStyle from './components/GlobalStyle';

const defaultColor = { name: '', hex: '#547689' };

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: true,
      showSearchBarChecked: false,
      colorMode: 'os',
      isDarkMode: false,
      defaultPlayChecked: true,
      colorStayChecked: false,
      verses: DEFAULT_SHICI,
      versesLayout: HORIZONTAL,
      engineOption: GOOGLE_SEARCH,
      value: '',
      focused: false,
      fontName: DEFAULT_FONT,
      waveColor: defaultColor,
      personalization: {},
    };
  }

  componentDidMount() {
    const hasZh = navigator.languages.includes('zh');
    document.title = hasZh ? '新标签页' : 'New Tab';

    Storager.get(
      [
        'personalization',
        'versesLayout',
        'selected',
        'colorStayChecked',
        'defaultPlayChecked',
        'engineOption',
        'showSearchBarChecked',
        'fontName',
        'colorMode',
      ],
      async (res) => {
        const saved = res.personalization || {};
        const personalization = { ...saved, colorFont: resolveFont(saved.colorFont) || '' };
        const fontName = resolveFont(res.fontName) || DEFAULT_FONT;
        const colorMode = res.colorMode || 'os';
        const isDarkMode = colorMode === 'os' ? isDarkModeEnabled() : colorMode === 'dark';
        const verses =
          findVerse(personalization.verse) ||
          (await nextVerse(fontName, personalization.script)) ||
          DEFAULT_SHICI;
        const waveColor = await nextColor(
          isDarkMode,
          verses,
          personalization.color,
          personalization.custom
        );
        this.setState({
          showSearchBarChecked: !!res.showSearchBarChecked,
          colorMode,
          personalization,
          colorStayChecked: !!res.colorStayChecked,
          defaultPlayChecked: res.defaultPlayChecked !== false,
          isVerticalVerses: res.versesLayout === VERTICAL,
          isPlaying: res.defaultPlayChecked !== false,
          verses,
          selected: res.selected || WAVES,
          engineOption: res.engineOption || GOOGLE_SEARCH,
          fontName,
          isDarkMode,
          waveColor: waveColor || defaultColor,
        });
      }
    );
  }

  refreshColor = async () => {
    const request = (this.colorRequest = (this.colorRequest || 0) + 1);
    const { isDarkMode, verses, personalization } = this.state;
    const waveColor = await nextColor(
      isDarkMode,
      verses,
      personalization.color,
      personalization.custom
    );
    if (request === this.colorRequest) this.setState({ waveColor: waveColor || defaultColor });
  };

  refreshVerse = async () => {
    const request = (this.verseRequest = (this.verseRequest || 0) + 1);
    const { fontName, personalization } = this.state;
    const verses =
      findVerse(personalization.verse) ||
      (await nextVerse(fontName, personalization.script)) ||
      DEFAULT_SHICI;
    if (request === this.verseRequest) this.setState({ verses }, this.refreshColor);
  };

  changePersonalization = (key, value) => {
    this.setState(
      ({ personalization }) => ({ personalization: { ...personalization, [key]: value } }),
      () => {
        const { personalization, fontName } = this.state;
        Storager.set({ personalization });
        if (
          key === 'verse' ||
          (key === 'script' && fontName === 'nyushu' && !personalization.verse)
        ) {
          this.refreshVerse();
        } else if (key === 'color' || key === 'custom') {
          this.refreshColor();
        }
      }
    );
  };

  handlePlayPauseSelect = () => this.setState((state) => ({ isPlaying: !state.isPlaying }));

  handleShowSearchBarChange = () => {
    this.setState(
      (state) => ({
        showSearchBarChecked: !state.showSearchBarChecked,
      }),
      () => {
        Storager.set({ showSearchBarChecked: this.state.showSearchBarChecked });
      }
    );
  };

  handleColorModeOptionChange = (colorMode) =>
    this.setState(
      { colorMode, isDarkMode: colorMode === 'os' ? isDarkModeEnabled() : colorMode === 'dark' },
      () => {
        Storager.set({ colorMode });
        this.refreshColor();
      }
    );

  handleVersesLayoutChange = () => {
    this.setState(
      (state) => ({
        isVerticalVerses: !state.isVerticalVerses,
      }),
      () => {
        Storager.set({
          versesLayout: this.state.isVerticalVerses ? VERTICAL : HORIZONTAL,
        });
      }
    );
  };

  handleDefaultPlayChange = () => {
    this.setState(
      (state) => ({
        defaultPlayChecked: !state.defaultPlayChecked,
      }),
      () => {
        Storager.set({ defaultPlayChecked: this.state.defaultPlayChecked });
      }
    );
  };

  handleColorStayChange = () => {
    this.setState(
      (state) => ({
        colorStayChecked: !state.colorStayChecked,
      }),
      () => {
        Storager.set({ colorStayChecked: this.state.colorStayChecked });
      }
    );
  };

  handleBgOptionChange = (selected) => {
    this.setState({ selected }, () => {
      Storager.set({ selected });
    });
  };

  handleKeyDown = ({ keyCode, altKey, target }) => {
    if (target.closest('input, select, button, a, [role="menuitem"]')) return;
    // space
    if (keyCode === 32) this.setState((state) => ({ isPlaying: !state.isPlaying }));
    // S + alt
    if (keyCode === 83 && altKey) saveBackground();

    // left or right arrow keys
    if (keyCode === 37 || keyCode === 39) {
      this.refreshColor();
    }
  };

  handleFontTypeChange = (fontName) =>
    this.setState({ fontName }, () => {
      Storager.set({ fontName });
      if (!this.state.personalization.verse) {
        if (fontName === 'nyushu') this.refreshVerse();
        else this.verseRequest = (this.verseRequest || 0) + 1;
      }
    });

  handleEngineOptionChange = (engineOption) =>
    this.setState({ engineOption }, () => Storager.set({ engineOption }));

  handleChange = ({ target: { value } }) => this.setState({ value });

  handleFocus = () => this.setState({ focused: true });

  handleBlur = () => this.setState({ focused: false });

  render() {
    const {
      verses,
      isVerticalVerses,
      isPlaying,
      showSearchBarChecked,
      defaultPlayChecked,
      colorStayChecked,
      selected,
      engineOption,
      value,
      focused,
      fontName,
      isDarkMode,
      waveColor,
      colorMode,
      personalization,
    } = this.state;
    const followsPoemFont = personalization.followPoemFont ?? !personalization.colorFont;
    const colorFont = followsPoemFont ? fontName : personalization.colorFont || DEFAULT_FONT;
    const originalScript = personalization.nushuOriginalScript || 'traditional';
    const originalFont = fonts[personalization.nushuOriginalFont] || fonts[DEFAULT_FONT];
    const sketches = { blobs, waves };

    return selected ? (
      <div className="App" tabIndex="-1" onKeyDown={this.handleKeyDown}>
        <GlobalStyle />
        {selected === WAVES && (
          <ColorName
            key={waveColor.name}
            fontName={fonts[colorFont]}
            originalScript={originalScript}
            originalFont={
              colorFont === 'nyushu' && personalization.showNushuColorOriginal
                ? originalFont
                : undefined
            }
            colorName={waveColor.name}
            colorStayChecked={colorStayChecked}
            isDarkMode={isDarkMode}
          />
        )}
        <Verses
          key={isVerticalVerses}
          bgOption={selected}
          verses={verses.origin ? verses : { ...verses, origin: verses }}
          fontSize={personalization.size}
          script={personalization.script}
          originalScript={originalScript}
          showNushuOriginal={fontName === 'nyushu' && !!personalization.showNushuOriginal}
          originalFont={originalFont}
          isVerticalVerses={isVerticalVerses}
          engineOption={engineOption}
          isDarkMode={isDarkMode}
          fontName={fonts[fontName]}
        />
        <ReactP5Wrapper
          sketch={sketches[selected]}
          isPlaying={isPlaying}
          isDarkMode={isDarkMode}
          waveColor={waveColor.hex}
        />
        <ConfigMenu
          onPlayPauseSelect={this.handlePlayPauseSelect}
          isPlaying={isPlaying}
          verticalVersesChecked={isVerticalVerses}
          showSearchBarChecked={showSearchBarChecked}
          isDarkMode={isDarkMode}
          onDarkModeChange={this.handleDarkModeChange}
          onShowSearchBarChange={this.handleShowSearchBarChange}
          defaultPlayChecked={defaultPlayChecked}
          onDefaultPlayChange={this.handleDefaultPlayChange}
          onVerticalVersesChange={this.handleVersesLayoutChange}
          colorStayChecked={colorStayChecked}
          onColorStayChange={this.handleColorStayChange}
          selected={selected}
          onBgOptionChange={this.handleBgOptionChange}
          engineOption={engineOption}
          onEngineOptionChange={this.handleEngineOptionChange}
          onColorModeOptionChange={this.handleColorModeOptionChange}
          colorMode={colorMode}
          fontName={fontName}
          onFontTypeChange={this.handleFontTypeChange}
          personalization={personalization}
          onPersonalizationChange={this.changePersonalization}
          waveColor={waveColor}
        />
        {showSearchBarChecked && (
          <SearchInput
            value={value}
            focused={focused}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            engineOption={engineOption}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    ) : null;
  }
}

export default hot(module)(App);
