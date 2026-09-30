<?php
// DEV ONLY: inserts one sample parish (St. Bede's) with sample intentions so the
// reader endpoints have something to return. Refuses to run unless site_url is local.
// Run:  php api/cli/seed-dev.php
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
foreach (['Config', 'Db', 'Crypto', 'Validate'] as $c) { require_once __DIR__ . "/../src/$c.php"; }

Config::load();
if (strpos((string)Config::get('site_url', ''), 'http://localhost') !== 0) {
    fwrite(STDERR, "Refusing to seed: site_url is not http://localhost... (this is a dev-only script).\n");
    exit(1);
}
$pdo = Db::pdo();
$row = $pdo->query("SELECT id, join_code_enc FROM parishes WHERE slug = 'st-bede'")->fetch();
if ($row === false) {
    $code = Crypto::generateJoinCode();
    $pdo->prepare(
        "INSERT INTO parishes (slug, name, tradition, diocese_key, corpus_parish_slug, visibility,
                               join_code_enc, join_code_version, status, created_at, approved_at)
         VALUES ('st-bede', ?, 'anglican', 'episcopal/western-oregon', 'st-bede', 'code', ?, 1,
                 'approved', UTC_TIMESTAMP(), UTC_TIMESTAMP())"
    )->execute(["St. Bede's Episcopal Church", Crypto::encryptJoinCode($code)]);
    $id = (int)$pdo->lastInsertId();
    echo "Created sample parish st-bede (approved, code required).\n";
} else {
    $id = (int)$row['id'];
    $code = Crypto::decryptJoinCode($row['join_code_enc']);
    echo "Sample parish st-bede already exists.\n";
}
$count = (int)$pdo->query("SELECT COUNT(*) FROM intentions WHERE parish_id = $id")->fetchColumn();
if ($count === 0) {
    $ins = $pdo->prepare('INSERT INTO intentions (parish_id, category, body, created_at, expires_at)
                          VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? DAY)');
    foreach ([['individual', 'Margaret, recovering from surgery', 21], ['family', 'The Alvarez family, grieving a loss', 14],
              ['situation', 'Those without work in our community', 21], ['institution', 'Our neighbors at the food pantry', 21],
              ['individual', 'An item that has already expired', -2]] as [$cat, $text, $days]) {
        $ins->execute([$id, $cat, $text, $days]);
    }
    echo "Added 5 sample intentions (one already expired).\n";
}
echo "Dev join code for st-bede: " . Crypto::formatJoinCode((string)$code) . "\n";
