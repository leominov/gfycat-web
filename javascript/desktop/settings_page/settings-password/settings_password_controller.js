angular.module('gfycatApp').controller('settingsPasswordCtrl',
  ['$scope', 'accountService', function($scope, accountService) {

  $scope.password = {current: '', new: '', confirm: ''};
  $scope.passwordErrors = {current: false, new: false, confirm: false};
  $scope.isPending = false;

  /**
  * Handles password inputs change
  * @param {String} type - password type (current|new|confirm)
  */
  $scope.onPasswordInputChange = function(type) {
    $scope.passwordErrors[type] = false;
    if (type === "confirm" && $scope.password.new !== $scope.password.confirm) {
        $scope.passwordErrors[type] = true;
    }
  };

  /**
  * Submits changePasswordForm
  */
  $scope.saveChangePasswordForm = function() {
    $scope.isPending = true;
    accountService.validatePassword($scope.password.current).then(
      function() {
        accountService.changePassword($scope.password.new).then(
          function() { $scope.resetChangePasswordForm(); },
          function() { $scope.passwordErrors.new = true; }
        ).finally(function() { $scope.isPending = false; });
      },
      function() { $scope.passwordErrors.current = true; }
    ).finally(function() { $scope.isPending = false; });
  };

  /**
  * Checks if there's a changePasswordForm error
  * @return {Boolean}
  */
  $scope.isChangePasswordFormError = function() {
    return $scope.changePasswordForm.$invalid || $scope.passwordErrors.current ||
     $scope.passwordErrors.new || $scope.passwordErrors.confirm;
  };

  /**
  * Resets changePasswordForm to initial state
  */
  $scope.resetChangePasswordForm = function() {
    $scope.password = {current: '', new: '', confirm: ''};
    $scope.changePasswordForm.$setPristine();
  };

  /**
  * Sends reset password request on Enter if resetPasswordForm is valid
  */
  $scope.onChangePasswordFormKeyup = function(event) {
    if (!$scope.isChangePasswordFormError() && event.keyCode === 13) {
      $scope.saveChangePasswordForm();
    }
  };
}]);
