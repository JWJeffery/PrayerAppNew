import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const adapter = require('../js/bible-browser/bible-source-lane-adapter.js');

const reportPath = process.env.BIBLE_SOURCE_LANE_UI_SMOKE_REPORT || '/tmp/bible-source-lane-ui-runtime-smoke.json';

class MiniElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.eventListeners = {};
    this.parentNode = null;
    this.value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.className = '';
    this.id = '';
    this.name = '';
  }

  setAttribute(key, value) {
    this.attributes[key] = String(value);
    if (key === 'id') this.id = String(value);
    if (key === 'name') this.name = String(value);
    if (key === 'class') this.className = String(value);
    if (key.startsWith('data-')) {
      const dataKey = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[dataKey] = String(value);
    }
    if (key === 'value') this.value = String(value);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  append(...items) {
    for (const item of items) this.appendChild(item);
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = this.eventListeners[type] || [];
    this.eventListeners[type].push(handler);
  }

  querySelector(selector) {
    return querySelectorFrom(this, selector);
  }
}

class MiniText {
  constructor(text) {
    this.textContent = text;
    this.children = [];
  }
}

function traverse(node, out = []) {
  if (!node || !node.children) return out;
  for (const child of node.children) {
    out.push(child);
    traverse(child, out);
  }
  return out;
}

function querySelectorFrom(root, selector) {
  const nodes = traverse(root);
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return nodes.find(node => node.id === id) || null;
  }

  const nameMatch = selector.match(/^\[name=['"]?([^'"\]]+)['"]?\]$/);
  if (nameMatch) {
    return nodes.find(node => node.name === nameMatch[1]) || null;
  }

  const dataMatch = selector.match(/^\[data-([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]$/);
  if (dataMatch) {
    const key = dataMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const expected = dataMatch[2];
    return nodes.find(node => node.dataset && Object.prototype.hasOwnProperty.call(node.dataset, key) && (!expected || node.dataset[key] === expected)) || null;
  }

  if (selector === 'main') return nodes.find(node => node.tagName === 'MAIN') || null;
  if (selector === 'body') return root.body || null;
  if (selector.startsWith('.')) {
    const className = selector.slice(1);
    return nodes.find(node => String(node.className || '').split(/\s+/).includes(className)) || null;
  }

  return nodes.find(node => node.tagName === selector.toUpperCase()) || null;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const document = {
  readyState: 'complete',
  body: new MiniElement('body'),
  createElement(tag) {
    return new MiniElement(tag);
  },
  createTextNode(text) {
    return new MiniText(text);
  },
  querySelector(selector) {
    if (selector === 'body') return this.body;
    return querySelectorFrom(this.body, selector);
  },
  getElementById(id) {
    return querySelectorFrom(this.body, `#${id}`);
  },
  addEventListener() {}
};

const main = new MiniElement('main');
document.body.appendChild(main);

const root = {
  document,
  window: null,
  globalThis: null,
  CustomEvent: class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  },
  addEventListener() {},
  dispatchEvent() {},
  setTimeout(fn) {
    fn();
  },
  UniversalOfficeBibleSourceLaneAdapter: adapter,
  UniversalOfficeBibleSourceLaneBrowser: {
    listInternalSourceLanes() {
      return adapter.listLanes();
    },
    resolveInternalSourceLanePassage(request) {
      return adapter.resolvePassage(request, { readJson });
    }
  }
};

root.window = root;
root.globalThis = root;

const report = {
  result: 'OK',
  panelCreated: false,
  laneOptionCount: 0,
  hasBookInput: false,
  hasLoadButton: false,
  drbResolved: false,
  nabreResolved: false,
  failures: []
};

try {
  const source = fs.readFileSync('js/bible-browser/bible-source-lane-ui-hook.js', 'utf8');
  vm.runInNewContext(source, root, { filename: 'bible-source-lane-ui-hook.js' });

  const panel = document.getElementById('bible-source-lane-panel');
  report.panelCreated = Boolean(panel);

  if (!panel) {
    report.failures.push('source-lane panel was not created');
  } else {
    const laneSelect = panel.querySelector("[name='sourceLaneId']");
    const bookInput = panel.querySelector("[name='sourceLaneBook']");
    const button = traverse(panel).find(node => node.tagName === 'BUTTON');

    report.laneOptionCount = laneSelect?.children?.length || 0;
    report.hasBookInput = Boolean(bookInput);
    report.hasLoadButton = Boolean(button);

    if (report.laneOptionCount !== 2) report.failures.push(`expected 2 lane options, found ${report.laneOptionCount}`);
    if (!report.hasBookInput) report.failures.push('book input missing');
    if (!report.hasLoadButton) report.failures.push('load button missing');
  }

  const drb = await root.UniversalOfficeBibleSourceLaneBrowser.resolveInternalSourceLanePassage({
    laneId: 'DRB_ORIGINAL',
    bookId: 'JOHN',
    chapter: 1,
    verseStart: 1
  });

  const nabre = await root.UniversalOfficeBibleSourceLaneBrowser.resolveInternalSourceLanePassage({
    laneId: 'NABRE_INTERNAL',
    bookId: 'JOHN',
    chapter: 1,
    verseStart: 1
  });

  report.drbResolved = Boolean(drb.text && drb.text.length > 5);
  report.nabreResolved = Boolean(nabre.text && nabre.text.length > 5);

  if (!report.drbResolved) report.failures.push('DRB sample did not resolve through browser API');
  if (!report.nabreResolved) report.failures.push('NABRE sample did not resolve through browser API');
} catch (error) {
  report.failures.push(error.message || String(error));
}

if (report.failures.length) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  panelCreated: report.panelCreated,
  laneOptionCount: report.laneOptionCount,
  hasBookInput: report.hasBookInput,
  hasLoadButton: report.hasLoadButton,
  drbResolved: report.drbResolved,
  nabreResolved: report.nabreResolved,
  failureCount: report.failures.length,
  firstFailures: report.failures.slice(0, 10),
  reportPath
}, null, 2));

console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK'
  ? 'NEXT: Internal source-lane UI runtime smoke passed.'
  : `NEXT: inspect ${reportPath}`);

if (report.result !== 'OK') process.exitCode = 1;
