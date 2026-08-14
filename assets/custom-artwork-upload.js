(() => {
  const root = document.querySelector('[data-ps-product]');
  const component = root?.querySelector('[data-ps-artwork-upload]');
  if (!root || !component) return;

  const input = component.querySelector('[data-ps-artwork-input]');
  const dropzone = component.querySelector('[data-ps-artwork-dropzone]');
  const selection = component.querySelector('[data-ps-artwork-selection]');
  const fileOutput = component.querySelector('[data-ps-artwork-file]');
  const removeButton = component.querySelector('[data-ps-artwork-remove]');
  const status = component.querySelector('[data-ps-artwork-status]');
  const mainImage = root.querySelector('[data-ps-main-image]');
  if (!input || !dropzone || !selection || !fileOutput || !removeButton || !status || !mainImage) return;

  const maxBytes = Number(component.dataset.maxFileBytes || 20971520);
  const maxPixels = Number(component.dataset.maxImagePixels || 20000000);
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const allowedExtension = /\.(jpe?g|png|webp)$/i;
  const originalImage = {
    src: mainImage.getAttribute('src') || '',
    srcset: mainImage.getAttribute('srcset'),
    sizes: mainImage.getAttribute('sizes'),
    alt: mainImage.getAttribute('alt') || '',
  };
  let selectedFile = null;
  let selectedMetadata = null;
  let previewUrl = '';
  let selectionToken = 0;

  const setStatus = (message = '', type = '') => {
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
    status.classList.toggle('is-success', type === 'success');
  };

  const formatFileSize = (bytes) => bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  const revokePreview = () => {
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    previewUrl = '';
  };

  const restoreOriginalImage = () => {
    mainImage.src = originalImage.src;
    if (originalImage.srcset) mainImage.setAttribute('srcset', originalImage.srcset);
    else mainImage.removeAttribute('srcset');
    if (originalImage.sizes) mainImage.setAttribute('sizes', originalImage.sizes);
    else mainImage.removeAttribute('sizes');
    mainImage.alt = originalImage.alt;
    root.dispatchEvent(new CustomEvent('product:media-change', {
      detail: { mediaId: mainImage.closest('[data-ps-art-preview]')?.dataset.mediaId || '', isCustomPreview: false, source: 'artwork_removed' },
    }));
  };

  const clearSelection = ({ restoreImage = true, announce = true } = {}) => {
    selectionToken += 1;
    selectedFile = null;
    selectedMetadata = null;
    input.value = '';
    selection.hidden = true;
    fileOutput.textContent = '';
    component.dataset.state = 'empty';
    revokePreview();
    if (restoreImage) restoreOriginalImage();
    setStatus(announce ? 'Image removed.' : '', announce ? 'success' : '');
    root.dispatchEvent(new CustomEvent('product:artwork-change', { detail: { hasArtwork: false } }));
  };

  const inspectImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('This image could not be read. Please choose another file.'));
    image.src = url;
  });

  const validateFile = (file) => {
    if (!file) return 'Choose an image to continue.';
    if (!allowedTypes.has(file.type) && !allowedExtension.test(file.name)) return 'Use a JPEG, PNG or WebP image.';
    if (file.size > maxBytes) return 'The image must be 20 MB or smaller.';
    return '';
  };

  const applyFile = async (file) => {
    const token = ++selectionToken;
    const basicError = validateFile(file);
    if (basicError) {
      clearSelection({ announce: false });
      setStatus(basicError, 'error');
      return;
    }

    setStatus('Preparing preview…');
    const nextUrl = URL.createObjectURL(file);
    try {
      const dimensions = await inspectImage(nextUrl);
      if (token !== selectionToken) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      if (dimensions.width * dimensions.height > maxPixels) {
        URL.revokeObjectURL(nextUrl);
        clearSelection({ announce: false });
        setStatus('The image must be 20 megapixels or smaller.', 'error');
        return;
      }

      revokePreview();
      previewUrl = nextUrl;
      selectedFile = file;
      selectedMetadata = { ...dimensions, size: file.size, type: file.type || 'image' };
      mainImage.removeAttribute('srcset');
      mainImage.removeAttribute('sizes');
      mainImage.alt = 'Your uploaded artwork preview';
      mainImage.addEventListener('load', () => {
        root.dispatchEvent(new CustomEvent('product:media-change', {
          detail: { mediaId: 'customer-artwork', isCustomPreview: true, source: 'customer_upload' },
        }));
      }, { once: true });
      mainImage.src = previewUrl;
      fileOutput.textContent = `${file.name} · ${dimensions.width}×${dimensions.height}px · ${formatFileSize(file.size)}`;
      selection.hidden = false;
      component.dataset.state = 'ready';
      setStatus('Your image is now shown in the preview.', 'success');
      root.dispatchEvent(new CustomEvent('product:artwork-change', { detail: { hasArtwork: true, ...selectedMetadata } }));
      window.dataLayer?.push({
        event: 'custom_artwork_uploaded',
        file_type: selectedMetadata.type,
        file_size_bytes: selectedMetadata.size,
        image_width: selectedMetadata.width,
        image_height: selectedMetadata.height,
      });
    } catch (error) {
      URL.revokeObjectURL(nextUrl);
      if (token !== selectionToken) return;
      clearSelection({ announce: false });
      setStatus(error.message || 'This image could not be read. Please choose another file.', 'error');
    }
  };

  input.addEventListener('change', () => applyFile(input.files?.[0]));
  removeButton.addEventListener('click', () => clearSelection());
  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (typeof DataTransfer !== 'function') {
      setStatus('Use the Choose image button to select this file.', 'error');
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    applyFile(file);
  });
  window.addEventListener('beforeunload', revokePreview, { once: true });

  component.dataset.state = 'empty';
  root.productArtwork = {
    getFile: () => selectedFile,
    getMetadata: () => selectedMetadata ? { ...selectedMetadata } : null,
    clear: () => clearSelection(),
  };
})();
