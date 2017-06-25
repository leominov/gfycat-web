/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 1/12/2016
*/

angular.module('gfycatApp').controller('mainPageCtrl',
  function($scope, gfyHttpFactory, msgMachine, $window, $state, gfyAnalytics) {

  $scope.msgs = msgMachine;
  $scope.tagService = gfyHttpFactory.MasterTags;
  $scope.scrollNum = undefined;
  $scope.isMouseOverThumb = false;

  $window.addEventListener('resize', function(event) {
    if (document.querySelector('.slide-list')) {
        $scope.updateScrollNum();
    }
  }, false);

  $scope.scrollTrack = function(list, count) {
    if (list.current === undefined) {
      list.current = 0;
    }

    if (count == undefined) {
      $scope.updateScrollNum();
      count = $scope.scrollNum;
    }

    // loading new data (only on right click), loadMore preloads 3 times more elements
    if (!list.busy && !list.noNextPage && count > 0 && list.gfycats.length - list.current < 4 * count) {
      list.loadMore(3 * count);
    }

    // sliding animation
    var numOfAvailableElements,
        numOfElementsToSlide = 0;

    if (count > 0) { // click right
      numOfAvailableElements = list.gfycats.length - list.current - count;
      numOfElementsToSlide = numOfAvailableElements > count ? count : numOfAvailableElements;
    } else { // click left
      numOfAvailableElements = list.current;
      numOfElementsToSlide = numOfAvailableElements > Math.abs(count) ? count : -numOfAvailableElements;
    }
    list.current += numOfElementsToSlide;
    var translate = 'translateX(' + -list.current * 270 + 'px )';
    list.transform = { transform: translate, '-webkit-transform': translate, '-ms-transform': translate };
  };

  $scope.updateScrollNum = function() {
    $scope.scrollNum = Math.floor(document.querySelector('.slide-list').clientWidth / 270);
  };

  $scope.generateThumbURL = function(list, item) {
    return "/detail/" + item.gfyName + "?tagname=" + list.tag + "&tvmode=0";
  };

  $scope.onMouseLeaveThumb = function() {
    $scope.isMouseOverThumb = false;
  };

  $scope.sendViewAnalytics = function(gfyId, tagName) {
    // prevents from firing this event twice
    // it fires twice because internal html in thumb changes(?)
    if ($scope.isMouseOverThumb) {
      return;
    }
    $scope.isMouseOverThumb = true;
    gfyAnalytics.fetchAndSendViewCount(
      gfyId,
      {
        flow: 'hover',
        context: 'main',
        keyword: tagName
      }
    );
  };
});
