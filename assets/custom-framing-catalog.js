(() => {
  const DEFAULT_HANDLES = {
    passepartout: 'system-passepartout-addon',
    frame: 'system-frame-addon',
  };
  const EXPECTED_VARIANTS = { passepartout: 117, frame: 189 };
  const PASSEPARTOUT_FITS = new Map([
    ['a3 (29.7x42 cm)', 'A4 (21x29,7 cm)'],
    ['a2 (42x59.4 cm)', 'A3 (29,7x42 cm)'],
    ['a1 (59.4x84.1 cm)', 'A2 (42x59,4 cm)'],
    ['30x40 cm', 'A4 (21x29,7 cm)'],
    ['40x50 cm', '30x40 cm'],
    ['50x70 cm', '40x50 cm'],
    ['60x80 cm', '50x70 cm'],
    ['70x70 cm', '50x50 cm'],
    ['70x100 cm', '50x70 cm'],
  ]);

  const normalizeSize = (value = '') => value
    .toLowerCase()
    .replaceAll(',', '.')
    .replace(/[×✕✖]/g, 'x')
    .replace(/\s*x\s*/g, 'x')
    .replace(/\s+/g, ' ')
    .trim();

  const slugify = (value = '') => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const assetUrl = (baseUrl, kind, styleSlug, orientation) => {
    if (!baseUrl) return '';
    const prefix = kind === 'passepartout' ? 'ps-mat' : 'ps-frame';
    return `${baseUrl}${prefix}-${styleSlug}-${orientation}.png`;
  };

  const money = (price) => {
    const currency = globalThis.Shopify?.currency?.active || 'GBP';
    const locale = document.documentElement.lang || 'en-GB';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(price || 0) / 100);
  };

  const optionPosition = (product, matcher, fallback) => {
    const index = (product.options || []).findIndex((option) => matcher(typeof option === 'string' ? option : option.name));
    return index >= 0 ? index + 1 : fallback;
  };

  const optionValue = (variant, position) => variant[`option${position}`] || variant.options?.[position - 1] || '';

  const convertProduct = (kind, product, previewBaseUrl) => {
    const sizePosition = optionPosition(product, (name = '') => name.toLowerCase().includes('size'), 2);
    const stylePosition = optionPosition(product, (name = '') => !name.toLowerCase().includes('size'), 1);
    return {
      productId: product.id,
      handle: product.handle,
      variants: (product.variants || []).map((variant) => {
        const style = optionValue(variant, stylePosition);
        const size = optionValue(variant, sizePosition);
        const styleSlug = slugify(style);
        const fitsSize = kind === 'passepartout' ? PASSEPARTOUT_FITS.get(normalizeSize(size)) || '' : size;
        return {
          id: variant.id,
          style,
          styleSlug,
          size,
          fitsSize,
          price: Number(variant.price),
          formattedPrice: money(variant.price),
          available: Boolean(variant.available),
          sku: variant.sku || '',
          preview: Object.fromEntries(['portrait', 'landscape', 'square'].map((orientation) => [
            orientation,
            assetUrl(previewBaseUrl, kind, styleSlug, orientation),
          ])),
        };
      }),
    };
  };

  const readInline = (node) => {
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error('Framing catalog could not be read.', error);
      return {};
    }
  };

  const isComplete = (catalog) => Object.entries(EXPECTED_VARIANTS).every(([kind, count]) => (
    catalog[kind]?.variants?.length === count
  ));

  const fetchProduct = async (handle) => {
    const response = await fetch(`/products/${encodeURIComponent(handle)}.js`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Could not load framing product ${handle} (HTTP ${response.status}).`);
    return response.json();
  };

  const load = async (node) => {
    const inline = readInline(node);
    if (isComplete(inline)) return { ...inline, source: 'liquid' };

    const handles = Object.fromEntries(Object.keys(DEFAULT_HANDLES).map((kind) => [
      kind,
      inline[kind]?.handle || DEFAULT_HANDLES[kind],
    ]));
    try {
      const [passepartout, frame] = await Promise.all([
        fetchProduct(handles.passepartout),
        fetchProduct(handles.frame),
      ]);
      const catalog = {
        previewBaseUrl: inline.previewBaseUrl || '',
        passepartout: convertProduct('passepartout', passepartout, inline.previewBaseUrl),
        frame: convertProduct('frame', frame, inline.previewBaseUrl),
        source: 'ajax-product-api',
      };
      if (!isComplete(catalog)) throw new Error('Shopify returned an incomplete framing catalog.');
      return catalog;
    } catch (error) {
      console.error('Framing catalog fallback failed.', error);
      return { ...inline, source: 'incomplete-liquid' };
    }
  };

  globalThis.PosterFramingCatalog = { load, normalizeSize };
})();
