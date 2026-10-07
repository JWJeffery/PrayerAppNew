# Vendored passkeys-php (do not edit)

- Project: report-uri/passkeys-php -- https://github.com/report-uri/passkeys-php (MIT; fork of lbuchs/WebAuthn with security fixes, attestation removed)
- Version: **v2.0.0** (tag `v2.0.0`, commit `8f4f505ccc2381743ede029869890301d6953668`)
- Source: files copied from `src/` at that tag, plus `LICENSE` and `NOTICE.md` from the repo root.
- Vendored: 2026-10-07. Loaded with an explicit `require_once` of `WebAuthn.php` (it requires its own siblings). No Composer.
- Needs PHP 8.0+ with OpenSSL and mbstring (and sodium or OpenSSL Ed25519). The ceremonies are wrapped in `src/Passkeys.php`.

SHA-256 of the files as committed here (run `sha256sum` in this folder to check):

```
ea2ffd37f5fb1ca7e979758f5ff16d160f4bbde640d4b17bfce084fb109f2781  Attestation/AttestationObject.php
11b2e6db1d16e42fb20c92abb8cd6cbf77bd83d6ec65f8e1c36ebabb5ae1fd85  Attestation/AuthenticatorData.php
0ed3e628906103d01ef236055c3ac4d9b38d750475585f4b804187cee1935538  Binary/ByteBuffer.php
38420a22ad68586e3447c9e8364e0ea5b468a5e613fe41897577f7a3e38c96e6  CBOR/CborDecoder.php
09ca0951c42a90df77a5c5a1e5ad4d672223da3f6e8f4eca8c7f65d8b7241747  LICENSE
6a1531ed9f6dff41351513bb663bc88a44176f17839cd7c98279d82d4a816303  NOTICE.md
e9345041e9cb37139f079efe993a12f932c4f05c3be09269bd905bf0e03fc26d  WebAuthn.php
a0896861cd7673e93b22c3cd376c2ec60d5bee02a1f70758f8432e45380f03c1  WebAuthnException.php
```

To update: check https://github.com/report-uri/passkeys-php/releases for the newest tag, replace the `src/`
files, `LICENSE` and `NOTICE.md` with that tag's copies, and update the version, commit and checksums above.
Do not edit these files by hand.
