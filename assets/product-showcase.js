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
  const mediaPreviewState = new Map();
  let activeMediaId = root.querySelector('[data-ps-media].is-active')?.dataset.mediaId || root.querySelector('[data-ps-media]')?.dataset.mediaId || '';
  // The source catalog keeps one clean artwork image as the final gallery item.
  // Custom framing is intentionally previewed only on that image, so regular
  // lifestyle/detail images never receive the visual treatment.
  const customPreviewMediaId = [...root.querySelectorAll('[data-ps-media]')].at(-1)?.dataset.mediaId || '';

  const applyPreviewState = () => {
    if (!artPreview) return;
    const state = mediaPreviewState.get(activeMediaId) || { frame: 'none', mat: 'none' };
    artPreview.dataset.psPreviewFrame = state.frame;
    artPreview.dataset.psPreviewMat = state.mat;
    fitArtPreview();
  };

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
    const maxHeight = Math.min(window.innerHeight * 0.6, 720);
    const hasFrame = artPreview.dataset.psPreviewFrame && artPreview.dataset.psPreviewFrame !== 'none';
    // The transparent frame artwork has a 70.875% × 72.82% opening. Keep
    // the artwork at its natural rendered size and enlarge only the outer
    // composition to that opening, rather than shrinking the artwork.
    const frameWidthScale = hasFrame ? 1 / 0.70875 : 1;
    const frameHeightScale = hasFrame ? 1 / 0.7282 : 1;
    // Size the artwork exactly as it would be rendered without a frame.
    // The transparent frame canvas may extend beyond that artwork; it must
    // never be allowed to reduce the artwork just to fit its empty margins.
    const width = Math.min(mainMedia.clientWidth, maxHeight * ratio);
    const compositionHeight = Math.round((width / ratio) * frameHeightScale);
    artPreview.style.width = `${Math.round(width * frameWidthScale)}px`;
    artPreview.style.height = `${compositionHeight}px`;
    // Keep the enlarged outer frame inside the media section instead of
    // letting it overlap the details accordions below. The artwork itself
    // keeps the same no-frame dimensions; only the section height expands.
    mainMedia.style.height = `${Math.max(620, compositionHeight)}px`;
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
    activeMediaId = id;
    root.querySelectorAll('[data-ps-media]').forEach((item) => item.classList.remove('is-active'));
    thumbnail.classList.add('is-active');
    mainImage.style.opacity = '0';
    window.setTimeout(() => {
      if (thumbnail.dataset.mediaSrcset) {
        mainImage.srcset = thumbnail.dataset.mediaSrcset;
      } else {
        mainImage.removeAttribute('srcset');
      }
      mainImage.src = thumbnail.dataset.mediaSrc;
      mainImage.alt = thumbnail.dataset.mediaAlt || '';
      mainImage.style.opacity = '1';
      applyPreviewState();
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
      item.setAttribute('aria-selected', 'false');
    });
    choice.classList.add('is-selected');
    choice.setAttribute('aria-pressed', 'true');
    choice.setAttribute('aria-selected', 'true');
    const output = group.closest('.ps-config-group')?.querySelector('[data-ps-choice-output]');
    if (output) output.textContent = choice.dataset.psFrameName || choice.textContent.trim();
    const frameSelect = group.closest('[data-ps-frame-select]');
    if (frameSelect) {
      const value = frameSelect.querySelector('[data-ps-frame-select-value]');
      const trigger = frameSelect.querySelector('[data-ps-frame-trigger]');
      if (value) value.textContent = choice.dataset.psFrameName || choice.textContent.trim();
      frameSelect.classList.remove('is-open');
      trigger?.setAttribute('aria-expanded', 'false');
    }
    const previewTarget = group.dataset.psPreviewTarget;
    if (artPreview && previewTarget && choice.dataset.psPreviewValue) {
      const previewMediaId = customPreviewMediaId || activeMediaId;
      mediaPreviewState.set(previewMediaId, {
        frame: previewTarget === 'frame' ? choice.dataset.psPreviewValue : (mediaPreviewState.get(previewMediaId)?.frame || 'none'),
        mat: previewTarget === 'mat' ? choice.dataset.psPreviewValue : (mediaPreviewState.get(previewMediaId)?.mat || 'none')
      });
      if (activeMediaId !== previewMediaId) {
        setMedia(previewMediaId);
      } else {
        applyPreviewState();
      }
    }
  })));
  root.querySelectorAll('[data-ps-frame-select]').forEach((select) => {
    const trigger = select.querySelector('[data-ps-frame-trigger]');
    trigger?.addEventListener('click', () => {
      const open = !select.classList.contains('is-open');
      root.querySelectorAll('[data-ps-frame-select].is-open').forEach((item) => {
        item.classList.remove('is-open');
        item.querySelector('[data-ps-frame-trigger]')?.setAttribute('aria-expanded', 'false');
      });
      select.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-ps-frame-select]')) return;
    root.querySelectorAll('[data-ps-frame-select].is-open').forEach((select) => {
      select.classList.remove('is-open');
      select.querySelector('[data-ps-frame-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  });
  applyPreviewState();
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
