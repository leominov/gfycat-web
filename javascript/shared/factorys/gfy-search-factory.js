angular.module('gfycat.shared').factory('searchFactory', ['$http', 'gfyAnalytics','$q', function($http, gfyAnalytics,$q) {

  // caching the service to share data with details page
  var currentSearchCache = {};

  var getPagedSearchService = function(searchRequest, stateName) {
    var cache = currentSearchCache[stateName + 'paged'];
    if (cache === undefined) {
      cache = new PagedSearchService(searchRequest, stateName, true);
      currentSearchCache[stateName + 'paged'] = cache;
    }

    if (searchRequest != cache.searchRequest) {
      cache.reset(searchRequest);
    }

    return cache;
  };

  var PagedSearchService = function(searchRequest, stateName) {
    this.gfycats = [];
    this.busy = false;
    this.searchRequest = searchRequest;
    this.numberOfVideosToLoad = 24;
    this.noNextPage = false;
    this.start = 0;

    if (stateName === 'search.detail') {
      this.stateName = 'search';
    } else if (stateName === 'tag.detail') {
      this.stateName = 'tag';
    } else {
      this.stateName = stateName;
    }
  };

  PagedSearchService.prototype.reset = function(searchRequest) {
    this.searchRequest = searchRequest;
    this.noNextPage = false;
    this.gfycats = [];
    this.foundCount = null;
    this.start = 0;
  };

  PagedSearchService.prototype.nextPage = function(page, count) {
    if (count) this.numberOfVideosToLoad = count;
    if (page) this.start = this.numberOfVideosToLoad * page;

    if (this.busy) return;
    this.busy = true;

    this.loadNextPage(this.createRequestUrl(), this.createParams(this.numberOfVideosToLoad, this.start));
  };

  PagedSearchService.prototype.createRequestUrl = function() {
    var url = 'https://api.gfycat.com/v1';
    if (this.stateName == 'search') {
      url += '/gfycats/search';
    }
    if (this.stateName == 'tag') {
      url += '/gfycats/trending';
    }
    if (this.stateName == 'user') {
      url += '/users/' + this.searchRequest + '/gfycats';
    }
    return url;
  };

  PagedSearchService.prototype.createParams = function(count, start) {
    var params = {
      count: count,
      start: start
    };

    if (this.stateName == 'search') {
      params.search_text = this.searchRequest;
    }
    if (this.stateName == 'tag') {
      params.tagName = this.searchRequest.toLowerCase() === 'trending' ? "" : this.searchRequest;
    }
    return params;
  };

  PagedSearchService.prototype.loadNextPage = function(url, params) {
    var self = this;

    $http.get(url, {
        params: params
      }).success(function(data) {
          self.busy = false;
          if (data && data.gfycats) {
            self.start += data.gfycats.length;
            self.foundCount = UTIL.toLocaleNumber(data.found);
            data.gfycats.forEach(function(item) {
              self.gfycats.push(item);
            });
            self.noNextPage = false;
          }
          if (data && (!data.gfycats || data.gfycats.length === 0)) {
            self.noNextPage = true;
          }
    });
  };

  var getSearchService = function(searchRequest, stateName) {
    //console.log("Get ", searchRequest, stateName);

    var cache = currentSearchCache[stateName];
    if(cache === undefined) {
      cache = new SearchService(searchRequest,stateName);
      currentSearchCache[stateName] = cache;
    }

    if(searchRequest != cache.searchRequest) {
      cache.reset(searchRequest);
    }

    return cache;
  };

  var SearchService = function(searchRequest, stateName) {
    this.gfycats = [];
    this.busy = false;
    this.cursor = null;
    this.searchRequest = searchRequest;
    this.numberOfVideosToLoad = 30;
    this.noNextPage = false;

    if (stateName === 'search.detail') {
      this.stateName = 'search';
    } else if (stateName === 'tag.detail') {
      this.stateName = 'tag';
    } else {
      this.stateName = stateName;
    }
  };

  SearchService.prototype.reset = function(searchRequest) {
    this.cursor = null;
    this.searchRequest = searchRequest;
    this.noNextPage = false;
    this.gfycats = [];
    this.foundCount = null;
  };

  SearchService.prototype.nextPage = function(count) {
    var count = (count != undefined) ? count : this.numberOfVideosToLoad;

    if (this.busy) return;
    this.busy = true;

    this.loadNextPage(this.createRequestUrl(), this.createParams(count));
  };

  SearchService.prototype.createRequestUrl = function() {
    var url = 'https://api.gfycat.com/v1';
    if (this.stateName == 'search') {
      url += '/gfycats/search';
    }
    if (this.stateName == 'tag') {
      url += '/gfycats/trending';
    }
    if (this.stateName == 'user') {
      url += '/users/' + this.searchRequest + '/gfycats';
    }
    return url;
  };

  SearchService.prototype.createParams = function(count) {
    var params = {  count: count  };

    if(this.cursor) {
      params.cursor = this.cursor;
    }

    if (this.stateName == 'search') {
      params.search_text = this.searchRequest;
    }
    if (this.stateName == 'tag') {
      params.tagName = this.searchRequest.toLowerCase() === 'trending' ? "" : this.searchRequest;
    }
    return params;
  };

  SearchService.prototype.loadNextPage = function(url, params) {
    var self = this;

    if (this.cursor === '') {
      self.noNextPage = true;
      return;
    }

    $http.get(url, {
        params: params
      }).success(function(data) {
            self.busy = false;
            if (data && data.gfycats) {
              self.foundCount = UTIL.toLocaleNumber(data.found);
              data.gfycats.forEach(function(item) {
                self.gfycats.push(item);
                self.cursor = data.cursor;
              });
              self.noNextPage = false;
            }
            if (data && (!data.gfycats || data.gfycats.length === 0)) {
              self.noNextPage = true;
            }
    });
  };

  return {
    getSearchService: getSearchService,
    getPagedSearchService: getPagedSearchService
  };

}]);
