(async () => {
  const root = document.querySelector('[data-ps-product]');
  const catalogNode = document.querySelector('[data-ps-framing-catalog]');
  if (!root || !catalogNode) return;

  const catalog = globalThis.PosterFramingCatalog
    ? await globalThis.PosterFramingCatalog.load(catalogNode)
    : JSON.parse(catalogNode.textContent);

  const variantNode = document.querySelector('[data-ps-variants]');
  const posterVariants = variantNode ? JSON.parse(variantNode.textContent) : [];
  const variantInput = root.querySelector('[data-ps-variant-input]');
  const selected = { passepartout: null, frame: null };
  let isCustomPreviewActive = false;

  const labels = {
    passepartout: { empty: 'Add passepartout', none: 'No passepartout', from: 'From' },
    frame: { empty: 'Add frame', none: 'No frame', from: 'From' },
  };
  const swatches = {
    beige: '#e6dfca', black: '#111111', blue: '#38558d', brass: '#c3ad73',
    'dark-oak': '#654634', green: '#278e53', grey: '#c9c7bf', lavender: '#d9cbe8',
    'light-blue': '#9fc8db', mint: '#74c79d', oak: '#a77b49', orange: '#ff8038',
    petrol: '#577486', pink: '#ead0c2', plum: '#6e3e4c', red: '#c9584f',
    white: '#ffffff', yellow: '#f4cf65',
  };
  const swatchFor = (styleSlug = '') => swatches[styleSlug]
    || swatches[styleSlug.replace(/-(wood|alu)$/, '')]
    || '#b8bbba';

  const normalizeSize = globalThis.PosterFramingCatalog?.normalizeSize || ((value = '') => value
    .toLowerCase()
    .replaceAll(',', '.')
    .replace(/[×✕✖]/g, 'x')
    .replace(/\s*x\s*/g, 'x')
    .replace(/\s+/g, ' ')
    .trim());
  const isFramingOptionVisible = globalThis.PosterFramingVisibility?.isVisible || (() => true);
  const currentPosterVariant = () => posterVariants.find((variant) => String(variant.id) === String(variantInput?.value));
  const currentPosterSize = () => {
    const variant = currentPosterVariant();
    const sizeIndex = variant?.options?.findIndex((_value, index) => {
      const group = root.querySelector(`[data-ps-option-group][data-option-position="${index + 1}"]`);
      return group?.textContent.toLowerCase().includes('size');
    });
    return variant?.options?.[sizeIndex >= 0 ? sizeIndex : 0] || '';
  };
  const rowsForSize = (kind) => {
    const targetSize = kind === 'frame' && selected.passepartout ? selected.passepartout.size : currentPosterSize();
    const size = normalizeSize(targetSize);
    return (catalog[kind]?.variants || []).filter((variant) => (
      variant.available
      && isFramingOptionVisible(kind, variant)
      && normalizeSize(kind === 'passepartout' ? variant.fitsSize : variant.size) === size
    ));
  };
  const lowestPrice = (rows) => rows.length ? rows.reduce((lowest, row) => row.price < lowest.price ? row : lowest) : null;
  const optionLabel = (kind, variant) => kind === 'passepartout' ? `${variant.style} passepartout` : `${variant.style} frame`;
  const publishPricing = () => {
    const passepartoutPrice = Number(selected.passepartout?.price || 0);
    const framePrice = Number(selected.frame?.price || 0);
    root.dispatchEvent(new CustomEvent('product:framing-price-change', {
      detail: {
        addonPrice: passepartoutPrice + framePrice,
        passepartoutPrice,
        framePrice,
      },
    }));
  };

  const updateTrigger = (kind) => {
    const select = root.querySelector(`[data-ps-framing-select="${kind}"]`);
    if (!select) return;
    const value = select.querySelector('[data-ps-choice-select-value]');
    const price = select.querySelector('[data-ps-choice-select-price]');
    const plus = select.querySelector('[data-ps-choice-select-plus]');
    const output = select.closest('.ps-config-group')?.querySelector('[data-ps-choice-output]');
    const chosen = selected[kind];
    const lowest = lowestPrice(rowsForSize(kind));
    if (value) value.textContent = chosen ? optionLabel(kind, chosen) : labels[kind].empty;
    if (price) price.textContent = chosen ? chosen.formattedPrice : (lowest ? `${labels[kind].from} ${lowest.formattedPrice}` : 'Unavailable');
    if (plus) plus.hidden = Boolean(chosen);
    if (output) output.textContent = chosen ? optionLabel(kind, chosen) : labels[kind].none;
  };

  const applyPreview = () => {
    root.productFramePreview?.update({
      passepartout: selected.passepartout,
      frame: selected.frame,
      active: isCustomPreviewActive,
    });
  };

  const selectVariant = (kind, variant) => {
    selected[kind] = variant;
    render(kind);
    updateTrigger(kind);
    if (kind === 'passepartout') {
      render('frame');
      updateTrigger('frame');
    }
    if (variant) root.dispatchEvent(new CustomEvent('product:show-custom-preview'));
    applyPreview();
    publishPricing();
    window.dataLayer?.push({
      event: 'framing_option_changed',
      component: kind,
      action: variant ? 'selected' : 'removed',
      variant_id: variant?.id || null,
      price: Number(variant?.price || 0),
    });
  };

  const optionButton = (kind, variant) => {
    const button = document.createElement('button');
    const isSelected = String(selected[kind]?.id) === String(variant.id);
    button.type = 'button';
    button.className = `ps-frame-option${isSelected ? ' is-selected' : ''}`;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(isSelected));
    button.setAttribute('aria-pressed', String(isSelected));
    button.dataset.psFramingVariant = String(variant.id);
    button.innerHTML = `<span class="ps-frame-option__swatch" style="--ps-framing-swatch:${swatchFor(variant.styleSlug)}"></span><span class="ps-frame-option__details"><span class="ps-frame-option__name"></span><span class="ps-frame-option__size"></span></span><span class="ps-frame-option__price"></span>`;
    button.querySelector('.ps-frame-option__name').textContent = optionLabel(kind, variant);
    button.querySelector('.ps-frame-option__size').textContent = kind === 'passepartout' ? `${variant.size} | fits: ${variant.fitsSize}` : variant.size;
    button.querySelector('.ps-frame-option__price').textContent = variant.formattedPrice;
    button.addEventListener('click', () => selectVariant(kind, variant));
    return button;
  };

  const render = (kind) => {
    const select = root.querySelector(`[data-ps-framing-select="${kind}"]`);
    const list = select?.querySelector('[data-ps-framing-options]');
    if (!list) return;
    const rows = rowsForSize(kind);
    if (selected[kind] && !rows.some((row) => String(row.id) === String(selected[kind].id))) selected[kind] = null;
    list.replaceChildren();

    const none = document.createElement('button');
    none.type = 'button';
    none.className = `ps-frame-option ps-frame-option--natural${selected[kind] ? '' : ' is-selected'}`;
    none.setAttribute('role', 'option');
    none.setAttribute('aria-selected', String(!selected[kind]));
    none.setAttribute('aria-pressed', String(!selected[kind]));
    none.innerHTML = '<span class="ps-frame-option__swatch"></span><span class="ps-frame-option__details"><span class="ps-frame-option__name"></span></span>';
    none.querySelector('.ps-frame-option__name').textContent = labels[kind].none;
    none.addEventListener('click', () => selectVariant(kind, null));
    list.append(none);
    rows.forEach((variant) => list.append(optionButton(kind, variant)));
    if (!rows.length) {
      const message = document.createElement('p');
      message.className = 'ps-frame-options__empty';
      message.textContent = 'No option is available for this size.';
      list.append(message);
    }
    updateTrigger(kind);
  };

  root.querySelectorAll('[data-ps-framing-select]').forEach((select) => {
    const trigger = select.querySelector('[data-ps-frame-trigger]');
    trigger?.addEventListener('click', () => {
      const willOpen = !select.classList.contains('is-open');
      root.querySelectorAll('[data-ps-framing-select].is-open').forEach((item) => {
        item.classList.remove('is-open');
        item.querySelector('[data-ps-frame-trigger]')?.setAttribute('aria-expanded', 'false');
      });
      select.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-ps-framing-select]')) return;
    root.querySelectorAll('[data-ps-framing-select].is-open').forEach((select) => {
      select.classList.remove('is-open');
      select.querySelector('[data-ps-frame-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  });

  root.addEventListener('product:variant-change', () => {
    render('passepartout');
    render('frame');
    applyPreview();
    publishPricing();
  });
  root.addEventListener('product:media-change', (event) => {
    isCustomPreviewActive = Boolean(event.detail?.isCustomPreview);
    applyPreview();
  });
  root.addEventListener('product:preview-orientation', applyPreview);

  root.productFraming = {
    getCartItems(parentVariantId, quantity) {
      const configurationId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const parentProperties = { _framing_config: configurationId };
      const items = [{ id: Number(parentVariantId), quantity, properties: parentProperties }];
      for (const kind of ['passepartout', 'frame']) {
        const variant = selected[kind];
        if (!variant) continue;
        parentProperties[kind === 'passepartout' ? 'Passepartout' : 'Frame'] = optionLabel(kind, variant);
        items.push({
          id: Number(variant.id), quantity, parent_id: Number(parentVariantId),
          properties: {
            _framing_config: configurationId, _framing_component: kind,
            _framing_style: variant.style, _framing_size: variant.size,
          },
        });
      }
      return { items, configurationId, selected: { ...selected } };
    },
  };

  window.dataLayer?.push({
    event: 'framing_catalog_loaded',
    source: catalog.source || 'liquid',
    passepartout_variant_count: catalog.passepartout?.variants?.length || 0,
    frame_variant_count: catalog.frame?.variants?.length || 0,
    visible_passepartout_variant_count: (catalog.passepartout?.variants || []).filter((variant) => isFramingOptionVisible('passepartout', variant)).length,
    visible_frame_variant_count: (catalog.frame?.variants || []).filter((variant) => isFramingOptionVisible('frame', variant)).length,
  });

  render('passepartout');
  render('frame');
  applyPreview();
  publishPricing();
})();
