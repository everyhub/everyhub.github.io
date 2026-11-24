# Locally served browser bundles

- `pdf-lib-1.17.1.mjs`: `dist/pdf-lib.esm.min.js` from [pdf-lib 1.17.1](https://www.npmjs.com/package/pdf-lib/v/1.17.1), MIT; see `pdf-lib-LICENSE.md`.
- `qrcode-2.0.4.mjs`: `dist/qrcode.mjs` from [qrcode-generator 2.0.4](https://www.npmjs.com/package/qrcode-generator/v/2.0.4), MIT; see `qrcode-LICENSE.txt`.

The PDF and QR bundles came from the versioned npm archives, verified against npm's SHA-512 integrity values.

- `twitter-text-3.1.0.mjs`: bundled `dist/esm/parseTweet.js` from [twitter-text 3.1.0](https://www.npmjs.com/package/twitter-text/v/3.1.0) with esbuild 0.27.3 (browser ESM, minified). See the notices for twitter-text, Babel runtime, core-js, punycode and twemoji-parser in this directory.
- `heic-decode-1.0.0.mjs` and `heic_dec.wasm`: [@discourse/heic 1.0.0](https://www.npmjs.com/package/@discourse/heic/v/1.0.0), with the JS entry bundled with esbuild 0.27.3 and the WASM file unmodified. The decoder loads only for HEIC/HEIF input. See `heic-APACHE.txt`, `libheif-LGPL.txt` and `libde265-LGPL.txt`.
- HEIC corresponding source and rebuild materials: [jSquash at the npm release commit](https://github.com/discourse/jSquash/tree/345892e0e48b428d47875a5b5678fbcf58f2880e/packages/heic), including the [Emscripten build recipe](https://github.com/discourse/jSquash/blob/345892e0e48b428d47875a5b5678fbcf58f2880e/packages/heic/codec/Makefile), [libheif 1.19.7](https://github.com/strukturag/libheif/tree/v1.19.7) and [libde265 1.0.15](https://github.com/strukturag/libde265/tree/v1.0.15). Users may rebuild and replace the decoder and reverse-engineer it for debugging modifications as allowed by the LGPL.

The build serves these files from the site's own origin; images and text never become HTTP request payloads.
