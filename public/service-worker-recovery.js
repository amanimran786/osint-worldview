(function () {
  if (!('serviceWorker' in navigator)) return;
  var key = 'wm-sw-nuke';
  if (sessionStorage.getItem(key)) return;

  window.addEventListener('error', function (event) {
    var target = event.target;
    var url = target && (target.src || target.href) || '';
    if (!url || !/\/assets\//.test(url)) return;

    sessionStorage.setItem(key, '1');
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      return Promise.all(registrations.map(function (registration) {
        return registration.unregister();
      }));
    }).then(function () {
      if (!('caches' in window)) return [];
      return caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (cacheKey) {
          return caches.delete(cacheKey);
        }));
      });
    }).then(function () {
      location.reload();
    });
  }, true);
})();
