angular.module('ngModal').directive('modalLogin', ['$http', '$location',
    'gfyAccountTree', '$rootScope', 'accountService','gfyAnalytics',
    '$translate', 'hotkeys', '$state', '$stateParams', '$window',
    function($http, $location, gfyAccountTree, $rootScope, accountService,
        gfyAnalytics, $translate, hotkeys, $state, $stateParams, $window) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      onClose: '&?'
    },
    replace: true,
    transclude: true,
    link: function(scope) {
      scope.accountTree = gfyAccountTree;
      scope.account = {};
      scope.account.remember_me = true;
      scope.isLoginError = false;
      scope.isEmailError = false;
      scope.isResetPasswordShown = false;
      scope.isResetEmailSent = false;
      scope.isPending = {
        login: false,
        fbLogin: false,
        resetPassword: false
      };

      scope.closeButton = angular.element(document).find('.close-button');
      scope.closeButton.on('click touchstart', function() {
        scope.hideModal();
      });

      /**
      * Hides modal and clears the path
      */
      scope.hideModal = function() {
        // Hide signup if it was opened
        if ($location.path().substr(1) == 'signup') {
          $location.path('/')
        }
        return scope.show = false;
      };

      /**
      * Hides modal and opens a sign up page
      */
      scope.openSignUp = function() {
        scope.hideModal();
        $location.path('/signup');
      };

      /**
      * Prevents page body from scrolling in background when modal is opened
      */
      scope.$watch('show', function(newVal, oldVal) {
        if (newVal && !oldVal) {
          scope.isResetPasswordShown = false;
          scope.isResetEmailSent = false;
          scope.bindHotkeys();
          document.getElementsByTagName('body')[0].style.overflow = 'hidden';
        } else {
          document.getElementsByTagName('body')[0].style.overflow = '';
        }

        if ((!newVal && oldVal) && (scope.onClose != null)) {
          return scope.onClose();
        }
      });

      /**
      * Adds hotkeys event listeners
      */
      scope.bindHotkeys = function() {
        hotkeys.bindTo(scope)
        .add({
          combo: 'esc',
          description: 'Exit modal',
          callback: function() {
            scope.hideModal();
          }
        });
      };

      /**
      * Opens reset password form
      */
      scope.openResetPassword = function() {
        scope.isResetPasswordShown = true;
      };

      /**
      * Login with usermame/email and password
      */
      scope.sendLogin = function() {
        scope.isLoginError = false;
        scope.isPending.login = true;
        accountService.login(scope.account.username, scope.account.password,
            scope.account.remember_me).then(
          function(response) {
            if (response.login) {
              scope.sendAnalytics('account_logged_in', {
                username: response.username,
                email: response.email,
                channel: 'email'
              });
              scope.onLoginSuccess(response.username);
            } else {
              scope.isLoginError = true;
            }
          },
          function() {
            scope.isLoginError = true;
          }
        ).finally(function() {
          scope.isPending.login = false;
        });
      };

      /**
      * Sends login request on Enter if loginForm is valid
      */
      scope.onLoginFormKeyup = function(event) {
        if (scope.isLoginFormValid() && event.keyCode === 13) {
          scope.sendLogin();
        }
      };

      /**
      * Checks of loginForm valid
      * @return {Boolean}
      */
      scope.isLoginFormValid = function() {
        return scope.loginForm.$valid && !scope.isLoginError;
      };

      /**
      * Sets data for accountTree on login
      */
      scope.onLoginSuccess = function(username) {
        if (!username) {
          username = scope.account.username;
        }
        scope.accountTree.loggedIntoAccount = true;
        scope.accountTree.accountName = username;
        scope.accountTree.getUserFolders().then(function (data) {
          scope.accountTree.update(data);
          scope.accountTree.getSomeFolders();
          $state.go($state.current, {}, {reload: true});
        });

        scope.broadcastLoggedIn();
        if ($stateParams.redirect_uri) {
          $window.open($stateParams.redirect_uri, '_self');
        } else {
          scope.hideModal();
        }
      };

      /**
      * Clears login error flag
      */
      scope.clearLoginError = function() {
        scope.isLoginError = false;
      };

      /**
      * Sends authorization request to Facebook
      */
      scope.sendConnectWithFacebook = function(event) {
        scope.isPending.fbLogin = true;
        scope.unbindEvent = scope.$on('facebook_auth_success', function(event, data) {
          scope.unbindEvent();
          if (data.auth_code) {
            scope.onFacebookAuthSuccess(data.auth_code);
          }
        });
        accountService.sendConnectWithFacebook(event);
      };

      /**
      * Callback after Facebook authorization success
      * @param {String} auth_code - authorization code from Facebook
      */
      scope.onFacebookAuthSuccess = function(auth_code) {
        accountService.tryLoginWithFacebook(auth_code, true)
        .then(
          function(response) {
            if (response.login) {
              scope.account.username = response.username;
              scope.sendAnalytics('account_logged_in', {
                username: response.username,
                email: response.email,
                channel: 'facebook'
              });
              scope.onLoginSuccess();
            }
          },
          function(response) {
            scope.hideModal();
            $location.path('/signup');
          }
        ).finally(function() {
          scope.isPending.fbLogin = false;
        });
      };

      /**
      * Sets scope.emailError to the current error translation
      * (for Reset Password form)
      * @param {String} error - JSON key for translation
      */
      scope.setEmailErrorTranslation = function(error) {
        $translate(error).then(function (translation) {
          scope.emailError = translation;
        });
        scope.isEmailError = true;
      };

      /**
      * Resets email error state when email input changes
      * (for Reset Password form)
      */
      scope.onEmailInputChange = function() {
        scope.emailError = "";
        scope.isEmailError = false;
        if (scope.resetPasswordForm.email.$error.email) {
          scope.setEmailErrorTranslation('RESET_PASSWORD.INVALID_EMAIL');
        }
      };

      /**
      * Sends request for password reset
      * (for Reset Password form)
      */
      scope.sendResetPassword = function() {
        scope.isPending.resetPassword = true;
        accountService.resetPassword(scope.account.email).then(
          function(response) {
            if (response.isSent) {
              scope.isResetEmailSent = true;
            }
          },
          function(response) {
            if (response.notFound) {
              scope.setEmailErrorTranslation('RESET_PASSWORD.EMAIL_NOT_FOUND');
            } else if (response.isError) {
              scope.setEmailErrorTranslation('RESET_PASSWORD.ERROR_OCCURED');
            }
            scope.isEmailError = true;
          }).finally(function() {
            scope.isPending.resetPassword = false;
          });
      };

      /**
      * Sends reset password request on Enter if resetPasswordForm is valid
      * (for Reset Password form)
      */
      scope.onResetPasswordFormKeyup = function(event) {
        if (scope.isResetPasswordFormValid() && event.keyCode === 13) {
          scope.sendResetPassword();
        }
      };

      /**
      * Checks if resetPasswordForm is valid
      */
      scope.isResetPasswordFormValid = function() {
        return scope.resetPasswordForm.$valid && !scope.isEmailError;
      };

      /**
      * Sends analytic event
      * @param {String} eventType - name of an event
      * @param {Object=} eventData - data for an event
      */
      scope.sendAnalytics = function(eventType, eventData) {
        var sendData = eventData ? eventData : {};
        sendData.event = eventType;
        gfyAnalytics.sendEvent(sendData);
      };

      /**
      * Adds event listener for fb auth window closed
      */
      scope.addFbWindowClosedEventListener = function() {
        scope.fbWindowUnbindEvent = scope.$on('facebook_auth_window_closed', function() {
          scope.isPending.fbLogin = false;
          scope.$apply();
          scope.fbWindowUnbindEvent();
        });
      };

      scope.addFbWindowClosedEventListener();
    },
    controller: function($scope, $rootScope) {
      $scope.broadcastLoggedIn = function() {
        $rootScope.$broadcast('logged-in');
      }
    },
    templateUrl: '/javascript/desktop/_components/modals/modal-account-login.html',
  };
}]);
