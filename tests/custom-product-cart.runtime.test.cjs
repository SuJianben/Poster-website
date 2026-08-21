const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FormDataMock {
  constructor() {
    this.values = new Map();
  }

  set(key, value, filename) {
    this.values.set(key, { value, filename });
  }
}

const requests = [];
const parentKey = 'parent-line-key:abc123';
const croppedArtwork = { name: 'cropped-artwork.jpg', size: 12345, type: 'image/jpeg' };
const responses = [
  { ok: true, status: 200, json: async () => ({ key: parentKey }) },
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

  assert.equal(result.hasArtwork, true, 'Uploaded artwork must use the multipart parent flow.');
  assert.deepEqual(requests.map(({ url }) => url), ['/en/cart/add.js', '/en/cart/add.js', '/en/cart.js', '/en/cart.js'], 'A rate-limited cart refresh must retry without resubmitting any cart additions.');

  const parentFormData = requests[0].options.body;
  assert.equal(parentFormData.values.get('properties[Custom artwork]').value, croppedArtwork, 'The cropped artwork file must be restored to multipart form data after the file input is cleared.');
  assert.equal(parentFormData.values.get('properties[Custom artwork]').filename, croppedArtwork.name, 'The cropped artwork filename must be preserved for Shopify.');
  assert.equal(parentFormData.values.get('id').value, '101');
  assert.equal(parentFormData.values.get('quantity').value, '1');

  const addonPayload = JSON.parse(requests[1].options.body);
  assert.equal(addonPayload.items[0].parent_line_key, parentKey, 'A separately added add-on must reference the existing parent line key.');
  assert.equal('parent_id' in addonPayload.items[0], false, 'The same-request parent_id field must not leak into the second request.');

  const persistentRateLimitRequests = [];
  const persistentRateLimitContext = {
    FormData: FormDataMock,
    fetch: async (url, options = {}) => {
      persistentRateLimitRequests.push({ url, options });
      if (url.endsWith('cart/add.js') && options.body instanceof FormDataMock) return { ok: true, status: 200, json: async () => ({ key: parentKey }) };
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
  assert.equal(persistentRateLimitRequests.filter(({ url }) => url.endsWith('cart/add.js')).length, 2, 'Cart refresh retries must never resubmit confirmed cart additions.');
  console.log('Custom product cart parent-line runtime checks passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
