import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, Pane, Text, TextInputField } from 'evergreen-ui';
import styled from 'styled-components';
import icons from '../constants/shortcut-icons.json';
import Storager from '../utils/storager';

const MAX_SHORTCUTS = 8;
const STORAGE_KEY = 'shortcuts';
const siteIcons = new Map(
  Object.values(icons).flatMap(({ hosts, file }) =>
    hosts.map((host) => [host, './static/site-icons/' + file])
  )
);

const Bar = styled.nav`
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 18px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: max(44px, calc(100vh - 140px));
  padding: 4px;
  overflow-y: auto;
  color: ${({ dark }) => (dark ? '#f0f0f0' : '#222')};
  font-family: system-ui, sans-serif;
  scrollbar-width: thin;
`;

const Tile = styled.div`
  flex: 0 0 auto;
  position: relative;
`;

const TileFace = styled.a`
  box-sizing: border-box;
  width: 44px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: rgba(128, 128, 128, 0.16);
  }
`;

const Badge = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ dark }) => (dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.64)')};
  font-size: 15px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 150ms ease;

  ${Tile}:hover &,
  ${Tile}:focus-within & {
    opacity: 1;
  }
`;

const Favicon = styled.img`
  width: 17px;
  height: 17px;
  object-fit: contain;
`;

const Edit = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${({ dark }) => (dark ? '#494949' : '#fff')};
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;

  ${Tile}:hover &,
  ${Tile}:focus-within & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

function ShortcutIcon({ name, url, isDarkMode }) {
  const [attempt, setAttempt] = useState(0);
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  const candidates = [
    siteIcons.get(hostname),
    new URL('/favicon.ico', url).href,
    new URL('/favicon.svg', url).href,
  ].filter(Boolean);
  const source = candidates[attempt];
  return (
    <Badge aria-hidden="true" dark={isDarkMode}>
      {!source ? (
        Array.from(name)[0]?.toUpperCase()
      ) : (
        <Favicon
          src={source}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setAttempt(attempt + 1)}
        />
      )}
    </Badge>
  );
}

ShortcutIcon.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

function parseAddress(value) {
  const address = value.trim();
  if (!address || /[\s\\]/.test(address) || address.startsWith('/')) return undefined;
  const explicitHttp = /^https?:\/\//i.test(address);
  const otherScheme = /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i.test(address);
  if (!explicitHttp && otherScheme) return undefined;
  try {
    const url = new URL(explicitHttp ? address : 'https://' + address);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

function readShortcuts() {
  let shortcuts = [];
  Storager.get([STORAGE_KEY], (saved) => {
    if (!Array.isArray(saved.shortcuts)) return;
    shortcuts = saved.shortcuts
      .filter(
        (item) =>
          item &&
          typeof item.name === 'string' &&
          typeof item.url === 'string' &&
          /^https?:\/\//i.test(item.url) &&
          parseAddress(item.url)
      )
      .slice(0, MAX_SHORTCUTS);
  });
  return shortcuts;
}

const Shortcuts = ({ isDarkMode }) => {
  const [shortcuts, setShortcuts] = useState(readShortcuts);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = ({ key }) => {
      if (!key || key === STORAGE_KEY) setShortcuts(readShortcuts());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const open = (shortcut) => {
    setError('');
    setDraft(
      shortcut
        ? { previousUrl: shortcut.url, name: shortcut.name, address: shortcut.url }
        : { previousUrl: '', name: '', address: '' }
    );
  };

  const persist = (next) => {
    Storager.set({ shortcuts: next });
    setShortcuts(next);
    setDraft(null);
  };

  const save = (event) => {
    event.preventDefault();
    const url = parseAddress(draft.address);
    if (!url) {
      setError('请输入有效的 HTTP 或 HTTPS 网址。');
      return;
    }
    const latest = readShortcuts();
    const index = latest.findIndex((item) => item.url === draft.previousUrl);
    if (draft.previousUrl && index < 0) {
      setError('这条网址已在其他标签页更改，请关闭后重试。');
      return;
    }
    if (latest.some((item, i) => i !== index && item.url === url.href)) {
      setError('这条网址已经固定。');
      return;
    }
    if (index < 0 && latest.length >= MAX_SHORTCUTS) {
      setError('最多固定 8 个网址，请先移除一条。');
      return;
    }
    const shortcut = { name: draft.name.trim() || url.hostname, url: url.href };
    if (index < 0) latest.push(shortcut);
    else latest[index] = shortcut;
    persist(latest);
  };

  return (
    <>
      <Bar id="jizhi-shortcuts" aria-label="常用网址" dark={isDarkMode}>
        {shortcuts.map(({ url, name }) => (
          <Tile key={url}>
            <TileFace href={url} title={name} aria-label={name}>
              <ShortcutIcon name={name} url={url} isDarkMode={isDarkMode} />
            </TileFace>
            <Edit
              type="button"
              dark={isDarkMode}
              aria-label={`编辑 ${name}`}
              onClick={() => open({ url, name })}
            >
              ···
            </Edit>
          </Tile>
        ))}
        {shortcuts.length < MAX_SHORTCUTS && (
          <Tile>
            <TileFace
              as="button"
              type="button"
              title="添加网址"
              aria-label="添加网址"
              onClick={() => open()}
            >
              <Badge aria-hidden="true" dark={isDarkMode}>
                ＋
              </Badge>
            </TileFace>
          </Tile>
        )}
      </Bar>
      <Dialog
        isShown={!!draft}
        title={draft?.previousUrl ? '编辑常用网址' : '添加常用网址'}
        onCloseComplete={() => setDraft(null)}
        hasFooter={false}
      >
        {draft && (
          <form onSubmit={save}>
            <TextInputField
              label="名称"
              placeholder="留空时使用网站域名"
              value={draft.name}
              maxLength={32}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <TextInputField
              label="网址"
              placeholder="example.com"
              value={draft.address}
              autoComplete="off"
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
            />
            {error && (
              <Text role="alert" color="#a73636">
                {error}
              </Text>
            )}
            <Pane display="flex" justifyContent="flex-end" gap={8} marginTop={16}>
              {draft.previousUrl && (
                <Button
                  type="button"
                  intent="danger"
                  marginRight="auto"
                  onClick={() =>
                    persist(readShortcuts().filter(({ url }) => url !== draft.previousUrl))
                  }
                >
                  移除
                </Button>
              )}
              <Button type="button" onClick={() => setDraft(null)}>
                取消
              </Button>
              <Button type="submit" appearance="primary">
                保存
              </Button>
            </Pane>
          </form>
        )}
      </Dialog>
    </>
  );
};

Shortcuts.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
};

export default Shortcuts;
