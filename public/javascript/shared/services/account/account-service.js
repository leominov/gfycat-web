
angular.module('gfycat.shared').service('accountService', ['$rootScope','$location','$http','$q','httpHelperService','folderService','bookmarkService','albumService','$window','oauthTokenService', 'gfyAccountTree',
    function($rootScope, $location,$http,$q,httpHelperService,folderService,bookmarkService,albumService, $window, oauthTokenService, gfyAccountTree)  {
        var apiUrl = "https://api.gfycat.com/v1";
        var accessKey = "Anr96uuqt9EdamSCwK4txKPjMsf2M95Rfa5FLLhPFucu8H5HTzeutyAa";
        var globalSiteUrl = $rootScope.globalSiteUrl;

        /**
        * Broadcasts an event for a successful Facebook authorization
        */
        $window.setTokenCallback = function(auth_code) {
          $rootScope.$broadcast('facebook_auth_success', {auth_code: auth_code});
        };

        function accountCreateErrorMessage(response){
            if(typeof response.data.errorMessage === "undefined") {
                var ret = [];
                ret['code'] = 'genericError';
                ret['description'] = "Could not create the account.";
                return ret;
            }else{
                if(typeof response.data.errorMessage.code === "undefined"){
                    var ret = [];
                    ret['code'] = 'genericError';
                    ret['description'] = "Could not create the account.";
                    return ret;
                } else {
                    if (response.data.errorMessage.code) {
                        return response.data.errorMessage;
                    }else{
                        var ret = [];
                        ret['code'] = 'genericError';
                        ret['description'] = "Could not create the account.";
                        return ret;
                    }
                }
            }
        }
        function createAccountWithFacebookAuthCode(username, facebookAuthCode){
            var deferred = $q.defer();
            $http.post('https://weblogin.gfycat.com/oauth/webtoken',
                {
                    access_key:accessKey
                }).then(function(response){
                    if(response.status==200) {
                        var token = response.data.access_token;
                        if (typeof token === 'undefined') {
                            deferred.reject('Problem communicating with the server.');
                        } else {
                            $http({
                                method: 'POST',
                                url: 'https://api.gfycat.com/v1/users',
                                headers: {
                                    'Authorization': "Bearer " + token
                                },
                                data: {
                                    username: username,
                                    provider: 'facebook',
                                    auth_code:facebookAuthCode,
                                    redirect_uri: globalSiteUrl + '/fbreceive.php'
                                }
                            }).then(function (response) {
                                    if (response.status == 200) {
                                        deferred.resolve(response.data);
                                    } else {
                                        deferred.reject(accountCreateErrorMessage(response));
                                    }
                                },
                                function (response) {
                                    deferred.reject(accountCreateErrorMessage(response));
                                });
                        }
                    }else{
                        deferred.reject('Problem communicating with the server.');
                    }
                },function(){
                    deferred.reject('Problem communicating with the server.');
                });
            return deferred.promise;
        }

        /**
        * Login with access_token
        */
        function loginFromTokenResponse(gfyTokenResponse, rememberMe){
          var returnData = gfyTokenResponse;

          if (rememberMe) {
            oauthTokenService.setRememberMe(true);
          } else {
            oauthTokenService.setRememberMe(false);
          }
          oauthTokenService.setUsername(returnData.resource_owner);
          oauthTokenService.setAccessToken(returnData.access_token);
          oauthTokenService.setRefreshToken(returnData.refresh_token);
          return true;
        }

        /**
        * Sends request to create account using access_token
        * @param {String} username
        * @param {String} password
        * @param {String} email
        */
        function createAccount(username, password, email) {
          var deferred = $q.defer();
          $http.post('https://weblogin.gfycat.com/oauth/webtoken',
            {
              access_key: accessKey
            }).then(
              function(response) {
                if (response.status == 200) {
                  var token = response.data.access_token;
                  if (typeof token === 'undefined') {
                    deferred.reject('Problem communicating with the server.');
                  } else {
                      $http({
                        method: 'POST',
                        url: 'https://api.gfycat.com/v1/users',
                        headers: {
                          'Authorization': "Bearer " + token
                        },
                        data: {
                          username: username,
                          password: password,
                          email: email
                        }
                      }).then(
                          function (response) {
                            if (response.status == 200) {
                              deferred.resolve(response.data);
                            } else {
                              deferred.reject(
                                accountCreateErrorMessage(response));
                            }
                          },
                          function (response) {
                            deferred.reject(
                              accountCreateErrorMessage(response));
                          }
                        );
                  }
                } else {
                  deferred.reject('Problem communicating with the server.');
                }
              },
              function() {
                deferred.reject('Problem communicating with the server.');
              }
            );
          return deferred.promise;
        };

        /**
        * Create account with Facebook using a secret
        */
        function createAccountWithSecret(data) {
          var deferred = $q.defer();
          var requestData = {
              secret : data.secret,
              provider: 'facebook',
              username: data.username
          };

          // If email didn't come from Facebook
          if (data.email) {
            requestData.email = data.email;
          }

          $http.post('https://api.gfycat.com/v1/users', requestData).then(
            function(response) {
              var returnData = response.data;
              if (response.status == 200) {
                loginFromTokenResponse(returnData, true);
                deferred.resolve(response.data);
              } else {
                deferred.reject(response.data);
              }
            },
            function(response) {
              deferred.reject(response.data);
            }
          );
          return deferred.promise;
        }

        function loginWithFacebook(facebookAuthCode, rememberMe){
            var deferred = $q.defer();
            var requestData = {
                grant_type : 'convert_code',
                provider: 'facebook',
                auth_code: facebookAuthCode
            };

            $http.post(apiUrl+'/oauth/token', requestData)
                .then(function(response) {
                    var returnData = response.data;
                    var ret = {login: false};
                    if(response.status==401){
                        ret.error = 'Sorry, your credentials did not work.';
                        if(response.data.errorMessage.code=="AccountLocked"){
                            ret.error = "Your account has been locked due to too many wrong password attempts. Please email contact@gfycat.com to unlock it."
                        }
                        deferred.reject(ret);
                    } else if (!(returnData instanceof Object)) {
                        ret.error = 'Sorry, there is a problem with the login server.';
                        deferred.reject(ret);
                    } else if (!(returnData.access_token)) {
                        ret.error = 'Sorry, your credentials did not work.';
                        deferred.reject(ret);
                    } else {
                      loginFromTokenResponse(returnData, rememberMe)
                      ret = {login: true};
                      deferred.resolve(ret);
                    }
                }, function(response){
                    var ret = {login: false};
                    ret.error = 'Problem communicating with the login server';
                    if (response.status == 401) {
                        ret.error = 'Sorry, your credentials did not work.';
                        if(response.data.errorMessage.code=="AccountLocked"){
                            ret.error = "Your account has been locked due to too many wrong password attempts. Please email contact@gfycat.com to unlock it."
                        }
                    }
                    deferred.reject(ret);
                });
            return deferred.promise;
        }

        /**
        * Sends request for a Facebook autorization
        */
        function sendConnectWithFacebook(event) {
          event.preventDefault();
          popupCenter(globalSiteUrl + '/fbauth.php', 'loginWindow', 650, 500);
        };

        /**
        * Opens popup for a Facebook authorization
        */
        function popupCenter(url, title, w, h) {
           // Fixes dual-screen position       Most browsers      Firefox
           var dualScreenLeft =
            window.screenLeft != undefined ? window.screenLeft : screen.left;
           var dualScreenTop =
            window.screenTop != undefined ? window.screenTop : screen.top;

           var width = window.innerWidth ?
             window.innerWidth : document.documentElement.clientWidth ?
             document.documentElement.clientWidth : screen.width;
           var height = window.innerHeight ?
             window.innerHeight : document.documentElement.clientHeight ?
             document.documentElement.clientHeight : screen.height;

           var left = ((width / 2) - (w / 2)) + dualScreenLeft;
           var top = ((height / 2) - (h / 2)) + dualScreenTop;
           var newWindow = window.open(url, title, 'scrollbars=yes, width=' +
            w + ', height=' + h + ', top=' + top + ', left=' + left);

            var fbWindowClosedCheck = setInterval(function() {
              if (newWindow.closed) {
                $rootScope.$broadcast('facebook_auth_window_closed');
                clearInterval(fbWindowClosedCheck);
              }
            }, 500);

           // Puts focus on the newWindow
           if (window.focus) {
               newWindow.focus();
           }
        };

        /**
        * Attempt to login with Facebook.
        * on success - use access_token to login
        * on error - if secret is available, return secret and default data
        * for account creation
        */
        function tryLoginWithFacebook(facebookAuthCode, rememberMe) {
          var deferred = $q.defer(),
              requestData = {
               "provider": "facebook",
               "redirect_uri": globalSiteUrl + "/fbreceive.php",
               "auth_code": facebookAuthCode
              };
          $http.post(apiUrl + '/oauth/providerlogin', requestData)
           .then(function(response) {
             var returnData = response.data;
             var ret = {login: false};
             if (response.status == 401) {
               ret.error = 'Sorry, your credentials did not work.';
               if (response.data.errorMessage.code == "AccountLocked") {
                 ret.error = "Your account has been locked due to too many wrong" +
                  "password attempts. Please email contact@gfycat.com to unlock it."
               }
               deferred.reject(ret);
             } else if (!(returnData instanceof Object)) {
               ret.error = 'Sorry, there is a problem with the login server.';
               deferred.reject(ret);
             } else {
               // account exists, log in with access_token
               if ("access_token" in returnData) {
                 loginFromTokenResponse(returnData, rememberMe);
                 getProfile().then(
                   function(userData) {
                     ret = {login: true, username: userData.username,
                            email: userData.email};
                     deferred.resolve(ret);
                   },
                   function() {
                     ret = {login: true, username: returnData.resource_owner};
                     deferred.resolve(ret);
                   }
                 );
               // account can be created using secret
              } else if ("secret" in returnData) {
                 ret = {login: false, secret: returnData.secret};
                 var providerData = returnData.providerData;

                 if (providerData) {
                   if ("name" in providerData) {
                     ret.name = providerData.name;
                   }
                   if ("email" in providerData) {
                     ret.email = providerData.email;
                   }
                   if ("provider_id" in providerData) {
                     ret.fb_id = providerData.provider_id
                   }
                 }
                 deferred.reject(ret);
               }
             }
           }, function(response) {
             var ret = {login: false};
             ret.error = 'Problem communicating with the login server';
             deferred.reject(ret);
           });
          return deferred.promise;
        }

        /**
        * Sends login request
        * @param {String} username
        * @param {String} password
        * @param {Boolean} rememberMe
        */
        function login(username, password, rememberMe) {
          var deferred = $q.defer();

          var requestData = {
            grant_type: 'password',
            username: username,
            password: password
          };

          $http.post('https://weblogin.gfycat.com/oauth/weblogin',
              requestData).then(
            function (response) {
              var returnData = response.data;
              var ret = {login: false};

              if (returnData && returnData.access_token) {
                loginFromTokenResponse(returnData, rememberMe);
                getProfile().then(
                  function(userData) {
                    ret = {login: true, username: userData.username,
                           email: userData.email};
                    deferred.resolve(ret);
                  },
                  function() {
                    ret = {login: true, username: returnData.resource_owner};
                    deferred.resolve(ret);
                  }
                );
              } else {
                if (response.status == 401) {
                  ret.error = 'Sorry, your credentials did not work.';
                  if (typeof response.data.errorMessage != 'undefined') {
                    if (response.data.errorMessage.code == "AccountLocked") {
                      ret.error = "Your account has been locked due to too" +
                        " many wrong password attempts. Please email" +
                        " contact@gfycat.com to unlock it."
                    }
                  }
                } else if (!(returnData instanceof Object)) {
                  ret.error = 'Sorry, there is a problem with the login server.';
                } else if (!returnData.access_token) {
                  ret.error = 'Sorry, your credentials did not work.';
                }
                deferred.reject(ret);
              }
            },
            function(response) {
              var ret = {login: false};
              ret.error = 'Problem communicating with the login server';
              if (response.status == 401) {
                ret.error = 'Sorry, your credentials did not work.';
                if (typeof response.data.errorMessage != 'undefined') {
                  if (response.data.errorMessage.code == "AccountLocked") {
                    ret.error = "Your account has been locked due to too " +
                      "many wrong password attempts. Please email" +
                      " contact@gfycat.com to unlock it."
                  }
                }
              } else if (!(returnData instanceof Object)) {
                ret.error = 'Sorry, there is a problem with the login server.';
              } else if (!returnData.access_token) {
                ret.error = 'Sorry, your credentials did not work.';
              }
              deferred.reject(ret);
            }
          );
          return deferred.promise;
        }
        function logout() {
          oauthTokenService.removeCredentials();
          return true;
        }

        /**
        * Sends a request for a current password validation
        * @param {String} password
        * @return {Object} promise
        */
        function validatePassword(password) {
          var requestData = {
            grant_type: 'password',
            username: gfyAccountTree.accountName,
            password: password
          };
          return $q(function(resolve, reject) {
            $http.post('https://weblogin.gfycat.com/oauth/weblogin', requestData)
              .then(
                function(response) {
                  if (response.data && response.data.access_token) {
                    resolve(true);
                  }
                  reject(false);
                },
                function(response) { reject(false); }
            );
          });
        }

        /**
        * Sends request for a password resetPassword
        * @param {String} email
        */
        function resetPassword(email) {
          var deferred = $q.defer();
          var res = { isSent: false};
          $http.post('https://weblogin.gfycat.com/oauth/webtoken',
            {
              access_key: accessKey
            }).then(
              function(response) {
                if (response.status == 200) {
                  var token = response.data.access_token;
                  if (typeof token === 'undefined') {
                    res.isError = true;
                    deferred.reject(res);
                    // An error occurred trying to send your
                    // password reset email.
                  } else {
                    $http({
                      method: 'PATCH',
                      url: 'https://api.gfycat.com/v1/users',
                      headers: {
                        'Authorization': "Bearer " + token
                      },
                      data: {
                        action: 'send_password_reset_email',
                        value: email
                      }
                    }).then(
                      function(resp) {
                        if (resp.status == 204) {
                          res.isSent = true;
                          deferred.resolve(res);
                        } else {
                          res.notFound = true;
                          deferred.reject(res);
                        }
                      },
                      function() {
                        res.notFound = true;
                        deferred.reject(res);
                      }
                    );
                  }
                } else {
                  res.notFound = true;
                  deferred.reject(res);
                }
              },
              function() {
                res.isError = true;
                deferred.reject(res);
              }
            );
          return deferred.promise;
        };

        function verifyEmail(token) {
          var deferred = $q.defer();
          $http.patch(apiUrl + '/users', {
            action: 'verify_email',
            value: token
          })
          .then(
            function(response) {
              deferred.resolve(true);
            },
            function(response) {
              deferred.resolve(false);
            }
          );
          return deferred.promise;
        };

        function setGfyTags(gfyId, tags){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/gfycats/' + gfyId + '/tags', {value: tags}));
        }
        function setGfycatTitle(gfyId, title){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/gfycats/' + gfyId + '/title', {value: title}));
        }
        function setGfycatDescription(gfyId, description){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/gfycats/' + gfyId + '/description', {value: description}));
        }
        function setGfycatNsfw(gfyId, nsfw){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/gfycats/' + gfyId + '/nsfw', {value: nsfw}));
        }
        function setGfycatPublished(gfyId, published){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/gfycats/' + gfyId + '/published', {value:published}));
        }
        function getProfile(){
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl+'/me'));
        }
        function changePassword(newPass){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/password', {value: newPass}));
        }
        function getEmail(){
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl+'/me/email'));
        }
        function changeEmail(newEmail) {
          return $q(function(resolve, reject) {
            $http.put(apiUrl + '/me/email', {value: newEmail}).then(
              function(response) {
                if (response.status === 200) { resolve(response); }
                reject(response);
              },
              function(response) { reject(response); }
            );
          });
        }
        function setUploadNotices(newUploadNotices){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/upload-notices', {value: newUploadNotices}));
        }
        function deleteGfycatTitle(gfyId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+'/me/gfycats/' + gfyId + '/title'));
        }
        function deleteGfycatDescription(gfyId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+'/me/gfycats/' + gfyId + '/description'));
        }
        function deleteGfycat(gfyId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+'/me/gfycats/'+gfyId));
        }
        function batchDeleteGfycat(gfyArray) {
          var results = [];
          function push(response) {
            results.push(response);
          }

          return $q(function(resolve, reject) {
            var promises = [];

            for (var i = 0; i < gfyArray.length; i++) {
              promises.push(
                httpHelperService.wrapDeferredIf200(
                  $http.delete(apiUrl + '/me/gfycats/' + gfyArray[i].gfyId)
                ).then(push).catch(push)
              );
            }
            $q.all(promises).then(function() {
              resolve(results);
            });
          });
        }
        function getDirectChildren(folderId) {
          return this.folderTree[folderId];
        }
        function constructFolderTree(root) {
          this.folderTree = {};
          var children = [];
          for (var i = 0; i < root.nodes.length; i++) {
            var child = {
              id: root.nodes[i].id,
              title: root.nodes[i].title
            };
            children.push(child);
          }
          this.folderTree[root.id] = children;
        }

        return {
            login: login,
            loginWithFacebook: loginWithFacebook,
            tryLoginWithFacebook: tryLoginWithFacebook,
            sendConnectWithFacebook: sendConnectWithFacebook,
            loginFromTokenResponse: loginFromTokenResponse,
            logout: logout,
            createAccount: createAccount,
            createAccountWithFacebookAuthCode: createAccountWithFacebookAuthCode,
            createAccountWithSecret: createAccountWithSecret,
            getProfile: getProfile,
            getEmail: getEmail,
            changePassword: changePassword,
            validatePassword: validatePassword,
            setUploadNotices: setUploadNotices,
            setGfyTags: setGfyTags,
            setGfycatTitle: setGfycatTitle,
            setGfycatDescription: setGfycatDescription,
            setGfycatNsfw: setGfycatNsfw,
            setGfycatPublished: setGfycatPublished,
            changeEmail: changeEmail,
            resetPassword: resetPassword,
            verifyEmail: verifyEmail,
            folderService: folderService,
            albumService: albumService,
            bookmarkService: bookmarkService,
            deleteGfycatTitle: deleteGfycatTitle,
            deleteGfycatDescription: deleteGfycatDescription,
            deleteGfycat: deleteGfycat,
            batchDeleteGfycat: batchDeleteGfycat,
            getDirectChildren: getDirectChildren,
            constructFolderTree: constructFolderTree
        };

    }]);
