(function() {
  'use strict';

  angular
    .module('gfycatApp')
    .controller('gifbreweryController', gifbreweryController);

  gifbreweryController.$inject = ['$rootScope'];

  function gifbreweryController($rootScope) {
    var gifBr = this;
    gifBr.siteUrl = $rootScope.globalSiteUrl;
  }

})();
