angular.module('gfycat.shared').factory('oauthInterceptor',[
  '$rootScope', '$q', '$injector', 'oauthTokenService',
  function ($rootScope, $q, $injector, oauthTokenService) {
    return {
      request: function(config) {
        if (typeof String.prototype.endsWith !== 'function') {
          String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
          };
        }
        var x = document.createElement('a');
        x.setAttribute('href',config.url);

        if((x.protocol=="https:")&&(x.hostname.toString().endsWith("gfycat.com"))){
          if (oauthTokenService.getAccessToken()) {config.headers.Authorization = "Bearer "+oauthTokenService.getAccessToken();}
          else if(oauthTokenService.getClientToken()){config.headers.Authorization = "Bearer "+oauthTokenService.getClientToken();}
        }

        return config;
      },
      response: function (response) {
        return response; // no action, was successful
      },
      responseError: function (response) {
        function refreshToken(refresh_token) {
          var deferred = $q.defer();
          $injector.get("$http").post('https://weblogin.gfycat.com/oauth/webtoken',
            {refresh_token: refresh_token}).then(function (returnData) {
              if (isInvalidRefreshTokenResponseRemoveData(returnData)) {
                deferred.reject();
              } else if(returnData.data.access_token && returnData.data.refresh_token) {
                oauthTokenService.setAccessToken(returnData.data.access_token);
                oauthTokenService.setRefreshToken(returnData.data.refresh_token);
                response.config.headers.Authorization = "Bearer "+oauthTokenService.getAccessToken();
                $injector.get("$http")(response.config).then(function (response2) {
                  deferred.resolve(response2);
                }, function (response2) {
                  deferred.reject(response2);
                });
              }
            }, function (response) {
              deferred.reject(response);
            });
          return deferred.promise;
        }
        function getClientToken(){
          var deferred = $q.defer();
         $injector.get("$http").post('https://weblogin.gfycat.com/oauth/webtoken', {
              access_key:'Anr96uuqt9EdamSCwK4txKPjMsf2M95Rfa5FLLhPFucu8H5HTzeutyAa'
            }).then(function(response2) {
              if (response2.status == 200) {
                oauthTokenService.setClientToken(response2.data.access_token);
                response.config.headers.Authorization = "Bearer "+oauthTokenService.getClientToken();
                $injector.get("$http")(response.config).then(function (response3) {
                  deferred.resolve(response3);
                }, function (response3) {
                  deferred.reject(response3);
                });
              }else{
                deferred.reject(response);
              }
            },function(){
              deferred.reject(response);
            });
          return deferred.promise;
        }
        if (response.status === 401) {
          if(isAccountLocked(response)) {return $q.reject(response);}
          initDateVariables();

          var dateNow = Date.now();
          $rootScope.unauthorizedTimeArray.push(dateNow);
          // count how many times did we get 401 in the last 10 seconds, if greater than 5, don't retry the original request
          var last10secondAccess = $rootScope.unauthorizedTimeArray.filter(function(item){ return item + 10000 > dateNow});
          var numberOfRetries = last10secondAccess.length;
          if(numberOfRetries>6){
            return $q.reject(response);
          }else {
            if(oauthTokenService.getRefreshToken()) {
              return refreshToken(oauthTokenService.getRefreshToken());
            }else{
              return getClientToken();
            }
          }
        }
        if(response.status === 503){
          initDateVariables();

          var dateNow2 = Date.now();
          $rootScope.unauthorizedTimeArray.push(dateNow2);
          // count how many times did we get 401 in the last 10 seconds, if greater than 5, don't retry the original request
          var last10secondAccess2 = $rootScope.unauthorizedTimeArray.filter(function(item){ return item + 10000 > dateNow2});
          var numberOfRetries2 = last10secondAccess2.length;
          if(numberOfRetries2>6) {
            return $q.reject(response);
          }else{
            $injector.get("$http")(response.config).then(function (response2) {
              return $q.resolve(response2);
            }, function (response2) {
              return $q.reject(response2);
            });
          }
        }

        return $q.reject(response); // not a recoverable error
      }
    };
    //////////////////////////////
    function isAccountLocked(response){
      var locked = false;
      if(typeof response.data.errorMessage === "undefined") {
      }else{
        if(typeof response.data.errorMessage.code === "undefined"){}
        else {
          if (response.data.errorMessage.code == "AccountLocked") {
            locked = true;
          }
        }
      }
      return locked;
    }
    function initDateVariables(){
      if($rootScope.unauthorizedTimeArray){
      }else{
        $rootScope.unauthorizedTimeArray = [];
      }
      if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
      }
    }
    function isInvalidRefreshTokenResponseRemoveData(returnData){
      var isInvalidToken = false;
      if(returnData) {
        if(returnData.data) {
          if (returnData.data.errorMessage) {
            if(returnData.data.errorMessage.code == "InvalidRefreshToken"){
              isInvalidToken = true;
            }
          }
        }
      }
      // get old auth token and remove it from refresh token if same
      if(isInvalidToken) {
        if (returnData.config.data.refresh_token == oauthTokenService.getRefreshToken()) {
          console.log("purple elephant");
          console.log(returnData.config.data.refresh_token);
          console.log(oauthTokenService.getRefreshToken());
          oauthTokenService.removeTokensOnly();
        }
      }
      return isInvalidToken;
    }
  }]);