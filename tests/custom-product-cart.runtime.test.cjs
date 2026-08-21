const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FormDataMock {
  constructor() {
    this.values = new Map();
  }

  set(key, value) {
    this.values.set(key, value);
  }
}

const requests = [];
const parentKey = 'parent-line-key:abc123';
const responses = [
  { ok: true, status: 200, json: async () => ({ key: parentKey }) },
  { ok: true, status: 200, json: async () => ({ items: [] }) },
  { ok: true, status: 200, json: async () => ({ items: [], item_count: 0, total_price: 0 }) },
];

const context = {
  FormData: FormDataMock,
  fetch: async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  },
  window: { Shopify: { routes: { root: '/en/' } } },
};

const scriptPath = path.join(__dirname, '..', 'assets', 'custom-product-cart.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

(async () => {
  const result = await context.window.CustomProductCart.add({
    form: {},
    artwork: { getFile: () => ({ name: 'artwork.jpg' }) },
    cartPayload: {
      items: [
        { id: 101, quantity: 1, properties: { _framing_config: 'config-1' } },
        { id: 202, quantity: 1, parent_id: 101, properties: { _framing_component: 'frame' } },
      ],
    },
  });

  assert.equal(result.hasArtwork, true, 'Uploaded artwork must use the multipart parent flow.');
  assert.deepEqual(requests.map(({ url }) => url), ['/en/cart/add.js', '/en/cart/add.js', '/en/cart.js']);

  const addonPayload = JSON.parse(requests[1].options.body);
  assert.equal(addonPayload.items[0].parent_line_key, parentKey, 'A separately added add-on must reference the existing parent line key.');
  assert.equal('parent_id' in addonPayload.items[0], false, 'The same-request parent_id field must not leak into the second request.');
  console.log('Custom product cart parent-line runtime checks passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
