angular.module('gfycat.shared').service('profileHelperService',
  ['$http','$q', 'oauthTokenService' ,function($http, $q, oauthTokenService) {
    function validateAccessToken() {
      return $q(function(resolve, reject) {
        $http.get('https://api.gfycat.com/v1/gfycats/richpepperyferret').then(function(res) {
          if (res.status === 200) {
            resolve();
          } else {
            reject();
          }
        },
        function(res) {
          reject();
        });
      });
    };

    function getAccessToken() {
      return $q(function(resolve, reject) {
       $http.post('https://weblogin.gfycat.com/oauth/webtoken', {
          access_key:'Anr96uuqt9EdamSCwK4txKPjMsf2M95Rfa5FLLhPFucu8H5HTzeutyAa'
        }).then(function(res) {
         if (res.status === 200) {
           oauthTokenService.setClientToken(res.data.access_token);
           resolve();
         } else {
          reject();
         }
        },function(res){
         console.log('fail', res);
         reject();
        });
      });
    };

    function getPublicProfile(username) {
      var url = "https://api.gfycat.com/v1/users/";
      return $q(function(resolve, reject) {
        $http.get(url + username).then(
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
    };

    return {
      validateAccessToken: validateAccessToken,
      getAccessToken: getAccessToken,
      getPublicProfile: getPublicProfile
    };
}]);
