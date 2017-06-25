/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycatApp').controller('searchCtrl',
    function($scope, $stateParams, $state, searchFactory, $rootScope, gfyAnalytics) {
  $scope.params = $stateParams;
  $scope.page = ($stateParams.page === undefined) ? 0 : $stateParams.page;
  $scope.params.path = $scope.params.path.split('-').join(' ');
  if ($state.current.name === 'tag') {
    $scope.searchService = searchFactory.getSearchService($stateParams.path, $state.current.name);
  } else {
    $scope.searchService = searchFactory.getPagedSearchService($stateParams.path, $state.current.name);
  }
  $scope.searchService.reset($stateParams.path);
  $state.current.title = $scope.params.path + ' GIFs | Create, Share & Browse GIFs on Gfycat';
  $scope.username = ($state.current.name == "user") ? $scope.params.path : "";
  $scope.tagname = ($state.current.name == "tag") ? $scope.params.path : "";
  $scope.query = ($state.current.name == "search") ? $scope.params.path : "";
  $scope.translationData = {query: $scope.query};
  $scope.isMouseOverThumb = false;
  $scope.toLocaleNumber = UTIL.toLocaleNumber;
  //$scope.search = {foundCount: $scope.searchService.foundCount};
  $scope.stateName = $state.current.name;
  if ($state.current.name === 'search') {
    $rootScope.searchText = $stateParams.path;
  }

  gfyAnalytics.sendEvent({
    event: 'view_search_results',
    keyword: $scope.params.path
  });

  $scope.loadNextPage = function(numberOfVideosToLoad) {
    if (!$scope.isNoNextPage()) {
      //console.log("LOAD MORE***", $scope.params.page);
      if ($state.current.name === 'tag') {
        $scope.searchService.nextPage(numberOfVideosToLoad);
      } else {
        $scope.searchService.nextPage($scope.page, numberOfVideosToLoad);
        $rootScope.lastPage = Math.ceil(Number($scope.searchService.foundCount) / $scope.searchService.numberOfVideosToLoad);
        $scope.page = Number($scope.page) + 1;
      }
    }
  };

  $scope.getAllLoadedVideos = function() {
    return $scope.searchService.gfycats;
  };

  $scope.getSearchRequest = function() {
    return $scope.params.path;
  };

  $scope.isNextPageLoading = function() {
    return $scope.searchService.busy;
  };

  $scope.isNoNextPage = function() {
    return $scope.searchService.noNextPage;
  };

  $scope.generateURL = function(card) {
    return $state.href($state.current.name + ".detail", { path: $scope.params.path, gfyname: card.gfyName });
  };

  $scope.sendViewAnalytics = function(gfyId) {
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
        keyword: $scope.query || $scope.tagname,
        context: $state.current.name
      }
    );
  };

  $scope.onMouseLeaveThumb = function() {
    $scope.isMouseOverThumb = false;
  };
});
