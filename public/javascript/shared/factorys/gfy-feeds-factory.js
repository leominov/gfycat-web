/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('gfyFeeds', ['$http', function($http) {

  var loadCount = GLOBAL_VARIABLES.isMobile ? 3 : 9;

  return {
    galleryArray: {},
    busySignalGallery: false,
    currentGfyFrame: null,
    currentGfyChannel: {},
    channels: {},
    mainPageAutoPlay: true,
    mainGfyLoops:0,
    videoPageList: [],
    videoPageGfyFrame: null,
    videoPageAutoPlay: false,
    videoGfyLoops:0,
    videoPageTimer: 0,
    videoIntervalTime: 15000,
    comingFromGallery: false,
    clearMainVid: false, // need this to clear video tag from DOM for next gfy to load right
    clearPageVid: false,
    gfyIntervalTime: 15000, //15 seconds is all you get
    mainGfyTimer: 0,
    liveViewTimer: 0,
    liveCountId:null,
    gettingCounts: false,
    gettingTagGfys: false,
    siteLiveCount:0,
    site24HourViewCount:0,
    site24HourSubmissionCount:0,
    galleryCount: 0,
    galleryCursor: null,
    searchPageList: [],
    searchPageCursor: null,
    tagPageList: [],
    tagPageCursor: null,
    tagCount: '5',
    tagGfyCount: '10',
    channelCount: '9',
    albumPageList: [],
    albumPageFullList: [],
    albumPageGfyFrame: null,
    albumGfyLoops:0,
    albumPageAlbumInfo: null,
    clearAlbumVid: false,
    albumTimer: 0,
    albumIntervalTime: 15000,
    albumIndex: 0,
    refererSent: false,
    pastedData: null,

    cleanList: function(newgfys, list, name) {  // function to add new gfys to current list and format items that need adjusting
      var len = newgfys.length;
      var k = list.length;
      if (!len) return;
      for (var i = 0; i < len; i++) {
        newgfys[i].views = parseInt(newgfys[i].views); // adjust views to be an integer instead of a string value
        newgfys[i].createDate = new Date(newgfys[i].createDate * 1000); // adjust time to be java/unix time compatible
        if (newgfys[i].likes != undefined) newgfys[i].likes = parseInt(newgfys[i].likes);
        else newgfys[i].likes = 0;
        if (newgfys[i].dislikes != undefined) newgfys[i].dislikes = parseInt(newgfys[i].dislikes);
        else newgfys[i].dislikes = 0;
        newgfys[i].headingIndex = name;
        newgfys[i].tagName = list.tagName;
        newgfys[i].androidUrl = newgfys[i].mp4Url.replace(/\.mp4/g, '-android.mp4');
        newgfys[i].url360 = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-360.mp4';

        //                newgfys[i].mobileUrl = "https://thumbs.gfycat.com/" + newgfys[i].gfyName + "-mobile.mp4";
        newgfys[i].thumbnail = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-poster.jpg';
        newgfys[i].webpUrl = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '.webp';
        list[k + i] = newgfys[i];// move names from fetched data into list
      }
    },

    loadTagGfys: function(list, name) {
      var thisScope = this;
      list.loading = true;
      list.initialLoading = false;
      thisScope.gettingTagGfys = true;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        list.initialLoading = true;
        var gfyRoute = '';
        if (list.tagName == 'jiffiest') gfyRoute = 'gfycats/trending?count=' + loadCount;
        return $http.get('https://api.gfycat.com/v1/' + gfyRoute).success(function(data) { // on successful get request populate the data
          thisScope.cleanList(data['gfycats'], list, name);
          list.loading = false;
          list.cursor = data.cursor;
          thisScope.gettingTagGfys = false;

          thisScope.liveCountId = data.liveCountId;
          list.initialLoading = false;

          //console.log(thisScope.liveCountId);
          //if ($scope.accountTree.loggedIntoAccount)
          //    $http.get('/cajax/getFull/' + list[0].gfyName).success(function (data) { // on successful get request populate the data
          //        list[0].likeState=data.gfyItem.likeState;
          //        list[0].bookmarkState=data.gfyItem.bookmarkState;
          //        list[0].description=data.gfyItem.description;
          //    });
          //console.log(list);
        });
      }      else {
        var gfyRoute = '';
        var extra = '';
        if (list.tagName == 'jiffiest') gfyRoute = 'gfycats/trending?count=' + loadCount + '&cursor=';
        else {
          gfyRoute = 'gfycats/trending?cursor=';
          extra = '&tagName=' + list.tagName;
        }

        return $http.get('https://api.gfycat.com/v1/' + gfyRoute + list.cursor + extra + '&liveCountId=' + thisScope.liveCountId).success(function(data) { // on successful get request populate the data
          thisScope.cleanList(data['gfycats'], list, name);
          list.loading = false;
          thisScope.gettingTagGfys = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;
          if (data.liveCountId != undefined) thisScope.liveCountId = data.liveCountId;

        });
      }

    },
    /*load20Tags: function () {
        var gfyRoute = '';
        var thisScope = this;
        thisScope.reachedGalleryEnd=false;

        if (this.galleryCursor == undefined) gfyRoute = 'gfycats/trending?';
        else gfyRoute = 'gfycats/trending?&cursor=' + this.galleryCursor;

        $http.get('https://api.gfycat.com/v1test/' + gfyRoute +'&tagCount='+this.tagCount+'&count='+this.tagGfyCount+'&liveCountId='+this.liveCountId).success(function (data) { // on successful get request populate the data

            var start = thisScope.galleryCount;
            //console.log("start:" + start);
            thisScope.galleryCursor = data.cursor;
            thisScope.liveCountId=data.liveCountId;
            if (data.liveCountId==undefined) console.log(data);
            if (data.tagList.length != undefined && data.tagList.length > 0) {
                var numHDs = data.tagList.length; // number of headings we got back
                var i = 0;
                for (var k = start; k < start + numHDs; k++) {
                    //console.log("k= "+k);
                    (function (k, i) {
                        var name = "";
                        if (k < 10000) name += "0"; // need to pad object key name for proper sort
                        if (k < 1000) name += "0"; // need to pad object key name for proper sort
                        if (k < 100) name += "0"; // need to pad object key name for proper sort
                        if (k < 10) name += "0"; // need to pad object key name for proper sort
                        name += k;
                        //set gallery heading
                        thisScope.galleryArray[name] = [];//make empty array
                        thisScope.galleryArray[name].headingIndex = name;
                        if (data.tagList[i].cursor == undefined) thisScope.galleryArray[name].cursor = 'end';
                        else thisScope.galleryArray[name].cursor = data.tagList[i].cursor;
                        thisScope.galleryArray[name].tagName = data.tagList[i].tag;
                        thisScope.galleryArray[name].start = 0;
                        thisScope.galleryArray[name].first = 0;


                        thisScope.cleanList(data.tagList[i].gfyList,thisScope.galleryArray[name],name);

                    })(k, i);
                    i++;
                    thisScope.galleryCount += 1;
                }
            }
            else {
                //console.log("GOT AN EMPTY LIST BACK");
                thisScope.reachedGalleryEnd=true;
            }
            //console.log(thisScope.galleryArray);
            thisScope.busySignalGallery=false;
        });


    },*/
    load20Tags: function() {
      var gfyRoute = '';
      var thisScope = this;
      thisScope.reachedGalleryEnd = false;
      gfyRoute = 'https://api.gfycat.com/v1/tags/trending/populated?count=' + this.tagGfyCount;
      if (this.galleryCursor == undefined)
		console.log('undefined');
      else
                  gfyRoute += '&cursor=' + this.galleryCursor;

      $http.get(gfyRoute).success(function(data) { // on successful get request populate the data

        var start = thisScope.galleryCount;

        //console.log("start:" + start);
        thisScope.galleryCursor = data.cursor;
        console.log('results!');
        console.log(data);

        //thisScope.liveCountId=data.liveCountId;
        //if (data.liveCountId==undefined) console.log(data);
        if (data.tags.length != undefined && data.tags.length > 0) {
          var numHDs = data.tags.length; // number of headings we got back
          var i = 0;
          for (var k = start; k < start + numHDs; k++) {
            //console.log("k= "+k);
            (function(k, i) {
              var name = '';
              if (k < 10000) name += '0'; // need to pad object key name for proper sort
              if (k < 1000) name += '0'; // need to pad object key name for proper sort
              if (k < 100) name += '0'; // need to pad object key name for proper sort
              if (k < 10) name += '0'; // need to pad object key name for proper sort
              name += k;

              //set gallery heading
              thisScope.galleryArray[name] = [];//make empty array
              thisScope.galleryArray[name].headingIndex = name;
              if (data.tags[i].cursor == undefined) thisScope.galleryArray[name].cursor = 'end';
              else thisScope.galleryArray[name].cursor = data.tags[i].cursor;
              thisScope.galleryArray[name].tagName = data.tags[i].tag;
              thisScope.galleryArray[name].start = 0;
              thisScope.galleryArray[name].first = 0;

              console.log('tag:' + thisScope.galleryArray[name].tagName);
              thisScope.cleanList(data.tags[i].gfycats, thisScope.galleryArray[name], name);

            })(k, i);

            i++;
            thisScope.galleryCount += 1;
          }
        }        else {
          //console.log("GOT AN EMPTY LIST BACK");
          thisScope.reachedGalleryEnd = true;
        }

        //console.log(thisScope.galleryArray);
        thisScope.busySignalGallery = false;
      });

    },

    saveBookmarkState: function(item) {
        item.savingBookmark = true;
        if (item.gfyId == undefined) item.gfyId = item.gfyName.toLowerCase();
        var bookmarkState = 0;
        var method = "DELETE";

        if(!item.bookmarkState) {
            bookmarkState = 1;
            method = "PUT";
        }

        return $http({
            method: method,
            url: 'https://api.gfycat.com/v1/me/bookmarks/contents/'+item.gfyId
        }).success(function() {
            item.savingBookmark = false;
            item.bookmarkState = bookmarkState;
        }).error(function(data) {});
    },

    saveLikeState: function(item) {
      item.savingLike = true;
      var newLikeState = 1;
      var tempLike = 1; //like something
      var tempCurrentLikes = item.likes;
      var tempCurrentDislikes = item.dislikes;
      if (item.likeState == 0 || item.likeState == undefined) {
        tempLike = 1;//like something we had no opinion yet
        newLikeState = 1;
        tempCurrentLikes = parseInt(item.likes) + tempLike;
      }

      if (item.likeState == 1) {
        tempLike = -1;//unlike something we already like
        newLikeState = 0;
        tempCurrentLikes = parseInt(item.likes) + tempLike;
      }

      if (item.likeState == -1) {
        tempLike = 1;//like something we already dislike
        newLikeState = 1;
        tempCurrentLikes = parseInt(item.likes) + tempLike;
        tempCurrentDislikes = parseInt(item.dislikes) - tempLike;
      }

      var dataT = {};
      dataT['value'] = newLikeState;
      if (item.tagName != undefined && item.tagName != 'jiffiest') dataT['tag'] = item.tagName;

      //console.log(dataT);
      return $http.put('https://api.gfycat.com/v1/me/gfycats/'+item.gfyId+'/like', dataT).success(function(data) {
        item.savingLike = false;
        item.likeState = newLikeState;
        item.likes = tempCurrentLikes;
        item.dislikes = tempCurrentDislikes;
      }).error(function(status, data) {
        //console.log(status);
      });
    },

    saveDislikeState: function(item) {
      item.savingDislike = true;
      var newLikeState = -1;
      var tempDislike = 1;
      var tempCurrentLikes = item.likes;
      var tempCurrentDislikes = item.dislikes;
      if (item.likeState == 0 || item.likeState == undefined) {
        tempDislike = 1;//dislike something we had no opinion yet
        newLikeState = -1;
        tempCurrentDislikes = parseInt(item.dislikes) + tempDislike;
      }

      if (item.likeState == -1) {
        tempDislike = -1;// un dislike something we dislike
        newLikeState = 0;
        tempCurrentDislikes = parseInt(item.dislikes) + tempDislike;
      }

      if (item.likeState == 1) {
        tempDislike = 1;//dislike something we already like
        newLikeState = -1;
        tempCurrentLikes = parseInt(item.likes) - tempDislike;
        tempCurrentDislikes = parseInt(item.dislikes) + tempDislike;
      }

      var dataT = {};
      dataT['value'] = newLikeState;
        if(newLikeState==-1)
        {
            dataT['value'] = 1;
        }
      if (item.tagName != undefined && item.tagName != 'jiffiest') dataT['tag'] = item.tagName;

      //console.log(dataT);
      return $http.put('https://api.gfycat.com/v1/me/gfycats/'+item.gfyId+'/dislike', dataT).success(function(data) {
        item.savingDislike = false;
        item.likeState = newLikeState;
        item.dislikes = tempCurrentDislikes;
        item.likes = tempCurrentLikes;
      }).error(function(status, data) {
        //console.log(status);
      });
    },

    loadGfysForTagSearchPage: function(list, name) {
      chunk = function(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
          newArr.push(arr.slice(i, i + size));
        }

        return newArr;
      };

      if (list.cursor == 'end' || list.loading) return;

      //console.log(name);
      //console.log("tagname:"+list.tagName);
      //console.log(list);
      list.searching = name;
      list.loading = true;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        var gfyRoute = '';
        if (list.searching == 'jiffiest') gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?count=9';
        else gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?tagName=' + list.searching + '&count=9';
        $http.get(gfyRoute).success(function(data) { // on successful get request populate the data
          //console.log(data);
          var newgfys = data['gfycats']; // get gfys
          var len = newgfys.length;

          //console.log("Amount of Gfys fetched this time is: " + len);
          if (!len) {
            list.loading = false;
            list.cursor = 'end';

            //list.isError = true;
            return;
          }

          var k = list.length;
          for (var i = 0; i < len; i++) {
            newgfys[i].views = parseInt(newgfys[i].views); // adjust views to be an integer instead of a string value
            newgfys[i].createDate = new Date(newgfys[i].createDate * 1000); // adjust time to be java/unix time compatible
            newgfys[i].url360 = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-360.mp4';
            if (newgfys[i].likes != undefined) newgfys[i].likes = parseInt(newgfys[i].likes);
            else newgfys[i].likes = 0;
            if (newgfys[i].dislikes != undefined) newgfys[i].dislikes = parseInt(newgfys[i].dislikes);
            else newgfys[i].dislikes = 0;
            newgfys[i].headingIndex = name;

            //list[k + i] = newgfys[i];// move names from fetched data into list
          }

          //console.log("original fetch length:" + newgfys.length);
          var chunked = chunk(newgfys, 3);
          for (i = k; i < chunked.length; i++) {
            list[i] = chunked[i];
          }

          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;
        }).error(function(status, data) {
          list.loading = false;
          list.isError = true;
          list.cursor = 'end';
        });
      }      else {
        var gfyRoute = '';
        if (list.searching == 'jiffiest') gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?cursor=' + list.cursor;
        else gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?cursor=' + list.cursor + '&tagName=' + list.searching;

        //console.log('fetching cursor');
        $http.get(gfyRoute).success(function(data) { // on successful get request populate the data
          //console.log(data);
          var newgfys = data['gfycats']; // get gfys
          var len = newgfys.length;

          //console.log("Amount of Gfys fetched this time is: " + len);
          if (!len) {
            list.loading = false;
            list.cursor = 'end';

            //list.isError = true;
            return;
          }

          var k = list.length;
          for (var i = 0; i < len; i++) {
            newgfys[i].views = parseInt(newgfys[i].views); // adjust views to be an integer instead of a string value
            newgfys[i].createDate = new Date(newgfys[i].createDate * 1000); // adjust time to be java/unix time compatible
            newgfys[i].url360 = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-360.mp4';
            if (newgfys[i].likes != undefined) newgfys[i].likes = parseInt(newgfys[i].likes);
            else newgfys[i].likes = 0;
            if (newgfys[i].dislikes != undefined) newgfys[i].dislikes = parseInt(newgfys[i].dislikes);
            else newgfys[i].dislikes = 0;
            newgfys[i].headingIndex = name;

            //list[k + i] = newgfys[i];// move names from fetched data into list
          }

          var chunked = chunk(newgfys, 3);
          for (i = 0; i < chunked.length; i++) {
            list[k + i] = chunked[i];
          }

          //console.log(list);
          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;
        });
      }
    },

    loadGfysForSearchPage: function(list, name) {
      chunk = function(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
          newArr.push(arr.slice(i, i + size));
        }

        return newArr;
      };

      if (list.cursor == 'end' || list.loading) return;

      //console.log(name);
      //console.log("tagname:"+list.tagName);
      //console.log(list);
      list.searching = name;
      list.loading = true;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        var gfyRoute = '';
        gfyRoute = '?search_text=' + list.searching + '&count=9';
        $http.get('https://api.gfycat.com/v1/gfycats/search' + gfyRoute).success(function(data) { // on successful get request populate the data
          //console.log(data);
          if (data.tagResults != undefined) list.tagResults = data.tagResults;
          if (data.hasOwnProperty('gfycats')) {
            var newgfys = data['gfycats']; // get gfys
            var len = newgfys.length;

            //console.log("Amount of Gfys fetched this time is: " + len);
            if (!len) {
              list.loading = false;
              list.cursor = 'end';

              //list.isError = true;
              return;
            }

            var k = list.length;
            for (var i = 0; i < len; i++) {
              newgfys[i].views = parseInt(newgfys[i].views); // adjust views to be an integer instead of a string value
              newgfys[i].createDate = new Date(newgfys[i].createDate * 1000); // adjust time to be java/unix time compatible
              newgfys[i].url360 = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-360.mp4';
              if (newgfys[i].likes != undefined) newgfys[i].likes = parseInt(newgfys[i].likes);
              else newgfys[i].likes = 0;
              if (newgfys[i].dislikes != undefined) newgfys[i].dislikes = parseInt(newgfys[i].dislikes);
              else newgfys[i].dislikes = 0;
              newgfys[i].headingIndex = name;

              //list[k + i] = newgfys[i];// move names from fetched data into list
            }

            //console.log("original fetch length:" + newgfys.length);
            var chunked = chunk(newgfys, 3);
            for (i = k; i < chunked.length; i++) {
              list[i] = chunked[i];
            }
          }

          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;
        }).error(function(status, data) {
          list.loading = false;
          list.isError = true;
          list.cursor = 'end';
        });
      }      else {
        var gfyRoute = '';
        gfyRoute = '?search_text=' + list.searching;

        //console.log('fetching cursor');
        $http.get('https://api.gfycat.com/v1/gfycats/search' + gfyRoute + '&cursor=' + list.cursor + '&count=9').success(function(data) { // on successful get request populate the data
          //console.log(data);
          if (data.hasOwnProperty('gfycats')) {
            var newgfys = data['gfycats']; // get gfys
            var len = newgfys.length;

            //console.log("Amount of Gfys fetched this time is: " + len);
            if (!len) {
              list.loading = false;
              list.cursor = 'end';

              //list.isError = true;
              return;
            }

            var k = list.length;
            for (var i = 0; i < len; i++) {
              newgfys[i].views = parseInt(newgfys[i].views); // adjust views to be an integer instead of a string value
              newgfys[i].createDate = new Date(newgfys[i].createDate * 1000); // adjust time to be java/unix time compatible
              newgfys[i].url360 = 'https://thumbs.gfycat.com/' + newgfys[i].gfyName + '-360.mp4';
              if (newgfys[i].likes != undefined) newgfys[i].likes = parseInt(newgfys[i].likes);
              else newgfys[i].likes = 0;
              if (newgfys[i].dislikes != undefined) newgfys[i].dislikes = parseInt(newgfys[i].dislikes);
              else newgfys[i].dislikes = 0;
              newgfys[i].headingIndex = name;

              //list[k + i] = newgfys[i];// move names from fetched data into list
            }

            var chunked = chunk(newgfys, 3);
            for (i = 0; i < chunked.length; i++) {
              list[k + i] = chunked[i];
            }

            //console.log(list);
          }

          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;
        });
      }

    },

    loadGfysForVideoPage: function(list, name) {
      var thisScope = this;
      list.loading = true;
      list.searching = name;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        var gfyRoute = '';
        if (list.searching == 'jiffiest') gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending';
        else gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?&tagName=' + list.searching;
        return $http.get(gfyRoute).success(function(data) { // on successful get request populate the data
          thisScope.cleanList(data['gfycats'], list, name);

          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;

          //thisScope.liveCountId = data.liveCountId; don't want to change this when we load these
          //console.log(thisScope.liveCountId);
          //if ($scope.accountTree.loggedIntoAccount)
          //    $http.get('/cajax/getFull/' + list[0].gfyName).success(function (data) { // on successful get request populate the data
          //        list[0].likeState=data.gfyItem.likeState;
          //        list[0].bookmarkState=data.gfyItem.bookmarkState;
          //        list[0].description=data.gfyItem.description;
          //    });

        });
      }      else if (list.cursor != 'end') {
        var gfyRoute = '';
        var extra = '';
        if (list.tagName == 'jiffiest') gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?cursor=' + list.cursor;
        else {
          gfyRoute = 'https://api.gfycat.com/v1/gfycats/trending?cursor=' + list.cursor + '&tagName=' + list.tagName;
        }

        //+ '&liveCountId='+this.liveCountId
        return $http.get(gfyRoute).success(function(data) { // on successful get request populate the data

          thisScope.cleanList(data['gfycats'], list, name);

          list.loading = false;
          if (data.cursor == undefined) list.cursor = 'end';
          else list.cursor = data.cursor;

          //thisScope.liveCountId = data.liveCountId;
        });
      }
    },

    loadGfysForMobileSearchPage: function(list, name) {
      if (list.cursor == 'end' || list.loading) return;
      var thisScope = this;
      list.searching = name;
      list.loading = true;
      list.initialLoading = false;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        list.initialLoading = true;
        var gfyRoute = '?search_text=' + list.searching + '&count=' + loadCount;
        if (list.searching == 'jiffiest') gfyRoute = 'getTrendingGfycats';
        $http.get('https://api.gfycat.com/v1/gfycats/search' + gfyRoute).success(function(data) { // on successful get request populate the data
          if (data.errorMessage !== undefined) {
            list.cursor = 'end';
            list.noResult = true;
          } else {
            thisScope.cleanList(data['gfycats'], list, name);
            list.noResult = false;
            list.cursor = data.cursor;
          }

          list.loading = false;
          list.initialLoading = false;
        }).error(function(status, data) {
          list.loading = false;
          list.isError = true;
        });
      }      else if (list.cursor != 'end') {

        var gfyRoute = '?search_text=' + list.searching + '&cursor=' + list.cursor + '&count=' + loadCount;
        $http.get('https://api.gfycat.com/v1/gfycats/search' + gfyRoute).success(function(data) { // on successful get request populate the data
          if (data.errorMessage !== undefined) {
            list.cursor = 'end';
          } else {
            thisScope.cleanList(data['gfycats'], list, name);
            list.cursor = data.cursor;
          }

          list.loading = false;
        });
      }
    },

    loadGfysForMobileTagPage: function(list, name) {
      if (list.cursor == 'end' || list.loading) return;
      var thisScope = this;
      list.searchingTag = name;
      list.loading = true;
      list.initialLoading = false;
      if (list.length == undefined) list.length = 0;
      if (list.cursor == undefined) {
        list.initialLoading = true;
        var gfyRoute = '?tagName=' + list.searchingTag + '&count=' + loadCount;
        $http.get('https://api.gfycat.com/v1/gfycats/trending' + gfyRoute).success(function(data) { // on successful get request populate the data
          if (data.errorMessage !== undefined || (data.gfycats && data.gfycats.length === 0)) {
            list.cursor = 'end';
            list.noResult = true;
          } else {
            thisScope.cleanList(data['gfycats'], list, name);
            list.noResult = false;
            list.cursor = data.cursor;
          }

          list.loading = false;
          list.initialLoading = false;
        }).error(function(status, data) {
          list.loading = false;
          list.initialLoading = false;
          list.isError = true;
        });
      }      else if (list.cursor != 'end') {
        var gfyRoute = '?tagName=' + list.searchingTag + '&cursor=' + list.cursor + '&count=' + loadCount;
        $http.get('https://api.gfycat.com/v1/gfycats/trending' + gfyRoute).success(function(data) { // on successful get request populate the data
          if (data.errorMessage !== undefined || (data.gfycats && data.gfycats.length === 0)) {
            list.cursor = 'end';
          } else {
            thisScope.cleanList(data['gfycats'], list, name);
            list.cursor = data.cursor;
          }

          list.loading = false;
        });
      }
    },
  };

},]);
