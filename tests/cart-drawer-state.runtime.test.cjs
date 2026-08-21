const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ClassListMock {
  constructor() {
    this.names = new Set();
  }

  add(name) { this.names.add(name); }
  remove(name) { this.names.delete(name); }
  contains(name) { return this.names.has(name); }
}

const content = { innerHTML: '' };
const footer = { hidden: false, innerHTML: '' };
const count = { textContent: '' };
const panel = { focus: () => {} };
const paymentIcons = { innerHTML: '' };
const drawer = {
  classList: new ClassListMock(),
  setAttribute: () => {},
  addEventListener: () => {},
  querySelector(selector) {
    return {
      '.cd-drawer__panel': panel,
      '[data-cart-drawer-content]': content,
      '[data-cart-drawer-footer]': footer,
      '[data-cart-drawer-count]': count,
      '[data-cart-drawer-payment-icons]': paymentIcons,
    }[selector] || null;
  },
};

const documentMock = {
  readyState: 'complete',
  documentElement: { lang: 'en', classList: new ClassListMock() },
  querySelector: (selector) => selector === '[data-cart-drawer]' ? drawer : null,
  querySelectorAll: () => [],
  addEventListener: () => {},
};
const context = {
  console,
  CustomEvent: class CustomEvent {},
  document: documentMock,
  fetch: async () => { throw new Error('Not used in this state test.'); },
  Intl,
  window: {
    Shopify: { currency: { active: 'GBP' } },
    setTimeout: (callback) => { callback(); return 1; },
  },
};

const scriptPath = path.join(__dirname, '..', 'assets', 'cart-drawer.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

context.window.CartDrawer.openLoading();
assert.match(content.innerHTML, /Loading your cart/, 'The drawer must expose a loading state while a cart request is pending.');
assert.equal(footer.hidden, true, 'The footer must remain hidden while loading.');

context.window.CartDrawer.openError();
assert.doesNotMatch(content.innerHTML, /Loading your cart/, 'An error must replace the loading placeholder.');
assert.match(content.innerHTML, /couldn’t add this item/i, 'The drawer must show a customer-facing cart error.');
assert.equal(footer.hidden, true, 'The footer must remain hidden in the error state.');
assert.equal(drawer.classList.contains('is-open'), true, 'The error state must remain visible to the customer.');

const customProductSource = fs.readFileSync(path.join(__dirname, '..', 'assets', 'custom-product.js'), 'utf8');
assert.match(customProductSource, /CartDrawer\?\.openError\(\)/, 'Custom product failures must leave the loading state.');

console.log('Cart drawer loading and error state runtime checks passed.');
