(function() {
  'use strict';

  angular
    .module('gfycatApp')
    .factory('vineService', vine);

  vine.$inject = ['httpHelperService', '$http', '$httpParamSerializer', '$location', 'oauthTokenService'];

  function vine(httpHelperService, $http, $httpParamSerializer, $location, oauthTokenService) {
    var service = {
      getVines: getVines,
      showVines: showVines,
      isUserLoggedIn: isUserLoggedIn
    };

    return service;


    function getVines(opt) {
      return new Promise( (resolve, reject) => {
        if (!oauthTokenService.isUserLoggedIn()) {
          //TODO: prompt for login
          return reject();
        }

        var userName = opt.user;
        var token = '?token=' + oauthTokenService.getAccessToken();
        var baseUrl = 'https://botsapi.gfycat.com/vine/user/' + userName + token;
        var url = opt.type === 'id' ? baseUrl + '&id=true' : baseUrl;

        $http.get(url).then(data => {
          resolve(data.data);
        });
      });
    }


    function showVines(opt) {
      return new Promise( (resolve, reject) => {
        var userName = opt.user;
        var baseUrl = 'https://botsapi.gfycat.com/vine/user_info/' + userName;
        var url = opt.type === 'id' ? baseUrl + '?id=true' : baseUrl;
        $http.get(url).then(data => {
          resolve(data.data.data);
        }, err => {
          reject();
        });
      });
    }


    function isUserLoggedIn() {
      return oauthTokenService.isUserLoggedIn();
    }
  }

})();
