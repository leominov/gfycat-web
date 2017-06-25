angular.module('profileApp').directive('profileInfoEdit',
  ['gfyAnalytics', function(gfyAnalytics) {
  return {
    restrict: 'E',
    templateUrl: '/javascript/desktop/profile_module/profile-info-edit/profile-info-edit.html',
    link: function(scope, element, attrs) {
      var nameInput = element.find('.input-name')[0],
          urlInput = element.find('.input-url')[0],
          descriptionInput = element.find('.textarea-description')[0],
          imageInput = element.find('.input-image')[0];

      scope.formSubmitPending = false;

      /**
      * Error statuses
      */
      scope.error = {
        name: false,
        url: false,
        description: false
      };

      /**
      * Fields that can be changed
      */
      scope.fieldForChange = {
        name: true,
        profileUrl: true,
        description: true
      };

      /**
      * Adds event listeners for events on profile page
      */
      scope.addEventListeners = function() {
        scope.$on('add-name-click', function() {
          nameInput.focus();
        });
        scope.$on('add-url-click', function() {
          urlInput.focus();
        });
        scope.$on('add-description-click', function() {
          descriptionInput.focus();
        });
        imageInput.addEventListener('click', function($event) {
          if (scope.isUploadImagePending) {
            $event.preventDefault();
            return false;
          }
        });
        imageInput.addEventListener('change', function($event) {
          if ($event.target.files.length != 0) {
            scope.uploadProfileImage($event.target.files[0]);
          }
        });
      };

      /**
      * Checks if a form has any errors
      */
      scope.isFormError = function() {
        return scope.profileInfoForm.$invalid || scope.error.name ||
          scope.error.url || scope.error.description;
      };

      /**
      * Submits profile info form
      */
      scope.submitProfileInfoForm = function() {
        if (scope.isFormError()) {
          return;
        }
        var newProfileInfo = scope.collectNewProfileInfo();
        if (newProfileInfo.length) {
          scope.formSubmitPending = true;
          scope.profileService.updateProfileInfo(newProfileInfo).then(
            function(response) {
              scope.updateCurrentProfileInfo(true);
              scope.formSubmitPending = false;
              gfyAnalytics.sendEvent({
                event: 'profile_edited',
                username: scope.info.username
              });
            },
            function(response) {
              if (response.status === 400) {
                scope.checkFormErrors(response.data);
              }
              scope.formSubmitPending = false;
            }
          );
        } else {
          scope.closeEdit();
        }
      };

      /**
      * Checks if there're errors after form submit
      */
      scope.checkFormErrors = function(errors) {
        for (var i = 0; i < errors.length; i++) {
          var errorCode = errors[i].errorMessage.code;
          if (errorCode == "InvalidName") {
            scope.error.name = true;
          } else if (errorCode == "InvalidUrl") {
            scope.error.url = true;
          } else if (errorCode == "InvalidDescription") {
            scope.error.description = true;
          }
        }
      };

      /**
      * Clears inpit error state
      * @param {String} inputName - name of an input
      */
      scope.clearError = function(inputName) {
        scope.error[inputName] = false;
      };

      scope.addEventListeners();
    },
    controller: function($scope) {
      /**
      * Checks url using regEx
      * @param {String}
      * @return {String} url which starts with https:// or http://
      */
      $scope.urlCheck = function(url) {
        var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
        if (url.match(regex)) {
          return url;
        } else {
          var newUrl = 'http://' + url;
          if (newUrl.match(regex)) {
            return newUrl;
          }
        }
        return url;
      };

      /**
      * Collects all changed profile info
      */
      $scope.collectNewProfileInfo = function() {
        var newData = [];

        for (var key in $scope.info) {
          // old value == undefined && new value == ""
          if (!$scope.currInfo[key] && !$scope.info[key]) {
            continue;
          }
          if ($scope.fieldForChange[key] && $scope.currInfo[key] !== $scope.info[key]) {
            var updatedKeyData = {};

            if ($scope.info[key]) {
              updatedKeyData.op = 'add';
              updatedKeyData.value = $scope.info[key];
            } else {
              updatedKeyData.op = 'remove';
            }
            if (key == 'profileUrl') {
              updatedKeyData.value = $scope.urlCheck($scope.info[key]);
              updatedKeyData.path = '/' + 'profile_url';
            } else {
              updatedKeyData.path = '/' + key;
            }
            newData.push(updatedKeyData);
          }
        }
        return newData;
      };
    }
  }
}]);
