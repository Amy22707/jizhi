import React from 'react';
import { Icon } from 'evergreen-ui';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { pureWords } from '../../utils';

const Content = styled.div`
  font-size: calc(
    ${({ fontSize }) => (Number.isFinite(fontSize) ? Math.min(48, Math.max(18, fontSize)) : 30)}px +
      1vw
  );
  width: 80vw;
  word-break: keep-all;
  ${(props) =>
    props.isVertical &&
    css`
      width: auto;
      line-height: 1.35;
    `};
`;

const OriginalOrigin = styled.div`
  font-size: 0.78em;
  margin-inline-start: 0.5em;
  opacity: 0.85;
`;

const Original = styled.div`
  font-family: ${({ fontName }) => fontName};
  font-size: calc(14px + 0.45vw);
  line-height: 1.5;
  margin-block-start: 1.2em;
  opacity: 0.78;
  text-align: center;
  word-break: keep-all;
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
      margin: 0;
      margin-right: 10px;
      text-align: center;
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

const VersesContent = (props) => {
  const {
    verses: {
      content,
      origin: { author, title },
    },
    engineOption,
    isVertical,
    fontSize,
    original,
    originalFont,
    originalScript,
  } = props;

  const searchLink = `${engineOption}${author} ${title}`;
  const filteredContent = isVertical ? pureWords(content) : content;

  return (
    <>
      <Content fontSize={fontSize} isVertical={isVertical}>
        {filteredContent}
      </Content>
      <Origin isVertical={isVertical} hasOriginal={!!original}>
        <a href={searchLink} target="_blank" rel="noopener noreferrer">
          <span className="title">{`「${title}」`}</span>
        </a>
        <Stamp isVertical={isVertical}>{author}</Stamp>
        <Search>
          <Icon size={14} icon="search-text" color="black" />
        </Search>
      </Origin>
      {original && (
        <Original
          aria-label="汉字原文"
          fontName={originalFont}
          lang={originalScript === 'simplified' ? 'zh-Hans' : 'zh-Hant'}
        >
          {isVertical ? pureWords(original.content) : original.content}
          <OriginalOrigin>{`「${original.origin.title}」 · ${original.origin.author}`}</OriginalOrigin>
        </Original>
      )}
    </>
  );
};

VersesContent.propTypes = {
  verses: PropTypes.object,
  isVertical: PropTypes.bool,
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
