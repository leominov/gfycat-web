(function() {
  'use strict';

  angular
    .module('gfycatApp')
    .controller('gifCategoriesController', gifCategoriesController);

  gifCategoriesController.$inject = ['gifCategoriesService', '$scope'];

  function gifCategoriesController(gifCategoriesService, $scope) {
    let categories = this;

    categories.categoriesList = [];
    categories.loading = true;

    gifCategoriesService.getCategories().then((response) => {
      categories.categoriesList = response;
      categories.loading = false;
      $scope.$apply();
    });
  }
})();
