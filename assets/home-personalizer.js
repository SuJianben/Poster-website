(() => {
  const geometry = globalThis.PosterCropGeometry;
  const cropMode = globalThis.PosterCropMode;
  if (!geometry || !cropMode) return;

  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const allowedExtension = /\.(jpe?g|png|webp)$/i;
  const handles = ['nw', 'ne', 'sw', 'se'];

  const inspectImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be read. Please choose another file.'));
    image.src = url;
  });

  const formatFileSize = (bytes) => bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  const initializeCropper = (root, modal, track) => {
    const workspace = modal.querySelector('[data-home-personalizer-crop-workspace]');
    const canvas = modal.querySelector('[data-home-personalizer-crop-canvas]');
    const context = canvas?.getContext('2d');
    const confirmButton = modal.querySelector('[data-home-personalizer-crop-confirm]');
    const cancelButtons = [...modal.querySelectorAll('[data-home-personalizer-crop-cancel]')];
    const ratioButtons = [...modal.querySelectorAll('[data-home-personalizer-ratio]')];
    if (!workspace || !canvas || !context || !confirmButton || ratioButtons.length !== 3) return null;

    let state = null;
    let resolver = null;
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
      nw: { x: crop.x, y: crop.y },
      ne: { x: crop.x + crop.width, y: crop.y },
      sw: { x: crop.x, y: crop.y + crop.height },
      se: { x: crop.x + crop.width, y: crop.y + crop.height },
    });

    const hitHandle = (point) => {
      const points = handlePoints(state.crop);
      return handles.find((name) => Math.hypot(point.x - points[name].x, point.y - points[name].y) <= 18) || '';
    };

    const isInsideCrop = (point) => point.x >= state.crop.x
      && point.x <= state.crop.x + state.crop.width
      && point.y >= state.crop.y
      && point.y <= state.crop.y + state.crop.height;

    const draw = () => {
      if (!state) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
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
        context.moveTo(x, crop.y);
        context.lineTo(x, crop.y + crop.height);
        context.moveTo(crop.x, y);
        context.lineTo(crop.x + crop.width, y);
      }
      context.stroke();
      context.fillStyle = '#fff';
      Object.values(handlePoints(crop)).forEach((point) => context.fillRect(point.x - 7, point.y - 7, 14, 14));
      context.restore();
    };

    const resetCrop = () => {
      if (!state || !canvas.clientWidth || !canvas.clientHeight) return;
      state.crop = geometry.fitCrop(displayedImageRect(), cropMode.ratios[state.orientation], 0.72);
      draw();
    };

    const syncRatioSelection = () => {
      ratioButtons.forEach((button) => {
        const selected = button.dataset.homePersonalizerRatio === state.orientation;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-checked', String(selected));
      });
    };

    const setOrientation = (orientation, { shouldTrack = true } = {}) => {
      const selected = cropMode.select(orientation, false);
      if (!state || !selected || selected.cropMode !== 'fixed') return;
      state.orientation = selected.orientation;
      syncRatioSelection();
      resetCrop();
      if (shouldTrack) {
        track('home_personalizer_crop_ratio_selected', {
          orientation: selected.orientation,
          ratio: cropMode.ratios[selected.orientation],
        });
      }
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
      track('home_personalizer_crop_cancelled');
      close(null);
    };

    const createOutput = () => new Promise((resolve, reject) => {
      const imageRect = displayedImageRect();
      const source = geometry.toSourceRect(state.crop, imageRect, state.image.naturalWidth, state.image.naturalHeight);
      const longest = Math.max(source.width, source.height);
      const scale = Math.min(1, 3200 / longest);
      const width = Math.max(1, Math.round(source.width * scale));
      const height = Math.max(1, Math.round(source.height * scale));
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      const outputContext = output.getContext('2d');
      outputContext.drawImage(state.image, source.x, source.y, source.width, source.height, 0, 0, width, height);
      const requestedType = allowedTypes.has(state.file.type) ? state.file.type : 'image/jpeg';
      output.toBlob((blob) => {
        if (!blob) {
          reject(new Error('The cropped image could not be prepared. Please try again.'));
          return;
        }
        const extension = requestedType === 'image/png' ? 'png' : requestedType === 'image/webp' ? 'webp' : 'jpg';
        const baseName = state.file.name.replace(/\.[^.]+$/, '') || 'custom-artwork';
        const file = new File([blob], `${baseName}-${state.orientation}.${extension}`, {
          type: blob.type || requestedType,
          lastModified: Date.now(),
        });
        resolve({ file, orientation: state.orientation, ratio: width / height, width, height });
      }, requestedType, requestedType === 'image/png' ? undefined : 0.92);
    });

    const confirm = async () => {
      if (!state || confirmButton.disabled) return;
      confirmButton.disabled = true;
      const label = confirmButton.textContent;
      confirmButton.textContent = 'Preparing…';
      try {
        const result = await createOutput();
        track('home_personalizer_crop_applied', {
          orientation: result.orientation,
          ratio: result.ratio,
          output_width: result.width,
          output_height: result.height,
        });
        close(result);
      } catch (error) {
        console.error('Homepage artwork crop failed.', error);
      } finally {
        confirmButton.disabled = false;
        confirmButton.textContent = label;
      }
    };

    const open = async (file) => {
      if (resolver) close(null);
      const url = URL.createObjectURL(file);
      const image = await inspectImage(url).catch((error) => {
        URL.revokeObjectURL(url);
        throw error;
      });
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const orientation = imageRatio > 1.08 ? 'landscape' : imageRatio < 0.92 ? 'portrait' : 'square';
      state = { file, url, image, orientation, crop: null };
      previousFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('ps-cropper-open');
      syncRatioSelection();
      requestAnimationFrame(() => {
        resetCrop();
        ratioButtons.find((button) => button.classList.contains('is-selected'))?.focus();
      });
      track('home_personalizer_crop_opened', { suggested_orientation: orientation, fixed_ratio_count: 3 });
      return new Promise((resolve) => { resolver = resolve; });
    };

    ratioButtons.forEach((button) => button.addEventListener('click', () => setOrientation(button.dataset.homePersonalizerRatio)));
    cancelButtons.forEach((button) => button.addEventListener('click', cancel));
    confirmButton.addEventListener('click', confirm);
    canvas.addEventListener('pointerdown', (event) => {
      if (!state) return;
      const point = pointFromEvent(event);
      const handle = hitHandle(point);
      if (!handle && !isInsideCrop(point)) return;
      event.preventDefault();
      pointerState = {
        id: event.pointerId,
        mode: handle ? 'resize' : 'move',
        handle,
        point,
        crop: { ...state.crop },
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
      state.crop = pointerState.mode === 'move'
        ? geometry.moveCrop(pointerState.crop, point.x - pointerState.point.x, point.y - pointerState.point.y, displayedImageRect())
        : geometry.resizeCrop(pointerState.crop, pointerState.handle, point, displayedImageRect(), cropMode.ratios[state.orientation]);
      draw();
    });

    const releasePointer = (event) => {
      if (!pointerState || pointerState.id !== event.pointerId) return;
      pointerState = null;
      canvas.style.cursor = 'move';
    };
    canvas.addEventListener('pointerup', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') cancel();
    });
    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(() => state && resetCrop());
      resizeObserver.observe(workspace);
    }

    return { open };
  };

  document.querySelectorAll('[data-home-personalizer]').forEach((root) => {
    const upload = root.querySelector('[data-home-personalizer-upload]');
    const input = upload?.querySelector('[data-home-personalizer-input]');
    const dropzone = upload?.querySelector('[data-home-personalizer-dropzone]');
    const selection = upload?.querySelector('[data-home-personalizer-selection]');
    const fileName = upload?.querySelector('[data-home-personalizer-file-name]');
    const removeButton = upload?.querySelector('[data-home-personalizer-remove]');
    const status = upload?.querySelector('[data-home-personalizer-status]');
    const preview = root.querySelector('[data-home-personalizer-preview]');
    const previewImage = preview?.querySelector('[data-home-personalizer-preview-image]');
    const modal = root.querySelector('[data-home-personalizer-cropper]');
    if (!upload || !input || !dropzone || !selection || !fileName || !removeButton || !status || !preview || !previewImage || !modal) return;

    const sectionId = root.dataset.homePersonalizerId || '';
    const maxBytes = Number(upload.dataset.maxFileBytes || 20971520);
    const maxPixels = Number(upload.dataset.maxImagePixels || 20000000);
    let previewUrl = '';

    const track = (event, detail = {}) => window.dataLayer?.push({ event, section_id: sectionId, ...detail });
    const cropper = initializeCropper(root, modal, track);
    if (!cropper) return;

    const setStatus = (message = '', type = '') => {
      status.textContent = message;
      status.classList.toggle('is-error', type === 'error');
      status.classList.toggle('is-success', type === 'success');
    };

    const revokePreview = () => {
      if (!previewUrl) return;
      URL.revokeObjectURL(previewUrl);
      previewUrl = '';
    };

    const clearPreview = ({ announce = true } = {}) => {
      input.value = '';
      selection.hidden = true;
      fileName.textContent = '';
      upload.dataset.state = 'empty';
      preview.hidden = true;
      preview.removeAttribute('data-orientation');
      previewImage.removeAttribute('src');
      revokePreview();
      setStatus(announce ? 'Image removed.' : '', announce ? 'success' : '');
      if (announce) track('home_personalizer_image_removed');
    };

    const validateFile = (file) => {
      if (!file) return 'Choose an image to continue.';
      if (!allowedTypes.has(file.type) && !allowedExtension.test(file.name)) return 'Use a JPEG, PNG or WebP image.';
      if (file.size > maxBytes) return 'The image must be 20 MB or smaller.';
      return '';
    };

    const applyFile = async (file, source) => {
      const validationError = validateFile(file);
      if (validationError) {
        input.value = '';
        setStatus(validationError, 'error');
        track('home_personalizer_upload_error', { reason: 'file_validation' });
        return;
      }

      track('home_personalizer_upload_started', { source, file_type: file.type, file_size_bytes: file.size });
      setStatus('Preparing crop…');
      const inspectionUrl = URL.createObjectURL(file);
      try {
        const sourceImage = await inspectImage(inspectionUrl);
        URL.revokeObjectURL(inspectionUrl);
        if (sourceImage.naturalWidth * sourceImage.naturalHeight > maxPixels) {
          input.value = '';
          setStatus('The image must be 20 megapixels or smaller.', 'error');
          track('home_personalizer_upload_error', { reason: 'pixel_limit' });
          return;
        }

        const result = await cropper.open(file);
        input.value = '';
        if (!result) {
          setStatus(previewUrl ? 'Your existing preview is unchanged.' : '', previewUrl ? 'success' : '');
          return;
        }

        revokePreview();
        previewUrl = URL.createObjectURL(result.file);
        preview.style.aspectRatio = String(result.ratio);
        preview.dataset.orientation = result.orientation;
        previewImage.src = previewUrl;
        preview.hidden = false;
        fileName.textContent = `${result.file.name} · ${result.width}×${result.height}px · ${formatFileSize(result.file.size)}`;
        selection.hidden = false;
        upload.dataset.state = 'ready';
        setStatus('Your image is now shown on the wall preview.', 'success');
        track('home_personalizer_preview_applied', {
          orientation: result.orientation,
          ratio: result.ratio,
          output_width: result.width,
          output_height: result.height,
        });
      } catch (error) {
        URL.revokeObjectURL(inspectionUrl);
        input.value = '';
        setStatus(error.message || 'This image could not be read. Please choose another file.', 'error');
        track('home_personalizer_upload_error', { reason: 'image_processing' });
      }
    };

    input.addEventListener('change', () => applyFile(input.files?.[0], 'file_picker'));
    removeButton.addEventListener('click', () => clearPreview());
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragging');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragging');
      const file = event.dataTransfer?.files?.[0];
      if (file) applyFile(file, 'drag_drop');
    });
    window.addEventListener('beforeunload', revokePreview, { once: true });
    upload.dataset.state = 'empty';
  });
})();

