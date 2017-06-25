/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycatApp').directive("gfyAlbumThumb", function(gfyAnalytics) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: '/javascript/desktop/_components/gfy-album-thumb/gfy-album-thumb.html',
    scope: {
      cover: '=',
      data: '=',
      openAlbum: '&'
    },
    controller: function($scope) {
      $scope.albumTitle = $scope.data.albumTitle ? $scope.data.albumTitle : $scope.data.title;
      $scope.albumDescription = $scope.data.albumDescription ? $scope.data.albumDescription : null;
      //$scope.albumId = $scope.data.albumId ? $scope.data.albumId : $scope.data.id;

      $scope.makeAltText = function(data) {
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

        return $.unique(altKeywords).join(', ');
      };

      $scope.altText = $scope.makeAltText($scope.data);

      $scope.mouseClick = function() {
        console.log('click!: ', $scope.openAlbum);
      };

      $scope.mouseEnter = function() {
        $scope.show_video = $scope.videoUrl ? true : false;
        gfyAnalytics.fetchAndSendViewCount($scope.data.gfyId);
      };

      $scope.mouseLeft = function() {
        $scope.show_video = false;
      };

      $scope.isVideoShown = function() {
        return $scope.show_video;
      };

      $scope.createUrls = function() {
        if ($scope.data) {
          $scope.imageUrl = $scope.data.mobilePosterUrl ? $scope.data.mobilePosterUrl : $scope.data.coverImageUrl;
          $scope.videoUrl = $scope.data.mobileUrl ? $scope.data.mobileUrl : null;
        }
      };

      $scope.createUrls();
    }
  };
});
