const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildRoot, buildDirectory } = require('../build');

const webExtPackage = path.join(path.dirname(require.resolve('web-ext')), 'package.json');
const executable = path.resolve(path.dirname(webExtPackage), require(webExtPackage).bin['web-ext']);
const result = spawnSync(
  process.execPath,
  [
    executable,
    'lint',
    '--source-dir',
    buildDirectory('firefox'),
    '--output',
    'json',
    '--boring',
    '--no-input',
    '--no-config-discovery',
  ],
  {
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
  }
);
if (result.error) throw result.error;
if (result.stderr) process.stderr.write(result.stderr);
const report = JSON.parse(result.stdout);
fs.writeFileSync(path.join(buildRoot, 'firefox-lint.json'), JSON.stringify(report, null, 2) + '\n');
const warnings = {};
for (const item of report.warnings) warnings[item.code] = (warnings[item.code] || 0) + 1;
console.log('Mozilla web-ext lint:', report.summary, warnings);
console.log('Full report: builds/firefox-lint.json');
for (const item of report.errors) console.error(item.code, item.file, item.message);

// The bundled drawing/export dependencies still trigger innerHTML heuristics.
// Reject new warning categories, any warning from application/background code,
// and changes to the reviewed number of dependency warnings.
const reviewedWarning = (item) =>
  item.code === 'UNSAFE_VAR_ASSIGNMENT' && /^assets\/2\.[0-9a-f]+\.js$/.test(item.file);
if (
  result.status !== 0 ||
  report.warnings.some((item) => !reviewedWarning(item)) ||
  report.warnings.length > 49
) {
  process.exitCode = 1;
}
