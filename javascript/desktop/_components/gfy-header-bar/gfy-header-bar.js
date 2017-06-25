/* Copyright (C) GfyCat, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Date: 12/1/2015
 */


angular.module('gfycatApp')
  .directive('gfyHeaderBar', function() {
    return {
      restrict: 'EA',
      templateUrl: '/javascript/desktop/_components/gfy-header-bar/gfy-header-bar.html',
      controller: function($scope, $rootScope, $location, gfyAccountTree,
        msgMachine, gfyModalMachine, gfyFeeds, hotkeys, $window,
        accountService, gfyAnalytics) {
        $scope.msgs = msgMachine;
        $scope.accountTree = gfyAccountTree;
        $scope.gfyModals = gfyModalMachine;
        $scope.feeds = gfyFeeds;
        $scope.search = {
          siteSearch: ''
        };

        $scope.loginUrl = '/login' + (window.location.pathname !== '/' ? '?redirectUri=' + window.location.pathname : '')

        $scope.$watch(function() {
          return $scope.searchText;
        }, function(newValue, oldValue) {
          $scope.search.siteSearch = '';
          angular.element('.search-header')
            .css("display", "block");
        });
        $scope.sendAnalytics = function(eventType) {
          gfyAnalytics.sendEvent({
            event: eventType
          });
        };

        $scope.searchMainPage = function(path) {
          if (path && path.length) {
            path = encodeURIComponent(path.trim())
            $scope.feeds.searchPageList = [];
            window.location = '/gifs/search/' + path;
          }
        };

        $scope.hideMenu = function() {
          angular.element('.dropdown-menu').addClass('hidden');
        };

        $scope.showMenu = function() {
          angular.element('.dropdown-menu').removeClass('hidden');
        };

        $scope.typing = function(event) {
          angular.element('.search-header')
            .css("display", "none");
        };

        $scope.notTyping = function(event) {
          if (angular.element('.search-input')
            .val()
            .length === 0) {
            angular.element('.search-header')
              .css("display", "block");
          }
        };

        $scope.goUserAccount = function(type) {
          $scope.accountTree.getUserFolders()
            .then(function(data) {
              $scope.accountTree.update(data);
              $scope.accountTree.getSomeFolders(); // get everything else why not
              var newpath;
              if (type === "profile") {
                newpath = '/@' + $scope.accountTree.accountName;
              } else if (type === "library") {
                newpath = '/@' + $scope.accountTree.accountName + '/library';
              } else {
                newpath = '/useraccount/' + $scope.accountTree.accountName;
              }
              $location.path(newpath);
            });
        };

        $scope.logout = function() {
          accountService.logout();
          $window.location.reload();
        };

        $scope.isUserSignedIn = function() {
          return $scope.accountTree.accountName !== 'Login';
        };

        $scope.viewGfyBlog = function() {
          $location.path('/GfycatNews');
        };

        $scope.openUploaderEvent = function() {
          hotkeys.add({
            combo: 'esc',
            description: 'Close modal',
            callback: function() {
              gfyModalMachine.modalUploadsShown = false;
              hotkeys.del('esc');
            }
          });
          $scope.sendAnalytics('upload_clickFromMainPage');
        };

        $scope.mobileHeaderStyles = function() {
          if ($rootScope.isMobile) {
            angular.element('.header-container')
              .removeClass('header-container--desktop')
              .addClass('header-container--mobile');
          } else {
            angular.element('.dropdown-container')
              .addClass('hover-drop');
            angular.element('#dropdownMenu1')
              .removeAttr("data-toggle");
            angular.element('#dropdownUser')
              .removeAttr("data-toggle");
          }
        };

        $scope.mobileHeaderStyles();
      },

      controllerAs: 'gfyHeaderBarCtrl',
    };
  }); //end directive
