const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ClassList {
  constructor(...names) {
    this.names = new Set(names);
  }

  add(name) {
    this.names.add(name);
  }

  remove(name) {
    this.names.delete(name);
  }

  contains(name) {
    return this.names.has(name);
  }
}

const listeners = new Map();
const properties = new Map();
const scheduled = [];
const cleared = [];
const card = {
  classList: new ClassList('editorial-depth-card', 'has-hover-image'),
  dataset: { productHandle: 'test-poster' },
  style: { setProperty: (name, value) => properties.set(name, value) },
  querySelector: (selector) => selector === '.editorial-depth-card__surface' ? {} : null,
  addEventListener: (type, callback) => listeners.set(type, callback),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 300 })
};

const documentMock = {
  readyState: 'complete',
  querySelectorAll: (selector) => selector === '[data-depth-card]' ? [card] : [],
  addEventListener: () => {},
  dispatchEvent: () => {}
};

const context = {
  CustomEvent: class CustomEvent {},
  document: documentMock,
  window: {
    dataLayer: [],
    matchMedia: (query) => ({ matches: query.includes('hover: hover') }),
    setTimeout: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
    clearTimeout: (id) => cleared.push(id)
  }
};

const scriptPath = path.join(__dirname, '..', 'assets', 'editorial-depth-cards.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

listeners.get('pointerenter')({ pointerType: 'mouse' });
assert.equal(card.classList.contains('is-pointer-hovered'), true, 'Pointer entry should activate hover immediately.');

listeners.get('pointermove')({ pointerType: 'mouse', clientX: 175, clientY: 75 });
assert.notEqual(properties.get('--depth-rotate-y'), '0deg', 'Pointer movement should retain the depth transform.');

listeners.get('pointerleave')({ pointerType: 'mouse' });
assert.equal(scheduled.at(-1).delay, 500, 'Pointer return should be scheduled for 500ms.');
assert.equal(card.classList.contains('is-pointer-hovered'), true, 'Hover state should remain during the 500ms grace period.');

scheduled.at(-1).callback();
assert.equal(card.classList.contains('is-pointer-hovered'), false, 'Hover state should clear after the grace period.');
assert.equal(properties.get('--depth-rotate-y'), '0deg', 'Depth transform should reset with the hover state.');
assert.equal(properties.get('--depth-image-x'), '0px', 'Image translation should reset with the hover state.');

listeners.get('pointerenter')({ pointerType: 'mouse' });
listeners.get('pointerleave')({ pointerType: 'mouse' });
listeners.get('pointerenter')({ pointerType: 'mouse' });
assert.equal(cleared.length > 0, true, 'Re-entry should cancel a pending return timer.');
assert.equal(card.classList.contains('is-pointer-hovered'), true, 'Re-entry should keep the active hover state.');

console.log('Editorial depth hover delay runtime checks passed.');
