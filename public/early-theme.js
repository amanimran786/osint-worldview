(function () {
  try {
    var variants = ['full', 'tech', 'finance', 'commodity', 'happy'];
    var requested = new URLSearchParams(location.search).get('variant');
    var variant = variants.indexOf(requested) >= 0 ? requested : null;

    if (!variant) {
      var hostVariant = location.hostname.split('.')[0];
      if (variants.indexOf(hostVariant) >= 0 && hostVariant !== 'full') {
        variant = hostVariant;
      }
    }

    if (!variant) {
      var storedVariant = localStorage.getItem('worldview-variant');
      if (variants.indexOf(storedVariant) >= 0) variant = storedVariant;
    }

    if (!variant) {
      var buildVariant = document.documentElement.dataset.buildVariant;
      if (variants.indexOf(buildVariant) >= 0) variant = buildVariant;
    }

    if (variant && variant !== 'full') {
      document.documentElement.dataset.variant = variant;
    } else {
      document.documentElement.removeAttribute('data-variant');
    }

    var theme = localStorage.getItem('worldview-theme') || localStorage.getItem('worldmonitor-theme');
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
    } else if (variant === 'happy') {
      document.documentElement.dataset.theme = 'light';
    }
  } catch (_) {
    // Storage can be unavailable in hardened browser modes.
  }
  document.documentElement.classList.add('no-transition');
})();
