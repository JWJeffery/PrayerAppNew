<?php
// Copy to <home>/uo-private/config.php and fill in. NEVER commit the real file.
return [
  'db' => ['host' => 'localhost', 'name' => 'CHANGE_ME', 'user' => 'CHANGE_ME', 'pass' => 'CHANGE_ME'],
  'mail' => [
    'driver' => 'smtp',                       // 'smtp' or 'log'
    'host' => 'CHANGE_ME', 'port' => 587, 'encryption' => 'tls', // 'tls' (STARTTLS) or 'ssl' (SMTPS)
    'username' => 'admin@theuniversaloffice.com', 'password' => 'CHANGE_ME',
    'from_email' => 'admin@theuniversaloffice.com', 'from_name' => 'The Universal Office',
  ],
  'secrets' => [
    'pepper' => 'CHANGE_ME_64_HEX',           // HMAC key for codes, IP hashes, reader passes
    'box_key' => 'CHANGE_ME_BASE64_32_BYTES', // libsodium secretbox key for join codes
  ],
  'admin_emails' => ['admin@theuniversaloffice.com'],  // may be changed to Josh's personal address
  'site_url' => 'https://theuniversaloffice.com',
  'allowed_origins' => [],                    // dev only, e.g. ['http://localhost:8080']
  'trust_proxy' => false,
  'log_dir' => null,                          // default: <config dir>/logs
];
