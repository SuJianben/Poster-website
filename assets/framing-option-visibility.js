(() => {
  const allowedStyles = Object.freeze({
    passepartout: Object.freeze(['white']),
    frame: Object.freeze(['white-wood', 'black-wood']),
  });

  const normalizeStyleSlug = (variant = {}) => String(variant.styleSlug || variant.style || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const isVisible = (kind, variant) => {
    const allowed = allowedStyles[kind];
    return !allowed || allowed.includes(normalizeStyleSlug(variant));
  };

  globalThis.PosterFramingVisibility = Object.freeze({ allowedStyles, isVisible });
})();
