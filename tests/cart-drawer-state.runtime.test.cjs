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
  querySelector: (selector) => selector === '[data-cart-drawer]' ? drawer : selector === '.cart-count' ? count : null,
  querySelectorAll: (selector) => selector === '.cart-count' ? [count] : [],
  addEventListener: () => {},
};
let fetchResponses = [];
let fetchCalls = 0;
const context = {
  console,
  CustomEvent: class CustomEvent {},
  document: documentMock,
  fetch: async () => {
    fetchCalls += 1;
    const response = fetchResponses.shift();
    if (!response) throw new Error('Unexpected cart request.');
    return response;
  },
  Intl,
  window: {
    Shopify: { currency: { active: 'GBP' } },
    dataLayer: [],
    setTimeout: (callback) => { callback(); return 1; },
  },
};

const scriptPath = path.join(__dirname, '..', 'assets', 'cart-drawer.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

(async () => {
context.window.CartDrawer.openLoading();
assert.match(content.innerHTML, /Loading your cart/, 'The drawer must expose a loading state while a cart request is pending.');
assert.equal(footer.hidden, true, 'The footer must remain hidden while loading.');

context.window.CartDrawer.openError();
assert.doesNotMatch(content.innerHTML, /Loading your cart/, 'An error must replace the loading placeholder.');
assert.match(content.innerHTML, /couldn’t add this item/i, 'The drawer must show a customer-facing cart error.');
assert.equal(footer.hidden, true, 'The footer must remain hidden in the error state.');
assert.equal(drawer.classList.contains('is-open'), true, 'The error state must remain visible to the customer.');

count.textContent = '2';
const recoveredCart = {
  item_count: 3,
  total_price: 11100,
  items: [{
    key: 'recovered-custom-poster-line',
    quantity: 3,
    product_title: 'CUSTOM POSTER',
    variant_title: 'A4',
    url: '/products/custom-poster',
    image: 'https://cdn.shopify.com/s/files/recovered-product.jpg',
    properties: {},
    original_line_price: 11100,
    final_line_price: 11100,
  }],
};
fetchResponses = [
  { ok: false, status: 429, json: async () => ({ description: 'Too many requests' }) },
  { ok: true, status: 200, json: async () => recoveredCart },
];
const recoveryPromise = context.window.CartDrawer.openAdded(1);
assert.match(content.innerHTML, /Added to cart\. Loading your cart/i, 'A confirmed add must keep loading the complete cart instead of stopping at a static success page.');
assert.doesNotMatch(content.innerHTML, /View cart/i, 'The manual fallback must not replace the complete cart while automatic refresh is still retrying.');
assert.equal(count.textContent, 3, 'The success fallback must update the visible parent-product count without counting hidden add-ons.');
assert.equal(footer.hidden, true, 'The regular totals footer must remain hidden until a full cart payload is available.');
const refreshedCart = await recoveryPromise;
assert.equal(refreshedCart, recoveredCart, 'The delayed refresh must resolve with the complete Shopify cart.');
assert.equal(fetchCalls, 2, 'Only cart reads may be retried after Shopify confirms the add.');
assert.match(content.innerHTML, /CUSTOM POSTER/, 'The recovered cart must replace the temporary success state with normal line content.');
assert.doesNotMatch(content.innerHTML, /Added to cart\. Loading your cart/i, 'The temporary loading state must be removed after recovery.');
assert.equal(footer.hidden, false, 'The normal subtotal and checkout footer must return after recovery.');
assert.equal(context.window.dataLayer.at(-1).event, 'cart_drawer_refresh_recovered', 'A recovered delayed refresh must be measurable.');

fetchResponses = Array.from({ length: 5 }, () => ({ ok: false, status: 429, json: async () => ({ description: 'Too many requests' }) }));
const deferredCart = await context.window.CartDrawer.openAdded(1);
assert.equal(deferredCart, null, 'A persistently unavailable cart read must end without resubmitting the item.');
assert.match(content.innerHTML, /View cart/i, 'The manual cart link must remain available only after automatic retries are exhausted.');
assert.equal(context.window.dataLayer.at(-1).event, 'cart_drawer_refresh_deferred', 'An exhausted refresh sequence must be measurable.');

const uploadedArtworkUrl = 'https://cdn.shopify.com/s/files/uploaded-artwork.jpg';
context.window.CartDrawer.open({
  item_count: 1,
  total_price: 3700,
  items: [{
    key: 'custom-poster-line',
    quantity: 1,
    product_title: 'CUSTOM POSTER',
    variant_title: 'A4',
    url: '/products/custom-poster',
    image: 'https://cdn.shopify.com/s/files/default-product.jpg',
    properties: { 'Custom artwork': uploadedArtworkUrl, _framing_config: 'config-1' },
    original_line_price: 3700,
    final_line_price: 3700,
  }],
});
assert.match(content.innerHTML, new RegExp(`src="${uploadedArtworkUrl}"`), 'The uploaded artwork must replace the generic product thumbnail.');
assert.doesNotMatch(content.innerHTML, /Custom artwork:/, 'The internal artwork URL must not be rendered as customer-facing item text.');
assert.doesNotMatch(content.innerHTML, /default-product\.jpg/, 'The generic product image must not win when uploaded artwork exists.');

const mainCartSource = fs.readFileSync(path.join(__dirname, '..', 'sections', 'main-cart.liquid'), 'utf8');
assert.match(mainCartSource, /item\.properties\['Custom artwork'\]/, 'The full cart page must read the uploaded artwork property.');
assert.match(mainCartSource, /src="\{\{ custom_artwork \| escape \}\}"/, 'The full cart page must use uploaded artwork as the line thumbnail.');

const customProductSource = fs.readFileSync(path.join(__dirname, '..', 'assets', 'custom-product.js'), 'utf8');
assert.match(customProductSource, /CartDrawer\?\.openError\(\)/, 'Custom product failures must leave the loading state.');
assert.match(customProductSource, /CartDrawer\?\.openAdded\(quantity\)/, 'Confirmed adds with a delayed refresh must use the success fallback.');

console.log('Cart drawer loading, recovery, and error state runtime checks passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
