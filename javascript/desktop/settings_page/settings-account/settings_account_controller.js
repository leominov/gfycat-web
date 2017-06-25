angular.module('gfycatApp').controller('settingsAccountCtrl',
  ['$scope', 'profileFactory', 'gfyAccountTree', '$translate',
  function($scope, profileFactory, gfyAccountTree, $translate) {
    $scope.profileService = profileFactory.getProfileService({
      userName: gfyAccountTree.accountName
    });
    $scope.currentInfo = $scope.profileService.getCurrentProfileData().info;
    $scope.info = {
      email: $scope.currentInfo.email,
      createDate: UTIL.toLocaleDate($scope.currentInfo.createDate * 1000)
    };
    $scope.error = {email: false};
    $scope.isPending = false;
    $scope.emailErrorText = "";

    /**
    * Sends a request to update account info
    */
    $scope.saveChangeAccountForm = function() {
      if ($scope.isChangeAccountFormError()) return;
      $scope.isPending = true;
      $scope.profileService.changeEmail($scope.info.email).then(
        function() {},
        function(data) {
           if (data && data.errorMessage) {
             $scope.checkEmail(data.errorMessage.code);
           }
           $scope.error.email = true;
         }
      ).finally(function() { $scope.isPending = false; });
    };

    /**
    * Handles email input change
    */
    $scope.onEmailInputChange = function() {
      $scope.error.email = false;
      $scope.emailErrorText = "";
    };

    /**
    * Checks if email value was changed
    * @return {Boolean}
    */
    $scope.isEmailChanged = function() {
      return $scope.info.email !== $scope.currentInfo.email;
    };

    /**
    * Sets $scope.emailError to the current error translation
    * @param {String} error - JSON key for translation
    */
    $scope.setEmailErrorTranslation = function(error) {
      $translate(error).then(function (translation) {
        $scope.emailErrorText = translation;
      });
    };

    /**
    * Handles email validation errors after form submit
    * @param {String} errorCode
    */
    $scope.checkEmail = function(errorCode) {
      if (errorCode == "InvalidEmail") {
        $scope.setEmailErrorTranslation('SETTINGS.INVALID_EMAIL');
      } else if (errorCode == "EmailTaken") {
        $scope.setEmailErrorTranslation('SETTINGS.EMAIL_TAKEN');
      }
    };

    /**
    * Checks if there's a form error
    * @return {Boolean}
    */
    $scope.isChangeAccountFormError = function() {
      return $scope.changeAccountForm.$invalid ||
        $scope.error.email || !$scope.isEmailChanged();
    };

    /**
    * Sends reset password request on Enter if resetPasswordForm is valid
    */
    $scope.onChangeAccountFormKeyup = function(event) {
      if  (event.keyCode === 13) {
        $scope.saveChangeAccountForm();
      }
    };
}]);
