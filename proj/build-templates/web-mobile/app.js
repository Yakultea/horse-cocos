const app = () => {
  const currentURL = new URL(window.location.href);
  const urlParams = currentURL.searchParams;

  const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOSDevice = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isLandscapeMode = () => window.innerWidth > window.innerHeight;

  const verifyOrientation = () => {
    const viewMode = urlParams.get('view_mode');

    if (!viewMode || viewMode === 'dual' || !isMobileDevice()) {
      return;
    }

    const orientationContainer = document.getElementById('orientation');
    const iconElement = orientationContainer?.children[0];

    if (!iconElement) {
      return;
    }

    const getShowViewMode = () => (
      (isLandscapeMode() && viewMode === 'portrait') ||
      (!isLandscapeMode() && viewMode === 'landscape')
    ) ? viewMode : null;
    orientationContainer.style.display = 'none'
    const updateOrientationUI = () => {
      const viewMode = getShowViewMode();
      if (!isIOSDevice()) {
        if (viewMode) {
          orientationContainer.style.display = 'block';
          iconElement.classList.add(getShowViewMode());
        } else {
          orientationContainer.style.display = 'none';
        }
      }

      setIOSDevice(isLandscapeMode() ? 16 : 0)

    };

    updateOrientationUI();
    window.addEventListener('resize', updateOrientationUI);
  };

  const logoContainer = document.getElementById('logo');
  const setLogo = () => {
    const logo = urlParams.get('p');
    const defaultUrl = './public/atg.png';
    const remoteUrl = `${window.location.origin}/images/logos/${logo}.png`;

    const imageLoader = new Image();

    imageLoader.onload = () => {
      showLogo(remoteUrl);
    };

    imageLoader.onerror = () => {
      showLogo(defaultUrl);
    };

    imageLoader.src = remoteUrl;
  };

  const showLogo = (url) => {
    logoContainer.src = url;
    logoContainer.style.width = '10%';
  };

  const hideLogo = () => {
    logoContainer.style.display = 'none';
  };

  const setIOSDevice = (avoidOffset) => {
    if (!isIOSDevice()) return;
    const iframeWrapper = document.getElementById('iframeWrapper');
    iframeWrapper.style.height = `calc(100% - ${avoidOffset}px)`;
    iframeWrapper.style.top = `calc(50% - ${avoidOffset / 2}px)`;
  }

  setIOSDevice(isLandscapeMode() ? 16 : 0)
  setLogo();
  verifyOrientation();
  window.hideLogo = hideLogo;
};

app();
