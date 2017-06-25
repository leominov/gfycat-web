
angular.module('ngModal').directive('modalDetailPlayer', ['ngModalDefaults', '$location',
    'hotkeys','gfyHttpFactory','$http','gfyAccountTree','gfyFeeds',
    '$stateParams', 'gfyAnalytics',
  function(ngModalDefaults, $location, hotkeys, gfyHttpFactory, $http,
     gfyAccountTree, gfyFeeds, $stateParams, gfyAnalytics) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      dialogTitle: '@',
      onClose: '&?',
      videoInfo:'='
    },
    replace: true,
    transclude: true,
    controller: ['$scope', 'hotkeys','gfyFeeds','$location', 'gfyAnalytics',
      function($scope, hotkeys,gfyFeeds,$location, gfyAnalytics) {

      $scope.goDetailPage = function() {
        gfyFeeds.videoPageGfyFrame = $scope.currentGfycat;
        $location.path('/' + $scope.currentGfycat.gfyName);
      };

      $scope.onEmbedButtonClick = function() {
        if ($scope.currentGfycat) {
          var videoData = $scope.currentGfycat;
          $scope.ratio = (videoData.width / videoData.height).toFixed(2);
          $scope.height640Ratio = (640 / $scope.ratio).toFixed();
          gfyAnalytics.sendEvent({
            event: 'click_embedButton',
            flow: 'theatre',
            device_type: 'desktop',
            gfyid: $scope.currentGfycat.gfyName.toLowerCase()
          });
        }
      };

      $scope.onShareButtonClick = function() {
        if ($scope.share_enabled) {
          gfyAnalytics.sendEvent({
            event: 'click_shareButton',
            flow: 'theatre',
            device_type: 'desktop',
            gfyid: $scope.currentGfycat.gfyName.toLowerCase()
          });
        }
      };

      $scope.onShareAttempt = function(channel) {
        gfyAnalytics.sendEvent({
          event: 'share_attempt',
          flow: 'theatre',
          channel: channel,
          device_type: 'desktop',
          gfyid: $scope.currentGfycat.gfyName.toLowerCase()
        });
      };

      $scope.onCopyEmbedUrl = function(field) {
        gfyAnalytics.sendEvent({
          event: 'copy_embedURL',
          flow: 'theatre',
          field: field,
          device_type: 'desktop',
          gfyid: $scope.currentGfycat.gfyName.toLowerCase()
        });
      };

      $scope.openUploadDialog = function() {
        var shareGfy = $scope.currentGfycat;

        if (shareGfy.title === null || shareGfy.title.toLowerCase() === 'untitled') {
          var tagStringTitle = '';
          if (shareGfy.tags) {
            tagStringTitle = shareGfy.tags.join(', ') + " GIF";
            tagStringTitle = tagStringTitle.charAt(0).toUpperCase() + tagStringTitle.slice(1);
          }
          shareGfy.title = tagStringTitle;
        }

        window.open($scope.$root.globalSiteUrl + "/fbupload?upload_url=" + shareGfy.mobileUrl +
          "&title=" + shareGfy.title + "&poster=" + shareGfy.mobilePosterUrl + "&gfyid=" + shareGfy.gfyName + "&flow=theater",
          "popUpWindow", "innerHeight=595,width=520,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes");
      };
    }],

    link: function($scope, element, attrs) {
      $scope.globalSiteUrl = $scope.$root.globalSiteUrl;
      $scope.hideModal = function() {
        $scope.detailPlayer.onModalHidden();
        return $scope.show = false;
      };

      $scope.goRight = function() {
        if ($scope.detailPlayer.index + 1 >= $scope.detailPlayer.list.gfycats.length) {
          var nextFive = $scope.detailPlayer.list.loadMore(5);
          if(nextFive) {
            if (!$scope.busy) {
              $scope.busy = true;
              nextFive.then(function() {
                $scope.busy = false;
                $scope.detailPlayer.index += 1;
                $scope.load();
              });
            }
          }else if($scope.detailPlayer.list.loadMore(1)){
            if (!$scope.busy) {
              $scope.detailPlayer.list.loadMore($scope.detailPlayer.list.gfycats.length - $scope.detailPlayer.index - 1).then(function(){
                $scope.busy = false;
                $scope.detailPlayer.index += 1;
                $scope.load();
              });
            }
          }
        }  else {
          $scope.detailPlayer.index += 1;
          $scope.load();
        }
      };

      $scope.goLeft = function() {
        if ($scope.detailPlayer.index < $scope.detailPlayer.list.gfycats.length &&
            $scope.detailPlayer.index > 0) {
          $scope.detailPlayer.index -= 1;
          $scope.load();
        }
      };

      $scope.load = function() {
        $scope.$$postDigest(function() {
          element.find('video')[0].load();
        });

        $scope.currentGfycat = $scope.detailPlayer.list.gfycats[$scope.detailPlayer.index];

        var path = $location.path();
        var newPath = path.substring(0, path.lastIndexOf('/')) + "/" + $scope.detailPlayer.list.gfycats[$scope.detailPlayer.index].gfyName;
        $location.path(newPath).replace();
      };

      var performActionWithLogin = function(item, cb) {
        if (gfyAccountTree.loggedIntoAccount) cb(item);
        else {
          $scope.$root.modalActionShouldStaySamePage = true;
          $scope.$parent.gfyModals.toggleModal('modalLoginShown');
          $scope.$on('logged-in',function() {
            gfyHttpFactory.loadSocialLikes(item).then(function(data) {
              cb(item);
            });
            $scope.$root.$$listeners['logged-in'] = [];
          });
        }
      };

      $scope.videoPageLike = function(item) {
        performActionWithLogin(item, function(item) {
          gfyFeeds.saveLikeState(item);
        });
      };

      $scope.videoPageDislike = function(item) {
        performActionWithLogin(item, function(item) {
          gfyFeeds.saveDislikeState(item);
        });
      };

      $scope.videoPageBookmark = function(item) {
        performActionWithLogin(item, function(item) {
          gfyFeeds.saveBookmarkState(item);
        });
      };

      $scope.copySuccess = function(e) {
        angular.element(document.getElementById('detail-copy-btn')).tooltip({ trigger: 'manual' }).tooltip('show');
        setTimeout(function() {
          angular.element(document.getElementById('detail-copy-btn')).tooltip('hide');
        },500);
      }

      $scope.sendViewAnalytics = function() {
        var keyword,
            splitPath = $location.path().substr(1).split('/');
        if (splitPath[0] === 'detail') {
          keyword = $location.search().tagname;
        } else if (splitPath[0] === 'tag' || splitPath[0] === 'search') {
          keyword = splitPath[1];
        }

        gfyAnalytics.fetchAndSendViewCount(
          $scope.detailPlayer.gfyname.toLowerCase(),
          {
            flow: 'theater',
            context: 'theater',
            keyword: keyword
          }
        );
      };

      $scope.$on('update-detail-player', function(e, data) {
        $scope.detailPlayer = data;
        $scope.sendViewAnalytics();

        hotkeys.add({
          combo: 'left',
          description: 'Navigates left 1 video',
          callback: function() {
            $scope.goLeft();
          }
        });
        hotkeys.add({
          combo: 'j',
          description: 'Navigates left 1 video',
          callback: function() {
            $scope.goLeft();
          }
        });
        hotkeys.add({
          combo: 'right',
          description: 'Navigates right 1 video',
          callback: function() {
            $scope.goRight();
          }
        });
        hotkeys.add({
          combo: 'k',
          description: 'Navigates right 1 video',
          callback: function() {
            $scope.goRight();
          }
        });
        hotkeys.add({
          combo: 'a',
          description: 'Like video',
          callback: function() {
            $scope.videoPageLike($scope.currentGfycat);
          }
        });
        hotkeys.add({
          combo: 'z',
          description: 'Unlike video',
          callback: function() {
            $scope.videoPageDislike($scope.currentGfycat);
          }
        });
        hotkeys.add({
          combo: 'b',
          description: 'Bookmark video',
          callback: function() {
            $scope.videoPageBookmark($scope.currentGfycat);
          }
        });
        hotkeys.add({
          combo: 'esc',
          description: 'Exit modal',
          callback: function() {
            $scope.hideModal();
            hotkeys.del('esc');
            hotkeys.del('left');
            hotkeys.del('right');
            hotkeys.del('a');
            hotkeys.del('z');
            hotkeys.del('j');
            hotkeys.del('k');
            hotkeys.del('b');
          }
        });
        $scope.load();
      });

      $scope.toLocaleNumber = UTIL.toLocaleNumber;
      $scope.toLocaleDate = UTIL.toLocaleDate;
    },

    templateUrl: '/javascript/desktop/_components/modals/modal-detail-player.html',

  };
},
])
.factory('detailModalFactory', function($stateParams, $rootScope, gfyModalMachine, gfyHttpFactory, $http) {


  function showModal(gfyname, list, onModalHidden) {

    if(!UTIL.isEmptyObj(list) && list.gfycats.length > 0) {
      var listindex;
      for (var i = 0; i < list.gfycats.length; i++) {
        if (list.gfycats[i].gfyName == gfyname) {
          listindex = list.gfycats.indexOf(list.gfycats[i]);
          break;
        }
      }

      $rootScope.$broadcast('update-detail-player', {
        gfyname: gfyname,
        list: list,
        index: listindex,
        onModalHidden: onModalHidden
      });
      gfyModalMachine.modalDetailPlayerShown = true;

    } else {
      $http.get('https://api.gfycat.com/v1/gfycats/' + gfyname).success(function(data) {

        $rootScope.$broadcast('update-detail-player', {
          gfyname: gfyname,
          list: { gfycats: [data.gfyItem]},
          index: 0,
          onModalHidden: onModalHidden
        });

        gfyModalMachine.modalDetailPlayerShown = true;

      }).error(function(e) {
        console.log('errror: ', e);
      });
    }

  }

  return {
    showModal: showModal
  };
});
