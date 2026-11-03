const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const { spawnSync } = require('child_process');
const args = process.versions.openssl.startsWith('3.') ? ['--openssl-legacy-provider'] : [];
const result = spawnSync(
  process.execPath,
  [...args, require.resolve('webpack/bin/webpack.js'), '--mode', 'production'],
  {
    stdio: 'inherit',
  }
);
if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;

if (process.exitCode === 0) {
  const wrapperRequire = createRequire(require.resolve('react-p5-wrapper/package.json'));
  const libraries = [
    ['p5', wrapperRequire],
    ['microdiff', wrapperRequire],
    ...[
      'react',
      'react-dom',
      'react-p5-wrapper',
      'evergreen-ui',
      'styled-components',
      'retina-dom-to-image',
      'lodash',
    ].map((name) => [name, require]),
  ];
  for (const [name, resolveFrom] of libraries) {
    let dir = path.dirname(resolveFrom.resolve(name));
    while (path.basename(dir) !== name && path.dirname(dir) !== dir) dir = path.dirname(dir);
    if (path.basename(dir) !== name) continue;
    const notice = fs.readdirSync(dir).find((file) => /^licen[sc]e(?:\..*)?$/i.test(file));
    if (!notice) continue;
    for (const browser of ['chrome', 'firefox']) {
      fs.copyFileSync(
        path.join(dir, notice),
        path.join('builds', 'build_' + browser, 'static', 'licenses', name + '.txt')
      );
    }
  }
  const opencc = path.resolve(path.dirname(require.resolve('opencc-js')), '../..');
  for (const browser of ['chrome', 'firefox']) {
    const destination = path.join('builds', 'build_' + browser, 'static', 'licenses');
    for (const [file, output] of [
      ['LICENSE', 'opencc-js.txt'],
      ['THIRD_PARTY_LICENSES.md', 'opencc-js-third-party.md'],
      ['LICENSES/Apache-2.0.txt', 'opencc-js-apache.txt'],
    ])
      fs.copyFileSync(path.join(opencc, file), path.join(destination, output));
  }
}
