(function() {
  'use strict';

  angular
    .module('gfycat.shared')
    .factory('gifCategoriesService', categories);

  categories.$inject = ['$http'];

  function categories($http) {
    let categoriesList = [];

    let service = {
      getCategories: getCategories
    };

    return service;

    function getCategories() {
      return new Promise((resolve, reject) => {
        if (categoriesList.length) {
          resolve(categoriesList);
          return;
        }

        $http.get('https://api.gfycat.com/v1/reactions/populated?gfyCount=1')
        .then((response) => {
          if (response.data) {
            categoriesList = response.data.tags;
          }
          resolve(categoriesList);
        },
        (error) => {
          reject(error);
        });
      });
    }
  }
})();
