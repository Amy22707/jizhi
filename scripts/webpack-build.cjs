const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { root, buildRoot, buildDirectory, selectedTargets, packageTargets } = require('../build');

function prepareDirectories(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isDirectory())
      prepareDirectories(path.join(source, entry.name), path.join(destination, entry.name));
  }
}

function addNotices(directory) {
  const destination = path.join(directory, 'static', 'licenses');
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
    if (notice) fs.copyFileSync(path.join(dir, notice), path.join(destination, name + '.txt'));
  }
  const opencc = path.resolve(path.dirname(require.resolve('opencc-js')), '../..');
  for (const [file, output] of [
    ['LICENSE', 'opencc-js.txt'],
    ['THIRD_PARTY_LICENSES.md', 'opencc-js-third-party.md'],
    ['LICENSES/Apache-2.0.txt', 'opencc-js-apache.txt'],
  ])
    fs.copyFileSync(path.join(opencc, file), path.join(destination, output));
  fs.copyFileSync(path.join(root, 'CREDITS.md'), path.join(destination, 'credits.md'));
}

async function main() {
  const browsers = selectedTargets(process.argv[2]);
  fs.mkdirSync(buildRoot, { recursive: true });
  const realRoot = fs.realpathSync(root);
  if (fs.realpathSync(buildRoot) !== path.join(realRoot, 'builds')) {
    throw new Error('The builds directory must be inside the project');
  }
  const compiled = fs.mkdtempSync(path.join(buildRoot, '.compile-'));
  try {
    // Pre-create the asset directories to avoid Webpack 4 mkdir races on Windows.
    prepareDirectories(path.join(root, 'src', 'static'), path.join(compiled, 'static'));
    fs.mkdirSync(path.join(compiled, 'assets'));
    const args = process.versions.openssl.startsWith('3.') ? ['--openssl-legacy-provider'] : [];
    const result = spawnSync(
      process.execPath,
      [
        ...args,
        require.resolve('webpack/bin/webpack.js'),
        '--mode',
        'production',
        '--output-path',
        compiled,
      ],
      { cwd: root, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } }
    );
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error('Webpack exited with status ' + result.status);
    addNotices(compiled);

    for (const browser of browsers) {
      const destination = buildDirectory(browser);
      if (
        fs.existsSync(destination) &&
        fs.realpathSync(destination) !== path.join(realRoot, 'builds', path.basename(destination))
      ) {
        throw new Error('Refusing to replace redirected output: ' + destination);
      }
      fs.rmSync(destination, { recursive: true, force: true });
      fs.cpSync(compiled, destination, { recursive: true });
      const template = browser === 'firefox' ? 'firefox' : 'chrome';
      const manifest = require(path.join(root, template + '.manifest.json'));
      const version = require('../package.json').version;
      fs.writeFileSync(
        path.join(destination, 'manifest.json'),
        JSON.stringify({ ...manifest, version }, null, 2) + '\n'
      );
      fs.copyFileSync(
        path.join(root, 'extension.background.js'),
        path.join(destination, 'background.js')
      );
    }
    await packageTargets(browsers);
  } finally {
    if (fs.realpathSync(compiled) === path.join(realRoot, 'builds', path.basename(compiled))) {
      fs.rmSync(compiled, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
