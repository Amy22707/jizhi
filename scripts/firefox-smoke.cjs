const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const firefox = process.argv[2];
const driverPath = process.argv[3];
if (!firefox || !driverPath)
  throw new Error('Usage: node scripts/firefox-smoke.cjs <firefox.exe> <geckodriver.exe>');

async function freePort() {
  const socket = net.createServer();
  await new Promise((resolve, reject) =>
    socket.once('error', reject).listen(0, '127.0.0.1', resolve)
  );
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

async function main() {
  const port = await freePort();
  const base = 'http://127.0.0.1:' + port;
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'jizhi-firefox-downloads-'));
  const driver = spawn(
    path.resolve(driverPath),
    ['--port', String(port), '--allow-system-access'],
    {
      stdio: 'ignore',
      env: { ...process.env, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: '1' },
      windowsHide: true,
    }
  );
  let session;
  async function request(method, target, data) {
    const result = await fetch(base + target, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(15000),
    });
    const payload = await result.json();
    if (!result.ok) throw new Error(target + ': ' + JSON.stringify(payload.value));
    return payload.value;
  }
  try {
    for (let i = 0; ; i++) {
      try {
        await request('GET', '/status');
        break;
      } catch (error) {
        if (i === 29 || driver.exitCode !== null) throw error;
        await delay(150);
      }
    }
    const opened = await request('POST', '/session', {
      capabilities: {
        alwaysMatch: {
          browserName: 'firefox',
          'moz:firefoxOptions': {
            binary: path.resolve(firefox),
            args: ['-headless'],
            prefs: {
              'network.proxy.type': 1,
              'network.proxy.http': '127.0.0.1',
              'network.proxy.http_port': 9,
              'network.proxy.ssl': '127.0.0.1',
              'network.proxy.ssl_port': 9,
              'browser.download.folderList': 2,
              'browser.download.dir': downloads,
              'browser.download.useDownloadDir': true,
              'browser.helperApps.neverAsk.saveToDisk': 'image/png',
            },
          },
        },
      },
    });
    session = '/session/' + opened.sessionId;
    const call = (method, target, data) => request(method, session + target, data);
    const evalPage = (script) => call('POST', '/execute/sync', { script, args: [] });
    await call('POST', '/moz/addon/install', {
      path: path.resolve('builds/firefox.zip'),
      temporary: true,
    });
    await call('POST', '/moz/context', { context: 'chrome' });
    const newTabURL = await evalPage(`
      const { AboutNewTab } = ChromeUtils.importESModule('resource:///modules/AboutNewTab.sys.mjs');
      return AboutNewTab.newTabURL;
    `);
    assert.match(
      newTabURL,
      /^moz-extension:\/\//,
      'Native Firefox new tab override not registered'
    );
    await call('POST', '/moz/context', { context: 'content' });
    await call('POST', '/url', { url: newTabURL });
    const ready = async () => {
      for (let i = 0; i < 35; i++) {
        const state =
          await evalPage(`return { url: location.href, poem: document.querySelector('.title')?.textContent,
          canvas: !!document.querySelector('canvas'), color: !!document.querySelector('.App > div') };`);
        if (state.poem && state.canvas) return state;
        await delay(160);
      }
      throw new Error('Firefox new tab did not render: ' + (await call('GET', '/url')));
    };
    const seen = new Set();
    for (let i = 0; i < 21; i++) {
      if (i) await call('POST', '/refresh', {});
      const state = await ready();
      assert.match(state.url, /^moz-extension:\/\//);
      // Compare verse bodies, because different extracts can share a title.
      const poem = await evalPage(
        "return document.querySelector('.title').parentElement.parentElement.previousElementSibling.textContent"
      );
      assert.ok(poem && !seen.has(poem), 'Repeated poem in Firefox');
      seen.add(poem);
    }
    const frame = () => evalPage("return document.querySelector('canvas').toDataURL()");
    const before = await frame();
    await delay(450);
    assert.notEqual(await frame(), before, 'Canvas did not animate');
    await evalPage(`localStorage.setItem('fontName', JSON.stringify({fontName:'nyushu'}));
      localStorage.setItem('personalization', JSON.stringify({personalization:{verse:'e9d41c44f2d80da227cb',script:'simplified',color:'custom',custom:'#123456',customColorName:'烟岚青'}}));`);
    await call('POST', '/refresh', {});
    await ready();
    const fontAndColor = await call('POST', '/execute/async', {
      script: `const done = arguments[arguments.length - 1]; document.fonts.ready.then(() => done({
        fengqi: [...document.fonts].some(face => face.family === 'JizhiFengqi' && face.status === 'loaded'),
        color: document.querySelector('.App > div').textContent
      }));`,
      args: [],
    });
    assert.deepEqual(fontAndColor, { fengqi: true, color: '烟岚青' });
    await evalPage(
      `document.querySelector('.App').dispatchEvent(new KeyboardEvent('keydown', {bubbles:true,keyCode:83,altKey:true}));`
    );
    const png = path.join(downloads, 'jizhi.png');
    for (let i = 0; i < 80 && !fs.existsSync(png); i++) await delay(250);
    assert.ok(
      fs.existsSync(png) &&
        fs.readFileSync(png).subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
      'Firefox PNG was not downloaded'
    );
    console.log(
      'Firefox ' +
        opened.capabilities.browserVersion +
        ': temporary ZIP, registered new tab override, 21 offline poems, animation, custom color, bundled font and PNG verified.'
    );
  } finally {
    if (session) await request('DELETE', session).catch(() => {});
    driver.kill();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
