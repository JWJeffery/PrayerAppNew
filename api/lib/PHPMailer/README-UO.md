# Vendored PHPMailer (do not edit)

- Project: PHPMailer/PHPMailer -- https://github.com/PHPMailer/PHPMailer
- Version: **7.1.1** (release tag `v7.1.1`, commit `1bc1716a507a65e039d4ac9d9adebbbd0d346e15`)
- Source: https://github.com/PHPMailer/PHPMailer/releases/tag/v7.1.1 (files copied from `src/` at that tag; LICENSE from the repo root)
- Vendored: 2026-09-30. Loaded with explicit `require_once` (no Composer).

SHA-256 of the files as committed here:

```
45599a196ae7944ee2dcd4f3d3da0ac4243513d346b2d77bbd15dbd0c37f7064  PHPMailer.php
522bcf0d07be7e7e00114711db5c9ce2b4d59ac041c5ec36eaadd979d5fa7046  SMTP.php
22ab858ae438d98f58f41f38ad2191d1b0d59570aebea0463a7948cfae1021b7  Exception.php
a1a33180d02960ab1c5de36cf20b1a2f0fe9888d83826ad263da5db52f1b183b  LICENSE
```

To update: check https://github.com/PHPMailer/PHPMailer/releases for the newest release,
replace the three `src/` files (`PHPMailer.php`, `SMTP.php`, `Exception.php`) and `LICENSE`
with that tag's copies, and update the version, commit and checksums above. Never copy an
older PHPMailer from anywhere else (old versions had critical CVEs).
