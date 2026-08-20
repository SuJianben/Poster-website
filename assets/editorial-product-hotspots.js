(() => {
  const readyRoots = new WeakSet();
  let activeHotspot = null;

  const track = (event, hotspot, detail = {}) => {
    const payload = {
      event,
      section_id: hotspot.closest('[data-editorial-hotspots]')?.dataset.editorialSectionId || '',
      product_handle: hotspot.dataset.productHandle || '',
      ...detail,
    };
    window.dataLayer?.push(payload);
    document.dispatchEvent(new CustomEvent('posterandform:analytics', { detail: payload }));
  };

  const closeHotspot = (hotspot, { restoreFocus = false } = {}) => {
    if (!hotspot?.classList.contains('is-open')) return;
    const panel = hotspot.querySelector('[data-editorial-hotspot-panel]');
    const trigger = hotspot.querySelector('[data-editorial-hotspot-trigger]');
    hotspot.classList.remove('is-open', 'is-panel-left');
    trigger?.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
    if (activeHotspot === hotspot) activeHotspot = null;
    if (restoreFocus) trigger?.focus();
  };

  const positionPanel = (hotspot) => {
    const scene = hotspot.closest('.editorial__image');
    const panel = hotspot.querySelector('[data-editorial-hotspot-panel]');
    if (!scene || !panel || panel.hidden || window.matchMedia('(max-width: 750px)').matches) return;
    hotspot.classList.remove('is-panel-left');
    const sceneBounds = scene.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    if (panelBounds.right > sceneBounds.right - 8) hotspot.classList.add('is-panel-left');
  };

  const openHotspot = (hotspot) => {
    if (activeHotspot && activeHotspot !== hotspot) closeHotspot(activeHotspot);
    const panel = hotspot.querySelector('[data-editorial-hotspot-panel]');
    const trigger = hotspot.querySelector('[data-editorial-hotspot-trigger]');
    if (!panel || !trigger) return;
    panel.hidden = false;
    hotspot.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    activeHotspot = hotspot;
    requestAnimationFrame(() => positionPanel(hotspot));
    track('editorial_hotspot_opened', hotspot);
  };

  const updateVariant = (hotspot) => {
    const select = hotspot.querySelector('[data-editorial-hotspot-variant]');
    const option = select?.selectedOptions?.[0];
    const price = hotspot.querySelector('[data-editorial-hotspot-price]');
    const image = hotspot.querySelector('.editorial-hotspot__product-image img');
    const addButton = hotspot.querySelector('[data-editorial-hotspot-add]');
    if (!option) return;
    if (price) price.textContent = option.dataset.price || '';
    if (image && option.dataset.image) image.src = option.dataset.image;
    if (addButton) addButton.disabled = option.disabled;
    track('editorial_hotspot_variant_selected', hotspot, { variant_id: option.value });
  };

  const submitForm = async (event, hotspot) => {
    const form = event.currentTarget;
    const button = form.querySelector('[data-editorial-hotspot-add]');
    const label = form.querySelector('[data-editorial-hotspot-add-label]');
    const status = form.querySelector('[data-editorial-hotspot-status]');
    const select = form.querySelector('[data-editorial-hotspot-variant]');
    if (!button || !label || !select || button.disabled) return;
    event.preventDefault();
    button.disabled = true;
    label.textContent = 'Adding…';
    if (status) status.textContent = '';
    window.CartDrawer?.openLoading();

    try {
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(select.value), quantity: 1 }] }),
      });
      if (!response.ok) throw new Error('Could not add this item to cart.');
      const cartResponse = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, { headers: { Accept: 'application/json' } });
      if (!cartResponse.ok) throw new Error('Could not refresh the cart.');
      const cart = await cartResponse.json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      window.CartDrawer?.open(cart);
      label.textContent = 'Added to cart';
      track('editorial_hotspot_added_to_cart', hotspot, { variant_id: select.value });
    } catch (error) {
      if (status) status.textContent = error.message || 'Could not add this item to cart.';
      label.textContent = 'Try again';
      track('editorial_hotspot_add_error', hotspot, { variant_id: select.value });
      window.CartDrawer?.refresh?.().catch(() => {});
    } finally {
      window.setTimeout(() => {
        button.disabled = select.selectedOptions[0]?.disabled || false;
        label.textContent = button.disabled ? 'Sold out' : 'Add to cart';
      }, 1200);
    }
  };

  const setupRoot = (root) => {
    if (readyRoots.has(root)) return;
    readyRoots.add(root);

    root.querySelectorAll('[data-editorial-hotspot]').forEach((hotspot) => {
      const trigger = hotspot.querySelector('[data-editorial-hotspot-trigger]');
      const close = hotspot.querySelector('[data-editorial-hotspot-close]');
      const select = hotspot.querySelector('[data-editorial-hotspot-variant]');
      const form = hotspot.querySelector('[data-editorial-hotspot-form]');
      trigger?.addEventListener('click', () => hotspot.classList.contains('is-open') ? closeHotspot(hotspot) : openHotspot(hotspot));
      close?.addEventListener('click', () => closeHotspot(hotspot, { restoreFocus: true }));
      select?.addEventListener('change', () => updateVariant(hotspot));
      form?.addEventListener('submit', (event) => submitForm(event, hotspot));
    });
  };

  const setup = (scope = document) => scope.querySelectorAll('[data-editorial-hotspots]').forEach(setupRoot);

  document.addEventListener('click', (event) => {
    if (activeHotspot && !activeHotspot.contains(event.target)) closeHotspot(activeHotspot);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeHotspot) closeHotspot(activeHotspot, { restoreFocus: true });
  });
  window.addEventListener('resize', () => activeHotspot && positionPanel(activeHotspot), { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setup(), { once: true });
  } else {
    setup();
  }
  document.addEventListener('shopify:section:load', (event) => setup(event.target));
})();
