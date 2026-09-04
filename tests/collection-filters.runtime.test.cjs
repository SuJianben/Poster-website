const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const listeners = new Map();
const historyCalls = [];
const dispatchedEvents = [];
let assignedUrl = null;
let requestedUrl = null;

const createResults = () => ({
  attributes: new Map(),
  classList: { toggle() {} },
  replaceWith(nextResults) { currentResults = nextResults; },
  setAttribute(name, value) { this.attributes.set(name, value); }
});

let currentResults = createResults();
const nextResults = createResults();
const currentCount = { textContent: '(31)' };
const nextCount = { textContent: '(24)' };
const panel = { scrollTop: 47 };
const currentForm = {
  action: 'https://example.test/collections/abstract-geometric-prints',
  elements: [],
  innerHTML: 'old filters',
  values: [
    ['sort_by', 'best-selling'],
    ['filter.p.m.custom.orientation', 'Portrait']
  ],
  contains() { return false; },
  querySelectorAll() { return [{ open: true }, { open: false }]; },
  setAttribute() {}
};
const nextForm = { innerHTML: 'updated filters' };

const nextRoot = {
  querySelector(selector) {
    if (selector === '[data-cg-results]') return nextResults;
    if (selector === '[data-cg-product-count]') return nextCount;
    if (selector === '[data-cg-filter-form]') return nextForm;
    return null;
  }
};

const root = {
  dataset: { cgSectionId: 'mock-section', cgCollectionHandle: 'abstract-geometric-prints' },
  addEventListener(type, handler) { listeners.set(type, handler); },
  dispatchEvent(event) { dispatchedEvents.push(event); },
  querySelector(selector) {
    if (selector === '[data-cg-results]') return currentResults;
    if (selector === '[data-cg-product-count]') return currentCount;
    if (selector === '[data-cg-filter-form]') return currentForm;
    if (selector === '.cg-drawer__panel') return panel;
    return null;
  }
};

class FakeFormData {
  constructor(form) { this.values = form.values; }
  forEach(callback) { this.values.forEach(([key, value]) => callback(value, key)); }
}

class FakeCustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options.detail;
  }
}

const fetchMock = async (url) => {
  requestedUrl = new URL(url);
  return { ok: true, text: async () => '<section></section>' };
};

const windowMock = {
  addEventListener(type, handler) { listeners.set(`window:${type}`, handler); },
  dataLayer: [],
  fetch: fetchMock,
  history: { pushState(state, title, url) { historyCalls.push({ state, title, url: new URL(url) }); } },
  location: {
    assign(url) { assignedUrl = url; },
    href: 'https://example.test/collections/abstract-geometric-prints',
    origin: 'https://example.test'
  }
};

const context = {
  AbortController,
  CustomEvent: FakeCustomEvent,
  DOMParser: class { parseFromString() { return { querySelector: () => nextRoot }; } },
  FormData: FakeFormData,
  URL,
  URLSearchParams,
  document: {
    activeElement: null,
    querySelector: (selector) => selector === '[data-cg-collection]' ? root : null
  },
  fetch: fetchMock,
  window: windowMock
};

const scriptPath = path.join(__dirname, '..', 'assets', 'collection-filters.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context);

assert.equal(typeof listeners.get('change'), 'function', 'change listener should be registered');
listeners.get('change')({
  target: {
    closest: () => currentForm,
    matches: () => true
  }
});

setImmediate(() => {
  assert.equal(requestedUrl.searchParams.get('section_id'), 'mock-section');
  assert.equal(requestedUrl.searchParams.get('filter.p.m.custom.orientation'), 'Portrait');
  assert.equal(currentResults, nextResults, 'product results should be replaced');
  assert.equal(currentCount.textContent, '(24)', 'visible product count should update');
  assert.equal(currentForm.innerHTML, 'updated filters', 'filter counts and selected values should update');
  assert.equal(historyCalls.length, 1, 'successful filtering should add one history entry');
  assert.equal(historyCalls[0].url.searchParams.has('section_id'), false, 'public URL must not expose section_id');
  assert.equal(assignedUrl, null, 'successful AJAX filtering must not fall back to page navigation');
  assert.equal(dispatchedEvents[0].type, 'cg:results-updated');
  assert.equal(windowMock.dataLayer[0].event, 'collection_results_updated');
  process.stdout.write('PASS: AJAX filtering replaces results, updates counts/history and keeps native navigation as fallback only.\n');
});
