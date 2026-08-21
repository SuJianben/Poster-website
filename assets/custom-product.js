(() => {
  const root = document.querySelector('[data-ps-product]');
  if (!root) return;

  const variantData = document.querySelector('[data-ps-variants]');
  const variants = variantData ? JSON.parse(variantData.textContent) : [];
  // Shopify's form tag preserves underscore attribute names verbatim. The
  // section already owns this form class, so it is the stable binding point.
  const form = root.querySelector('.ps-form');
  const variantInput = root.querySelector('[data-ps-variant-input]');
  const price = root.querySelector('[data-ps-price]');
  const currentPrice = root.querySelector('.ps-price__current');
  const comparePrice = root.querySelector('[data-ps-compare]');
  const addButton = root.querySelector('[data-ps-add-button]');
  const addLabel = root.querySelector('[data-ps-add-label]');
  const status = root.querySelector('[data-ps-status]');
  const mainImage = root.querySelector('[data-ps-main-image]');
  const mainMedia = root.querySelector('.ps-main-media');
  const artPreview = root.querySelector('[data-ps-art-preview]');
  const details = root.querySelector('[data-ps-accordions]');
  const desktopDetailsAnchor = root.querySelector('[data-ps-details-desktop-anchor]');
  const mobileDetailsAnchor = root.querySelector('[data-ps-details-mobile-anchor]');
  const productMobileBreakpoint = window.matchMedia('(max-width: 900px)');
  let activeMediaId = root.querySelector('[data-ps-media].is-active')?.dataset.mediaId || root.querySelector('[data-ps-media]')?.dataset.mediaId || '';
  // The source catalog keeps one clean artwork image as the final gallery item.
  // Custom framing is intentionally previewed only on that image, so regular
  // lifestyle/detail images never receive the visual treatment.
  const customPreviewMediaId = [...root.querySelectorAll('[data-ps-media]')].at(-1)?.dataset.mediaId || '';
  let mediaSwitchToken = 0;
  let framingAddonPrice = 0;

  const placeDetailsForViewport = () => {
    if (!details || !desktopDetailsAnchor || !mobileDetailsAnchor) return;
    const anchor = productMobileBreakpoint.matches ? mobileDetailsAnchor : desktopDetailsAnchor;
    anchor.after(details);
  };

  placeDetailsForViewport();
  productMobileBreakpoint.addEventListener('change', placeDetailsForViewport);

  const fitArtPreview = () => {
    if (!artPreview || !mainMedia || !mainImage?.naturalWidth || !mainImage?.naturalHeight) return;
    const ratio = mainImage.naturalWidth / mainImage.naturalHeight;
    artPreview.style.setProperty('--pdp-aspect', `${mainImage.naturalWidth} / ${mainImage.naturalHeight}`);
    artPreview.dataset.psPreviewOrientation = ratio > 1.08 ? 'landscape' : ratio < .92 ? 'portrait' : 'square';
    root.dispatchEvent(new CustomEvent('product:preview-orientation', { detail: { orientation: artPreview.dataset.psPreviewOrientation } }));
  };

  mainImage?.addEventListener('load', fitArtPreview);
  window.addEventListener('resize', fitArtPreview, { passive: true });
  fitArtPreview();

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(cents / 100);
  const currentVariant = () => variants.find((item) => String(item.id) === String(variantInput?.value));
  const renderPrice = (variant) => {
    if (!variant || !currentPrice) return;
    currentPrice.textContent = money(Number(variant.price || 0) + framingAddonPrice);
    if (variant.compare_at_price > variant.price) {
      comparePrice.textContent = money(Number(variant.compare_at_price || 0) + framingAddonPrice);
      comparePrice.classList.remove('is-hidden');
    } else {
      comparePrice.classList.add('is-hidden');
    }
  };
  root.addEventListener('product:framing-price-change', (event) => {
    framingAddonPrice = Number(event.detail?.addonPrice || 0);
    renderPrice(currentVariant());
  });
  const selectedValues = () => {
    const activeVariant = variants.find((item) => String(item.id) === String(variantInput?.value));
    const values = [...(activeVariant?.options || [])];
    root.querySelectorAll('[data-ps-option-group]').forEach((group) => {
      const position = Number(group.dataset.optionPosition) - 1;
      const selected = group.querySelector('input:checked')?.value;
      if (position >= 0 && selected) values[position] = selected;
    });
    return values;
  };

  const setMedia = (id) => {
    const thumbnail = root.querySelector(`[data-media-id="${id}"]`);
    if (!thumbnail || !mainImage) return;
    activeMediaId = id;
    root.querySelectorAll('[data-ps-media]').forEach((item) => item.classList.remove('is-active'));
    thumbnail.classList.add('is-active');
    const switchToken = ++mediaSwitchToken;
    const commitMedia = () => {
      if (switchToken !== mediaSwitchToken) return;
      if (thumbnail.dataset.mediaSrcset) {
        mainImage.srcset = thumbnail.dataset.mediaSrcset;
      } else {
        mainImage.removeAttribute('srcset');
      }
      mainImage.src = thumbnail.dataset.mediaSrc;
      mainImage.alt = thumbnail.dataset.mediaAlt || '';
      mainImage.style.opacity = '1';
      root.dispatchEvent(new CustomEvent('product:media-change', { detail: { mediaId: activeMediaId, isCustomPreview: activeMediaId === customPreviewMediaId } }));
    };
    const preload = new Image();
    let committed = false;
    const finishPreload = () => {
      if (committed) return;
      committed = true;
      commitMedia();
    };
    preload.onload = finishPreload;
    preload.onerror = finishPreload;
    if (thumbnail.dataset.mediaSrcset) {
      preload.srcset = thumbnail.dataset.mediaSrcset;
      preload.sizes = mainImage.sizes || '(min-width: 901px) 58vw, 100vw';
    }
    preload.src = thumbnail.dataset.mediaSrc;
    if (preload.complete) finishPreload();
    thumbnail.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  const changeMedia = (direction) => {
    const media = [...root.querySelectorAll('[data-ps-media]')];
    if (!media.length) return;
    const activeIndex = Math.max(media.findIndex((item) => item.classList.contains('is-active')), 0);
    const nextIndex = (activeIndex + direction + media.length) % media.length;
    setMedia(media[nextIndex].dataset.mediaId);
  };

  const updateVariant = () => {
    if (!variants.length || !variantInput) return;
    const values = selectedValues();
    const variant = variants.find((item) => item.options.every((value, index) => value === values[index]));
    if (!variant) {
      addButton.disabled = true;
      addLabel.textContent = 'Unavailable';
      status.textContent = 'This option combination is unavailable.';
      return;
    }
    variantInput.value = variant.id;
    renderPrice(variant);
    addButton.disabled = !variant.available;
    addLabel.textContent = variant.available ? 'Add to cart' : 'Sold out';
    status.textContent = variant.available ? '' : 'This variant is sold out.';
    if (variant.featured_media?.id) setMedia(variant.featured_media.id);
    root.dispatchEvent(new CustomEvent('product:variant-change', { detail: { variant } }));
  };

  root.querySelectorAll('[data-ps-media]').forEach((thumbnail) => thumbnail.addEventListener('click', () => setMedia(thumbnail.dataset.mediaId)));
  root.querySelectorAll('[data-ps-thumbnail-scroll]').forEach((control) => control.addEventListener('click', () => {
    const rail = root.querySelector('[data-ps-thumbnail-rail]');
    const item = rail?.querySelector('[data-ps-media]');
    if (!rail || !item) return;
    const direction = Number(control.dataset.psThumbnailScroll);
    rail.scrollBy({ top: direction * (item.offsetHeight + 10), behavior: 'smooth' });
  }));
  root.querySelectorAll('[data-ps-media-direction]').forEach((control) => control.addEventListener('click', () => changeMedia(Number(control.dataset.psMediaDirection))));
  let mediaSwipeStart = null;
  mainMedia?.addEventListener('pointerdown', (event) => {
    if (!window.matchMedia('(max-width: 900px)').matches || !event.isPrimary) return;
    mediaSwipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }, { passive: true });
  mainMedia?.addEventListener('pointerup', (event) => {
    if (!mediaSwipeStart || mediaSwipeStart.id !== event.pointerId) return;
    const deltaX = event.clientX - mediaSwipeStart.x;
    const deltaY = event.clientY - mediaSwipeStart.y;
    mediaSwipeStart = null;
    if (Math.abs(deltaX) < 32 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    changeMedia(deltaX < 0 ? 1 : -1);
  }, { passive: true });
  mainMedia?.addEventListener('pointercancel', () => { mediaSwipeStart = null; }, { passive: true });
  root.querySelectorAll('[data-ps-accordion]').forEach((accordion) => {
    const trigger = accordion.querySelector('[data-ps-accordion-trigger]');
    const panel = accordion.querySelector('[data-ps-accordion-panel]');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      panel.setAttribute('aria-hidden', String(!isOpen));
    });
  });
  root.querySelectorAll('[data-ps-option-group] input').forEach((input) => input.addEventListener('change', () => {
    const label = input.closest('[data-ps-option-group]')?.querySelector('[data-ps-option-label]');
    if (label) label.textContent = input.value;
    updateVariant();
  }));
  root.querySelectorAll('[data-ps-choice-group]').forEach((group) => group.querySelectorAll('[data-ps-choice]').forEach((choice) => choice.addEventListener('click', () => {
    group.querySelectorAll('[data-ps-choice]').forEach((item) => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-pressed', 'false');
      item.setAttribute('aria-selected', 'false');
    });
    choice.classList.add('is-selected');
    choice.setAttribute('aria-pressed', 'true');
    choice.setAttribute('aria-selected', 'true');
    const choiceLabel = choice.dataset.psChoiceLabel || choice.dataset.psFrameName || choice.textContent.trim();
    const output = group.closest('.ps-config-group')?.querySelector('[data-ps-choice-output]');
    if (output) output.textContent = choiceLabel;
  })));
  root.addEventListener('product:show-custom-preview', () => {
    if (customPreviewMediaId && activeMediaId !== customPreviewMediaId) setMedia(customPreviewMediaId);
  });
  root.dispatchEvent(new CustomEvent('product:media-change', { detail: { mediaId: activeMediaId, isCustomPreview: activeMediaId === customPreviewMediaId } }));
  root.querySelectorAll('[data-ps-quantity-change]').forEach((button) => button.addEventListener('click', () => { const input = root.querySelector('[data-ps-quantity] input'); if (input) input.value = Math.max(1, Number(input.value || 1) + Number(button.dataset.psQuantityChange)); }));
  const offerToggle = root.querySelector('[data-ps-offer-toggle]');
  const offerDetails = root.querySelector('[data-ps-offer-details]');
  let offerCloseTimer;
  offerToggle?.addEventListener('click', () => {
    const open = offerToggle.getAttribute('aria-expanded') !== 'true';
    offerToggle.setAttribute('aria-expanded', String(open));
    if (!offerDetails) return;

    window.clearTimeout(offerCloseTimer);
    if (open) {
      offerDetails.hidden = false;
      window.requestAnimationFrame(() => offerDetails.classList.add('is-open'));
      return;
    }

    offerDetails.classList.remove('is-open');
    offerCloseTimer = window.setTimeout(() => { offerDetails.hidden = true; }, 220);
  });
  form?.addEventListener('submit', async (event) => {
    if (!addButton || addButton.disabled) return;
    event.preventDefault();
    addButton.disabled = true;
    addLabel.textContent = 'Adding…';
    // Open immediately so the customer gets feedback before Shopify returns
    // the refreshed cart payload.
    window.CartDrawer?.openLoading();
    try {
      const quantity = Math.max(1, Number(root.querySelector('[data-ps-quantity] input')?.value || 1));
      const cartPayload = root.productFraming
        ? root.productFraming.getCartItems(variantInput.value, quantity)
        : { items: [{ id: Number(variantInput.value), quantity }] };
      if (!window.CustomProductCart) throw new Error('The cart service is unavailable. Please refresh and try again.');
      const cartResult = await window.CustomProductCart.add({ form, cartPayload, artwork: root.productArtwork });
      const cart = cartResult.cart;
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      window.dataLayer?.push({
        event: 'framing_configuration_added',
        product_variant_id: String(variantInput.value),
        configuration_id: cartPayload.configurationId || null,
        passepartout_variant_id: cartPayload.selected?.passepartout?.id || null,
        frame_variant_id: cartPayload.selected?.frame?.id || null,
        artwork_uploaded: cartResult.hasArtwork,
        quantity,
      });
      if (cartResult.hasArtwork) {
        const artworkMetadata = root.productArtwork?.getMetadata?.();
        window.dataLayer?.push({
          event: 'custom_artwork_added_to_cart',
          product_variant_id: String(variantInput.value),
          file_type: artworkMetadata?.type || null,
          file_size_bytes: artworkMetadata?.size || null,
          image_width: artworkMetadata?.width || null,
          image_height: artworkMetadata?.height || null,
        });
      }
      window.CartDrawer?.open(cart);
      addLabel.textContent = 'Added to cart';
    } catch (error) {
      window.CartDrawer?.openError();
      status.textContent = error.message || 'Could not add this item to cart.';
      addLabel.textContent = 'Try again';
      window.dataLayer?.push({
        event: 'custom_product_cart_add_failed',
        product_variant_id: String(variantInput.value),
        artwork_uploaded: Boolean(root.productArtwork?.getFile?.()),
        http_status: error.status || null,
      });
    } finally {
      addButton.disabled = false;
      window.setTimeout(() => updateVariant(), 900);
    }
  });
})();
