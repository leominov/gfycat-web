/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('gfyHttpFactory', ['$http', '$q', '$rootScope', 'oauthTokenService',
  function($http, $q, $rootScope, oauthTokenService) {

  var Tags = function() {
    this.tags = [];
    this.busy = false;
    this.cursor = null;
  };

  Tags.prototype.nextPage = function(tagCount, gfyCount) {
    var defer = $q.defer();
    if (this.busy || this.cursor == "") {
      defer.resolve();
      return defer.promise;
    }
    this.busy = true;

    var url;
    if (gfyCount === undefined) {
      url = 'https://api.gfycat.com/v1/tags/trending/populated';
    } else {
      url = 'https://api.gfycat.com/v1/tags/frontpage';
    }
    var self = this;
    var params = self.cursor ? { tagCount:tagCount, gfyCount:gfyCount, cursor: this.cursor } : { tagCount:tagCount, gfyCount:gfyCount };
    $http.get(url, {
      params:params
    }).success(function(data) {
      data.tags.forEach(function(item) {
        self.tags.push(item);
        self.busy = false;
        self.cursor = data.cursor;
        item.nowIndex = 0;
        item.loadMore = function(count) {
          var innerSelf = this;
          var defer = $q.defer();

          if (innerSelf.cursor == '') {
            innerSelf.noNextPage = true;
            return defer.resolve();
          }

          innerSelf.busy = true;
          count = count ? count : 5;

          $http.get('https://api.gfycat.com/v1/gfycats/trending', {
            params: {
              count: count,
              cursor: innerSelf.cursor,
              tagName: innerSelf.tag === "Trending" ? "" : innerSelf.tag
            },
          }).success(function(tagData) {
            tagData.gfycats.forEach(function(e) {
              innerSelf.gfycats.push(e);
            });

            innerSelf.busy = false;
            innerSelf.cursor = tagData.cursor;

            defer.resolve(innerSelf);
          });

          return defer.promise;
        };
      });

      self.cursor = data.cursor;
      self.busy = false;

      defer.resolve();
    });

    return defer.promise;
  };

  var loadTrendingVideos = function(count, cursor) {
    var gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?count=' + count;
    if (cursor !== undefined) {
      gfyRoute += '&cursor=' + cursor;
    }

    return $http.get(gfyRoute);
  };

  var loadSocialLikes = function(gfycat) {
    var defer = $q.defer();
    var myrand = '?m=';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) myrand += possible.charAt(Math.floor(Math.random() * possible.length));
      if(oauthTokenService.isUserLoggedIn()) {
          $http.get('https://api.gfycat.com/v1/me/gfycats/' + gfycat.gfyName + '/full' + myrand).success(function (data) {

              gfycat.likes = data.gfyItem.likes === null ? 0 : parseInt(data.gfyItem.likes);
              gfycat.dislikes = data.gfyItem.dislikes === null ? 0 : parseInt(data.gfyItem.dislikes);
              gfycat.likeState = parseInt(data.gfyItem.likeState) + 0;
              gfycat.bookmarkState = parseInt(data.gfyItem.bookmarkState) + 0;
              defer.resolve(gfycat);
          });
      }

    return defer.promise;
  };

  return {
    MasterTags: new Tags(),
    Tags: Tags,
    loadTrendingVideos: loadTrendingVideos,
    loadSocialLikes: loadSocialLikes,
  };
},]);
