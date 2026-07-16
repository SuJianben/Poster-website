(() => {
  'use strict';

  const LIGHT = '#fff';
  const DARK = '#111';
  const luminance = (red, green, blue) => (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);

  function setHeaderColour(header, foreground) {
    header.style.setProperty('--adaptive-header-foreground', foreground);
    header.style.setProperty('--adaptive-header-count-foreground', foreground === LIGHT ? DARK : LIGHT);
  }

  function getHeroImage() {
    return document.querySelector('.hero__media img');
  }

  function measureHero(image) {
    if (!image || !image.currentSrc) return Promise.resolve(null);

    return new Promise((resolve) => {
      const source = new Image();
      source.crossOrigin = 'anonymous';
      source.onload = () => {
        try {
          const size = 24;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(source, 0, 0, size, size);
          const pixels = context.getImageData(0, 0, size, size).data;
          let total = 0;
          for (let index = 0; index < pixels.length; index += 4) total += luminance(pixels[index], pixels[index + 1], pixels[index + 2]);
          resolve(total / (pixels.length / 4));
        } catch (_) { resolve(null); }
      };
      source.onerror = () => resolve(null);
      source.src = image.currentSrc;
    });
  }

  function initialise() {
    const header = document.querySelector('[data-adaptive-header]');
    const heroImage = getHeroImage();
    if (!header || !heroImage) return;

    // The banner is darkened beneath the left-aligned hero copy. A value below
    // 145 needs white controls; otherwise ink controls provide better contrast.
    measureHero(heroImage).then((value) => {
      if (value === null) return;
      setHeaderColour(header, value < 145 ? LIGHT : DARK);
    });

    // Re-measure if Shopify swaps the selected hero image in the theme editor.
    new MutationObserver(() => measureHero(getHeroImage()).then((value) => {
      if (value !== null) setHeaderColour(header, value < 145 ? LIGHT : DARK);
    })).observe(heroImage, { attributes: true, attributeFilter: ['src', 'srcset'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
