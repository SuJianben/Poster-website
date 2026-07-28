(() => {
  const root = document.querySelector('[data-ps-product]');
  if (!root) return;

  const variantData = document.querySelector('[data-ps-variants]');
  const variants = variantData ? JSON.parse(variantData.textContent) : [];
  const form = root.querySelector('[data-ps-form]');
  const variantInput = root.querySelector('[data-ps-variant-input]');
  const price = root.querySelector('[data-ps-price]');
  const currentPrice = root.querySelector('.ps-price__current');
  const comparePrice = root.querySelector('[data-ps-compare]');
  const addButton = root.querySelector('[data-ps-add-button]');
  const addLabel = root.querySelector('[data-ps-add-label]');
  const status = root.querySelector('[data-ps-status]');
  const mainImage = root.querySelector('[data-ps-main-image]');

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(cents / 100);
  const selectedValues = () => [...root.querySelectorAll('[data-ps-option-group]')].map((group) => group.querySelector('input:checked')?.value);

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
  root.querySelectorAll('[data-ps-option-group] input').forEach((input) => input.addEventListener('change', updateVariant));
  root.querySelectorAll('[data-ps-choice-group]').forEach((group) => group.querySelectorAll('[data-ps-choice]').forEach((choice) => choice.addEventListener('click', () => {
    group.querySelectorAll('[data-ps-choice]').forEach((item) => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-pressed', 'false');
    });
    choice.classList.add('is-selected');
    choice.setAttribute('aria-pressed', 'true');
    const output = group.parentElement?.querySelector('[data-ps-choice-output]');
    if (output) output.textContent = choice.dataset.psFrameName || choice.textContent.trim();
  })));
  form?.addEventListener('submit', () => { if (addButton && !addButton.disabled) addLabel.textContent = 'Adding…'; });
})();
