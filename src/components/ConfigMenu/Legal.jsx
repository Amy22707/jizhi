import React from 'react';
import PropTypes from 'prop-types';
import { Paragraph, Avatar, Heading, Pane, HeartIcon } from 'evergreen-ui';
import styled, { keyframes } from 'styled-components';
import { WAVES, JIZHI_LINKS } from '../../constants/appConstants';
import { colorOptions, verseOptions } from '../../utils/enhanced';
import { version } from '../../../package.json';
import CustomLink from './CustomLink';

const pulse = keyframes`
  10% {
    transform: scale(1.2)
  }
`;

const HeartPulse = styled(HeartIcon)`
  animation: ${pulse} 1.2s infinite;
`;

const LegalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 20px;
`;

const Legal = ({ waveColor, selected }) => {
  const hex = waveColor.hex || '';

  return (
    <LegalWrapper>
      <Pane display="flex" alignItems="center">
        <Avatar src="/static/icons/jizhi-64.png" size={32} name="几枝" />
        <Heading size={500} marginLeft={10}>
          几枝·增强版 v{version}
        </Heading>
      </Pane>

      {selected === WAVES && (
        <Paragraph size={400} marginTop="default">
          中国色：{hex.toUpperCase()} | {waveColor && waveColor.name}
        </Paragraph>
      )}
      <Paragraph size={400} marginTop="default">
        <CustomLink url={JIZHI_LINKS.home.link} name={JIZHI_LINKS.home.name} />
        <CustomLink url={JIZHI_LINKS.issues.link} name={JIZHI_LINKS.issues.name} />
      </Paragraph>
      <Paragraph size={400} marginTop="default">
        几枝·增强版基于 Unicar 和贡献者开发的几枝。诗词与传统色均可离线使用。
        <CustomLink url={JIZHI_LINKS.upstream.link} name={JIZHI_LINKS.upstream.name} />
      </Paragraph>
      <Paragraph size={400} marginTop="default">
        离线诗库收录 {verseOptions.length.toLocaleString('zh-CN')} 条诗句，摘自
        <CustomLink url="https://github.com/chinese-poetry/chinese-poetry" name="Chinese Poetry" />
        的唐诗和宋词。波浪配色库收录 {colorOptions.length.toLocaleString('zh-CN')}{' '}
        种传统色，来自原版几枝和
        <CustomLink url="https://github.com/zerosoul/chinese-colors" name="Chinese Colors" />。
      </Paragraph>
      <Paragraph size={400} marginTop="default">
        <HeartPulse color="#e25555" size={14} marginRight={5} />
        感谢您的支持和喜爱
      </Paragraph>
    </LegalWrapper>
  );
};

Legal.propTypes = {
  waveColor: PropTypes.object,
  selected: PropTypes.string,
};

export default Legal;
