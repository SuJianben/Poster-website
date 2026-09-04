const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'custom-product-cart.js'), 'utf8');

class FakeFormData {
  constructor(form) {
    this.form = form;
    this.values = new Map([['properties[Custom artwork]', { name: 'artwork.jpg' }]]);
  }
  set(key, value) { this.values.set(key, value); }
}

const jsonResponse = (payload, ok = true) => ({ ok, json: async () => payload });

const makeService = (fetch) => {
  const window = { Shopify: { routes: { root: '/en/' } } };
  vm.runInNewContext(source, { window, fetch, FormData: FakeFormData });
  return window.CustomProductCart;
};

(async () => {
  const calls = [];
  const successFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('cart/add.js') && options.body instanceof FakeFormData) return jsonResponse({ key: 'parent-line-key' });
    if (url.endsWith('cart/add.js')) return jsonResponse({ items: [{ key: 'addon-line-key' }] });
    if (url.endsWith('cart.js')) return jsonResponse({ item_count: 2, items: [] });
    throw new Error(`Unexpected URL: ${url}`);
  };
  const service = makeService(successFetch);
  const result = await service.add({
    form: { id: 'custom-product-form' },
    artwork: { getFile: () => ({ name: 'artwork.jpg' }) },
    cartPayload: {
      items: [
        { id: 101, quantity: 1, properties: { _framing_config: 'config-1' } },
        { id: 202, quantity: 1, properties: { _framing_component: 'frame' } },
      ],
    },
  });
  if (!result.hasArtwork || result.cart.item_count !== 2) throw new Error('Artwork cart result is incorrect.');
  if (calls[0].url !== '/en/cart/add.js' || !(calls[0].options.body instanceof FakeFormData)) throw new Error('Parent artwork must use locale-aware multipart add.js.');
  if (calls[0].options.body.values.get('properties[_framing_config]') !== 'config-1') throw new Error('Parent framing properties were not preserved.');
  if (calls[1].url !== '/en/cart/add.js') throw new Error('Add-ons were not submitted after the parent artwork.');

  const rollbackCalls = [];
  const failureFetch = async (url, options = {}) => {
    rollbackCalls.push({ url, options });
    if (rollbackCalls.length === 1) return jsonResponse({ key: 'parent-line-key' });
    if (url.endsWith('cart/add.js')) return jsonResponse({ description: 'Add-on unavailable' }, false);
    if (url.endsWith('cart/change.js')) return jsonResponse({ item_count: 0 });
    throw new Error(`Unexpected URL: ${url}`);
  };
  const rollbackService = makeService(failureFetch);
  await rollbackService.add({
    form: {},
    artwork: { getFile: () => ({ name: 'artwork.jpg' }) },
    cartPayload: { items: [{ id: 101, quantity: 1 }, { id: 202, quantity: 1 }] },
  }).then(() => { throw new Error('Expected add-on failure.'); }, (error) => {
    if (error.message !== 'Add-on unavailable') throw error;
  });
  if (!rollbackCalls.some(({ url }) => url === '/en/cart/change.js')) throw new Error('Parent line was not rolled back after add-on failure.');

  console.log('Custom product cart runtime checks passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
