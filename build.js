const fs = require('node:fs');
const path = require('node:path');
const archiver = require('archiver');

const root = __dirname;
const buildRoot = path.join(root, 'builds');
const targets = ['chrome', 'edge', 'firefox'];

function selectedTargets(argument = 'all') {
  if (argument === 'all') return targets;
  if (!targets.includes(argument)) throw new Error('Expected chrome, edge, firefox, or all');
  return [argument];
}

function buildDirectory(browser) {
  if (!targets.includes(browser)) throw new Error('Unknown browser: ' + browser);
  return path.join(buildRoot, 'build_' + browser);
}

function archiveTo(name, addEntries) {
  return new Promise((resolve, reject) => {
    const destination = path.join(buildRoot, name);
    const output = fs.createWriteStream(destination);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      console.log(name + ' · ' + (archive.pointer() / 1048576).toFixed(2) + ' MiB');
      resolve();
    });
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', reject);
    archive.pipe(output);
    addEntries(archive);
    archive.finalize().catch(reject);
  });
}

function packageBrowser(browser) {
  const directory = buildDirectory(browser);
  if (!fs.existsSync(path.join(directory, 'manifest.json'))) {
    throw new Error('Build ' + browser + ' before packaging it');
  }
  return archiveTo(browser + '.zip', (archive) => archive.directory(directory, false));
}

function packageFirefoxSource() {
  // This allowlist includes the checked-in assets used by webpack. It excludes
  // developer profiles, downloaded fonts, browser binaries, and generated files.
  const files = [
    'README.md',
    'CREDITS.md',
    'PRIVACY.md',
    'CHANGELOG.md',
    'LICENSE',
    '.neutrinorc.js',
    '.eslintrc.js',
    '.prettierrc',
    'jest.config.js',
    'package.json',
    'package-lock.json',
    'build.js',
    'webpack.config.js',
    'chrome.manifest.json',
    'firefox.manifest.json',
    'extension.background.js',
  ];
  return archiveTo('firefox-source.zip', (archive) => {
    for (const file of files) {
      const source = path.join(root, file);
      if (file === 'LICENSE' && !fs.existsSync(source)) continue;
      archive.file(source, { name: file });
    }
    for (const directory of ['src', 'scripts', 'docs']) {
      archive.glob(
        '**/*',
        {
          cwd: path.join(root, directory),
          ignore: ['**/__pycache__/**', '**/*.pyc', '**/.env*', '**/*.pem', '**/*.key'],
        },
        { prefix: directory }
      );
    }
  });
}

async function packageTargets(browsers) {
  await Promise.all(browsers.map(packageBrowser));
  if (browsers.includes('chrome')) {
    fs.copyFileSync(path.join(buildRoot, 'chrome.zip'), path.join(buildRoot, 'chrome_edge.zip'));
  }
  if (browsers.includes('firefox')) await packageFirefoxSource();
}

if (require.main === module) {
  Promise.resolve()
    .then(() => packageTargets(selectedTargets(process.argv[2])))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { root, buildRoot, buildDirectory, selectedTargets, packageTargets };
