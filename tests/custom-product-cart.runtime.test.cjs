const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FormDataMock {
  constructor(source) {
    assert.equal(source, undefined, 'Atomic cart payload must not inherit stale product form fields.');
    this.values = new Map();
  }

  set(key, value, filename) {
    this.values.set(key, { value, filename });
  }
}

const requests = [];
const croppedArtwork = { name: 'cropped-artwork.jpg', size: 12345, type: 'image/jpeg' };
const responses = [
  { ok: true, status: 200, json: async () => ({ items: [] }) },
  { ok: false, status: 429, json: async () => ({ description: 'Too many requests' }) },
  { ok: true, status: 200, json: async () => ({ items: [], item_count: 0, total_price: 0 }) },
];

const context = {
  FormData: FormDataMock,
  fetch: async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  },
  window: { Shopify: { routes: { root: '/en/' } }, setTimeout: (callback) => callback() },
};

const scriptPath = path.join(__dirname, '..', 'assets', 'custom-product-cart.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

(async () => {
  const result = await context.window.CustomProductCart.add({
    form: {},
    artwork: { getFile: () => croppedArtwork },
    cartPayload: {
      items: [
        { id: 101, quantity: 1, properties: { _framing_config: 'config-1' } },
        { id: 202, quantity: 1, parent_id: 101, properties: { _framing_component: 'frame' } },
      ],
    },
  });

  assert.equal(result.hasArtwork, true, 'Uploaded artwork must use the multipart item flow.');
  assert.deepEqual(requests.map(({ url }) => url), ['/en/cart/add.js', '/en/cart.js', '/en/cart.js'], 'The configured product must use one atomic add request, and a rate-limited refresh must not resubmit it.');

  const atomicFormData = requests[0].options.body;
  assert.equal(atomicFormData.values.get('items[0][properties][Custom artwork]').value, croppedArtwork, 'The cropped artwork file must be included on the parent item.');
  assert.equal(atomicFormData.values.get('items[0][properties][Custom artwork]').filename, croppedArtwork.name, 'The cropped artwork filename must be preserved for Shopify.');
  assert.equal(atomicFormData.values.get('items[0][id]').value, '101');
  assert.equal(atomicFormData.values.get('items[0][quantity]').value, '1');
  assert.equal(atomicFormData.values.get('items[1][id]').value, '202');
  assert.equal(atomicFormData.values.get('items[1][parent_id]').value, '101', 'A same-request add-on must reference its parent variant ID.');
  assert.equal(atomicFormData.values.get('items[1][properties][_framing_component]').value, 'frame');

  const persistentRateLimitRequests = [];
  const persistentRateLimitContext = {
    FormData: FormDataMock,
    fetch: async (url, options = {}) => {
      persistentRateLimitRequests.push({ url, options });
      if (url.endsWith('cart/add.js')) return { ok: true, status: 200, json: async () => ({ items: [] }) };
      return { ok: false, status: 429, json: async () => ({ description: 'Too many requests' }) };
    },
    window: { Shopify: { routes: { root: '/en/' } }, setTimeout: (callback) => callback() },
  };
  vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), persistentRateLimitContext, { filename: scriptPath });
  const deferredResult = await persistentRateLimitContext.window.CustomProductCart.add({
    form: {},
    artwork: { getFile: () => croppedArtwork },
    cartPayload: {
      items: [
        { id: 101, quantity: 1, properties: { _framing_config: 'config-2' } },
        { id: 202, quantity: 1, parent_id: 101, properties: { _framing_component: 'frame' } },
      ],
    },
  });
  assert.equal(deferredResult.cart, null, 'A confirmed add must not be reported as failed when only the cart refresh remains rate limited.');
  assert.equal(deferredResult.cartRefreshDeferred, true);
  assert.equal(persistentRateLimitRequests.filter(({ url }) => url.endsWith('cart/add.js')).length, 1, 'Cart refresh retries must never resubmit a confirmed atomic cart addition.');
  console.log('Custom product cart atomic multipart runtime checks passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
