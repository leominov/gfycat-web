angular.module('gfycatApp').directive('httpPrefix', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, controller) {
          function ensureHttpPrefix(value) {
            //add url prefix if absent and not partially present
            if (value && !/^(https?):\/\//i.test(value)
               && 'http://'.indexOf(value) !== 0 && 'https://'.indexOf(value) !== 0 ) {
                controller.$setViewValue('http://' + value);
                controller.$render();
                return 'http://' + value;
            } else {
              return value;
            }
          }
          controller.$formatters.push(ensureHttpPrefix);
          controller.$parsers.splice(0, 0, ensureHttpPrefix);
        }
    };
}).controller('partnerSignupCtrl',
  function($scope, $http, $location, gfyAccountTree, accountService,
      $translate, $timeout, gfyAnalytics, $state, $window, profileFactory, $q, $rootScope) {
  $scope.accountTree = gfyAccountTree;

  $scope.notificationEmailProperties = {
    contact_name: null,
    contact_email: null,
    gfycat_username: null,
    partner_type: "Select",
    partner_name: null,
    company: null,
    web_url: null,
  };

  // determine whether user is logged in, change validation rules accordingly
  if (gfyAccountTree.loggedIntoAccount) {
    $scope.loggedIn = true;

    // prepopulate form fields with known answers
    accountService.getProfile().then(
      function(data) {
        $scope.notificationEmailProperties.gfycat_username = data.userid;
        $scope.notificationEmailProperties.contact_email = data.email;

        $scope.profileService = profileFactory.getProfileService({
          userName: data.userid
        });

        if (data.profileUrl) {
          $scope.initialWebUrl, $scope.notificationEmailProperties.web_url = data.profileUrl;
        }

        if (data.name) {
          $scope.initialName, $scope.notificationEmailProperties.partner_name = data.name;
        }
      },
      function(data) {
        console.log("failed to retrieve profile info");
      }
    );

    $scope.isSignupFormValid = function() {
      return $scope.signupForm.$valid;
    };
  } else {
    $scope.loggedIn = false;
    $scope.initialName = null;
    $scope.initialWebUrl = null;

    $scope.isSignupFormValid = function() {
      return $scope.signupForm.$valid && !($scope.isUsernameError ||
      $scope.isPasswordError || $scope.isEmailError);
    };
  }

  $scope.account = {};
  $scope.usernameError = "";
  $scope.passwordError = "";
  $scope.emailError = "";
  $scope.isUsernameError = true;
  $scope.isPasswordError = false;
  $scope.isEmailError = false;
  $scope.isEmailVisible = true;
  $scope.usernameInputTimeout;
  $scope.isPending = {
    signup: false,
    fbSignUp: false
  };

  $scope.consent = false;
  $scope.typeSelected = false;

  $scope.isNewProfileInfo = function() {
    return $scope.initialName !== $scope.notificationEmailProperties.partner_name || $scope.initialWebUrl !== $scope.notificationEmailProperties.web_url
  };

  $scope.refreshProfileService = function() {
    $scope.profileService.userProfileData = {};
  };

  $scope.toggleConsent = function() {
    $scope.consent = !$scope.consent;
  };

  $scope.setPartnerType = function(type) {
    $scope.notificationEmailProperties.partner_type = type;
    $scope.typeSelected = true;
  };

  $scope.moveToTop = function() {
    $window.scrollTo(0, 0);
  };

  /**
  * Patches the current user with new values
  */
  $scope.updateProfileInfo = function (operationsArray) {
    return $q(function(resolve, reject) {
      $http.patch('https://api.gfycat.com/v1/me', {
          'operations': operationsArray
        }).then(
        function(response) { resolve(response); },
        function(response) { reject(response); }
      );
    });
  };

  $scope.createOperationsArray = function (name, profileUrl) {
    var operationsArray = [];

    if ($scope.initialName !== $scope.notificationEmailProperties.partner_name) {
      operationsArray.push({
        "op":"add",
        "path":"/name",
        "value": name
      });
    }

    if ($scope.initialWebUrl !== $scope.notificationEmailProperties.web_url) {
      operationsArray.push({
        "op":"add",
        "path":"/profile_url",
        "value": profileUrl
      });
    }

    return operationsArray;
  };

  $scope.formSubmit = function() {
    if ($scope.isSignupFormValid && $scope.consent && $scope.typeSelected) {
      if ($scope.loggedIn) {
        if ($scope.isNewProfileInfo()) {
          $scope.updateProfileInfo(
            $scope.createOperationsArray(
              $scope.notificationEmailProperties.partner_name, $scope.notificationEmailProperties.web_url
            )
          ).then(
              function() {
                $scope.refreshProfileService();
              }
          ).finally(
            function() {
              $scope.emailGfycat();
              $location.path('/@' + $scope.notificationEmailProperties.gfycat_username);
            }
          );
        } else {
          $scope.emailGfycat();
          $location.path('/@' + $scope.notificationEmailProperties.gfycat_username);
        }
      } else {
        $scope.sendAnalytics('signup_attempt', {'channel':'email'});
        $scope.sendCreate();
      }
    } 
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
        $scope.updateProfileInfo(
          $scope.createOperationsArray(
            $scope.notificationEmailProperties.partner_name, $scope.notificationEmailProperties.web_url
          )
        );
        $scope.emailGfycat();
      },
      function(response) {
        $scope.checkUsername(response);
        $scope.checkPassword(response);
        $scope.checkEmail(response.code);
        $scope.moveToTop();
      }
    ).finally(function() {
      $scope.isPending.signup = false;
    });
  };

  /**
  * Notifies Gfycat about a new applicant
  */
  $scope.emailGfycat = function() {
    var res = $http.post('https://api.gfycat.com/v1/me/verify', $scope.notificationEmailProperties);
    res.error(function(data, status, headers, config) {
      console.log( "failure message: " + JSON.stringify({data: data}));
    });   
  }

  /**
  * Sends reset password request on Enter if resetPasswordForm is valid
  */
  $scope.onSignupFormKeyup = function(event) {
    if ($scope.isSignupFormValid() && event.keyCode === 13) {
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
    $scope.notificationEmailProperties.contact_email = $scope.account.email;
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

    $scope.notificationEmailProperties.gfycat_username = $scope.account.username;

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
  * Sets data for accountTree on login
  */
  $scope.onLoginSuccess = function() {
    $scope.accountTree.loggedIntoAccount = true;
    $scope.accountTree.accountName = $scope.account.username;
    $scope.accountTree.getUserFolders().then(function (data) {
      $scope.accountTree.update(data);
      $scope.accountTree.getSomeFolders();
      $location.path('/');
    });
  };

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

  $scope.mobileHeaderStyles = function() {
    if ($rootScope.isMobile) {
      angular.element('.partner-type-select')
        .removeClass('partner-type-select--desktop')
        .addClass('partner-type-select--mobile');
    }
  };

  $scope.mobileHeaderStyles();
});
