import { createGlobalStyle } from 'styled-components';
import notoSerifTC from '../constants/noto-serif-tc-css.json';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'JizhiLiterary';
    src: url('./static/fonts/JizhiLiterary.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: 'JizhiBrush';
    src: url('./static/fonts/JizhiBrush.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: 'JizhiSong';
    src: url('./static/fonts/JizhiSong.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: JizhiFengqi;
    src: url('./static/fonts/JizhiFengqi.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: JizhiWoodcut;
    src: url('./static/fonts/JizhiWoodcut.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: JizhiBookSerif;
    src: url('./static/fonts/JizhiBookSerif.woff2') format('woff2');
    font-display: swap;
  }

  @font-face {
    font-family: JizhiRegularScript;
    src: url('./static/fonts/JizhiRegularScript.woff2') format('woff2');
    font-display: swap;
  }

  ${notoSerifTC}

  html,
  body {
    padding: 0;
    margin: 0;
    overflow: hidden;
    font-family: "JizhiLiterary", KaiTi, STKaiti, "Kaiti SC", serif;
    height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default GlobalStyle;
