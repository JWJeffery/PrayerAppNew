import fs from 'fs';
import vm from 'vm';

const reportPath = process.env.NABRE_SELECTOR_BRIDGE_AUDIT_REPORT || '/tmp/bible-nabre-selector-bridge-audit.json';

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
    this.className = '';
    this.id = '';
    this.name = '';
    this.options = this.tagName === 'SELECT' ? this.children : undefined;
  }

  setAttribute(key, value) {
    this.attributes[key] = String(value);
    if (key === 'id') this.id = String(value);
    if (key === 'name') this.name = String(value);
    if (key === 'class') this.className = String(value);
    if (key === 'value') this.value = String(value);
    if (key.startsWith('data-')) {
      const dataKey = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[dataKey] = String(value);
    }
  }

  getAttribute(key) {
    return this.attributes[key] || '';
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

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(child => child !== this);
  }

  querySelector(selector) {
    return querySelectorFrom(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAllFrom(this, selector);
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

function matches(node, selector) {
  if (selector === 'select') return node.tagName === 'SELECT';
  if (selector === 'input') return node.tagName === 'INPUT';
  if (selector === 'textarea') return node.tagName === 'TEXTAREA';
  if (selector === 'main') return node.tagName === 'MAIN';
  if (selector === 'body') return node.tagName === 'BODY';
  if (selector.startsWith('#')) return node.id === selector.slice(1);
  if (selector.startsWith('.')) return String(node.className || '').split(/\s+/).includes(selector.slice(1));

  const attr = selector.match(/^\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]$/);
  if (attr) {
    const key = attr[1];
    const expected = attr[2];
    if (key.startsWith('data-')) {
      const dataKey = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return node.dataset && Object.prototype.hasOwnProperty.call(node.dataset, dataKey) && (!expected || node.dataset[dataKey] === expected);
    }
    return node.attributes && Object.prototype.hasOwnProperty.call(node.attributes, key) && (!expected || node.attributes[key] === expected);
  }

  return false;
}

function querySelectorAllFrom(root, selector) {
  const selectors = selector.split(',').map(s => s.trim()).filter(Boolean);
  return traverse(root).filter(node => selectors.some(sel => matches(node, sel)));
}

function querySelectorFrom(root, selector) {
  return querySelectorAllFrom(root, selector)[0] || null;
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
    return querySelectorFrom(this.body, selector);
  },
  querySelectorAll(selector) {
    return querySelectorAllFrom(this.body, selector);
  },
  addEventListener() {}
};

const main = new MiniElement('main');
const select = new MiniElement('select');
select.setAttribute('id', 'bibleTranslation');
select.setAttribute('name', 'translation');

const option = new MiniElement('option');
option.setAttribute('value', 'DRB_ORIGINAL');
option.textContent = 'DRB';
select.appendChild(option);

const input = new MiniElement('input');
input.setAttribute('name', 'passage');
input.setAttribute('value', 'John 1:1');
input.value = 'John 1:1';

main.appendChild(select);
main.appendChild(input);
document.body.appendChild(main);

const root = {
  document,
  console,
  setTimeout(fn) { fn(); },
  addEventListener() {},
  UniversalOfficeBibleSourceLaneBrowser: {
    listInternalSourceLanes() {
      return [
        { id: 'DRB_ORIGINAL', label: 'Original Douay-Rheims', translationKey: 'DRB', use: 'internal_bible_browser' },
        { id: 'NABRE_INTERNAL', label: 'NABRE Internal Source Lane', translationKey: 'NABRE', use: 'internal_bible_browser' }
      ];
    },
    async resolveInternalSourceLanePassage(request) {
      if (request.laneId !== 'NABRE_INTERNAL') throw new Error('unexpected lane');
      return {
        laneId: request.laneId,
        translationKey: 'NABRE',
        bookId: request.bookId,
        chapter: request.chapter,
        verseStart: request.verseStart,
        verseEnd: request.verseEnd,
        verses: [{ chapter: 1, verse: 1, text: 'In the beginning was the Word.' }]
      };
    }
  }
};

root.globalThis = root;
root.window = root;

const report = {
  result: 'OK',
  bridgeLoadedByIndex: false,
  optionCountBefore: 1,
  optionCountAfter: 0,
  nabreOptionPresent: false,
  bridgeInstalled: false,
  failures: []
};

try {
  const index = fs.readFileSync('index.html', 'utf8');
  report.bridgeLoadedByIndex = index.includes('bible-nabre-selector-bridge.js');
  if (!report.bridgeLoadedByIndex) report.failures.push('index.html does not load NABRE selector bridge');

  const source = fs.readFileSync('js/bible-browser/bible-nabre-selector-bridge.js', 'utf8');
  vm.runInNewContext(source, root, { filename: 'bible-nabre-selector-bridge.js' });

  report.optionCountAfter = select.options.length;
  report.nabreOptionPresent = Array.from(select.options).some(opt => opt.value === 'NABRE_INTERNAL');
  report.bridgeInstalled = Boolean(root.UniversalOfficeNabreSelectorBridge?.installed);

  if (!report.nabreOptionPresent) report.failures.push('NABRE_INTERNAL option was not added to existing selector');
  if (!report.bridgeInstalled) report.failures.push('bridge did not mark itself installed');
} catch (error) {
  report.failures.push(error.message || String(error));
}

if (report.failures.length) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  bridgeLoadedByIndex: report.bridgeLoadedByIndex,
  optionCountBefore: report.optionCountBefore,
  optionCountAfter: report.optionCountAfter,
  nabreOptionPresent: report.nabreOptionPresent,
  bridgeInstalled: report.bridgeInstalled,
  failureCount: report.failures.length,
  firstFailures: report.failures.slice(0, 10),
  reportPath
}, null, 2));

console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK'
  ? 'NEXT: NABRE selector bridge adds NABRE_INTERNAL to existing Bible browser selector.'
  : `NEXT: inspect ${reportPath}`);

if (report.result !== 'OK') process.exitCode = 1;
