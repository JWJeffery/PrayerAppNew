#!/usr/bin/env node
const fs = require('fs');

const psalms = JSON.parse(fs.readFileSync('data/bible/OT/psalms.json', 'utf8'));
const failures = [];

if (!Array.isArray(psalms) || psalms.length !== 155) {
  failures.push('data/bible/OT/psalms.json must be a 155-record array');
}

function record(n) {
  return psalms.find(p => String(p.id || '').toUpperCase() === `PSALM ${n}`);
}

let drbCount = 0;
let rotherhamCount = 0;

for (let n = 1; n <= 150; n++) {
  const p = record(n);
  if (!p) {
    failures.push(`missing Psalm ${n}`);
    continue;
  }

  const drb = p.text?.DRB;
  const roth = p.text?.Rotherham;

  if (typeof roth === 'string' && roth.trim()) rotherhamCount++;
  else failures.push(`Psalm ${n} missing Rotherham`);

  if (typeof drb === 'string' && drb.trim()) {
    drbCount++;
    const first = drb.split(/\r?\n/)[0] || '';
    if (!first.startsWith(`${n}:1 `)) failures.push(`Psalm ${n} DRB first row is not verse-prefixed`);
  } else {
    failures.push(`Psalm ${n} missing DRB`);
  }
}

for (let n = 151; n <= 155; n++) {
  const p = record(n);
  if (p?.text && Object.prototype.hasOwnProperty.call(p.text, 'DRB')) {
    failures.push(`Psalm ${n} must not have DRB unless extended DRB source scope is separately established`);
  }
}

if (rotherhamCount !== 150) failures.push(`Rotherham count expected 150, got ${rotherhamCount}`);
if (drbCount !== 150) failures.push(`DRB count expected 150, got ${drbCount}`);

if (failures.length) {
  console.error(JSON.stringify({ result: 'FAIL', failures: failures.slice(0, 30) }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ result: 'OK', rotherhamCount, drbCount, skippedExtended: [151,152,153,154,155] }, null, 2));
