/**
 * Node-only helper: a component store reading the JSON bundles from disk.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const RB = require('./store.js');

const DEFAULT_DIR = path.join(__dirname, '..', '..', 'data', 'roman-breviary-1960-1962', 'components');

function createNodeStore(dir = DEFAULT_DIR) {
  return RB.createStore((id) => {
    const file = path.join(dir, id + '.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  });
}

module.exports = { createNodeStore, DEFAULT_DIR };
