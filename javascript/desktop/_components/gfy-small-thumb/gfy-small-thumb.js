/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycatApp').directive("gfySmallThumb",
 ['gfyAnalytics', function(gfyAnalytics) {
  return {
    restrict: 'E',
    templateUrl: function(elem, attrs) {
      if (attrs.noreflow) {
        return '/javascript/desktop/_components/gfy-small-thumb/gfy-small-thumb-noreflow.html';
      } else {
        return '/javascript/desktop/_components/gfy-small-thumb/gfy-small-thumb.html';
      }
    },
    scope: {
      data: '=',
      showVideoInfo: '=',
      roundBorder: '=',
      videoSize: '@',
      link: '=',
      maxTags: '='
    },
    link: function(scope, elem, attrs) {
      var img = elem.find('img')[0];
      img.onerror = function() {
        console.error('Error loading mobile image url, using poster image url instead.');
        scope.imageUrl = scope.data.posterUrl;
        img.src = scope.posterUrl;
        img.onerror = null;
      };

      if (attrs.noreflow) {
        var imageContainer = angular.element(img).parent();
        var aspectRatio = (scope.data.height / scope.data.width * 100) + '%';
        imageContainer.css('padding-bottom', aspectRatio);
      }

      var makeAltText = function(data) {
        if (!data) return "";

        if (data.description) return data.description;

        var altText = "";
        var altKeywords = [];
        if (data.tags && data.tags.length) {
          altKeywords = altKeywords.concat(data.tags);
        }

        if (data.title && data.title.toLowerCase() !== 'untitled') altKeywords.push(data.title);
        if (data.languageCategories && data.languageCategories.length) {
          altKeywords = altKeywords.concat(data.languageCategories);
        }
        if (data.languageText) {
          altKeywords = altKeywords.concat(data.languageText.split(' '));
        }
        if (data.extraLemmas) {}
        if (data.subreddit) altKeywords.push(data.subreddit);

        altText = $.unique(altKeywords).join(', ');

        elem.find('img')[0].alt = altText;
      };

      makeAltText(scope.data);
    },
    controller: function($scope, $rootScope) {
      // Additional variable isVideoInfoShown added.
      // When $scope.showVideoInfo is undefined
      // it could not be assigned due to some 2-way binding issues
      $scope.infoVisible = ($scope.showVideoInfo === undefined) ? false : $scope.showVideoInfo;
      $scope.title = $scope.data.title &&
        $scope.data.title.toLowerCase() != 'untitled' ? $scope.data.title : '';
      $scope.maxNumTags = $scope.maxTags ? $scope.maxTags : 4;

      $scope.checkVideoInfoExists = function() {
        if ($scope.title || $scope.data.tags && $scope.data.tags.length) {
          $scope.noInfo = false;
          return;
        }
        $scope.noInfo = true;
      };

      /**
      * Checks if tag is valid
      * @param {String} tag
      * @return {Boolean}
      */
      $scope.isValidTag = function(tag) {
        // Tag must contain 4+ letters
        var regEx = /.*([a-zA-Z].*){4,}/;
        return tag && tag.length >= 4 && regEx.test(tag);
      };

      /**
      * Parses title to generate tags
      * @param {Number} numOfTags - max number of tags to generate
      * @param {Object} uniqueTags - unique existing tags
      * @return {Array} array of tags generated from title
      */
      $scope.parseTitle = function(numOfTags, uniqueTags) {
        if (!$scope.title || !numOfTags) return [];
        var titleTags = {},
            titleSplit = $scope.title.toLowerCase().split(/[^\w-]/);
        for (var i = 0; i < titleSplit.length; i++) {
          var newTag = titleSplit[i];
          if (!numOfTags) break;

          if ($scope.isValidTag(newTag) && !titleTags[newTag] && !uniqueTags[newTag]) {
            titleTags[newTag] = true;
            uniqueTags[newTag] = true;
            numOfTags--;
          }
        }
        return Object.keys(titleTags);
      };

      $scope.generateTags = function() {
        var data = $scope.data;
        if (!data.tags) data.tags = [];

        if (data.tags.length < $scope.maxNumTags) {
          var uniqueTags = {};
          for (var i = 0; i < data.tags.length; i++) {
            if (!uniqueTags[data.tags[i]]) {
              uniqueTags[data.tags[i]] = true;
            }
          }
          var titleTags = $scope.parseTitle($scope.maxNumTags - data.tags.length, uniqueTags);
          data.tags = data.tags.concat(titleTags);
        }
      };

      $scope.mouseEnter = function() {
        if ($rootScope.isMobile) {
          return false;
        }
        $scope.show_video = true;
      };

      $scope.mouseLeft = function() {
        $scope.show_video = false;
      };

      $scope.isVideoShown = function() {
        return $scope.show_video;
      };

      $scope.createUrls = function() {
        if ($scope.data) {
          if ($scope.videoSize == "original") {
            $scope.videoUrl = $scope.data.mobileUrl;
            $scope.videoUrlFull = $scope.data.mp4Url;
            $scope.videoUrlWebm = $scope.data.webmUrl;
            $scope.imageUrl = $scope.data.mobilePosterUrl;
          }

          else if ($scope.videoSize == "fixed") {
            $scope.videoUrl = $scope.data.thumb360Url;
            $scope.videoUrlFull = $scope.data.mp4Url;
            $scope.videoUrlWebm = $scope.data.webmUrl;
            $scope.imageUrl = $scope.data.thumb360PosterUrl;
          }
        }
      };

      $scope.sendTagClickEvent = function(tag) {
        gfyAnalytics.sendEvent({
          event: 'click_tag',
          keyword: tag
        });
      };

      $scope.generateTags();
      $scope.createUrls();
      $scope.checkVideoInfoExists();
    }
  };
}]);
