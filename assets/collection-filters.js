(() => {
  const root = document.querySelector('[data-cg-collection]');
  if (!root || !root.dataset.cgSectionId || typeof window.fetch !== 'function') return;

  const sectionId = root.dataset.cgSectionId;
  let activeRequest = null;

  const buildFormUrl = (form) => {
    const url = new URL(form.action, window.location.origin);
    const params = new URLSearchParams();

    new FormData(form).forEach((value, key) => {
      if (String(value).trim() !== '') params.append(key, value);
    });

    url.search = params.toString();
    return url;
  };

  const captureFilterUi = (form) => {
    const focusedElement = form.contains(document.activeElement) ? document.activeElement : null;

    return {
      details: Array.from(form.querySelectorAll('details')).map((details) => details.open),
      focus: focusedElement?.name ? { name: focusedElement.name, value: focusedElement.value } : null,
      scrollTop: root.querySelector('.cg-drawer__panel')?.scrollTop ?? 0
    };
  };

  const restoreFilterUi = (form, state) => {
    form.querySelectorAll('details').forEach((details, index) => {
      if (typeof state.details[index] === 'boolean') details.open = state.details[index];
    });

    if (state.focus) {
      const nextFocus = Array.from(form.elements).find((element) => (
        element.name === state.focus.name && element.value === state.focus.value
      ));
      nextFocus?.focus({ preventScroll: true });
    }

    const panel = root.querySelector('.cg-drawer__panel');
    if (panel) panel.scrollTop = state.scrollTop;
  };

  const setLoading = (loading) => {
    const results = root.querySelector('[data-cg-results]');
    const form = root.querySelector('[data-cg-filter-form]');

    results?.classList.toggle('is-loading', loading);
    results?.setAttribute('aria-busy', String(loading));
    form?.setAttribute('aria-busy', String(loading));
  };

  const trackResultsUpdate = (url, source) => {
    const detail = {
      collectionHandle: root.dataset.cgCollectionHandle,
      query: url.searchParams.toString(),
      source
    };

    root.dispatchEvent(new CustomEvent('cg:results-updated', { bubbles: true, detail }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'collection_results_updated',
        collection_handle: detail.collectionHandle,
        filter_query: detail.query,
        update_source: source
      });
    }
  };

  const updateCollection = async (url, { updateHistory = true, source = 'filter' } = {}) => {
    activeRequest?.abort();

    const controller = new AbortController();
    const currentForm = root.querySelector('[data-cg-filter-form]');
    const filterUi = captureFilterUi(currentForm);
    activeRequest = controller;
    setLoading(true);

    try {
      const sectionUrl = new URL(url);
      sectionUrl.searchParams.set('section_id', sectionId);

      const response = await fetch(sectionUrl, {
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Collection request failed with ${response.status}`);

      const html = await response.text();
      const nextDocument = new DOMParser().parseFromString(html, 'text/html');
      const nextRoot = nextDocument.querySelector('[data-cg-collection]');
      const nextResults = nextRoot?.querySelector('[data-cg-results]');
      const nextCount = nextRoot?.querySelector('[data-cg-product-count]');
      const nextForm = nextRoot?.querySelector('[data-cg-filter-form]');

      if (!nextResults || !nextCount || !nextForm) {
        throw new Error('Collection response is missing replaceable regions');
      }

      root.querySelector('[data-cg-results]').replaceWith(nextResults);
      root.querySelector('[data-cg-product-count]').textContent = nextCount.textContent;
      currentForm.innerHTML = nextForm.innerHTML;
      restoreFilterUi(currentForm, filterUi);

      if (updateHistory) window.history.pushState({ collectionFilters: true }, '', url);
      trackResultsUpdate(url, source);
    } catch (error) {
      if (error.name === 'AbortError') return;
      window.location.assign(url.href);
    } finally {
      if (activeRequest === controller) {
        activeRequest = null;
        setLoading(false);
      }
    }
  };

  root.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"], input[type="radio"]')) return;

    const form = event.target.closest('[data-cg-filter-form]');
    if (form) updateCollection(buildFormUrl(form), { source: 'filter' });
  });

  root.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-cg-filter-form]');
    if (!form) return;

    event.preventDefault();
    updateCollection(buildFormUrl(form), { source: 'submit' });
  });

  root.addEventListener('click', (event) => {
    const clearLink = event.target.closest?.('[data-cg-filter-form] .cg-filter-actions a');
    const paginationLink = event.target.closest?.('[data-cg-results] .cg-pagination a');
    const link = clearLink || paginationLink;
    if (!link) return;

    event.preventDefault();
    updateCollection(new URL(link.href), { source: clearLink ? 'clear' : 'pagination' });
  });

  window.addEventListener('popstate', () => {
    updateCollection(new URL(window.location.href), { updateHistory: false, source: 'history' });
  });
})();
