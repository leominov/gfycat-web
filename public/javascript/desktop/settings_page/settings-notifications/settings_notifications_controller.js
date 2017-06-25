angular.module('gfycatApp').controller('settingsNotificationsCtrl',
  ['$scope', 'profileFactory', 'gfyAccountTree',
    function($scope, profileFactory, gfyAccountTree) {
    $scope.isPending = false;
    $scope.profileService = profileFactory.getProfileService({
      userName: gfyAccountTree.accountName
    });
    $scope.currentInfo = $scope.profileService.getCurrentProfileData().info;
    $scope.notifications = {
      newUpload: $scope.currentInfo.uploadNotices
    };

    /**
    * Checks if upload notifications value changed
    * @return {Boolean}
    */
    $scope.isUploadNotificationsChanged = function() {
      return $scope.notifications.newUpload !== $scope.currentInfo.uploadNotices;
    }

    /**
    * Sends a request to update newUpload notifications setting
    */
    $scope.updateUploadNotifications = function() {
      if ($scope.isUploadNotificationsChanged()) {
        $scope.isPending = true;
        // TODO: remove when data type for newUpload is a number
        var value = $scope.notifications.newUpload ? 1 : 0;
        $scope.profileService.updateUploadNotifications(value).finally(
          function() { $scope.isPending = false; }
        );
      }
    };

    /**
    * Saves notificationsForm
    */
    $scope.saveNotificationForm = function() {
      $scope.updateUploadNotifications();
    };

    /**
    * Checks if form data changed
    * @return {Boolean}
    */
    $scope.isDataChanged = function() {
      return $scope.isUploadNotificationsChanged();
    };
}]);
