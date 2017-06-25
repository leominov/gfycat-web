/**
 * Created by dave on 2015-01-06.
 */
angular.module('gfycatApp').controller('videoPageCtrl',
  function($scope, gfyFeeds, msgMachine, $http, $routeParams, gfyModalMachine,
    $location, $interval,gfyAccountTree, $rootScope, gfyAnalytics, oauthTokenService) {
  //$scope.useSmallScreen = (window.screen.height<900); // check for small screen true or false
  $scope.useSmallScreen = (window.innerHeight < 900); // check for small screen true or false

  $scope.showShare = false;
  $scope.showEmbed = false;
  $scope.showWebb = false;
  $scope.showReport = false;

  $scope.feeds = gfyFeeds; // video page feeds binding
  $scope.accountTree = gfyAccountTree;
  $scope.msgs = msgMachine;
  $scope.gfyModals = gfyModalMachine;
  $scope.params = $routeParams;
  $scope.showVideo = [];
  $scope.viewService = gfyAnalytics;

  if (($scope.feeds.videoPageGfyFrame || $scope.feeds.videoPageList[0]) != undefined) {
    var videoData = $scope.feeds.videoPageGfyFrame || $scope.feeds.videoPageList[0];
    $scope.ratio = (videoData.width / videoData.height).toFixed(2);
    $scope.height640Ratio = (640 / $scope.ratio).toFixed();

    $scope.viewService.fetchAndSendViewCount(
      $scope.feeds.videoPageGfyFrame.gfyId,
      {
        flow: 'details',
        context: 'details'
      }
    );
  }

  //console.log($scope.params);
  $scope.mouseHover = function(index) {
    $scope.showVideo[index] = true;
    $scope.viewService.fetchAndSendViewCount(
      $scope.feeds.videoPageList[index].gfyId,
      {
        flow: 'hover',
        content: 'details'
      }
    );
  };

  $scope.mouseLeft = function(index) {
    $scope.showVideo[index] = false;
  };

  var myrand = '?m=';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 5; i++) myrand += possible.charAt(Math.floor(Math.random() * possible.length));

  var vidTimeHandlerMaxFound = 0; // check if the video looped

  /*
   * Viewcount functions.  These functions are called every time this controller loads,
   * triggered after the call to either getFull for the new gfycat item, or to read
   * the global variable if the page was loaded directly
   * gfyItem contains the required variable 'tx' when it is loaded via /cajax/getFull/gfyName
   *
   * We generate a user tracking number and a session tracking number to send to the back end
   * We also send the http referer and the tx code contains other info about this gfycat
   * To maintain user and session, a cookie must be set
   * Note also angular pre 1.4 does not set cookies with persistent storage options
   */

  function generateUUID() {
    var b = new Date().getTime();
    var a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(e) {
      var d = (b + Math.random() * 16) % 16 | 0;
      b = Math.floor(b / 16);
      return (e == 'x' ? d : (d & 3 | 8)).toString(16);
    });

    return a;
  }

  function createCookie(c, d, e) {
    if (e) {
      var b = new Date();
      b.setTime(b.getTime() + (e * 1000));
      var a = '; expires=' + b.toGMTString();
    } else {
      var a = '';
    }

    document.cookie = c + '=' + d + a + ';domain=.gfycat.com;path=/';
  }

  function readCookie(b) {
    var e = b + '=';
    var a = document.cookie.split(';');
    for (var d = 0; d < a.length; d++) {
      var f = a[d];
      while (f.charAt(0) == ' ') {
        f = f.substring(1, f.length);
      }

      if (f.indexOf(e) == 0) {
        return f.substring(e.length, f.length);
      }
    }

    return null;
  }

  var vidTimeHandler = function() {
    var vid;
    if (vid = document.getElementById('videoGfy0')) {}

    // nothing
    else {
      return;
    }

    $scope.videoGfyPercent = Math.floor((100 / vid.duration) * vid.currentTime);
    $scope.$apply();

    if ($scope.feeds.videoPageAutoPlay) {
      if (vid.duration - vid.currentTime < vid.duration / $scope.feeds.videoPageGfyFrame.numFrames || vid.currentTime < vidTimeHandlerMaxFound) {
        vidTimeHandlerMaxFound = 0;
        $scope.videoAutoIndexRight();
      } else {
        vidTimeHandlerMaxFound = vid.currentTime;
      }
    }

    $scope.$apply();
  };

  $scope.loadScrollGfys = function(firstLoad) {
    $scope.feeds.videoPageList = [];
    if (!$scope.feeds.videoPageGfyFrame) {
      $scope.feeds.videoPageGfyFrame = superAwesomeGlobalGfyJSON;
      $scope.feeds.videoPageList.tagName = 'jiffiest';
      $scope.feeds.videoPageGfyFrame.error = false;
    } else {
      if ($scope.feeds.videoPageGfyFrame.tags) {
          $scope.feeds.videoPageList.tagName = $scope.feeds.videoPageGfyFrame.tags[0];
      } else {
        $scope.feeds.videoPageList.tagName = 'jiffiest';
      }
    }

    $scope.feeds.videoPageList.reachedEnd = false;
    $scope.feeds.loadGfysForVideoPage($scope.feeds.videoPageList, $scope.feeds.videoPageList.tagName).then(function() {
      $scope.feeds.videoPageList.start = 0;
      $scope.feeds.videoPageList.first = 0;
      $scope.feeds.videoPageList.headingIndex = $scope.feeds.videoPageGfyFrame.tagName;

      //console.log($scope.feeds.videoPageList);
      if (firstLoad) {
        var len = $scope.feeds.videoPageList.length;
        for (var i = 0; i < len; i++) {
          if ($scope.feeds.videoPageList[i].gfyId == $scope.feeds.videoPageGfyFrame.gfyId) {
            $scope.feeds.videoPageList.start = i;
            break;
          }
        }
      }
    });
  };

  if ($scope.feeds.videoPageGfyFrame) {
    $scope.feeds.videoPageGfyFrame.error = false;
    if ($scope.accountTree.loggedIntoAccount) {
      loadUserMetaData();
    }
  }

  if ($scope.feeds.videoPageList.tagName == undefined) {
    $scope.loadScrollGfys(true);
  }

  function loadUserMetaData() {
      if(oauthTokenService.isUserLoggedIn()) {
          $http.get('https://api.gfycat.com/v1/me/gfycats/' + $scope.feeds.videoPageGfyFrame.gfyName + '/full' + myrand).success(function (data) { // on successful get request populate the data
              $scope.feeds.videoPageGfyFrame.likes = parseInt($scope.feeds.videoPageGfyFrame.likes);
              $scope.feeds.videoPageGfyFrame.dislikes = parseInt($scope.feeds.videoPageGfyFrame.dislikes);
              $scope.feeds.videoPageGfyFrame.androidUrl = $scope.feeds.videoPageGfyFrame.mp4Url.replace(/\.mp4/g, '-android.mp4');
              $scope.feeds.videoPageGfyFrame.likeState = parseInt(data.gfyItem.likeState) + 0;
              $scope.feeds.videoPageGfyFrame.bookmarkState = parseInt(data.gfyItem.bookmarkState) + 0;
          });
      }

  }

  function checkLoad() {
    var vid;
    if (vid = document.getElementById('videoGfy0')) {
      vid.removeEventListener('timeupdate', vidTimeHandler, false);
      $scope.vidTimeHandlerMaxFound = 0;
      vid.addEventListener('timeupdate', vidTimeHandler, false);
    } else {
      $timeout(checkLoad, 10);
    }
  }

  //checkLoad();

  $scope.refreshVideoPage = function(GfyFrame, index) {

    if (GfyFrame != undefined && GfyFrame.gfyId != $scope.feeds.videoPageGfyFrame.gfyId) { // check if trying to load current video again

      $scope.feeds.videoPageGfyFrame = GfyFrame;
      var newpath = '/' + $scope.feeds.videoPageGfyFrame.gfyName;
      if (window.history.replaceState) {//prevents browser from storing history with each change:
        window.history.replaceState({}, '', newpath);
      }

      //clearInterval($scope.feeds.videoPageTimer); // if we touch the controls we no longer want autoscrolling
      $scope.feeds.videoPageAutoPlay = false;
      $scope.feeds.videoGfyLoops = 1;// if we touch the controls we no longer want autoscrolling
      //checkLoad();
      // $scope.feeds.clearPageVid = true;
      //setTimeout($scope.updateVidclear, 1);
    }
  };

  $scope.$watch(function() {if ($scope.feeds.videoPageGfyFrame && $scope.feeds.videoPageGfyFrame.hasOwnProperty('webmUrl'))
      return $scope.feeds.videoPageGfyFrame.webmUrl;
    else
        return $scope.feeds.videoPageGfyFrame;
  }, function() {

    $scope.$evalAsync(function() {
      var vid;
      if ($scope.feeds.videoPageGfyFrame && $scope.feeds.videoPageGfyFrame.hasOwnProperty('webmUrl')) {
        if (vid = document.getElementById('videoGfy0')) {

          checkLoad();
        }
      }

    });
  });

  //$scope.updateLiveView = function() {
  //  if ($scope.feeds.videoPageGfyFrame) {
  //    //$scope.viewService.updateView($scope.feeds.videoPageGfyFrame.gfyNumber).success(function(data) {
  //    //  if (data.siteLiveCount != undefined) gfyFeeds.siteLiveCount = data.siteLiveCount;
  //    //  if (data.site24HourViewCount != undefined) gfyFeeds.site24HourViewCount = data.site24HourViewCount;
  //    //  if (data.site24HourSubmissionCount != undefined) gfyFeeds.site24HourSubmissionCount = data.site24HourSubmissionCount;
  //    //
  //    //  if (data.liveCountsList[$scope.feeds.videoPageGfyFrame.gfyId] !== undefined) {
  //    //    $scope.feeds.videoPageGfyFrame.liveViews = data.liveCountsList[$scope.feeds.videoPageGfyFrame.gfyId].liveCount;
  //    //    $scope.feeds.videoPageGfyFrame.views = data.liveCountsList[$scope.feeds.videoPageGfyFrame.gfyId].totalCount;
  //    //  } else {
  //    //    $scope.feeds.videoPageGfyFrame.liveViews = 1;
  //    //  }
  //    //})
  //  }
  //};

  $scope.updateVidclear = function() { // this is a delay to toggle the video tag in the html....
    $scope.feeds.clearPageVid = false;
    $scope.videoGfyPercent = 0;
    $scope.$apply();

    //if (document.getElementById("videoGfy0") != undefined) {
    $scope.videoGfyEndCount = 0;
    if (document.getElementById('videoGfy0')) {
      document.getElementById('videoGfy0').addEventListener('timeupdate', function() {
        if (document.getElementById('videoGfy0') && document.getElementById('videoGfy0').duration != undefined && document.getElementById('videoGfy0').currentTime != undefined) {
          $scope.videoGfyPercent = Math.floor((100 / document.getElementById('videoGfy0').duration) * document.getElementById('videoGfy0').currentTime) / $scope.feeds.videoGfyLoops + 100 * $scope.videoGfyEndCount / $scope.feeds.videoGfyLoops;
          if (isNaN($scope.videoGfyPercent)) $scope.videoGfyPercent = 0;

          //console.log($scope.videoGfyPercent);
          $scope.$apply();
        }
      }, false);

      document.getElementById('videoGfy0').addEventListener('ended', function() {
        //console.log("endendendendendendend");
        $scope.videoGfyEndCount += 1;

        //console.log("endcount="+$scope.videoGfyEndCount);

        if ($scope.feeds.videoPageAutoPlay && $scope.videoGfyEndCount >= $scope.feeds.videoGfyLoops) $scope.videoAutoIndexRight();
        else this.play();// for this to work need to disable LOOP in video element
        $scope.$apply();
      }, false);
    }
  };

  // document.getElementById("videoGfy0").addEventListener('progress', function () {
  //     $scope.videoGfyLoaded = Math.floor((100 / document.getElementById("videoGfy0").duration) * document.getElementById("videoGfy0").buffered.end(0));
  //     $scope.$apply();
  //}, false);
  //}

  $scope.refreshIndexRight = function(list) {
    //console.log(list);
    //clearInterval($scope.feeds.videoPageTimer); // if we touch the controls we no longer want autoscrolling
    $scope.feeds.videoPageAutoPlay = false;
    $scope.feeds.videoGfyLoops = 1;// if we touch the controls we no longer want autoscrolling
    if ($scope.feeds.videoPageList.length > 6) $scope.feeds.videoPageList.start += 1;
    if ($scope.feeds.videoPageList.length - $scope.feeds.videoPageList.start == 6) $scope.feeds.videoPageList.reachedEnd = true;
    if (!$scope.feeds.videoPageList.reachedEnd && ($scope.feeds.videoPageList.length - $scope.feeds.videoPageList.start) < 8 && $scope.feeds.videoPageList.cursor != 'end') {
      if (!$scope.feeds.videoPageList.loading) $scope.feeds.loadGfysForVideoPage($scope.feeds.videoPageList, $scope.feeds.videoPageList.headingIndex);
    }

  };

  $scope.indexLeft = function(list) {
    $scope.feeds.videoPageList.start -= 1;
    if ($scope.feeds.videoPageList.reachedEnd) $scope.feeds.videoPageList.reachedEnd = false;
    if ($scope.feeds.videoPageList.start < 0) $scope.feeds.videoPageList.start = 0;

    //clearInterval($scope.feeds.videoPageTimer); // if we touch the controls we no longer want autoscrolling
    $scope.feeds.videoPageAutoPlay = false;
    $scope.feeds.videoGfyLoops = 1;// if we touch the controls we no longer want autoscrolling
  };

  $scope.videoPageBookmark = function(item) {
    if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveBookmarkState(item);
    else $scope.gfyModals.toggleModal('modalLoginShown');
  };

  $scope.videoPageLike = function(item) {
    if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveLikeState(item);
    else $scope.gfyModals.toggleModal('modalLoginShown');
  };

  $scope.videoPageDislike = function(item) {
    if ($scope.accountTree.loggedIntoAccount) $scope.feeds.saveDislikeState(item);
    else $scope.gfyModals.toggleModal('modalLoginShown');
  };

  $scope.reportGfy = function(item) {
    //console.log("Report: " +item.gfyName);
  };

  $scope.goToPage = function(path1, path2) {

    if (path1 && path2 && path1.length && path2.length) {
      $scope.feeds.tagPageList = [];
      $location.path(path1 + path2);
    }
  };

  $scope.toggleNavs = function(whichone) {
    var gfyId = $scope.feeds.videoPageGfyFrame.gfyName.toLowerCase();

    if ($scope.feeds.videoPageGfyFrame.redditId == null &&
       $scope.feeds.videoPageGfyFrame.url == null && whichone == 'webb') {
      if (whichone == 'webb') {
        $scope.viewService.sendEvent({
          event: 'click_empty_source',
          gfyid: gfyId
        });
      }
      return;
    }

    switch (whichone){
      case 'share':
        if (!$scope.showShare) {
          $scope.viewService.sendEvent({
            event: 'click_shareButton',
            flow: 'details',
            device_type: 'desktop',
            gfyid: gfyId
          });
        }
        $scope.showShare = !$scope.showShare;
        $scope.showEmbed = false;
        $scope.showWebb = false;
        $scope.showReport = false;
        break;
      case 'embed':
        if (!$scope.showEmbed) {
          $scope.viewService.sendEvent({
            event: 'click_embedButton',
            flow: 'details',
            device_type: 'desktop'
          });
        }
        $scope.showShare = false;
        $scope.showEmbed = !$scope.showEmbed;
        $scope.showWebb = false;
        $scope.showReport = false;
        break;
      case 'webb':
        if (!$scope.showWebb) {
          $scope.viewService.sendEvent({
            event: 'click_for_source',
            gfyid: gfyId
          });
        }
        $scope.showShare = false;
        $scope.showEmbed = false;
        $scope.showWebb = !$scope.showWebb;
        $scope.showReport = false;
        break;
      case 'report':
        $scope.showShare = false;
        $scope.showEmbed = false;
        $scope.showWebb = false;
        $scope.showReport = !$scope.showReport;
        break;
      default:// probably not needed
        $scope.showShare = false;
        $scope.showEmbed = false;
        $scope.showWebb = false;
        $scope.showReport = false;
        break;
    }
  };

  $scope.onSocialButtonClick = function(channel) {
    $scope.viewService.sendEvent({
      event: 'share_attempt',
      flow: 'details',
      channel: channel,
      device_type: 'desktop',
      gfyid: $scope.feeds.videoPageGfyFrame.gfyName.toLowerCase()
    });
  };

  $scope.openUploadDialog = function() {
    var shareGfy = $scope.feeds.videoPageGfyFrame;
    var uploadUrl = shareGfy.mobileUrl;
    var uploadTitle = shareGfy.title;
    var uploadPoster = shareGfy.mobilePosterUrl;

    if (uploadTitle === null || uploadTitle.toLowerCase() === 'untitled') {
      var tagStringTitle = '';
      if (shareGfy.tags) {
        tagStringTitle = shareGfy.tags.join(', ') + " GIF";
        tagStringTitle = tagStringTitle.charAt(0).toUpperCase() + tagStringTitle.slice(1);
      }
      uploadTitle = tagStringTitle;
    }
    
    window.open($scope.$root.globalSiteUrl + "/fbupload?upload_url=" + uploadUrl + 
      "&title=" + uploadTitle + "&poster=" + uploadPoster + "&gfyid=" + shareGfy.gfyName + "&flow=details", "_blank", "innerHeight=595, width=520");
  };

  $scope.onEmbedCodeCopy = function(field) {
    $scope.viewService.sendEvent({
      event: 'copy_embedURL',
      field: field
    });
  };

  $scope.videoAutoIndexRight = function(newGfyId) {

    var atStartAlready = false;
    var endOfList = 8;
    var gfyFoundInList = false;
    if (newGfyId) {
      var len = $scope.feeds.videoPageList.length;
      for (var i = 0; i < len; i++) {
        if ($scope.feeds.videoPageList[i].gfyId == newGfyId) {
          if (parseInt($scope.feeds.videoPageList.start) == i) atStartAlready = true;
          else $scope.feeds.videoPageList.start = i;
          gfyFoundInList = true;
          break;
        }
      }
    }    else $scope.feeds.videoPageList.start += 1;

    //console.log($scope.feeds.videoPageList);
    if ($scope.feeds.videoPageList.length - $scope.feeds.videoPageList.start <= 6) $scope.feeds.videoPageList.reachedEnd = true;
    if ($scope.feeds.videoPageList.start >= $scope.feeds.videoPageList.length) {
      $scope.feeds.videoPageList.start = 0;
      if ($scope.feeds.videoPageList.length > 6) $scope.feeds.videoPageList.reachedEnd = false;
    } // go back to the start

    //console.log('fred');
    //console.log($scope.feeds.videoPageList[$scope.feeds.videoPageList.start]);
    //console.log($scope.feeds.videoPageGfyFrame);
    if (newGfyId != $scope.feeds.videoPageGfyFrame.gfyId || !gfyFoundInList) $scope.feeds.videoPageGfyFrame = $scope.feeds.videoPageList[$scope.feeds.videoPageList.start];
    var myrand = '?m=';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) myrand += possible.charAt(Math.floor(Math.random() * possible.length));
    if ($scope.accountTree.loggedIntoAccount)
        if(oauthTokenService.isUserLoggedIn()) {
            $http.get('https://api.gfycat.com/v1/me/gfycats/' + $scope.feeds.videoPageGfyFrame.gfyName + '/full' + myrand).success(function (data) { // on successful get request populate the data
                $scope.feeds.videoPageGfyFrame.likeState = data.gfyItem.likeState;
                $scope.feeds.videoPageGfyFrame.bookmarkState = data.gfyItem.bookmarkState;
            });
        }

    if (!atStartAlready) {
      var newpath = '/' + $scope.feeds.videoPageGfyFrame.gfyName;
      if (window.history.replaceState) {//prevents browser from storing history with each change:
        window.history.replaceState({}, '', newpath);
      }
    }

    //$scope.feeds.clearPageVid = true;

    $scope.resetGfyVideoPageTimer();
    if ($scope.feeds.videoPageList.start > $scope.feeds.videoPageList.length - endOfList) { // check if we are near the end of the current list and try to get some more gfys
      if (!$scope.feeds.videoPageList.loading && $scope.feeds.videoPageList.cursor != 'end') {
        $scope.feeds.loadGfysForVideoPage($scope.feeds.videoPageList, $scope.feeds.videoPageList.headingIndex);
        $scope.feeds.videoPageList.reachedEnd = false;
      }
    }

    //console.log('did timer reset');
    //$scope.$apply(); // if we click too fast we are still in previous apply() function
  };

  $scope.resetGfyVideoPageTimer = function() {
    //console.log("resetting timer");
    //clearInterval($scope.feeds.videoPageTimer); // need to clear this or we have multiple timers running somehow...probably pointers or something wierd
    // timing algorithms
    if ($scope.feeds.videoPageGfyFrame.numFrames != undefined && $scope.feeds.videoPageGfyFrame.numFrames != 0 && $scope.feeds.videoPageGfyFrame.frameRate != undefined && $scope.feeds.videoPageGfyFrame.frameRate != 0) {
      var interval = parseInt($scope.feeds.videoPageGfyFrame.numFrames) / parseInt($scope.feeds.videoPageGfyFrame.frameRate);
      if (interval < 2) $scope.feeds.videoGfyLoops = 7;
      else if (interval <= 3) $scope.feeds.videoGfyLoops = 5;
      else if (interval <= 5) $scope.feeds.videoGfyLoops = 3;
      else if (interval <= 10) $scope.feeds.videoGfyLoops = 2;
      else $scope.feeds.videoGfyLoops = 1;
      $scope.feeds.videoIntervalTime = interval * $scope.feeds.videoGfyLoops * 1000;
    }    else {
      $scope.feeds.videoGfyLoops = 1;
      $scope.feeds.videoIntervalTime = 15000;
    }

    //console.log("timer:"+$scope.feeds.videoGfyLoops);
    //$scope.feeds.videoPageTimer = setInterval(function () {
    //    $scope.videoAutoIndexRight();
    //}, $scope.feeds.videoIntervalTime);//15 seconds is all you get
  };

  $scope.enableVideoPageAutoPlay = function() {
    $scope.feeds.videoPageAutoPlay = !$scope.feeds.videoPageAutoPlay;
    if ($scope.feeds.videoPageAutoPlay) {
      //$scope.feeds.clearPageVid = true;
      //setTimeout($scope.updateVidclear, 1);
      $scope.resetGfyVideoPageTimer();
      $scope.videoAutoIndexRight($scope.feeds.videoPageGfyFrame.gfyId);
      checkLoad();//need to make sure the progress bar is running
      //console.log('indexed right');
    }

    //else clearInterval($scope.feeds.videoPageTimer);
  };

}).filter('escape', function() {

  return function(input) {
    if (!input || input == 'null') {
      return '';
    } else {
      return window.encodeURIComponent(input);
    }
  };

});//end javascript wrapper function
