import React from 'react';
import PropTypes from 'prop-types';
import styled, { css, keyframes } from 'styled-components';
import { DEFAULT_COLOR_NAME_SIZE } from '../constants/appConstants';
import { convertScript } from '../utils/verseScript';

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const Wrapper = styled.div`
  font-family: ${(props) => props.fontName};
  position: absolute;
  font-size: min(
    ${({ preferredSize }) => preferredSize}px,
    calc((100vh - 32px) / ${({ fitCells }) => fitCells})
  );
  line-height: 1.15;
  right: 12px;
  top: 16px;
  color: ${(props) => (props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  writing-mode: vertical-rl;
  white-space: nowrap;
  ${(props) =>
    props.colorStayChecked
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0;
          animation: ${fadeOut} 5s ease;
        `};
`;

const Original = styled.span`
  position: absolute;
  right: 82%;
  top: 37%;
  transform: translateY(-50%);
  font-family: ${({ fontName }) => fontName};
  font-size: 0.32em;
`;

const ColorName = ({
  colorName,
  colorStayChecked,
  fontName,
  isDarkMode,
  originalFont,
  originalScript,
  fontSize,
}) => {
  const preferredSize = Number.isFinite(fontSize)
    ? Math.max(40, Math.min(160, fontSize))
    : DEFAULT_COLOR_NAME_SIZE;
  // Leave room for the taller upright glyphs in the bundled Fengqi font.
  const fitCells = Math.max(1, Array.from(colorName || '').length) * 1.65;
  return (
    <Wrapper
      fontName={fontName}
      colorStayChecked={colorStayChecked}
      isDarkMode={isDarkMode}
      preferredSize={preferredSize}
      fitCells={fitCells}
    >
      {colorName}
      {originalFont && (
        <Original
          aria-label="颜色名原文"
          fontName={originalFont}
          lang={originalScript === 'simplified' ? 'zh-Hans' : 'zh-Hant'}
        >
          {convertScript(colorName, originalScript)}
        </Original>
      )}
    </Wrapper>
  );
};

ColorName.propTypes = {
  colorName: PropTypes.string,
  colorStayChecked: PropTypes.bool,
  fontName: PropTypes.string,
  fontSize: PropTypes.number,
  originalFont: PropTypes.string,
  originalScript: PropTypes.string,
  isDarkMode: PropTypes.bool,
};

export default ColorName;
