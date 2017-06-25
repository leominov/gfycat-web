angular.module('gfycatApp').controller('signupCtrl',
  function($scope, $http, $location, gfyAccountTree, accountService,
      $translate, $timeout, gfyAnalytics, $stateParams, $window) {
  $scope.accountTree = gfyAccountTree;
  $scope.account = {};
  $scope.usernameError = "";
  $scope.passwordError = "";
  $scope.emailError = "";
  $scope.isUsernameError = true;
  $scope.isPasswordError = false;
  $scope.isEmailError = false;
  $scope.isFacebookSignupOpened = false;
  $scope.isEmailVisible = true;
  $scope.usernameInputTimeout;
  $scope.isPending = {
    signup: false,
    fbSignUp: false
  };

  /**
  * Opens login modal
  */
  $scope.openLogin = function() {
    $location.path('/').search({});
    $scope.$parent.gfyModals.toggleModal('modalLoginShown');
  };

  /**
  * Sends createAccount request.
  * Handles form validation errors.
  */
  $scope.sendCreate = function() {
    $scope.isUsernameError = false;
    $scope.isPasswordError = false;
    $scope.isPending.signup = true;
    accountService.createAccount($scope.account.username,
            $scope.account.password, $scope.account.email)
    .then(
      function(response) {
        accountService.loginFromTokenResponse(response, true);
        $scope.sendAnalytics('account_created', {
          username: $scope.account.username,
          email: $scope.account.email,
          channel: 'email'
        });
        $scope.onLoginSuccess();
      },
      function(response) {
        $scope.checkUsername(response);
        $scope.checkPassword(response);
        $scope.checkEmail(response.code);
      }
    ).finally(function() {
      $scope.isPending.signup = false;
    });
  };

  /**
  * Checks if signupForm valid
  * @return {Boolean}
  */
  $scope.isSignupFormValid = function() {
    return $scope.signupForm.$valid && !($scope.isUsernameError ||
       $scope.isPasswordError || $scope.isEmailError);
  };

  /**
  * Sends reset password request on Enter if resetPasswordForm is valid
  */
  $scope.onSignupFormKeyup = function(event) {
    if ($scope.isSignupFormValid && event.keyCode === 13) {
      $scope.sendCreate();
    }
  };

  /**
  * Sets $scope.usernameError to the current error translation
  * @param {String} error - JSON key for translation
  */
  $scope.setUsernameErrorTranslation = function(error) {
    $translate(error).then(function (translation) {
      $scope.usernameError = translation;
    });
    $scope.isUsernameError = true;
  };

  /**
  * Sets $scope.passwordError to the current error translation
  * @param {String} error - JSON key for translation
  */
  $scope.setPasswordErrorTranslation = function(error) {
    $translate(error).then(function (translation) {
      $scope.passwordError = translation;
    });
    $scope.isPasswordError = true;
  };

  /**
  * Sets $scope.emailError to the current error translation
  * @param {String} error - JSON key for translation
  */
  $scope.setEmailErrorTranslation = function(error) {
    $translate(error).then(function (translation) {
      $scope.emailError = translation;
    });
    $scope.isEmailError = true;
  };

  /**
  * Handles username validation errors after form submit
  * @param {Object} response
  */
  $scope.checkUsername = function(response) {
    if (response.code == "InvalidUsername") {
      $scope.setUsernameErrorTranslation('SIGNUP.INVALID_USERNAME');
    } else if (response.code == "UsernameTaken") {
      $scope.setUsernameErrorTranslation('SIGNUP.USERNAME_TAKEN');
    } else if (response.description == "Username is required") {
      $scope.setUsernameErrorTranslation('SIGNUP.USERNAME_REQUIRED');
    }
  };

  /**
  * Handles password validation errors after form submit
  * @param {Object} response
  */
  $scope.checkPassword = function(response) {
    if (response.code == "InvalidPassword") {
      $scope.setPasswordErrorTranslation('SIGNUP.INVALID_PASSWORD');
    } else if (response.description == "Password not provided") {
      $scope.setPasswordErrorTranslation('SIGNUP.PASSWORD_REQUIRED');
    }
  };

  /**
  * Handles email validation errors after form submit
  * @param {String} errorCode
  */
  $scope.checkEmail = function(errorCode) {
    if (errorCode == "InvalidEmail") {
      $scope.setEmailErrorTranslation('SIGNUP.INVALID_EMAIL');
    } else if (errorCode == "EmailTaken") {
      $scope.setEmailErrorTranslation('SIGNUP.EMAIL_TAKEN');
    }
  };

  /**
  * Resets email error state when email input changes
  */
  $scope.onEmailInputChange = function() {
    $scope.emailError = "";
    if ($scope.signupForm.email.$error.email) {
      $scope.setEmailErrorTranslation('SIGNUP.INVALID_EMAIL');
    }
    $scope.isEmailError = false;
  };

  /**
  * Resets password error state when password input changes
  */
  $scope.onPasswordInputChange = function() {
    $scope.isPasswordError = false;
  };

  /**
  * Sends server validation request for username after 1.5s of inactivity
  * @param {Boolean} isFacebookUsername - Did username come from Facebook
  */
  $scope.onUsernameInputChange = function(isFacebookUsername) {
    // assume username is incorrect after change before it's validated on server
    $scope.isUsernameError = true;
    $scope.usernameError = "";

    // keyup event happend before 1.5s of inactivity => clear previous timeout
    if ($scope.usernameInputTimeout) {
      $timeout.cancel($scope.usernameInputTimeout);
    }
    // Don't send server request when client validation failed
    if (!isFacebookUsername && $scope.signupForm.username.$invalid) {
      return;
    }
    $scope.usernameInputTimeout = $timeout(function() {
      $http.head('https://api.gfycat.com/v1/users/' + $scope.account.username)
            .then(
            function(response) {
              // 2** code - username was found
              if (response.status.toString()[0] == 2) {
                $scope.setUsernameErrorTranslation('SIGNUP.USERNAME_TAKEN');
                $scope.isUsernameError = true;
              }
            },
            function(response) {
              if (response.status == 422) {
                $scope.setUsernameErrorTranslation('SIGNUP.INVALID_USERNAME');
                $scope.isUsernameError = true;
              }
              // 404 - username not found, available
              if (response.status == 404) {
                $scope.isUsernameError = false;
              }
            }
          );
    }, 1500);
  };

  /**
  * Sends request for a Facebook autorization
  * @param {Event} event
  */
  $scope.sendConnectWithFacebook = function (event) {
    $scope.isPending.fbSignUp = true;
    $scope.unbindEvent = $scope.$on('facebook_auth_success', function(event, data) {
      $scope.unbindEvent();
      if (data.auth_code) {
        $scope.onFacebookAuthSuccess(data.auth_code);
      }
    });
    accountService.sendConnectWithFacebook(event);
  };

  /**
  * Callback after Facebook authorization success
  * @param {String} auth_code - authorization code from Facebook
  */
  $scope.onFacebookAuthSuccess = function(auth_code) {
    accountService.tryLoginWithFacebook(auth_code, true)
    .then(
      function(response) {
        if (response.login) {
          $scope.account.username = response.username;
          $scope.sendAnalytics('account_logged_in', {
            username: response.username,
            email: response.email,
            channel: 'facebook'
          });
          $scope.onLoginSuccess();
        }
      },
      function(response) {
        if (response.secret) {
          $scope.account.secret = response.secret;
          $scope.account.fb_id = response.fb_id;
          $scope.setDefaultFromFacebook(response);
          $scope.sendAnalytics('account_facebook_connected',
           {fb_id: response.fb_id});
        }
      }
    ).finally(function() {
      $scope.isPending.fbSignUp = false;
    });
  };

  /**
  * Finishes sign up with Facebook after choosing username and
  * email (if not provided by Facebook)
  */
  $scope.finishSignUpWithFacebook = function() {
    var accountData = {
      secret: $scope.account.secret,
      username: $scope.account.username
    };

    // Provided by user, didn't come from Facebook
    if ($scope.account.email) {
      accountData.email = $scope.account.email;
    }
    $scope.isPending.fbSignUp = true;
    accountService.createAccountWithSecret(accountData).then(
       function(response) {
         $scope.sendAnalytics('account_created', {
           username: $scope.account.username,
           email: $scope.account.email,
           fb_id: $scope.account.fb_id,
           channel: 'facebook'
         });
         $scope.onLoginSuccess();
       },
       function(response) {
         if (response.errorMessage &&
             response.errorMessage.code == "EmailTaken") {
           $scope.setEmailErrorTranslation('SIGNUP.EMAIL_ALREADY_IN_USE');
           $scope.isEmailError = true;
         }
       }
     ).finally(function() {
       $scope.isPending.fbSignUp = false;
     });
  };

  /**
  * Sets data for accountTree on login
  */
  $scope.onLoginSuccess = function() {
    $scope.accountTree.loggedIntoAccount = true;
    $scope.accountTree.accountName = $scope.account.username;
    $scope.accountTree.getUserFolders().then(function (data) {
      $scope.accountTree.update(data);
      $scope.accountTree.getSomeFolders();
      if ($stateParams.redirect_uri) {
        $window.open($stateParams.redirect_uri, '_self');
      } else {
        $location.path('/');
      }
    });
  };

  /**
  * Sets data from Facebook as a default in a signup with Facebook form
  * @param {Object} data - username and email which Facebook returns
  */
  $scope.setDefaultFromFacebook = function(data) {
    $scope.isFacebookSignupOpened = true;
    if (data.name) {
      $scope.account.username = data.name.replace(/\s/g,'').toLowerCase();
      $scope.onUsernameInputChange(true);
    }
    if (!data.email) { // didn't come from Facebook
      $scope.account.email = "";
      $scope.isEmailVisible = true;
    } else {
      $scope.account.email = data.email;
      $scope.isEmailVisible = false;
    }
  };

  /**
  * Adds event listener for fb auth window closed
  */
  $scope.addFbWindowClosedEventListener = function() {
    $scope.fbWindowUnbindEvent = $scope.$on('facebook_auth_window_closed', function() {
      $scope.isPending.fbSignUp = false;
      $scope.$apply();
      $scope.fbWindowUnbindEvent();
    });
  };

  $scope.addFbWindowClosedEventListener();

  /**
  * Sends analytic event
  * @param {String} eventType - name of an event
  * @param {Object=} eventData - data for an event
  */
  $scope.sendAnalytics = function(eventType, eventData) {
    var sendData = eventData ? eventData : {};
    sendData.event = eventType;
    gfyAnalytics.sendEvent(sendData);
  };
});
