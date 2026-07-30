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
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const maxWidth = isMobile ? mainMedia.clientWidth : mainMedia.clientWidth * 0.78;
    const maxHeight = isMobile
      ? Math.min(window.innerHeight * 0.6, 720)
      : mainMedia.clientHeight * 0.78;
    const width = Math.min(maxWidth, maxHeight * ratio);
    artPreview.style.width = `${Math.round(width)}px`;
    artPreview.style.height = `${Math.round(width / ratio)}px`;
  };

  mainImage?.addEventListener('load', fitArtPreview);
  window.addEventListener('resize', fitArtPreview, { passive: true });
  fitArtPreview();

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(cents / 100);
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
    root.querySelectorAll('[data-ps-media]').forEach((item) => item.classList.remove('is-active'));
    thumbnail.classList.add('is-active');
    mainImage.style.opacity = '0';
    window.setTimeout(() => {
      mainImage.src = thumbnail.dataset.mediaSrc;
      mainImage.alt = thumbnail.dataset.mediaAlt || '';
      mainImage.style.opacity = '1';
      fitArtPreview();
    }, 150);
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
    currentPrice.textContent = money(variant.price);
    if (variant.compare_at_price > variant.price) {
      comparePrice.textContent = money(variant.compare_at_price);
      comparePrice.classList.remove('is-hidden');
    } else {
      comparePrice.classList.add('is-hidden');
    }
    addButton.disabled = !variant.available;
    addLabel.textContent = variant.available ? 'Add to cart' : 'Sold out';
    status.textContent = variant.available ? '' : 'This variant is sold out.';
    if (variant.featured_media?.id) setMedia(variant.featured_media.id);
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
  root.querySelectorAll('[data-ps-description-tab]').forEach((tab) => tab.addEventListener('click', () => {
    const key = tab.dataset.psDescriptionTab;
    root.querySelectorAll('[data-ps-description-tab]').forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });
    root.querySelectorAll('[data-ps-description-panel]').forEach((panel) => {
      const isActive = panel.dataset.psDescriptionPanel === key;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }));
  root.querySelectorAll('[data-ps-option-group] input').forEach((input) => input.addEventListener('change', () => {
    const label = input.closest('[data-ps-option-group]')?.querySelector('[data-ps-option-label]');
    if (label) label.textContent = input.value;
    updateVariant();
  }));
  root.querySelectorAll('[data-ps-choice-group]').forEach((group) => group.querySelectorAll('[data-ps-choice]').forEach((choice) => choice.addEventListener('click', () => {
    group.querySelectorAll('[data-ps-choice]').forEach((item) => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-pressed', 'false');
    });
    choice.classList.add('is-selected');
    choice.setAttribute('aria-pressed', 'true');
    const output = group.parentElement?.querySelector('[data-ps-choice-output]');
    if (output) output.textContent = choice.dataset.psFrameName || choice.textContent.trim();
    const previewTarget = group.dataset.psPreviewTarget;
    if (artPreview && previewTarget && choice.dataset.psPreviewValue) {
      artPreview.dataset[`psPreview${previewTarget.charAt(0).toUpperCase()}${previewTarget.slice(1)}`] = choice.dataset.psPreviewValue;
    }
  })));
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
      const response = await fetch('/cart/add.js', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!response.ok) throw new Error('Could not add this item to cart.');
      const cartResponse = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!cartResponse.ok) throw new Error('Could not refresh cart.');
      const cart = await cartResponse.json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      window.CartDrawer?.open(cart);
      addLabel.textContent = 'Added to cart';
    } catch (error) {
      status.textContent = error.message || 'Could not add this item to cart.';
      addLabel.textContent = 'Try again';
    } finally {
      addButton.disabled = false;
      window.setTimeout(() => updateVariant(), 900);
    }
  });
})();
