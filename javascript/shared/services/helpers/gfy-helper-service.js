
angular.module('gfycat.shared').service('gfyHelperService',
  ['$http','$q',function($http, $q) {
    function checkGfyExists(gfyName) {
      var url = "https://api.gfycat.com/v1/gfycats/";
      return $q(function(resolve, reject) {
        $http.get(url + gfyName).then(
          function(response) {
            if (response.status.toString()[0] == 2) {
              resolve(response);
            }
            reject(response);
          },
          function(response) {
            reject(response);
          }
        )
      });
    }

    return {
        checkGfyExists: checkGfyExists
    };
}]);
