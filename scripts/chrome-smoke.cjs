const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const chrome = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const target = process.argv[3] || 'chrome';
if (!['chrome', 'edge'].includes(target)) throw new Error('Target must be chrome or edge');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jizhi-smoke-'));
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--disable-background-networking',
  '--enable-unsafe-extension-debugging', '--remote-debugging-pipe', '--user-data-dir=' + profile,
  'about:blank'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], windowsHide: true });
let counter = 0;
let buffer = '';
const pending = new Map();
const externalRequests = [];
const pageErrors = [];
const navigations = new Map();
child.stdio[4].on('data', (data) => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url)) {
      externalRequests.push(message.params.request.url);
    }
    if (message.method === 'Runtime.exceptionThrown') pageErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Page.loadEventFired') navigations.get(message.sessionId)?.();
    if (pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  }
});
function send(method, params = {}, sessionId) {
  const id = ++counter;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out: ' + method)), 15000);
    pending.set(id, (m) => {
      clearTimeout(timer);
      if (m.error) reject(new Error(method + ': ' + m.error.message));
      else resolve(m.result);
    });
    child.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}
async function main() {
  const { id } = await send('Extensions.loadUnpacked', { path: path.resolve('builds/build_' + target) });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await call('Network.enable');
  await call('Runtime.enable');
  await call('Page.enable');
  await call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  const history = new Set();
  for (let i = 0; i < 21; i++) {
    const loaded = new Promise((resolve) => navigations.set(sessionId, resolve));
    if (!i) await call('Page.navigate', { url: target === 'edge' ? 'edge://newtab/' : 'chrome://newtab/' });
    else await call('Page.reload');
    await Promise.race([loaded, new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('Page did not load')), 5000);
      loaded.then(() => clearTimeout(timer));
    })]);
    const text = await evaluate(`new Promise((resolve) => {
      const stop = Date.now() + 5000;
      const tick = () => {
        const text = document.querySelector('.title')?.parentElement?.parentElement?.parentElement?.firstChild?.textContent;
        if (text && document.querySelector('canvas')) resolve(text);
        else if (Date.now() > stop) resolve(null);
        else setTimeout(tick, 30);
      };
      tick();
    })`);
    assert.ok(text, 'Expected a visible verse and canvas');
    assert.ok(!history.has(text), 'Unexpected repeat: ' + text);
    history.add(text);
  }
  assert.match(await evaluate('location.href'), new RegExp('^chrome-extension://' + id + '/'));
  const frame = await evaluate("document.querySelector('canvas').toDataURL()");
  await new Promise((resolve) => setTimeout(resolve, 450));
  assert.notEqual(await evaluate("document.querySelector('canvas').toDataURL()"), frame, 'Canvas did not animate');
  const controls = await evaluate(`new Promise((resolve) => {
    document.getElementById('menu-button').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    setTimeout(() => {
      document.getElementById('个性化')?.click();
      setTimeout(() => {
        const panel = document.getElementById('panel-个性化');
        const favorite = [...panel.querySelectorAll('[role=menuitemradio]')].find((item) => item.textContent.includes('明月几时有'));
        favorite?.click();
        resolve({ search: !!panel.querySelector('[aria-label="搜索诗句"]'),
          size: !!panel.querySelector('[type=range]'), fontSizes: document.getElementById('panel-字体').querySelectorAll('[type=range]').length, nativeSelect: !!panel.querySelector('select'),
          favorite: !!favorite });
      }, 150);
    }, 150);
  })`);
  assert.deepEqual(controls, { search: true, size: false, fontSizes: 2, nativeSelect: false, favorite: true });
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('personalization')).personalization.verse"), '2d84faf60c2a8a0a2a98');
  const pinned = require('../src/constants/enhanced-verses.json').find((verse) => verse.id === 'e9d41c44f2d80da227cb');
  await evaluate(`(() => {
    localStorage.setItem('fontName', JSON.stringify({ fontName: 'nvshu' }));
    localStorage.setItem('versesLayout', JSON.stringify({ versesLayout: 'vertical' }));
    localStorage.setItem('personalization', JSON.stringify({ personalization: {
      size: 36, script: 'simplified', color: 'custom', custom: '#123456', verse: ${JSON.stringify(pinned.id)}
    } }));
  })()`);
  const reloaded = new Promise((resolve) => navigations.set(sessionId, resolve));
  await call('Page.reload');
  await reloaded;
  const appearance = await evaluate(`new Promise((resolve) => {
    const end = Date.now() + 5000;
    const tick = async () => {
      const root = document.querySelector('[lang=zh-Hans]');
      if (root) {
        await document.fonts.ready;
        const poem = document.querySelector('.title').parentElement.parentElement.previousElementSibling;
        resolve({ poem: poem.textContent,
          size: parseFloat(getComputedStyle(poem).fontSize),
          loaded: [...document.fonts].some((face) => face.family === 'JizhiFengqi' && face.status === 'loaded'),
          script: poem.closest('[lang=zh-Hans]')?.lang,
          font: getComputedStyle(poem).fontFamily, standaloneMark: !!root.querySelector('[lang=zh-Nshu]') });
      } else if (Date.now() > end) resolve(null);
      else setTimeout(tick, 30);
    };
    tick();
  })`);
  assert.equal(appearance.poem.replace(/\s/g, ''), require('opencc-js').Converter({ from: 'tw', to: 'cn' })(pinned.content).replace(/[，。！？、]/g, ''));
  assert.notEqual(appearance.poem, pinned.content);
  assert.equal(appearance.script, 'zh-Hans');
  assert.equal(appearance.standaloneMark, false);
  assert.ok(appearance.size > 36);
  assert.match(appearance.font, /JizhiFengqi/);
  assert.equal(appearance.loaded, true);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(pageErrors, []);
  await evaluate('document.fonts.ready.then(() => true)');
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const { data } = await call('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync('.data-work', { recursive: true });
  fs.writeFileSync('.data-work/chrome-smoke.png', Buffer.from(data, 'base64'));
  const converter = require('opencc-js').Converter({ from: 'cn', to: 'tw' });
  const example = require('../src/constants/enhanced-verses.json').find((verse) => converter(verse.content) !== verse.content);
  await evaluate(`(() => {
    localStorage.setItem('fontName', JSON.stringify({ fontName: 'notoseriftc' }));
    localStorage.setItem('versesLayout', JSON.stringify({ versesLayout: 'horizontal' }));
    localStorage.setItem('personalization', JSON.stringify({ personalization: {
      script: 'traditional', verse: ${JSON.stringify(example.id)}
    } }));
  })()`);
  const tcLoaded = new Promise((resolve) => navigations.set(sessionId, resolve));
  await call('Page.reload');
  await tcLoaded;
  const traditional = await evaluate(`new Promise((resolve) => {
    const end = Date.now() + 5000;
    const tick = async () => {
      const root = document.querySelector('[lang=zh-Hant]');
      if (root) {
        await document.fonts.ready;
        resolve({ poem: root.firstElementChild.textContent,
          font: [...document.fonts].some((face) => face.family.includes('Noto Serif TC') && face.status === 'loaded') });
      } else if (Date.now() > end) resolve(null);
      else setTimeout(tick, 30);
    };
    tick();
  })`);
  assert.deepEqual(traditional, { poem: converter(example.content), font: true });
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(pageErrors, []);
  const downloads = path.join(profile, 'downloads');
  fs.mkdirSync(downloads);
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await evaluate("document.querySelector('.App').dispatchEvent(new KeyboardEvent('keydown', {bubbles:true,keyCode:83,altKey:true})); true");
  const image = path.join(downloads, 'jizhi.png');
  for (let i = 0; i < 80 && !fs.existsSync(image); i++) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(fs.existsSync(image) && fs.readFileSync(image).subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'PNG was not downloaded');
  const browser = await send('Browser.getVersion');
  console.log(target + ' ' + browser.product + ': native new tab, 21 offline loads, fonts, animation and PNG verified.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => child.kill());
