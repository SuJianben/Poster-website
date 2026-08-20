(() => {
  const initialize = (root) => {
    const scene = root?.querySelector('[data-home-personalizer-scene]');
    const initialScene = scene?.querySelector('[data-home-personalizer-scene-initial]');
    const personalizedScene = scene?.querySelector('[data-home-personalizer-scene-personalized]');
    if (!scene || !initialScene) return null;

    const setState = (state) => {
      const isPersonalized = state === 'personalized' && Boolean(personalizedScene);
      root.classList.toggle('is-personalizer-scene-active', isPersonalized);
      root.dataset.homePersonalizerSceneState = isPersonalized ? 'personalized' : 'initial';
      initialScene.setAttribute('aria-hidden', String(isPersonalized));
      personalizedScene?.setAttribute('aria-hidden', String(!isPersonalized));
      return isPersonalized;
    };

    setState('initial');

    return {
      showInitial: () => setState('initial'),
      showPersonalized: () => setState('personalized'),
    };
  };

  globalThis.PosterHomePersonalizerScene = { initialize };
})();
