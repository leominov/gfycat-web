(function() {
  angular.module('gfycatApp')
    .config(oauthConfigurator)
    .config(sceConfigurator)
    .config(translateConfigurator);

  oauthConfigurator.$inject = ['$httpProvider'];
  sceConfigurator.$inject = ['$sceDelegateProvider'];
  translateConfigurator.$inject = ['$translateProvider'];

  function oauthConfigurator($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('oauthInterceptor');
  }

  function sceConfigurator($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://*.gfycat.com/**',
      'https://*.gfycat.com/**'
    ]);
  }

  function translateConfigurator($translateProvider) {
    $translateProvider
      .useStaticFilesLoader({
        prefix: '/javascript/shared/translations/translation-',
        suffix: '.json'
      })
      .registerAvailableLanguageKeys(['en', 'ru', 'fr', 'ko', 'pl', 'uk'], {
        'en_*': 'en',
        'ru_*': 'ru',
        'fr_*': 'fr',
        'ko_*': 'ko',
        'pl_*': 'pl',
        'uk_*': 'uk'
      })
      .determinePreferredLanguage()
      .fallbackLanguage('en')
      // Enable escaping of HTML
      .useSanitizeValueStrategy('escape');
  }
})();
