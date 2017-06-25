/**
* Created by dave on 2015-01-06.
*/
angular.module('gfycatApp').controller('channelsPageController', function($scope, gfyHttpFactory,gfyFeeds) {
  $scope.feeds = gfyFeeds;
  if (UTIL.isEmptyObj($scope.feeds.channels)) {
    $scope.feeds.channels = new gfyHttpFactory.Tags();
    $scope.feeds.channels.nextPage(12,1);
  }
});
