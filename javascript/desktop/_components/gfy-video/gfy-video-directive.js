/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

(function($angular) {

  'use strict';

  var app = $angular.module('gfyVideo', []);

  /**
   * @constant ngVideoConstants
   * @type {Object}
   */
  app.constant('ngVideoConstants', {

    /**
     * @property restrict
     * @type {String}
     */
    RESTRICT: 'EA',

  });

  app.constant('ngVideoOptions', {
    RESTRICT: 'CA',
    REFRESH: 50,
    SCREEN_DIRECTIVE: 'vi-screen',
    SCREEN_CHANGE: true,
    TIMELINE_CHANGE: true,
    VOLUME_STEPS: 0.1,
    VOLUME_MINIMUM: 0,
    VOLUME_MAXIMUM: 1,
    BUFFER_COLOUR: '#dd4b39',
    BUFFER_HEIGHT: 1,
    BUFFER_WIDTH: 485,
  });

  /**
   * @directive ngVideo
   * @type {Function}
   * @param video {Object}
   * @param ngVideoPlaylist {Array}
   * @param ngVideoConstants {Object}
   */
  app.directive('gfyVideo', ['$sce', '$timeout', 'ngVideoConstants', 'gfyFeeds', function VideoDirective($sce, $timeout, gfyFeeds, ngVideoConstants) {

    return {

      /**
       * @property restrict
       * @type {String}
       * @default "CA"
       */
      restrict: ngVideoConstants.RESTRICT,

      /**
       * @property scope
       * @type {Object}
       */
      scope: {
        interface: '=ngModel',
        gfyobject: '=',
        dial: '&',
      },

      /**
       * @property require
       * @type {String}
       */
      require: '?ngModel',

      /**
       * @property transclude
       * @type {Boolean}
       */
      transclude: true,

      /**
       * @property template
       * @type {String}
       */
      templateUrl: '/javascript/desktop/_components/gfy-video/gfy-video-template.html',

      replace: true,
      /**
       * @property controller
       * @type {Array}
       */
      controller: ['$scope', 'gfyFeeds', 'gfyModalMachine', function controller($scope, gfyFeeds, gfyModalMachine) {

        /**
         * @property isPaused
         * @type {Boolean}
         */
        $scope.feeds = gfyFeeds;

        $scope.isPaused = false;

        $scope.isReverse = false;

        $scope.gfyModalMachine = gfyModalMachine;

        /**
         * @property collection
         * @type {Array}
         */
        $scope.collection = [];

        /**
         * @property videoElement
         * @type {HTMLElement}
         */
        $scope.videoElement = {};

        /**
         * @method trustResource
         * @param resourceUrl {String}
         * @return {Object}
         */
        $scope.trustResource = function trustResource(resourceUrl) {
          return $sce.trustAsResourceUrl(resourceUrl);
        };

        $scope.gfyobject = gfyFeeds.videoPageGfyFrame;

        $scope.resizedGfyWidth = null;
        $scope.resizedGfyHeight = null;

        //$scope.setOriginalWidth = function() {
        //  // (Jason - Feb 19, 2015)
        //  var arrowBuffer = 200; // sum of left/right margins of .vidWrap (buffer for the next/prev arrows)
        //  var gfyWidth = 642,
        //      element = $('.ng-modal.player .ng-modal-dialog'),
        //      maxSize = $(window).width() - 30, // minus 30ish pixels to prevent horizontal scrollbars
        //      gfyHeight = 642,
        //      finalHeight,
        //      finalWidth;
        //
        //  // Drag to zoom re-sized if applicable
        //  if ($scope.resizedGfyWidth) {
        //    gfyWidth = $scope.resizedGfyWidth;
        //    gfyHeight = $scope.resizedGfyHeight;
        //  } else if (gfyFeeds.videoPageGfyFrame) {
        //    gfyWidth = gfyFeeds.videoPageGfyFrame.width;
        //    gfyHeight = gfyFeeds.videoPageGfyFrame.height;
        //  }
        //
        //  finalWidth = gfyWidth + arrowBuffer;
        //
        //  // set min-width of video
        //  if (gfyWidth + arrowBuffer < 640) {
        //    finalWidth = 640;
        //  }
        //
        //  var sizeSwitch = $scope.sizeMode % 2;
        //
        //  // If the vid's width is greater than the screen, limit the size. Otherwise, set the original width.
        //  // On first view, sizeMode == 1, do not fit to screen but show original size if smaller
        //  // and fit to screen if _larger_
        //  // After that, toggle between original size and fit to screen.
        //  if (($scope.sizeMode == 1 || sizeSwitch != 1) && gfyWidth + arrowBuffer > maxSize) {
        //    finalWidth = maxSize;
        //  }
        //
        //  var sizeSwitch = $scope.sizeMode % 2;
        //
        //  // Override if we switched gfycats and left the modal in a resized state
        //  if ((sizeSwitch == 0 && !$scope.resizedGfyHeight) || !gfyFeeds.videoPageGfyFrame) {
        //    $scope.sizeMode = 1;
        //    sizeSwitch = 1;
        //  }
        //
        //  if (sizeSwitch == 0 && gfyFeeds.videoPageGfyFrame.height && $scope.resizedGfyHeight < ((finalWidth / gfyFeeds.videoPageGfyFrame.width) * gfyFeeds.videoPageGfyFrame.height)) {
        //    finalWidth = gfyFeeds.videoPageGfyFrame.width * ($scope.resizedGfyHeight / gfyFeeds.videoPageGfyFrame.height);
        //  }
        //
        //  // (Jason - March 4th, 2014)
        //  // set the video to 77% of the screen to account for the sidebar of thumbnails
        //
        //  // adjust main video margin (mainly for albums)
        //  // NOTE: The dual scrollbar shouldn't appear unless the video is actually out of view
        //
        //  //console.log('modal-dialog height = ' + (element.offset().top + element.height() + 100));
        //  //console.log('window height = ' + $(window).height());
        //  var margin = '40px auto 0px'; // default margin for video page
        //  var winHeight = $(window).height();
        //  if (gfyModalMachine.modalAlbumPlayerShown) {
        //    finalWidth = finalWidth * 0.77;
        //    margin = '140px auto 100px'; // default 'album' margin to ensure the album title is always displayed while centering video, for large screens
        //    var elementFullHeight = (140 + element.height() + 100); // 140/100 (top/bottom margins)
        //    if (elementFullHeight > $(window).height()) {
        //      // if the excess margins create a dual scrollbar, then adjust the margins to remove it
        //      var topMarginAdjust = 140 - (elementFullHeight - winHeight);
        //
        //      // set the minimum margin-top required to display the album title
        //      if (topMarginAdjust <= 140)
        //          topMarginAdjust = 140;
        //      margin = topMarginAdjust + 'px auto 0';
        //    }
        //  }
        //
        //  return {
        //    //display: $scope.master.display,
        //    //backgroundColor: "#333",
        //    width: finalWidth + 'px',
        //    margin: margin,
        //
        //    //height: finalHeight + 'px',
        //    color: '#FFF',
        //  };
        //};

        $scope.refreshAlbumPage = function(GfyFrame, index) {
          if (GfyFrame != undefined) {
            gfyFeeds.albumPageAlbumInfo.albumAutoPlay = false;
            gfyFeeds.feeds.albumPageGfyFrame = GfyFrame;

            gfyFeeds.feeds.clearAlbumVid = true;

            //setTimeout($scope.updateAlbumClear, 1);

          }
        };

        /**
         * @method getControls
         * @return {Object}
         */
        $scope.getControls = function getControls() {

          return {

            /**
             * @method play
             * @return {void}
             */
            play: function play() {
              $scope.videoElement.play();
              $scope.isPaused = false;
            },

            /**
             * @method pause
             * @return {void}
             */
            pause: function pause() {
              $scope.videoElement.pause();
              $scope.isPaused = true;
            },

            /**
             * @method stop
             * @return {void}
             */
            stop: function stop() {
              $scope.videoElement.pause();
              $scope.isPaused = true;
            },

            /**
             * @method playPause
             * @return {void}
             */
            playPause: function playPause() {

              if ($scope.isPaused) {
                this.play();
                return;
              }

              this.pause();

            },

          };

        };

        /**
         * @method getSources
         * @returns {Object}
         */
        $scope.getSources = function getSources() {

          return {

            /**
             * @method add
             * @param source {String}
             * @return {String}
             */
            add: function add(source) {
              $scope.collection.push(source);

              var isAutoplay = $scope.videoElement.autoplay === true;

              // Attempt to autoplay the video if it's the only video, there are no videos
              // currently being played, and the `autoplay` option tells us to do so!
              if (isAutoplay && !$scope.video && this.all().length === 1) {
                $scope.video = source;
                $scope.getControls().play();
              }

              return source;

            },

            /**
             * @method remove
             * @param source {String}
             * @return {void}
             */
            remove: function remove(source) {
              var index = $scope.collection.indexOf(source);
              $scope.collection.splice(index, 1);
            },

            /**
             * @method all
             * @return {Array}
             */
            all: function all() {
              return $scope.collection;
            },

            /**
             * @method clear
             * @return {void}
             */
            clear: function clear() {
              $scope.collection.length = 0;
            },

          };

        };

        /**
         * @method getOptions
         * @return {Object}
         */
        $scope.getOptions = function getOptions() {

          return {

            /**
             * @method setAutoplay
             * @param value {Boolean}
             */
            setAutoplay: function setAutoplay(value) {
              $scope.videoElement.autoplay = !!value;
            },

            /**
             * @method isAutoplay
             * @return {Boolean}
             */
            isAutoplay: function isAutoplay() {
              return $scope.videoElement.autoplay;
            },

          };

        };

        /**
         * @method attachInterface
         * @return {void}
         */
        $scope.attachInterface = function attachInterface() {

          /**
           * @property controls
           * @type {Object}
           */
          $scope.interface.controls = $scope.getControls();

          /**
           * @property sources
           * @type {Object}
           */
          $scope.interface.sources = $scope.getSources();

          /**
           * @property options
           * @type {Object}
           */
          $scope.interface.options = $scope.getOptions();

        };

        if ($scope.interface) {

          // Attach the interface to the scope's interface.
          $scope.attachInterface();

          $timeout(function timeout() {

            // Interface's directive has been attached!
            $scope.$emit('$videoReady');
          });

        }

      },],

      /**
       * @method link
       * @param scope {Object}
       * @param element {Object}
       * @return {void}
       */
      link: function link(scope, element, attributes) {
        var obj = scope.$eval(attributes.gfyobject);
        var $vidWrap = element.find('.vidWrap'); // parent element of the video
        var $overlay = element.siblings(); // overlay element

        scope.showGif = false;

        scope.gifSource = ''; // TODO:  Turn this off when the modal closes externally, eg from a route change

        // Memorize the video element.
        //scope.videoElement = element.find('video')[0];
        //scope.videoElement = onloadeddata = function() {
        //    $(":root").css('background-color', 'white');
        // };

        scope.pauseMe = function() {
          var vid = document.getElementById('modalVid');
          vid.pause();
        };

        // Show as gif skipping angular functions for now, because otherwise
        // elements are not in the dom yet (even with ng-if=true) when jquery functions
        // are started.  leaving jquery functions for now
        scope.switchToVid = function() {
          scope.showGif = false;
          angular.element(document.querySelector('#gfycatgif')).hide();
          element.find('video').fadeIn();
          scope.gifSource = ''; // this also must be cleared by calling switchToVid when closing player, or gif stays loading
        };

        scope.switchToGif = function() {
          scope.showGif = true;
          scope.gifSource = scope.gfyobject.gifUrl; // Need to set this only when requested otherwise browser loads huge gif
          element.find('video').hide();
          angular.element(document.querySelector('#gfycatgif')).fadeIn();
          angular.element(document.querySelector('#gfycatgif')).show();
        };

        // Watch the webmUrl for changes (eg reverse video, etc).  Otherwise video will not play
        // when ngsrc var changes
        // We can run a watch on either a string variable or the output of a function
        // webmUrl is a string, but gfyobject might not exist yet, so we need to write
        // watch using a function.  watch(function_to_watch, function_to_act)
        // if webmUrl exists we watch that, otherwise just watch the object

        scope.$watch(function() {if (scope.gfyobject && scope.gfyobject.hasOwnProperty('webmUrl'))
                                    return scope.gfyobject.webmUrl;
          else
              return scope.gfyobject;
        }, function() {

          scope.$evalAsync(function() {
            if (scope.gfyobject && scope.gfyobject.hasOwnProperty('webmUrl')) {
              var vid;
              if (vid = element.find('video')[0]) {
                scope.$apply();
                vid.load();
                vid.play();
                scope.loadingStart = new Date().getTime();
                scope.loadedPercent = 1;
                scope.resizedGfyHeight = null;
                scope.resizedGfyWidth = null;
                updateLoadingBar();

                //scope.sizeMode = 1;
                //scope.dblClickVid();
              }
            }

          });
        });

        scope.$watch(function() {
          if (scope.gfyModalMachine.modalAlbumPlayerShown)
              return true;
          else {
            var vid;
            if (vid = element.find('video')[0]) {
              vid.removeEventListener('timeupdate', vidTimeHandler, false);
            }

            return false;
          }
        }, function() {

          scope.$evalAsync(function() {

            checkLoad();
            if (scope.gfyModalMachine.modalAlbumPlayerShown) {
              element.find('video')[0].play();

              //scope.videoElement.play();
            } else {
              //scope.feeds.clearAlbumVid = false;
              //if(document.getElementById("albumVid0"))
              //    document.getElementById("albumVid0").play();
            }
          });
        });

        scope.albumNextButton = function() {
          scope.feeds.albumPageAlbumInfo.albumAutoPlay = false;
          scope.albumNext();
        };

        scope.albumPrevButton = function() {
          scope.feeds.albumPageAlbumInfo.albumAutoPlay = false;
          scope.albumPrev();
        };

        scope.albumNext = function() {
          scope.feeds.albumIndex++;
          if (scope.feeds.albumIndex > scope.feeds.albumPageFullList.length - 1)
              scope.feeds.albumIndex = 0;
          scope.feeds.albumPageGfyFrame = scope.feeds.albumPageFullList[scope.feeds.albumIndex];
          scope.feeds.clearAlbumVid = true;
        };

        scope.albumPrev = function() {
          scope.feeds.albumIndex--;
          if (scope.feeds.albumIndex < 0)
              scope.feeds.albumIndex = scope.feeds.albumPageFullList.length - 1;
          scope.feeds.albumPageGfyFrame = scope.feeds.albumPageFullList[scope.feeds.albumIndex];
          scope.feeds.clearAlbumVid = true;
        };

        //(Jason - Feb 19, 2015)
        //When the video has loaded, hide the loading animation, and show the close button, video itself, and the ad
        checkLoad();

        // Defined in a var and setup through checkLoad()
        // When it is a var, we can also remove it
        //var vidEndHandler = function () {
        //    console.log('album ended event');
        //    if(!scope.gfyModalMachine.modalAlbumPlayerShown)
        //        return;
        //    if(scope.feeds.albumPageAlbumInfo.albumAutoPlay)
        //        scope.albumNext();
        //    else {
        //        scope.feeds.albumPlayPercent = 0;
        //        scope.videoElement.load();
        //        scope.videoElement.play();
        //    }
        //};

        var vidTimeHandlerMaxFound = 0; // check if the video looped

        var vidTimeHandler = function() {
          var vid = element.find('video')[0];
          if (!scope.gfyModalMachine.modalAlbumPlayerShown)
              return;
          scope.currentPlayPercent = Math.floor((100 / vid.duration) * vid.currentTime);
          if (scope.gfyModalMachine.modalAlbumPlayerShown) {
            scope.feeds.albumPlayPercent = scope.currentPlayPercent;
          }

          if (scope.feeds.albumPageAlbumInfo && scope.feeds.albumPageAlbumInfo.albumAutoPlay) {
            if (vid.duration - vid.currentTime < vid.duration / scope.feeds.albumPageGfyFrame.numFrames || vid.currentTime < vidTimeHandlerMaxFound) {
              vidTimeHandlerMaxFound = 0;

              //console.log(scope.videoElement);
              scope.albumNext();
            } else {
              vidTimeHandlerMaxFound = vid.currentTime;
            }
          }

          scope.$apply();
        };

        function checkLoad() {
          if (!scope.gfyModalMachine.modalAlbumPlayerShown)
              return;
          var vid;
          if (vid = element.find('video')[0]) {
            vid.removeEventListener('timeupdate', vidTimeHandler, false);
            scope.vidTimeHandlerMaxFound = 0;

            //scope.videoElement.removeEventListener('ended',vidEndHandler,false);
            vid.addEventListener('timeupdate', vidTimeHandler, false);

            //scope.videoElement.addEventListener('ended', vidEndHandler, false);

            updateLoadingBar();

            // IE and Safari do not recognize readystate.
            // Safari also does not recognize loadedmetadata.  Safest way
            // without much more testing is
            // ust to let the browser try to play
            // scope.videoElement.addEventListener('loadedmetadata', function () {
            element.find('.loading').hide();
            element.find('video').fadeIn();
            element.find('.header').fadeIn();

            //// position the ad (if it's smaller than the container, needs to be hacked into into position)
            var $ad = $('#modalAd');

            //if ($(scope.videoElement).width() < $ad.width())
            //    $ad.addClass('smallVidStyle').css('margin-left', $ad.width() * -0.5);
            //else if ($ad.width() == 0) // HACK - the ad hasn't loaded, so hardcode the ad to the min-width
            //    $ad.css('max-width', '640px').find('img').css('width','100%');
            vid.load();
            vid.play();
            $ad.fadeIn();

        //});

          } else {
            setTimeout(checkLoad, 10);
          }
        }

        scope.loadedPercent = 1;
        scope.showLoadingBar = false;
        scope.loadingStart = new Date().getTime();

        function updateLoadingBar() {

          var vid = element.find('video')[0];
          var buffer_range = vid.buffered;
          var total = vid.duration;

          // Only show the loading bar if it is taking time to load this clip
          var loadingNow = new Date().getTime();
          if (loadingNow - scope.loadingStart > 2000) {
            scope.showLoadingBar = true;
          }

          try {
            var start = buffer_range.start(0);

            //var start = buffer_range.start(0);
            var end = buffer_range.end(0);
            scope.loadedPercent = Math.floor(100 * end / total);
          } catch (e) {
          }

          if (!(scope.loadedPercent > 98)) {
            setTimeout(function() {updateLoadingBar();}, 100);
          } else {
            scope.showLoadingBar = false;
          }
        }

        // (Jason - Feb 19, 2015)
        // display menu and shadow on hover
        $('.ng-modal.player .vidWrap, .ng-modal.player .menuBar').mouseenter(function() {
          clearTimeout($vidWrap.data('timeoutId'));
          $vidWrap.addClass('hovering');
          $overlay.removeClass('showBackside');
        }).mouseleave(function() {
          var timeoutId = setTimeout(function() {
            $vidWrap.removeClass('hovering');
          }, 600);

          //set the timeoutId, allowing us to clear this trigger if the mouse comes back over
          $vidWrap.data('timeoutId', timeoutId);
        });

        $('#playerStillLoading').hide();
        scope.mouseIsDown = false;
        scope.overScrub = false;
        scope.mouseDownX = 0;
        scope.offsetX = 0;

        /*
         * Scrub bar mouse actions.   Can click anywhere in the containing, larger rectangle div around progress bar
         * Dragging function is attached to full content window, so once clicked 'down', can drag left or right even
         * outside of the scrub bar
         */
        scope.scrubMouseDown = function(e) {
          var vid = element.find('video')[0];
          var x1 = e.offsetX == undefined ? e.layerX : e.offsetX;
          var target  = e.target || e.srcElement,
              rect    = target.getBoundingClientRect(),
              x = e.clientX - rect.left;

          scope.mouseIsDown = true;
          var percent = Math.floor(100 * (x / $('#scrubBar').width()));
          vid.pause();
          scope.mouseDownX = e.pageX;
          scope.offsetX = x;
          vid.currentTime = (vid.duration * percent / 100);

        };

        scope.pageMouseUp = function(event) {
          activeDragX = null;
          scope.mouseIsDown = false;
          if (!scope.isPaused)
              scope.play();
        };

        scope.scrubMouseLeave = function(event) {
          activeDragX = null;
          scope.overScrub = false;
        };

        scope.pageMouseLeave = function(event) {
          scope.overScrub = false;
          scope.pageMouseUp(event);
        };

        scope.scrubMouseEnter = function() {
          scope.overScrub = true;
        };

        scope.pageMouseMove = function(event) {
          var vid = element.find('video')[0];
          if (scope.mouseIsDown) {
            var deltaX = scope.mouseDownX - event.pageX;

            var percent = Math.floor(100 * ((scope.offsetX - deltaX) / $('#scrubBar').width()));
            vid.currentTime = (vid.duration * percent / 100);
          }
        };

        var activeDragX = null;
        var activeDragY = null;
        var animFrameRequest = null;
        var activeDragSX = null;
        var activeDragSY = null;
        var Xo = null;
        var Yo = null;
        var Xi = null;
        var Yi = null;

        scope.sizeMode = 1;

        /*
         * Video drag to zoom functions
         */
        scope.mouseDownVid = function(e) {
          var vid = element.find('video')[0];

          // left click
          if (e.which !== 1)
              return;

          // Store distance of starting click from boundaries for a more natural feeling drag.
          var p = Math.pow;
          var rc = e.currentTarget.getBoundingClientRect();
          activeDragX = e.clientX;
          activeDragY = e.clientY;

          //if(isVidCreated) {
          activeDragSX = $(vid).width();
          activeDragSY = $(vid).height();

          //} //else {
          ///  activeDragSX = gif.width;
          //  activeDragSY = gif.height;
          //}
          Xo = rc.left + rc.width / 2;
          Yo = rc.top + rc.height / 2;
          Xi = e.clientX;
          Yi = e.clientY;

          //window.addEventListener('mousemove',mouseMoveVid);
          //window.addEventListener('mouseup',mouseUpVid);

        };

        scope.mouseUpVid = function(e) {
          // left click
          if (e.which !== 1)
              return;

          if (activeDragX != e.clientX) {
            activeDragX = null;
            return;
          }

          activeDragX = null;

          if (scope.overScrub == true)
                  return;
          if (scope.isPaused) {
            scope.play();
            return;
          }

          scope.pause();

        };

        scope.mouseMoveVid = function(e) {
          if (!activeDragX)
              return;

          // check if in controls area
          scope.sizeMode = 1;
          if (animFrameRequest) window.cancelAnimationFrame(animFrameRequest);
          animFrameRequest = window.requestAnimationFrame(function() {
            //var mult = getDragSize(e);
            //if (mult > 0){
            //setSize(Math.round(gfyWidth * mult), Math.round(gfyHeight * mult));
            var p = Math.pow;

            //var Xi = (activeDragX - (rc.left+rc.width/2));
            //var Yi = (activeDragY - (rc.top+rc.height/2));
            var Xn = e.clientX;
            var Yn = e.clientY;
            var oldW = activeDragSX;
            var oldY = activeDragSY;
            var x = e.clientX - activeDragX;
            var y = e.clientY - activeDragY;
            var xM = (1 + x / oldW);
            var yM = (1 + y / oldY);
            var mult = Math.max(xM, yM);
            var c = p(p(x, 2) + p(y, 2), .5);
            var Co = p(p(Xi - Xo, 2) + p(Yi - Yo, 2), .5);
            var Cn = p(p(Xn - Xo, 2) + p(Yn - Yo, 2), .5);
            mult = (1 + c / oldW);
            mult = Cn / Co;
            scope.setSize(Math.round(activeDragSX * mult), Math.round(activeDragSY * mult));

            //}

            document.getSelection().removeAllRanges(); // prevent selection
            animFrameRequest = null;
          });

        };

        scope.setSize = function(w, h) {
          //if(w<10||h<10)
          //if(w < 0.25 * gfyWidth)
          //    return;
          if (w < 440)
              return;
          scope.resizedGfyHeight = h;
          scope.resizedGfyWidth = w;
          return;

          if (isVidCreated) {
            vid.width = w;
            vid.height = h;
          } else {
            gif.width = w;
            gif.height = h;
          }

          var intw = Math.round(w);
          var inth = Math.round(h);
          gfyRootElem.style.width = intw + 40 + 'px';
          gfyRootElem.style.height = inth + 60 + 'px';

        };

        scope.dblClickVid = function() {
          scope.sizeMode++;
          var sizeSwitch = scope.sizeMode % 2;
          window.scrollTo(0, 0);
          switch (sizeSwitch) {
            case 1:
              scope.resizedGfyWidth = null;
              scope.resizedGfyHeight = null;
              break;
            case 0:
              scope.setSize($(window).width(), $(window).height());
              break;
          }
        };

        // (Jason - Feb 19, 2015)
        // fade out background when mouse is moving over the overlay
        /*var timer;
        window.addEventListener("mousemove",function(){
            if (!$vidWrap.hasClass('hovering')) {
                $overlay.addClass('showBackside');
                clearTimeout(timer);
                timer = setTimeout(mouseStopped, 1000);
            }
        });
        function mouseStopped() {
            $overlay.removeClass('showBackside');
        }*/

        scope.fullScreen = function() {
          var vid = element.find('video')[0];
          if (vid.requestFullscreen) {
            vid.requestFullscreen();
          } else if (vid.msRequestFullscreen) {
            vid.msRequestFullscreen();
          } else if (vid.mozRequestFullScreen) {
            vid.mozRequestFullScreen();
          } else if (vid.webkitRequestFullscreen) {
            vid.webkitRequestFullscreen();
          }
        };

        scope.playPause = function() {
 	  if(scope.isPaused)
		scope.play();
	  else
		scope.pause();
          return;
          if (!activeDragX)
              return;

        };

        scope.play = function() {
          var vid = element.find('video')[0];
	  vid.load();
          vid.play();
          scope.isPaused = false;
        };

        scope.pause = function() {
          var vid = element.find('video')[0];
          vid.pause();
          scope.isPaused = true;
        };

        scope.setSpeed = function(x) {
          var vid = element.find('video')[0];
          vid.playbackRate = x;
        };

        scope.playReverse = function() {
          var vid = element.find('video')[0];

          //var sourceList = scope.videoElement.getElementsByTagName('source');
          //for(var i=0; i < sourceList.length; i++) {
          scope.gfyobject.webmUrl = scope.gfyobject.webmUrl.replace(/\.webm/g, '-reverse.webm');
          scope.gfyobject.mp4Url = scope.gfyobject.mp4Url.replace(/\.mp4/g, '-reverse.mp4');

          //}
          //scope.videoElement.src = scope.videoElement.src.replace(/\.webm/g,"-reverse.webm");
          //attributes.gfyobject.webmUrl = attributes.gfyobject.webmUrl.replace(/\.webm/g,"-reverse.webm");
          //attributes.gfyobject.mp4Url = gfyobject.mp4Url.replace(/\.mp4/g,"-reverse.mp4");
          vid.playbackRate = 1;
          scope.isReverse = true;
          vid.pause();
          vid.load();
          vid.play();
        };

        scope.playForward = function() {
          var vid = element.find('video')[0];
          var sourceList = vid.getElementsByTagName('source');
          for (var i = 0; i < sourceList.length; i++) {
            //sourceList[i].src = sourceList[i].src.replace(/-reverse\.webm/g,".webm");
            //sourceList[i].src = sourceList[i].src.replace(/-reverse\.mp4/g,".mp4");
            scope.gfyobject.webmUrl = scope.gfyobject.webmUrl.replace(/-reverse\.webm/g, '.webm');
            scope.gfyobject.mp4Url = scope.gfyobject.mp4Url.replace(/-reverse\.mp4/g, '.mp4');
          }

          //scope.videoElement.src = scope.videoElement.src.replace(/-reverse\.webm/g,".webm");
          vid.playbackRate = 1;
          scope.isReverse = false;
          vid.pause();
          vid.load();
          vid.play();
        };

        scope.forwardReverse = function() {
          if (scope.isReverse) {
            scope.playForward();
            return;
          }

          scope.playReverse();
        };

      },

    };

  },]);

})(window.angular);
