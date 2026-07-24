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
  root.querySelectorAll('[data-ps-option-group] input').forEach((input) => input.addEventListener('change', updateVariant));
  form?.addEventListener('submit', () => { if (addButton && !addButton.disabled) addLabel.textContent = 'Adding…'; });
})();
