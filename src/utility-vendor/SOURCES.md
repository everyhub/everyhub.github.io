# Locally served browser bundles

- `pdf-lib-1.17.1.mjs`: `dist/pdf-lib.esm.min.js` from [pdf-lib 1.17.1](https://www.npmjs.com/package/pdf-lib/v/1.17.1), MIT; see `pdf-lib-LICENSE.md`.
- `qrcode-2.0.4.mjs`: `dist/qrcode.mjs` from [qrcode-generator 2.0.4](https://www.npmjs.com/package/qrcode-generator/v/2.0.4), MIT; see `qrcode-LICENSE.txt`.

Both bundles came from the versioned npm archives, verified against npm's SHA-512 integrity values. The build copies these modules unchanged and the browser loads them on demand from the site's own origin.
