angular.module('profileApp')
  .controller('profileCtrl', ['$scope', '$rootScope', '$state', '$stateParams',
    'gfyAccountTree', 'profileFactory', 'gfyAnalytics',
    function($scope, $rootScope, $state, $stateParams,
      gfyAccountTree, profileFactory, gfyAnalytics) {
      $scope.profileNotFound = false;
      $scope.isEditOpened = false;
      $scope.isFollowPending = false;
      $scope.isUploadImagePending = false;
      $scope.followClickSaved = false; // save follow button click when not logged in
      $scope.userName = $stateParams.path.toLowerCase()
        .substr(1);
      $scope.profileService = profileFactory.getProfileService({
        userName: $scope.userName
      });
      $scope.isMobile = $rootScope.isMobile;

      var body = angular.element('body');

      /**
       * Converts number using current locale
       */
      $scope.toLocaleNumber = UTIL.toLocaleNumber;

      /**
      * Initializes profile page title
      * TODO: add title for a profile.album route
      */
      $scope.initTitle = function() {
        var title = ' | Gfycat GIFs';
        if ($scope.currInfo.name) {
          $state.current.title = $scope.currInfo.name + ' (@' +
           $scope.currInfo.username + ')' + title;
        } else {
          $state.current.title = '@' + $scope.currInfo.username + title;
        }
      };

      /**
      * Attaches event listeners to $scope
      */
      $scope.attachEventListeners = function() {
        $scope.$on('imageUploadSuccessEvent', function() {
          $scope.profileService.getProfileImageUrl().then(function(newImageUrl) {
            $scope.currInfo.profileImageUrl = newImageUrl;
            $scope.info.profileImageUrl = newImageUrl;
            $scope.isUploadImagePending = false;
          });
        });

        $scope.$on('logged-in', function() {
          if (!$scope.isPrivate && $scope.followClickSaved && !$scope.isFollowing) {
            $scope.followUser();
          }
          $scope.followClickSaved = false;
        });
      };

      //$scope.gfyCount = $scope.profileService.getCurrentProfileData().gfyCount;

      /**
       * Initializes profile info
       */
      $scope.initProfileInfo = function() {
        var currentProfileData = $scope.profileService.getCurrentProfileData();
        if (currentProfileData.notFound) {
          $scope.profileNotFound = true;
          return;
        }
         $scope.currInfo = angular.extend({}, currentProfileData.info); // stores initial data
         $scope.info = angular.extend({}, currentProfileData.info); // may be changed, bind to a view
         $scope.tabCounts = {
           gifs: $scope.info.gfyCount,
           albums: Math.max($scope.info.albumCount, 0),
           bookmarks: $scope.info.bookmarkCount
         };
         //$scope.gfyCount = $scope.info.gfyCount;
         //$scope.albumCount = $scope.info.albumCount;
         $scope.isPrivate = $scope.profileService.getIsPrivate();
         $scope.isFollowing = currentProfileData.isFollowing;
         $scope.initTitle();
      };

      gfyAnalytics.sendEvent({
          event: 'view_profile',
          username: gfyAccountTree.loggedIntoAccount ? gfyAccountTree.accountName : '',
          profile_username: $scope.userName
      });

      $scope.initProfileInfo();
      $scope.attachEventListeners();

      /**
       * Saves current profile info (as it's saved on server) to currInfo object
       * @param {Boolean} closeEdit - if edit form should be closed
       */
      $scope.updateCurrentProfileInfo = function(closeEdit) {
        $scope.profileService.getPrivateProfileInfo()
          .then(
            function(response) {
              $scope.currInfo = angular.extend({}, response.data);
              if (closeEdit) $scope.closeEdit();
            },
            function() {
              if (closeEdit) $scope.closeEdit();
            }
          );
      };

      /**
       * Follow current user
       */
      $scope.followUser = function() {
        $scope.isFollowPending = true;
        $scope.profileService.followUser($scope.userName).then(
          function() {
            $scope.isFollowing = true;
            gfyAnalytics.sendEvent({
              event: 'follow_user_success',
              username: gfyAccountTree.accountName,
              profile_username: $scope.userName
            });
          }
        ).finally(function() {
          $scope.isFollowPending = false;
        });
      };

      /**
       * Unfollow current user
       */
      $scope.unfollowUser = function() {
        $scope.isFollowPending = true;
        $scope.profileService.unfollowUser($scope.userName).then(
          function() {
            $scope.isFollowing = false;
            gfyAnalytics.sendEvent({
              event: 'unfollow_user_success',
              username: gfyAccountTree.accountName,
              profile_username: $scope.userName
            });
          }
        ).finally(function() {
          $scope.isFollowPending = false;
        });
      };

      /**
      * Sets isUploadImagePending = true and sends upload image request
      * @param {Object} imageFile
      */
      $scope.uploadProfileImage = function(imageFile) {
        $scope.isUploadImagePending = true;
        $scope.profileService.uploadProfileImage(imageFile);
      };

      /**
       * Opens edit form
       */
      $scope.openEdit = function() {
        body.css({
          'overflow': 'hidden'
        });
        $scope.isEditOpened = true;
      };

      /**
       * Closes edit form
       */
      $scope.closeEdit = function($event) {
        if ($event && $event.target != $event.currentTarget) return;
        body.css({
          'overflow': 'auto'
        });
        $scope.isEditOpened = false;
      };

      /**
       * Handles follow button click
       */
      $scope.followButtonClick = function() {
        if ($scope.isFollowPending) return;

        if (!gfyAccountTree.loggedIntoAccount) {
          $rootScope.gfyModals.modalLoginShown = true;
          $scope.followClickSaved = true;
          return;
        }

        if ($scope.isFollowing) {
          $scope.unfollowUser();
        } else {
          $scope.followUser();
        }
      };
    }
  ]);
