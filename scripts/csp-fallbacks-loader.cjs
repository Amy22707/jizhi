/**
 * Drop old JavaScript-engine fallbacks that use the Function constructor.
 * This loader runs on named, locked dependency files in production only.
 */
module.exports = function cspFallbacks(source) {
  let result = source.replace(/(?:new\s+)?Function\((['"])return this\1\)\(\)/g, 'globalThis');
  if (/[\\/]p5[\\/]lib[\\/]p5\.js$/.test(this.resourcePath)) {
    const constructorFallback =
      /var factories = \{\};\s*var construct = function\(C, argsLength, args\) \{[\s\S]*?return factories\[argsLength\]\(C, args\);\s*\};/;
    const stringTimer =
      /\(typeof fn == 'function' \? fn : Function\(fn\)\)\.apply\(undefined, args\);/;
    if (!constructorFallback.test(result) || !stringTimer.test(result)) {
      throw new Error('p5 compatibility fallback changed; review the extension CSP patch');
    }
    result = result
      .replace(
        constructorFallback,
        'var construct = function(C, argsLength, args) { return Reflect.construct(C, args); };'
      )
      .replace(
        stringTimer,
        "if (typeof fn !== 'function') throw new TypeError('Expected a callback'); fn.apply(undefined, args);"
      )
      .replace(/eval\((tempArray\[i\]|functionArray\[_i5\])\)/g, 'globalThis[$1]')
      .replace(
        /var c = 'function' == typeof require && require;\s*if \(!f && c\) return c\(i, !0\);\s*if \(u\) return u\(i, !0\);/,
        ''
      );
  }
  return result;
};
