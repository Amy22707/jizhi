const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');
const { buildRoot, buildDirectory, selectedTargets } = require('../build');
const { version } = require('../package.json');

const forbidden =
  /(?:^|\/)(?:node_modules|\.git|\.data-work|\.env[^/]*)(?:\/|$)|\.(?:pem|key|p12|pfx|crx|xpi|exe|log|map)$/i;

function openZip(file) {
  const zip = new AdmZip(file);
  assert.ok(zip.test(), 'Corrupt ZIP: ' + file);
  const entries = new Map();
  for (const entry of zip.getEntries()) {
    const name = entry.entryName;
    assert.ok(
      !name.startsWith('/') && !name.includes('\\') && !name.split('/').includes('..'),
      name
    );
    assert.ok(!forbidden.test(name), 'Unexpected ZIP entry: ' + name);
    if (entry.isDirectory) continue;
    assert.ok(!entries.has(name), 'Duplicate ZIP entry: ' + name);
    entries.set(name, entry.getData());
  }
  return entries;
}

function verifyBrowser(browser) {
  const entries = openZip(path.join(buildRoot, browser + '.zip'));
  const read = (name) => {
    assert.ok(entries.has(name) && entries.get(name).length, 'Missing or empty file: ' + name);
    return entries.get(name);
  };
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, version);
  assert.equal(manifest.name, '几枝·增强版');
  assert.match(manifest.description, /非官方/);
  assert.deepEqual(manifest.permissions || [], []);
  assert.deepEqual(manifest.host_permissions || [], []);
  assert.deepEqual(manifest.optional_host_permissions || [], []);
  assert.deepEqual(manifest.content_security_policy, {
    extension_pages: "script-src 'self'; object-src 'self'",
  });
  assert.equal(manifest.chrome_url_overrides.newtab, 'index.html');

  if (browser === 'firefox') {
    assert.equal(manifest.browser_specific_settings.gecko.id, 'jizhi-enhanced@amy22707.github.io');
    const consent = manifest.browser_specific_settings.gecko.data_collection_permissions;
    assert.deepEqual(consent.required, ['none']);
    assert.deepEqual(consent.optional, ['searchTerms', 'browsingActivity']);
    assert.deepEqual(manifest.background, { scripts: ['background.js'] });
  } else {
    assert.equal(manifest.browser_specific_settings, undefined);
    assert.deepEqual(manifest.background, { service_worker: 'background.js' });
  }
  read('background.js');

  for (const icons of [manifest.icons, manifest.action.default_icon]) {
    for (const [size, name] of Object.entries(icons)) {
      const png = read(name.replace(/^\.\//, ''));
      assert.equal(png.readUInt32BE(16), Number(size), name);
      assert.equal(png.readUInt32BE(20), Number(size), name);
    }
  }
  const html = read('index.html').toString('utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0);
  for (const [, attributes, body] of scripts) {
    assert.equal(body.trim(), '', 'Inline script in new tab');
    const source = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    assert.ok(
      source && /^(?:\.\/|\/)?assets\/[a-zA-Z0-9._-]+\.js$/.test(source),
      'External or invalid script: ' + source
    );
    read(source.replace(/^(?:\.\/|\/)/, ''));
  }
  for (const name of fs.readdirSync('src/static/fonts', { recursive: true })) {
    if (fs.statSync(path.join('src/static/fonts', name)).isFile()) {
      read('static/fonts/' + name.split(path.sep).join('/'));
    }
  }
  for (const { file } of Object.values(require('../src/constants/shortcut-icons.json')))
    read('static/site-icons/' + file);
  read('static/licenses/credits.md');

  const assets = [...entries].filter(
    ([name]) => name.startsWith('assets/') && name.endsWith('.js')
  );
  const js = assets.map(([, content]) => content.toString('utf8')).join('\n');
  // Both datasets are bundled into JavaScript rather than fetched at runtime.
  assert.ok(js.includes(require('../src/constants/enhanced-verses.json')[0].id));
  assert.ok(js.includes(require('../src/constants/enhanced-colors.json')[0].hex));
  assert.doesNotMatch(js, /jinrishici\.com\/one\.json|netlify\.app\/.*\.woff\.json/);
  const output = buildDirectory(browser);
  const outputFiles = fs
    .readdirSync(output, { recursive: true })
    .filter((name) => fs.statSync(path.join(output, name)).isFile());
  assert.equal(outputFiles.length, entries.size, 'ZIP and unpacked output differ');
  for (const [name, content] of entries) {
    assert.ok(
      content.equals(fs.readFileSync(path.join(output, name))),
      'ZIP and unpacked file differ: ' + name
    );
  }
  console.log(
    browser + ': MV3 ZIP, local assets, and contents verified (' + entries.size + ' files)'
  );
  return entries;
}

const results = new Map(
  selectedTargets(process.argv[2]).map((browser) => [browser, verifyBrowser(browser)])
);
if (results.has('chrome') && results.has('edge')) {
  const edge = results.get('edge');
  for (const [name, content] of results.get('chrome')) {
    assert.ok(edge.get(name)?.equals(content), 'Chromium targets differ: ' + name);
  }
  console.log('Chrome and Edge contain identical files.');
}
if (results.has('firefox')) {
  const source = openZip(path.join(buildRoot, 'firefox-source.zip'));
  for (const file of [
    'README.md',
    'package-lock.json',
    'firefox.manifest.json',
    'src/App.jsx',
    'scripts/webpack-build.cjs',
    'docs/FIREFOX_SOURCE_BUILD.md',
  ])
    assert.ok(source.get(file)?.length, 'Missing from Firefox source ZIP: ' + file);
  console.log('Firefox reviewer source ZIP verified.');
}
