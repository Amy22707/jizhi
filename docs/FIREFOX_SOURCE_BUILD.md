# Firefox source build for AMO review

The reviewer archive contains the original React JSX, the p5 sketches, the webpack configuration, the npm lockfile and the exact local poetry, color, icon and font assets used by the build. No separately generated font or dataset is required.

## Reproduce the submitted package

The build uses Node.js 24 and npm 11. It was developed on Windows; the commands below are also intended to run in the Mozilla review environment on Linux.

1. Extract `firefox-source.zip` into an empty directory.
2. Open a terminal at the directory containing `package.json`.
3. Run:

   ```sh
   npm ci --legacy-peer-deps --ignore-scripts
   npm run build:firefox
   npm run verify:builds -- firefox
   npm run lint:firefox
   ```

The unpacked output is `builds/build_firefox/` and the upload is `builds/firefox.zip`. ZIP container timestamps may differ. To compare builds, compare the files extracted from the ZIPs. The package version in `package.json` is used for the final manifest.

Dependencies are obtained from the npm registry using the versions and integrity hashes in `package-lock.json`. No download of browser fonts, poem datasets or scripts is performed during the webpack build. Webpack 4 uses its legacy OpenSSL build flag where applicable. In production, the named loader in `scripts/csp-fallbacks-loader.cjs` adapts old dynamic code fallbacks in p5 and related dependencies for modern browser CSP. The original dependency sources are the locked npm packages. The repo records the bundled assets in [CREDITS.md](../CREDITS.md).

## Reviewer notes

- Temporarily load `firefox.zip` from `about:debugging#/runtime/this-firefox` on desktop Firefox 142 or newer. The toolbar button opens a new tab and the new tab override loads the extension page.
- Core behavior is offline. The optional search form sends the submitted query to the selected search engine. Optional remote icons contact the origin of a manually pinned URL. Neither starts network transfers on a fresh install. Built-in Firefox data consent is requested before these optional transfers.
- The `required: ["none"]` entry describes required data only. The separate optional list declares `searchTerms` and `browsingActivity`. The AMO linter rejects a missing or empty required list. See [privacy details](../PRIVACY.md).
