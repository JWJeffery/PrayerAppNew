<?php
// Prints a fresh pepper and box key for you to paste into config.php.
// Does NOT write any file. Run:  php api/cli/gen-secrets.php
if (PHP_SAPI !== 'cli') { exit; }
echo "Paste these two values into the 'secrets' section of your config.php:\n\n";
echo "  'pepper'  => '" . bin2hex(random_bytes(32)) . "',\n";
echo "  'box_key' => '" . base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES)) . "',\n\n";
echo "Keep them private. Do not commit them, email them, or paste them into chat.\n";
echo "If you lose them, every join code and reader pass becomes unusable.\n";
