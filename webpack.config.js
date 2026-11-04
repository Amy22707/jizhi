const path = require('node:path');
const { createRequire } = require('node:module');
const neutrino = require('neutrino');

const config = neutrino().webpack();
if (process.env.NODE_ENV === 'production') {
  const wrapperRequire = createRequire(require.resolve('react-p5-wrapper/package.json'));
  config.resolve.alias = {
    ...config.resolve.alias,
    p5$: wrapperRequire.resolve('p5/lib/p5.js'),
  };
  config.module.rules.push({
    test: /[\\/](?:p5[\\/]lib[\\/]p5|lodash[\\/]_root|lodash\.[^\\/]+[\\/]index|webpack[\\/]buildin[\\/]global|regenerator-runtime[\\/]runtime(?:-module)?)\.js$/,
    use: path.resolve(__dirname, 'scripts/csp-fallbacks-loader.cjs'),
  });
}
module.exports = config;
