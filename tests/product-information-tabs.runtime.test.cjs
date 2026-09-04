const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const documentListeners = new Map();
const rootEvents = [];

const createClassList = (active = false) => ({
  active,
  toggle(className, enabled) {
    if (className === 'is-active') this.active = enabled;
  }
});

const createTab = (key, selected) => {
  const listeners = new Map();
  const attributes = new Map([['aria-selected', String(selected)]]);
  return {
    dataset: { psDescriptionTab: key },
    classList: createClassList(selected),
    addEventListener(type, handler) { listeners.set(type, handler); },
    getAttribute(name) { return attributes.get(name); },
    setAttribute(name, value) { attributes.set(name, value); },
    click() { listeners.get('click')(); }
  };
};

const createPanel = (key, active) => ({
  dataset: { psDescriptionPanel: key },
  classList: createClassList(active),
  hidden: !active
});

const tabs = [createTab('description', true), createTab('shipping', false)];
const panels = [createPanel('description', true), createPanel('shipping', false)];
const root = {
  dataset: { productHandle: 'deep-blue' },
  dispatchEvent(event) { rootEvents.push(event); },
  querySelectorAll(selector) {
    if (selector === '[data-ps-description-tab]') return tabs;
    if (selector === '[data-ps-description-panel]') return panels;
    return [];
  }
};

class FakeCustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options.detail;
  }
}

const windowMock = { dataLayer: [] };
const documentMock = {
  addEventListener(type, handler) { documentListeners.set(type, handler); },
  querySelectorAll(selector) { return selector === '[data-ps-information-tabs]' ? [root] : []; }
};

const context = {
  CustomEvent: FakeCustomEvent,
  document: documentMock,
  window: windowMock
};

const scriptPath = path.join(__dirname, '..', 'assets', 'product-information-tabs.js');
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context);

tabs[1].click();

assert.equal(tabs[0].getAttribute('aria-selected'), 'false');
assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
assert.equal(panels[0].hidden, true);
assert.equal(panels[1].hidden, false);
assert.equal(rootEvents.length, 1);
assert.equal(rootEvents[0].type, 'ps:information-tab-changed');
assert.equal(rootEvents[0].detail.productHandle, 'deep-blue');
assert.equal(windowMock.dataLayer[0].event, 'product_information_tab_changed');
assert.equal(windowMock.dataLayer[0].information_tab, 'shipping');

tabs[1].click();
assert.equal(rootEvents.length, 1, 'Repeated clicks on the active tab must not emit duplicate tracking.');
assert.equal(typeof documentListeners.get('shopify:section:load'), 'function');

process.stdout.write('PASS: Product information tabs switch panels, sync accessibility state and emit one analytics event.\n');
