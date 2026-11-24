import React from 'react';
import { Icon } from 'evergreen-ui';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { pureWords } from '../../utils';

const poemSize = (size) => Math.min(48, Math.max(18, Number.isFinite(size) ? size : 30));
const length = (text) => Array.from(text).length;

const Content = styled.div`
  font-size: calc(${({ fontSize }) => poemSize(fontSize)}px + 1vw);
  width: 80vw;
  word-break: keep-all;
  ${(props) =>
    props.isCustom &&
    css`
      overflow-wrap: anywhere;
      white-space: pre-line;
    `};
  ${(props) =>
    props.isVertical &&
    css`
      width: auto;
      font-size: min(
        calc(${poemSize(props.fontSize)}px + 1vw),
        ${76 / props.verticalMetrics.poemHeight}vh,
        ${82 / props.verticalMetrics.poemWidth}vw
      );
      line-height: 1.35;
      text-align: center;
      white-space: pre;
    `};
`;

const OriginalOrigin = styled.div`
  font-size: 0.78em;
  margin-inline-start: 0.5em;
  opacity: 0.85;
  ${(props) =>
    props.isVertical &&
    css`
      margin-inline-start: 0;
    `};
`;

const Original = styled.div`
  font-family: ${({ fontName }) => fontName};
  font-size: calc(14px + 0.45vw);
  line-height: 1.5;
  margin-block-start: 1.2em;
  opacity: 0.78;
  text-align: center;
  word-break: keep-all;
  ${(props) =>
    props.verticalMetrics &&
    css`
      font-size: min(calc(14px + 0.45vw), ${76 / props.verticalMetrics.originalHeight}vh, 4vw);
      white-space: nowrap;
    `};
`;

const Origin = styled.div`
  display: flex;
  margin-top: ${({ hasOriginal }) => (hasOriginal ? '0.25em' : '1em')};
  font-size: calc(10px + 1vw);
  justify-content: center;
  align-items: center;
  ${(props) =>
    props.isVertical &&
    css`
      inline-size: max-content;
      margin: 0;
      margin-right: 10px;
      /* Keep the spacing inside the centered title and stamp group. */
      gap: 0.34em;
      text-align: center;
      font-size: min(calc(10px + 1vw), ${76 / props.verticalMetrics.originHeight}vh, 4.5vw);
      white-space: nowrap;
    `};
`;

const Stamp = styled.span`
  color: #fff;
  background-color: #c20000;
  border-radius: 3px;
  padding: 3px 4px 3px 3px;
  margin: 0.5em;
  font-size: 67%;
  letter-spacing: -1px;
  ${(props) =>
    props.isVertical &&
    css`
      margin: 0;
      padding: 3px 2px 4px;
    `};
`;

const Search = styled.div`
  opacity: 0;
  transition: all 200ms ease-in;
  &:hover ${Origin} {
    opacity: 0.5;
  }
`;

const VerticalPunctuation = styled.span`
  position: relative;
  display: inline-flex;
  inline-size: 1em;
  block-size: 1em;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  writing-mode: horizontal-tb;
  line-height: 1;

  > span {
    display: inline-block;
    transform: ${({ mark }) =>
      mark === '、' ? 'translate(-0.07em, -0.23em)' : 'translateX(-0.3em)'};
  }

  ${({ mark }) =>
    (mark === '·' || mark === '。') &&
    css`
      > span {
        visibility: hidden;
      }

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        width: ${mark === '·' ? '0.12em' : '0.26em'};
        height: ${mark === '·' ? '0.12em' : '0.26em'};
        border-radius: 50%;
        ${mark === '·'
          ? css`
              background: currentColor;
            `
          : css`
              border: 0.05em solid currentColor;
            `}
      }
    `};
`;

const VersesContent = (props) => {
  const {
    verses: {
      content,
      custom,
      origin: { author, title },
    },
    engineOption,
    isVertical,
    isNvshu,
    fontSize,
    original,
    originalFont,
    originalScript,
  } = props;

  const searchLink = engineOption + encodeURIComponent(author + ' ' + title);
  const columns = isVertical ? (pureWords(content).trim() || content).split(/\s+/) : [];
  const verticalColumns = custom
    ? columns.flatMap((column) => column.match(/.{1,8}/gu) || [])
    : columns;
  const originalContent = original && (isVertical ? pureWords(original.content) : original.content);
  const originalTitle = original?.origin.title ? `「${original.origin.title}」` : '';
  const originalAuthor = original?.origin.author || '';
  const originalOrigin = [originalTitle, originalAuthor].filter(Boolean).join(' · ');
  const titleContent = `「${title}」`;
  const titleText = title && (
    <span className="title">
      {isVertical && isNvshu
        ? titleContent.split(/([、·。])/u).map((part, index) =>
            part === '、' || part === '·' || part === '。' ? (
              <VerticalPunctuation key={index} mark={part}>
                <span>{part}</span>
              </VerticalPunctuation>
            ) : (
              part
            )
          )
        : titleContent}
    </span>
  );
  // Allow for Fengqi's longer vertical advances, brackets, and the author stamp.
  const verticalMetrics = isVertical
    ? {
        poemHeight: Math.max(1, ...verticalColumns.map(length)) * 1.45,
        poemWidth: verticalColumns.length * 1.35 + 3,
        originHeight: (length(title) + 2 + length(author) * 0.67) * 1.45 + 2.5,
        originalHeight: original
          ? Math.max(length(originalContent), length(originalOrigin) * 0.78) * 1.45
          : 1,
      }
    : null;

  return (
    <>
      <Content
        fontSize={fontSize}
        isVertical={isVertical}
        isCustom={custom}
        verticalMetrics={verticalMetrics}
      >
        {isVertical ? verticalColumns.join('\n') : content}
      </Content>
      {(title || author) && (
        <Origin isVertical={isVertical} hasOriginal={!!original} verticalMetrics={verticalMetrics}>
          {title &&
            (custom ? (
              titleText
            ) : (
              <a href={searchLink} target="_blank" rel="noopener noreferrer">
                {titleText}
              </a>
            ))}
          {author && <Stamp isVertical={isVertical}>{author}</Stamp>}
          {!isVertical && !custom && (
            <Search>
              <Icon size={14} icon="search-text" color="black" />
            </Search>
          )}
        </Origin>
      )}
      {original && (
        <Original
          aria-label="汉字原文"
          fontName={originalFont}
          verticalMetrics={verticalMetrics}
          lang={originalScript === 'simplified' ? 'zh-Hans' : 'zh-Hant'}
        >
          {originalContent}
          {originalOrigin && (
            <OriginalOrigin isVertical={isVertical}>{originalOrigin}</OriginalOrigin>
          )}
        </Original>
      )}
    </>
  );
};

VersesContent.propTypes = {
  verses: PropTypes.object,
  isVertical: PropTypes.bool,
  isNvshu: PropTypes.bool,
  fontSize: PropTypes.number,
  original: PropTypes.shape({
    content: PropTypes.string.isRequired,
    origin: PropTypes.shape({ author: PropTypes.string, title: PropTypes.string }).isRequired,
  }),
  originalFont: PropTypes.string,
  originalScript: PropTypes.string,
  engineOption: PropTypes.string,
  fontName: PropTypes.string,
  isDarkMode: PropTypes.bool,
};

export default VersesContent;
