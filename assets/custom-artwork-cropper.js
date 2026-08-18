(() => {
  const root = document.querySelector('[data-ps-product]');
  const modal = root?.querySelector('[data-ps-cropper]');
  const geometry = globalThis.PosterCropGeometry;
  if (!root || !modal || !geometry) return;

  const workspace = modal.querySelector('[data-ps-cropper-workspace]');
  const canvas = modal.querySelector('[data-ps-cropper-canvas]');
  const context = canvas?.getContext('2d');
  const confirmButton = modal.querySelector('[data-ps-cropper-confirm]');
  const cancelButtons = [...modal.querySelectorAll('[data-ps-cropper-cancel]')];
  const ratioButtons = [...modal.querySelectorAll('[data-ps-cropper-ratio]')];
  if (!workspace || !canvas || !context || !confirmButton || !ratioButtons.length) return;

  const ratios = { landscape: Math.SQRT2, square: 1, portrait: 1 / Math.SQRT2 };
  const freeformResize = root.dataset.psFramingRenderMode === 'css';
  const ratioMatchTolerance = 0.01;
  const handles = ['nw', 'ne', 'sw', 'se'];
  let state = null;
  let resolver = null;
  let resizeObserver = null;
  let previousFocus = null;
  let pointerState = null;

  const pointFromEvent = (event) => {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const displayedImageRect = () => {
    const availableWidth = canvas.clientWidth;
    const availableHeight = canvas.clientHeight;
    const scale = Math.min(availableWidth / state.image.naturalWidth, availableHeight / state.image.naturalHeight);
    const width = state.image.naturalWidth * scale;
    const height = state.image.naturalHeight * scale;
    return { x: (availableWidth - width) / 2, y: (availableHeight - height) / 2, width, height };
  };

  const handlePoints = (crop) => ({
    nw: { x: crop.x, y: crop.y }, ne: { x: crop.x + crop.width, y: crop.y },
    sw: { x: crop.x, y: crop.y + crop.height }, se: { x: crop.x + crop.width, y: crop.y + crop.height },
  });

  const hitHandle = (point) => {
    const points = handlePoints(state.crop);
    return handles.find((name) => Math.hypot(point.x - points[name].x, point.y - points[name].y) <= 18) || '';
  };

  const isInsideCrop = (point) => point.x >= state.crop.x && point.x <= state.crop.x + state.crop.width
    && point.y >= state.crop.y && point.y <= state.crop.y + state.crop.height;

  const draw = () => {
    if (!state) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const density = Math.min(globalThis.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * density) || canvas.height !== Math.round(height * density)) {
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
    }
    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#292b2b';
    context.fillRect(0, 0, width, height);
    const imageRect = displayedImageRect();
    context.drawImage(state.image, imageRect.x, imageRect.y, imageRect.width, imageRect.height);

    const crop = state.crop;
    context.save();
    context.fillStyle = 'rgb(0 0 0 / 58%)';
    context.beginPath();
    context.rect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);
    context.rect(crop.x, crop.y, crop.width, crop.height);
    context.fill('evenodd');
    context.restore();

    context.save();
    context.strokeStyle = '#fff';
    context.lineWidth = 2;
    context.strokeRect(crop.x, crop.y, crop.width, crop.height);
    context.strokeStyle = 'rgb(255 255 255 / 72%)';
    context.lineWidth = 1;
    context.beginPath();
    for (let index = 1; index < 3; index += 1) {
      const x = crop.x + crop.width * index / 3;
      const y = crop.y + crop.height * index / 3;
      context.moveTo(x, crop.y); context.lineTo(x, crop.y + crop.height);
      context.moveTo(crop.x, y); context.lineTo(crop.x + crop.width, y);
    }
    context.stroke();
    context.fillStyle = '#fff';
    Object.values(handlePoints(crop)).forEach((point) => {
      context.fillRect(point.x - 7, point.y - 7, 14, 14);
    });
    context.restore();
  };

  const resetCrop = () => {
    if (!state) return;
    const currentRatio = state.crop?.width && state.crop?.height ? state.crop.width / state.crop.height : 1;
    state.crop = geometry.fitCrop(displayedImageRect(), ratios[state.orientation] || currentRatio, 0.72);
    draw();
  };

  const syncRatioSelection = (orientation = '') => {
    if (!state) return;
    state.orientation = orientation;
    ratioButtons.forEach((button) => {
      const selected = button.dataset.psCropperRatio === orientation;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-checked', String(selected));
    });
  };

  const syncFreeformRatioSelection = () => {
    if (!freeformResize || !state?.crop) return;
    const cropRatio = state.crop.width / state.crop.height;
    syncRatioSelection(geometry.matchRatio(cropRatio, ratios, ratioMatchTolerance));
  };

  const setRatio = (orientation, { track = true } = {}) => {
    if (!ratios[orientation] || !state) return;
    syncRatioSelection(orientation);
    resetCrop();
    if (track) window.dataLayer?.push({ event: 'custom_artwork_crop_ratio_selected', orientation, ratio: ratios[orientation] });
  };

  const close = (result) => {
    modal.hidden = true;
    document.body.classList.remove('ps-cropper-open');
    pointerState = null;
    const resolve = resolver;
    resolver = null;
    if (state?.url) URL.revokeObjectURL(state.url);
    state = null;
    previousFocus?.focus?.();
    previousFocus = null;
    resolve?.(result);
  };

  const cancel = () => {
    if (!state) return;
    window.dataLayer?.push({ event: 'custom_artwork_crop_cancelled' });
    close(null);
  };

  const outputFile = () => new Promise((resolve, reject) => {
    const source = geometry.toSourceRect(state.crop, displayedImageRect(), state.image.naturalWidth, state.image.naturalHeight);
    const cropRatio = state.crop.width / state.crop.height;
    const outputOrientation = state.orientation || 'custom';
    const longest = Math.max(source.width, source.height);
    const outputScale = Math.min(1, 3200 / longest);
    const outputWidth = Math.max(1, Math.round(source.width * outputScale));
    const outputHeight = Math.max(1, Math.round(source.height * outputScale));
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputContext = outputCanvas.getContext('2d');
    outputContext.drawImage(state.image, source.x, source.y, source.width, source.height, 0, 0, outputWidth, outputHeight);
    const requestedType = ['image/jpeg', 'image/png', 'image/webp'].includes(state.file.type) ? state.file.type : 'image/jpeg';
    outputCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The cropped image could not be prepared. Please try again.'));
        return;
      }
      const extension = requestedType === 'image/png' ? 'png' : requestedType === 'image/webp' ? 'webp' : 'jpg';
      const baseName = state.file.name.replace(/\.[^.]+$/, '') || 'custom-artwork';
      const file = new File([blob], `${baseName}-${outputOrientation}.${extension}`, { type: blob.type || requestedType, lastModified: Date.now() });
      resolve({ file, orientation: outputOrientation, ratio: cropRatio, width: outputWidth, height: outputHeight });
    }, requestedType, requestedType === 'image/jpeg' || requestedType === 'image/webp' ? 0.92 : undefined);
  });

  const confirm = async () => {
    if (!state || confirmButton.disabled) return;
    confirmButton.disabled = true;
    const originalLabel = confirmButton.textContent;
    confirmButton.textContent = 'Preparing…';
    try {
      const result = await outputFile();
      window.dataLayer?.push({
        event: 'custom_artwork_crop_applied', orientation: result.orientation, ratio: result.ratio,
        output_width: result.width, output_height: result.height,
      });
      close(result);
    } catch (error) {
      console.error('Artwork crop failed.', error);
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = originalLabel;
    }
  };

  const loadImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be opened for cropping.'));
    image.src = url;
  });

  const open = async (file) => {
    if (resolver) close(null);
    const url = URL.createObjectURL(file);
    const image = await loadImage(url).catch((error) => {
      URL.revokeObjectURL(url);
      throw error;
    });
    const suggestedOrientation = image.naturalWidth / image.naturalHeight > 1.08
      ? 'landscape' : image.naturalWidth / image.naturalHeight < 0.92 ? 'portrait' : 'square';
    state = { file, url, image, orientation: suggestedOrientation, crop: null };
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('ps-cropper-open');
    setRatio(suggestedOrientation, { track: false });
    requestAnimationFrame(() => {
      resetCrop();
      ratioButtons.find((button) => button.classList.contains('is-selected'))?.focus();
    });
    window.dataLayer?.push({
      event: 'custom_artwork_crop_opened',
      suggested_orientation: suggestedOrientation,
      crop_mode: freeformResize ? 'freeform' : 'fixed',
    });
    return new Promise((resolve) => { resolver = resolve; });
  };

  ratioButtons.forEach((button) => button.addEventListener('click', () => setRatio(button.dataset.psCropperRatio)));
  cancelButtons.forEach((button) => button.addEventListener('click', cancel));
  confirmButton.addEventListener('click', confirm);
  canvas.addEventListener('pointerdown', (event) => {
    if (!state) return;
    const point = pointFromEvent(event);
    const handle = hitHandle(point);
    if (!handle && !isInsideCrop(point)) return;
    pointerState = {
      id: event.pointerId,
      mode: handle ? 'resize' : 'move',
      handle,
      point,
      crop: { ...state.crop },
      startingOrientation: state.orientation,
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = handle ? `${handle}-resize` : 'grabbing';
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!state) return;
    const point = pointFromEvent(event);
    if (!pointerState) {
      const handle = hitHandle(point);
      canvas.style.cursor = handle ? `${handle}-resize` : isInsideCrop(point) ? 'move' : 'default';
      return;
    }
    if (pointerState.id !== event.pointerId) return;
    if (pointerState.mode === 'move') {
      state.crop = geometry.moveCrop(pointerState.crop, point.x - pointerState.point.x, point.y - pointerState.point.y, displayedImageRect());
    } else if (freeformResize) {
      state.crop = geometry.resizeCropFree(pointerState.crop, pointerState.handle, point, displayedImageRect());
      syncFreeformRatioSelection();
    } else {
      state.crop = geometry.resizeCrop(pointerState.crop, pointerState.handle, point, displayedImageRect(), ratios[state.orientation]);
    }
    draw();
  });
  const releasePointer = (event) => {
    if (!pointerState || pointerState.id !== event.pointerId) return;
    if (pointerState.mode === 'resize' && freeformResize) {
      window.dataLayer?.push({
        event: 'custom_artwork_crop_resized',
        crop_mode: 'freeform',
        crop_ratio: state.crop.width / state.crop.height,
        matched_orientation: state.orientation || 'custom',
        preset_selection_changed: pointerState.startingOrientation !== state.orientation,
      });
    }
    pointerState = null;
    canvas.style.cursor = 'move';
  };
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') cancel();
  });
  resizeObserver = new ResizeObserver(() => state && resetCrop());
  resizeObserver.observe(workspace);

  root.productArtworkCropper = { open };
})();
