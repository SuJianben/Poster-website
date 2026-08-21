(() => {
  const storefrontRoot = () => window.Shopify?.routes?.root || '/';
  const endpoint = (path) => `${storefrontRoot()}${path}`;

  const responseError = async (response, fallback) => {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.description || payload.message || fallback);
    error.status = response.status;
    return error;
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

  const addItemsWithArtwork = async (items, artworkFile) => {
    const formData = new FormData();
    items.forEach((item, index) => {
      formData.set(`items[${index}][id]`, String(item.id));
      formData.set(`items[${index}][quantity]`, String(item.quantity));
      if (item.parent_id) formData.set(`items[${index}][parent_id]`, String(item.parent_id));
      Object.entries(item.properties || {}).forEach(([key, value]) => {
        formData.set(`items[${index}][properties][${key}]`, String(value));
      });
    });
    formData.set('items[0][properties][Custom artwork]', artworkFile, artworkFile.name);
    const response = await fetch(endpoint('cart/add.js'), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    if (!response.ok) throw await responseError(response, 'Could not upload this image to the cart.');
    return response.json();
  };

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const getCart = async () => {
    const retryDelays = [400, 800, 1600];
    for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
      const response = await fetch(endpoint('cart.js'), { headers: { Accept: 'application/json' } });
      if (response.ok) return response.json();
      if (response.status !== 429 || attempt === retryDelays.length) {
        throw await responseError(response, 'Could not refresh cart.');
      }
      await wait(retryDelays[attempt]);
    }
    throw new Error('Could not refresh cart.');
  };

  const refreshAfterConfirmedAdd = async (result) => {
    try {
      return { ...result, cart: await getCart(), cartRefreshDeferred: false };
    } catch (error) {
      if (error.status !== 429) throw error;
      return { ...result, cart: null, cartRefreshDeferred: true };
    }
  };

  window.CustomProductCart = {
    async add({ form, cartPayload, artwork }) {
      const file = artwork?.getFile?.();
      if (!file) {
        await addJsonItems(cartPayload.items);
        return refreshAfterConfirmedAdd({ hasArtwork: false });
      }

      await addItemsWithArtwork(cartPayload.items, file);
      return refreshAfterConfirmedAdd({ hasArtwork: true });
    },
  };
})();


