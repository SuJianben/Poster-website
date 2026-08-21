(() => {
  const parseSizeLabel = (label) => {
    const normalized = String(label || '').replaceAll(',', '.');
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (!match) return null;

    const width = Number.parseFloat(match[1]);
    const height = Number.parseFloat(match[2]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    return { width, height };
  };

  const calculateRelativeSizes = (labels) => {
    const parsed = labels.map((label) => ({ label, dimensions: parseSizeLabel(label) }));
    const maximumDimension = Math.max(
      1,
      ...parsed.flatMap((item) => item.dimensions ? [item.dimensions.width, item.dimensions.height] : [])
    );

    return parsed.map((item) => ({
      ...item,
      widthPercent: item.dimensions ? (item.dimensions.width / maximumDimension) * 86 : 58,
      heightPercent: item.dimensions ? (item.dimensions.height / maximumDimension) * 86 : 78
    }));
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseSizeLabel, calculateRelativeSizes };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const initializedRoots = new WeakSet();

  const initializeSizeGuide = (root) => {
    if (!root || initializedRoots.has(root)) return;

    const modal = root.querySelector('[data-ps-size-guide-modal]');
    const openButtons = [...root.querySelectorAll('[data-ps-size-guide-open]')];
    if (!modal || openButtons.length === 0) return;

    const dialog = modal.querySelector('[role="dialog"]');
    const closeButtons = [...modal.querySelectorAll('[data-ps-size-guide-close]')];
    const items = [...modal.querySelectorAll('[data-ps-size-guide-item]')];
    const relativeSizes = calculateRelativeSizes(items.map((item) => item.dataset.sizeLabel || ''));
    let returnFocus = null;

    relativeSizes.forEach((size, index) => {
      const shape = items[index]?.querySelector('[data-ps-size-guide-shape]');
      if (!shape) return;
      shape.style.setProperty('--ps-size-guide-width', `${size.widthPercent}%`);
      shape.style.setProperty('--ps-size-guide-height', `${size.heightPercent}%`);
    });

    const setCurrentSize = (trigger) => {
      const selectedSize = trigger.closest('[data-ps-option-group]')?.querySelector('input:checked')?.value || '';
      items.forEach((item) => {
        const isCurrent = item.dataset.sizeLabel === selectedSize;
        item.classList.toggle('is-current', isCurrent);
        if (isCurrent) {
          item.setAttribute('aria-current', 'true');
        } else {
          item.removeAttribute('aria-current');
        }
        const currentLabel = item.querySelector('[data-ps-size-guide-current]');
        if (currentLabel) currentLabel.hidden = !isCurrent;
      });
      return selectedSize;
    };

    const closeModal = () => {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove('ps-size-guide-is-open');
      returnFocus?.focus();
      returnFocus = null;
    };

    const openModal = (trigger) => {
      returnFocus = trigger;
      const selectedSize = setCurrentSize(trigger);
      modal.hidden = false;
      document.body.classList.add('ps-size-guide-is-open');
      dialog.focus();

      const detail = {
        productContext: root.dataset.psProductContext || 'unknown',
        selectedSize,
        availableSizes: items.map((item) => item.dataset.sizeLabel || '')
      };
      root.dispatchEvent(new CustomEvent('product:size-guide-open', { bubbles: true, detail }));
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'product_size_guide_open',
          product_context: detail.productContext,
          selected_size: detail.selectedSize,
          available_size_count: detail.availableSizes.length
        });
      }
    };

    openButtons.forEach((button) => button.addEventListener('click', () => openModal(button)));
    closeButtons.forEach((button) => button.addEventListener('click', closeModal));
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hidden && !element.hasAttribute('disabled'));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    initializedRoots.add(root);
  };

  const initializeWithin = (scope) => {
    if (scope.matches?.('[data-ps-product]')) initializeSizeGuide(scope);
    scope.querySelectorAll?.('[data-ps-product]').forEach(initializeSizeGuide);
  };

  initializeWithin(document);
  document.addEventListener('shopify:section:load', (event) => initializeWithin(event.target));
})();
