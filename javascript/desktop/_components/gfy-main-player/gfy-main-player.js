/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycatApp').directive('mainPlayer', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl:'/javascript/desktop/_components/gfy-main-player/gfy-main-player.html',

    link: function($scope, element, attr, $timeout) {

      var extra = angular.element(document.querySelector('.extra'));
      var tv = document.querySelector('.tv');
      var scrollBar = document.querySelector('.scrollable');
      var video = document.querySelector('.main-player-video');

      $scope.mvpThumbWidth = 169;

      extra.css({
        width:tv.offsetLeft + 'px',
      });

      window.addEventListener('resize', function(event) {
        extra.css({
          width:tv.offsetLeft + 'px',
        });

      }, false);

      scrollBar.addEventListener('scroll', function(e) {
        if (scrollBar.scrollWidth - scrollBar.scrollLeft < window.innerWidth * 2) {
          $scope.loadMvpGallery();
        }
        $scope.showLeftArrow = (e.target.scrollLeft > 60);
      }, false);

      $scope.hideRightArrow = function() {
        return scrollBar.scrollWidth - scrollBar.scrollLeft <= window.innerWidth;
      }

      $scope.$watch(function() {
        return $scope.gfyModals.anyModalShown();
      }, function(newValue, oldValue) {
        if (video) {
          if (newValue) {
            if (!video.paused) video.pause();
          } else {
            var playPromise = video.play();
            if (playPromise) {
              playPromise.then(function() {}, function() {});
            }
          }
        }
      });

      $scope.$watch(function() {
        return $scope.feeds.currentGfyFrame;
      },function() {
        if ($scope.feeds.currentGfyFrame) {
          if (video) {
            video.load();
            video.play();
          }
          $scope.viewService.fetchAndSendViewCount(
            $scope.feeds.currentGfyFrame.gfyId,
            {
              flow: 'mainplayer',
              keyword: $scope.feeds.currentGfyChannel.tag,
              context: 'main'
            }
          );
          $scope.updateUserData();
          $scope.resetGfyTimer();

          if ($scope.feeds.currentGfyChannel.nowIndex + 3 >= $scope.feeds.currentGfyChannel.gfycats.length) {
            $scope.loadMvpGallery(16);
          }
        }
      });

      $scope.mainGfyLoopHandler = function() {
        $scope.mainGfyEndCount += 1;
        if ($scope.mainGfyEndCount >= $scope.feeds.mainGfyLoops) {
          $scope.autoJumpToNextVideo();
        } else if (video) {
          if (video.paused) video.play();
        }
      };

      $scope.addVideoEventListeners = function() {
        video.addEventListener('timeupdate', function() {
          $scope.mainGfyPercent = Math.floor((100 / video.duration) * video.currentTime) / $scope.feeds.mainGfyLoops + 100 * $scope.mainGfyEndCount / $scope.feeds.mainGfyLoops;
          if (isNaN($scope.mainGfyPercent)) $scope.mainGfyPercent = 0;
        }, false);

        video.addEventListener('ended', function() {
          $scope.mainGfyLoopHandler();
        }, false);
      };

      $scope.addVideoEventListeners();

      $scope.loadToCurrentFrame = function($index) {
        $scope.feeds.currentGfyFrame = $scope.feeds.currentGfyChannel.gfycats[$index];
        $scope.feeds.currentGfyChannel.nowIndex = $index;
        $scope.autoScrollEnabled = true;
        $scope.updateGalleryPosition();
      };

      $scope.mvpMoveRight = function() {
        $scope.autoScrollEnabled = false;
        $scope.updateGalleryPosition(scrollBar.scrollLeft + window.innerWidth - $scope.mvpThumbWidth);
      };

      $scope.mvpMoveLeft = function() {
        $scope.autoScrollEnabled = false;
        $scope.updateGalleryPosition(scrollBar.scrollLeft - window.innerWidth + $scope.mvpThumbWidth);
      };

      $scope.copySuccess = function(e) {
        angular.element(document.getElementById('copy-btn')).tooltip({ trigger: 'manual' }).tooltip('show');
        setTimeout(function() {
          angular.element(document.getElementById('copy-btn')).tooltip('hide');
        },500);
      }

      $scope.autoJumpToNextVideo = function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        var current = $scope.feeds.currentGfyChannel;
        if (current.nowIndex + 1 < current.gfycats.length) {
          var now = scrollBar.scrollLeft;
          var expected = current.nowIndex * $scope.mvpThumbWidth;

          current.nowIndex ++;
          $scope.feeds.currentGfyFrame = current.gfycats[current.nowIndex];

          if (now === expected) {
            $scope.updateGalleryPosition();
          }
        } else{
          current.nowIndex = 0;
          $scope.feeds.currentGfyFrame = current.gfycats[0];

          angular.element(scrollBar).animate({ scrollLeft: $scope.feeds.currentGfyChannel.nowIndex * -1 * $scope.mvpThumbWidth}, 'slow');
        }
      };

      $scope.autoJumpToPrevVideo = function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        var current = $scope.feeds.currentGfyChannel;
        if (current.nowIndex >= 1) {
          var now = scrollBar.scrollLeft;
          var expected = current.nowIndex * $scope.mvpThumbWidth;

          current.nowIndex --;
          $scope.feeds.currentGfyFrame = current.gfycats[current.nowIndex];

          if (now === expected) {
            $scope.updateGalleryPosition();
          }
        }
      };

      $scope.updateGalleryPosition = function(len) {
        var scrollLength;
        if ($scope.autoScrollEnabled) {
          scrollLength = $scope.feeds.currentGfyChannel.nowIndex * $scope.mvpThumbWidth;
        } else {
          scrollLength = len;
        }
        angular.element(scrollBar).animate({ scrollLeft: scrollLength }, 'slow');
      }
    },

    controller: function($scope, gfyFeeds, msgMachine, gfyHttpFactory,
       gfyAccountTree, $interval, gfyAnalytics,$location, $rootScope) {
      $scope.feeds = gfyFeeds;
      $scope.msgs = msgMachine;
      $scope.httpFactory = gfyHttpFactory;
      $scope.autoScrollEnabled = true;
      $scope.initialLoadingNum = 16;
      $scope.loadingNum = 8;
      $scope.autoPlayVideo = [];
      $scope.viewService = gfyAnalytics;
      $scope.accountTree = gfyAccountTree;
      $scope.channels = new $scope.httpFactory.Tags();
      $scope.isMobile = $rootScope.isMobile;

      $scope.toLocaleNumber = UTIL.toLocaleNumber;
      $scope.toLocaleDate = UTIL.toLocaleDate;

      $scope.updateUserData = function() {
        $scope.httpFactory.loadSocialLikes($scope.feeds.currentGfyFrame);
      }

      $scope.resetGfyTimer = function() {
        $scope.mainGfyEndCount = 0;
        $scope.mainGfyPercent = 0;

        // timing algorithms
        if ($scope.feeds.currentGfyFrame.numFrames != undefined && $scope.feeds.currentGfyFrame.numFrames != 0 && $scope.feeds.currentGfyFrame.frameRate != undefined && $scope.feeds.currentGfyFrame.frameRate != 0) {
          var interval = parseInt($scope.feeds.currentGfyFrame.numFrames) / parseInt($scope.feeds.currentGfyFrame.frameRate);
          if (interval < 2) {
            $scope.feeds.mainGfyLoops = 7;
          } else if (interval <= 3) {
            $scope.feeds.mainGfyLoops = 5;
          } else if (interval <= 5) {
            $scope.feeds.mainGfyLoops = 3;
          } else if (interval <= 10) {
            $scope.feeds.mainGfyLoops = 2;
          } else {
            $scope.feeds.mainGfyLoops = 1;
          }
        } else {
          $scope.feeds.mainGfyLoops = 1;
        }

      };

      $scope.switchChannel = function(channel) {
        $scope.msgs.defaultJiffiestHeading = channel.tag;
        $scope.feeds.currentGfyFrame = channel.gfycats[channel.nowIndex];
        $scope.feeds.currentGfyChannel = channel;
        $scope.autoScrollEnabled = true;
        $scope.updateGalleryPosition();
      };

      $scope.loadMvpGallery = function(count) {
        if (UTIL.isEmptyObj($scope.feeds.currentGfyChannel)) {
          $scope.channels.nextPage(12,1).then(function(data) {
            $scope.feeds.currentGfyChannel = $scope.channels.tags[0];
            $scope.feeds.currentGfyFrame = $scope.channels.tags[0].gfycats[0];
            $scope.feeds.channels = $scope.channels;
          });
        } else {
          if ($scope.feeds.currentGfyChannel.busy) return;
          $scope.feeds.currentGfyChannel.busy = true;
          if (count === undefined) {
            $scope.feeds.currentGfyChannel.loadMore($scope.loadingNum);
          } else {
            $scope.feeds.currentGfyChannel.loadMore(count);
          }
        }
      };

      $scope.hoverVideo = function($index) {
        if ($rootScope.isMobile) {
          return false;
        }
        $scope.autoPlayVideo[$index] = true;
        $scope.viewService.fetchAndSendViewCount(
          $scope.feeds.currentGfyChannel.gfycats[$index].gfyId,
          {
            flow: 'hover',
            keyword: $scope.feeds.currentGfyChannel.tag,
            context: 'main'
          }
        );
      };

      $scope.leaveVideo = function($index) {
        $scope.autoPlayVideo[$index] = false;
      };

      $scope.videoPageLike = function(item) {
        if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveLikeState(item);
        else {
          $rootScope.modalActionShouldStaySamePage = true;
          $scope.gfyModals.toggleModal('modalLoginShown');
          $scope.$on('logged-in',function() {
            $scope.httpFactory.loadSocialLikes($scope.feeds.currentGfyFrame).then(function(data) {
              $scope.feeds.saveLikeState($scope.feeds.currentGfyFrame);
            });
            $rootScope.$$listeners['logged-in'] = [];
          });
        }
      };

      $scope.videoPageDislike = function(item) {
        if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveDislikeState(item);
        else {
          $rootScope.modalActionShouldStaySamePage = true;
          $scope.gfyModals.toggleModal('modalLoginShown');
          $scope.$on('logged-in',function() {
            $scope.httpFactory.loadSocialLikes($scope.feeds.currentGfyFrame).then(function(data) {
              $scope.feeds.saveDislikeState($scope.feeds.currentGfyFrame);
            });
            $rootScope.$$listeners['logged-in'] = [];
          });
        }
      };

      $scope.videoPageBookmark = function(item) {
        if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveBookmarkState(item);
        else {
          $rootScope.modalActionShouldStaySamePage = true;
          $scope.gfyModals.toggleModal('modalLoginShown');
          $scope.$on('logged-in',function() {
            $scope.httpFactory.loadSocialLikes($scope.feeds.currentGfyFrame).then(function(data) {
              $scope.feeds.saveBookmarkState($scope.feeds.currentGfyFrame);
            });
            $rootScope.$$listeners['logged-in'] = [];
          });
        }
      };

      $scope.goToMorePage = function() {
        $location.path('/channels');
      };

      $scope.onShareButtonClick = function() {
        if ($scope.share_enabled) {
          $scope.viewService.sendEvent({
            event: 'click_shareButton',
            flow: 'main',
            device_type: 'desktop',
            gfyid: $scope.feeds.currentGfyFrame.gfyId
          });
        }
      };

      $scope.onShareAttempt = function(channel) {
        $scope.viewService.sendEvent({
          event: 'share_attempt',
          flow: 'main',
          channel: channel,
          device_type: 'desktop',
          gfyid: $scope.feeds.currentGfyFrame.gfyId
        });
      };

      $scope.openUploadDialog = function() {
        var shareGfy = $scope.feeds.currentGfyFrame;
        var uploadPoster = shareGfy.mobilePosterUrl;
        var uploadUrl = $scope.feeds.currentGfyFrame.mobileUrl;
        var uploadTitle = shareGfy.title;

        if (uploadTitle === null || uploadTitle.toLowerCase() === 'untitled') {
          var tagStringTitle = '';
          if (shareGfy.tags) {
            tagStringTitle = shareGfy.tags.join(', ') + " GIF";
            tagStringTitle = tagStringTitle.charAt(0).toUpperCase() +
            tagStringTitle.slice(1);
          }
          uploadTitle = tagStringTitle;
        }

        window.open($scope.$root.globalSiteUrl + "/fbupload?upload_url=" + uploadUrl +
          "&title=" + uploadTitle + "&poster=" + uploadPoster + "&gfyid=" + shareGfy.gfyName + "&flow=main", "_blank", "innerHeight=595,width=520,top=0,left=0");
      };

      var loadData = function() {

        if ($scope.feeds.currentGfyFrame) {
          $scope.resetGfyTimer();
        } else {
          $scope.loadMvpGallery();
        }
        $interval(function(){},1000); //leaving this in as the functions seem to rely on this value for image swaps
      }();

    },
    controllerAs: 'mainPlayerCtrl'
  };
});
