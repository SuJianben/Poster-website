(() => {
  const storefrontRoot = () => window.Shopify?.routes?.root || '/';
  const endpoint = (path) => `${storefrontRoot()}${path}`;

  const responseError = async (response, fallback) => {
    const payload = await response.json().catch(() => ({}));
    return new Error(payload.description || payload.message || fallback);
  };

  const addJsonItems = async (items) => {
    const response = await fetch(endpoint('cart/add.js'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw await responseError(response, 'Could not add this item to cart.');
    return response.json();
  };

  const addParentWithArtwork = async (form, parentItem) => {
    const formData = new FormData(form);
    formData.set('id', String(parentItem.id));
    formData.set('quantity', String(parentItem.quantity));
    Object.entries(parentItem.properties || {}).forEach(([key, value]) => {
      formData.set(`properties[${key}]`, String(value));
    });
    const response = await fetch(endpoint('cart/add.js'), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    if (!response.ok) throw await responseError(response, 'Could not upload this image to the cart.');
    return response.json();
  };

  const removeAddedParent = async (itemKey) => {
    if (!itemKey) return false;
    const response = await fetch(endpoint('cart/change.js'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemKey, quantity: 0 }),
    });
    return response.ok;
  };

  const getCart = async () => {
    const response = await fetch(endpoint('cart.js'), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw await responseError(response, 'Could not refresh cart.');
    return response.json();
  };

  window.CustomProductCart = {
    async add({ form, cartPayload, artwork }) {
      const file = artwork?.getFile?.();
      if (!file) {
        await addJsonItems(cartPayload.items);
        return { cart: await getCart(), hasArtwork: false };
      }

      const [parentItem, ...addonItems] = cartPayload.items;
      const parentResponse = await addParentWithArtwork(form, parentItem);
      const parentLine = parentResponse.items?.[0] || parentResponse;
      try {
        if (addonItems.length) await addJsonItems(addonItems);
      } catch (error) {
        const rolledBack = await removeAddedParent(parentLine.key).catch(() => false);
        if (!rolledBack) error.message = `${error.message} The main item may still be in your cart.`;
        throw error;
      }
      return { cart: await getCart(), hasArtwork: true };
    },
  };
})();
