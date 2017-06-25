var app = angular.module('profileApp');

app.factory('profileFactory', ['$rootScope', '$http', '$q', '$log',
  'gfyAccountTree', 'albumService', 'bookmarkService', 'folderService', 'accountService',
  function($rootScope, $http, $q, $log, gfyAccountTree, albumService,
    bookmarkService, folderService, accountService) {
    /**
     * Singleton class for processing profile data
     */
    var ProfileService = function(userName) {
      this.apiUrl = 'https://api.gfycat.com/v1';
      this.count = 14;
      this.loadedGifsCount = 0;
      this.first = 0;
      this.folderId = 1; //Current folderId
      this.folders = {}; //Stores folders in a flattened out map
      this.folderTree = {}; //Stores folders in a tree-like nested structure
      this.gfycats = {}; //Stores and array of gifs per folderId
      this.albums = { nodes: [] }; //Stores albums and their contents
      this.favorites = {}; //Stores favorited gifs
      this.userName = userName;
      this.loggedIn = gfyAccountTree.loggedIntoAccount;
      this.isPrivate = (gfyAccountTree.loggedIntoAccount &&
          this.userName.toLowerCase() === gfyAccountTree.accountName.toLowerCase()) ?
        true : false; //Indicates whether logged in user is accessing her own profile
      this.userProfileData = {}; // current user profile data
    };


    /**
     * Caches profileService instances by userName
     */
    var currentUsers = {};


    /**
     * Returns an instance of ProfileService from cache if available,
     * and login state has not changed. Otherwise, return a new instance.
     * @param {Object} params
     * @return {ProfileService} profileService
     */
    var getProfileService = function(params, clean) {
      var profileService = currentUsers[params.userName];
      $log.debug('###getProfileService', currentUsers);
      if (typeof profileService === 'undefined') {
        $log.debug('##profileService is undefined');
        profileService = new ProfileService(params.userName);
        currentUsers[params.userName] = profileService;
      } else {
        if (gfyAccountTree.loggedIntoAccount !== profileService.loggedIn) {
          $log.debug('#login status changed');
          delete currentUsers[params.userName];
          profileService = new ProfileService(params.userName);
          currentUsers[params.userName] = profileService;
        }
        if (typeof clean !== 'undefined') {
          delete currentUsers[params.userName];
          profileService = new ProfileService(params.userName);
          currentUsers[params.userName] = profileService;
        }
      }
      return profileService;
    };


    /**
    * Gets profile info, private or public
    * return {Object} promise
    */
    ProfileService.prototype.getProfileInfo = function() {
      var that = this;
      return $q(function(resolve, reject) {
        if (that.userProfileData.hasOwnProperty('info')) {
          resolve();
        } else {
          if (that.isPrivate) {
            that.getPrivateProfileInfo().then(
              function(response) {
                that.userProfileData.info = response.data;
                that.userProfileData.info.gfyCount = response.data.publishedGfycats;
                that.userProfileData.info.albumCount = response.data.publishedAlbums;
                that.userProfileData.info.bookmarkCount = response.data.totalBookmarks;
                that.userProfileData.info.views =
                  parseInt(that.userProfileData.info.views);
                resolve();
              },
              function() { reject(); }
            );
          } else {
            that.getPublicProfileInfo(that.userName).then(
              function(response) {
                that.userProfileData.info = response.data;
                that.userProfileData.info.gfyCount = response.data.publishedGfycats;
                that.userProfileData.info.albumCount = response.data.publishedAlbums;
                that.userProfileData.info.views =
                  parseInt(that.userProfileData.info.views);
                resolve();
              },
              function(response) {
                if (response.status == 404) {
                  that.userProfileData.notFound = true;
                  resolve({notFound: true});
                }
                reject();
              }
            );
          }
        }
      });
    };


    /**
    * Requests initial profile data
    * @return {Object} common promise from data requests
    */
    ProfileService.prototype.getProfileData = function() {
      return $q.all([this.getProfileInfo(), this.isFollowing(this.userName)]);
    };


    /**
    * Returns current profile data from service
    * @return {Object}
    */
    ProfileService.prototype.getCurrentProfileData = function() {
      return this.userProfileData;
    };


    /**
    * Checks if profile info is loaded, loads if not
    * @return {Object|Boolean} promise from data request if
    *   info isn't loaded, true if it's
    */
    ProfileService.prototype.checkCurrentProfileData = function() {
      if (this.userProfileData.hasOwnProperty('info')) {
        return true;
      } else {
        return this.getProfileData();
      }
    };


    /**
     * Gets private profile info
     * @return {Object} promise
     */
    ProfileService.prototype.getPrivateProfileInfo = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get(that.apiUrl + '/me').then(
          function(response) {
            $log.debug('getPrivateProfileInfo', response);
            resolve(response); },
          function(response) { reject(response); }
        );
      });
    };


    /**
     * Gets public profile info
     * @param {String} username
     * @return {Object} promise
     */
    ProfileService.prototype.getPublicProfileInfo = function(username) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get(that.apiUrl + '/users/' + username).then(
            function(response) {
              $log.debug('getPublicProfileInfo', response);
              resolve(response); },
            function(response) { reject(response); }
        );
      });
    };


    /**
     * Updates profile info
     * @return {Object} promise
     */
    ProfileService.prototype.updateProfileInfo = function(newInfo) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.patch(that.apiUrl + '/me', {
            'operations': newInfo
          }).then(
          function(response) { resolve(response); },
          function(response) { reject(response); }
        );
      });
    };


    /**
     * Sends request to follow user
     * @param {String} username
     * @return {Object} promise
     */
    ProfileService.prototype.followUser = function(username) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.put(that.apiUrl + '/me/follows/' + username).then(
          function(response) {
            if (response.status === 200) {
              that.userProfileData.isFollowing = true;
              resolve();
            }
          }
        );
      });
    };


    /**
     * Sends request to unfollow user
     * @param {String} username
     * @return {Object} promise
     */
    ProfileService.prototype.unfollowUser = function(username) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.delete(that.apiUrl + '/me/follows/' + username).then(
          function(response) {
            if (response.status === 200) {
              that.userProfileData.isFollowing = false;
              resolve();
            }
          }
        );
      });
    };


    /**
    * Sends request to check if following user
    * @param {String} username
    * @return {Object} promise
    */
    ProfileService.prototype.isFollowing = function(username) {
      var that = this;
      return $q(function(resolve, reject) {
        if (!that.loggedIn || that.loggedIn && that.isPrivate) {
          resolve();
          return;
        }

        if (that.userProfileData.hasOwnProperty('isFollowing')) {
          resolve();
        } else {
          $http.head(that.apiUrl + '/me/follows/' + username).then(
            function(response) {
              if (response.status === 200) {
                that.userProfileData.isFollowing = true;
                resolve();
              } else {
                that.userProfileData.isFollowing = false;
                resolve();
              }
            },
            function() {
              that.userProfileData.isFollowing = false;
              resolve();
            }
          );
        }
      });
    };


    /**
    * Sends a request to update email
    * @param {String} newEmail
    * @return {Object} promise
    */
    ProfileService.prototype.changeEmail = function(newEmail) {
      var that = this;
      return $q(function(resolve, reject) {
        accountService.changeEmail(newEmail).then(
          function(response) {
            that.userProfileData.info.email = newEmail;
            resolve();
          },
          function(response) { reject(response.data); }
        );
      });
    };

    /**
    * Sends a request to update upload notifications
    * @param {Integer} value
    * @return {Object} promise
    */
    ProfileService.prototype.updateUploadNotifications = function(value) {
      var that = this;
      return $q(function(resolve, reject) {
        accountService.setUploadNotices(value).then(
          function() {
            that.userProfileData.info.uploadNotices =
              !that.userProfileData.info.uploadNotices;
            resolve();
          },
          function() { reject(); }
        );
      });
    };


    /**
    * Returns isPrivate status for the current profile
    * @return {Boolean} isPrivate
    */
    ProfileService.prototype.getIsPrivate = function() {
      return this.isPrivate;
    };


    /**
    * Obtains upload url for image upload
    * @return {Object} promise
    */
    ProfileService.prototype.obtainUploadUrl = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.post(that.apiUrl + '/me/profile_image_url').then(
          function(response) {
            if (response.status === 200 && response.data) {
              resolve(response.data);
            }
            reject();
          },
          function() { reject(); }
        );
      });
    };


    /**
    * Gets current profile image url
    * @return {Object} promise
    */
    ProfileService.prototype.getProfileImageUrl = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get(that.apiUrl + '/me/profile_image_url').then(
          function(response) {
            if (response.status.toString()[0] == 2 && response.data) {
              that.userProfileData.info.profileImageUrl = response.data;
              resolve(response.data);
            }
          }
        );
      });
    };

    /**
    * Checks for a new profile image upload status
    */
    ProfileService.prototype.checkUploadStatus = function(ticket) {
      var that = this;
      $http.get(this.apiUrl + '/me/profile_image_url/status/' + ticket).then(
        function(response) {
          // 2** code
          if (response.status.toString()[0] == 2) {
            if (response.data === "succeeded") {
              $rootScope.$broadcast('imageUploadSuccessEvent');
            } else if (response.data === "pending") {
              that.checkUploadStatus(ticket);
            }
          }
        }
      );
    };

    /**
    * Gets ticket from uploadUrl
    * @param {String} uploadUrl
    * @return {String} ticket
    */
    ProfileService.prototype.getTicketFromUrl = function(uploadUrl) {
      var ticket = "";
      if (uploadUrl) {
        ticket = uploadUrl.split('/').pop();
      }
      return ticket;
    };

    /**
    * Makes request to upload new profile image
    * @param {Object} imageFile
    * @return {Object} promise
    */
    ProfileService.prototype.uploadProfileImage = function(imageFile) {
      var that = this;
      return $q(function(resolve, reject) {
        that.obtainUploadUrl().then(
          function(uploadUrl) {
            var ticket = that.getTicketFromUrl(uploadUrl);
            $http.put(uploadUrl, imageFile).then(
              function(response) {
                that.checkUploadStatus(ticket);
                resolve();
              },
              function(response) { reject(); }
            );
          },
          function() { reject(); }
        );
      });
    };

    ProfileService.prototype.getPrivateGifs = function(count) {
      var self = this;
      return $q(function(resolve, reject) {
        if (self.gfycats[1] !== undefined && self.gfycats[1].length !== 0) {
          resolve(self.gfycats[1]);
        } else {
          var params = {
            params: {
              count: count
            }
          };
          $http.get(self.apiUrl + '/me/gfycats', params).then(function(response) {
            self.gfycats[1] = self.gfycats[1] !== undefined ? self.gfycats[1].concat(response.gfycats) : response.data.gfycats;
            self.gfycats[1].cursor = response.data.cursor;
            resolve(self.gfycats[1]);
          }, function(response) {
            reject(response);
          });
        }
      });
    };

    ProfileService.prototype.getMorePrivateGifs = function() {
      return $q(function(resolve, reject) {
        if (!this.gfycats[1].cursor) return resolve();
        var params = {
          params: {
            count: 20,
            cursor: this.gfycats[1].cursor
          }
        };
        $http.get(this.apiUrl + '/me/gfycats', params).then(function(response) {
          if (response.data.cursor) {
            this.gfycats[1] = typeof this.gfycats[1] !== 'undefined' ? this.gfycats[1].concat(response.data.gfycats) : response.data.gfycats;
            this.gfycats[1].cursor = response.data.cursor;
            resolve(response.data.gfycats);
          } else {
            this.gfycats[1].cursor = null;
            resolve(response.data.gfycats);
          }
        }.bind(this), function(response) {
          reject(response);
        });
      }.bind(this));
    };

    /**
    * Gets domain whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.getDomainWhitelist = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get(that.apiUrl + '/me/domain-whitelist').then(
          function(response) {
            if (response.data && response.data.domainWhitelist) {
              resolve(response);
            } else {
              reject(response);
            }
          },
          function(response) {
            reject(response)
          }
        );
      });
    };

    /**
    * Updates domain whitelist
    * @param {Array} whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.updateDomainWhitelist = function(whitelist) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.put(that.apiUrl + '/me/domain-whitelist', {
          'domainWhitelist': whitelist
        }).then(
          function(response) {
            if (response.data && response.data.isOk) {
              that.userProfileData.info.domainWhitelist = whitelist;
              resolve(response);
            } else {
              reject(response);
            }
          },
          function(response) {
            reject(response);
          }
        );
      });
    };

    /**
    * Deletes domain whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.deleteDomainWhitelist = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.delete(that.apiUrl + '/me/domain-whitelist').then(
          function(response) {
            if (response.data && response.data.isOk) {
              that.userProfileData.info.domainWhitelist = [];
              resolve(response);
            } else {
              reject();
            }
          },
          function(response) {
            reject();
          }
        );
      });
    };


    /**
    * Gets geo whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.getGeoWhitelist = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get(that.apiUrl + '/me/geo-whitelist').then(
          function(response) {
            if (response.data && response.data.geoWhitelist) {
              resolve(response);
            } else {
              reject(response);
            }
          },
          function(response) {
            reject(response)
          }
        );
      });
    };

    /**
    * Updates geo whitelist
    * @param {Array} whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.updateGeoWhitelist = function(whitelist) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.put(that.apiUrl + '/me/geo-whitelist', {
          'geoWhitelist': whitelist
        }).then(
          function(response) {
            if (response.data && response.data.isOk) {
              that.userProfileData.info.geoWhitelist = whitelist;
              resolve(response);
            } else {
              reject(response);
            }
          },
          function(response) {
            reject(response);
          }
        );
      });
    };

    /**
    * Deletes geo whitelist
    * @return {Object} promise
    */
    ProfileService.prototype.deleteGeoWhitelist = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.delete(that.apiUrl + '/me/geo-whitelist').then(
          function(response) {
            if (response.data && response.data.isOk) {
              that.userProfileData.info.geoWhitelist = [];
              resolve(response);
            } else {
              reject();
            }
          },
          function(response) {
            reject();
          }
        );
      });
    };

    ProfileService.prototype.updateIframeImageVisibility = function(isVisible) {
      var that = this;
      return $q(function(resolve, reject) {
        $http.patch(that.apiUrl + '/me', {
            "operations": [{
              "op": "replace",
              "path": "/iframe_image_visible",
              "value": isVisible
            }]
        }).then(
          function(response) { resolve(); },
          function(response) { reject(); }
        );
      });
    };

    ProfileService.prototype.getPublicGifs = function() {
      $log.debug('getPublicGifs');
      return $q(function(resolve, reject) {
        if (typeof this.gfycats[1] !== 'undefined' && this.gfycats[1].length !== 0 && !(this.gfycats[1].hasOwnProperty('type'))) {
          $log.debug('retrieving cached gifs');
          resolve(this.gfycats[1]);
        } else {
          if (this.gfycats[1] && this.gfycats[1].hasOwnProperty('type')) {
            this.gfycats = {};
          }
          var params = {
            params: {
              count: 12
            }
          };
          this.getProfileFeed(params).then(function(res) {
            $log.debug('getPublicGifs -> getProfileFeed response: ', res);
            this.gfycats[1] = typeof this.gfycats[1] !== 'undefined' ? this.gfycats[1].concat(res.gfycats) : res.gfycats;
            this.gfycats[1].cursor = res.cursor;
            resolve(this.gfycats[1]);
          }.bind(this));
        }
      }.bind(this));
    };


    ProfileService.prototype.getMorePublicGifs = function() {
      $log.debug('###getMorePublicGifs');
      return $q(function(resolve, reject) {
        var params = {
          params: {
            count: 12,
            cursor: this.gfycats[1].cursor
          }
        };
        this.getProfileFeed(params).then(function (res) {
          $log.debug('getMorePublicGifs --> getProfileFeed response: ', res);
          this.gfycats[1] = typeof this.gfycats[1] !== 'undefined' ? this.gfycats[1].concat(res.gfycats) : res.gfycats;
          this.gfycats[1].cursor = res.cursor;
          resolve(this.gfycats[1]);
        }.bind(this));
      }.bind(this));
    };

    ProfileService.prototype.getMorePublicGifsPaginate = function() {
      $log.debug('###getMorePublicGifsPaginate');
      var self = this;
      return $q(function(resolve, reject) {
        var params = {
          params: {
            count: 12,
            cursor: self.gfycats[1].cursor
          }
        };
        self.getProfileFeed(params).then(function (res) {
          self.gfycats[1] = typeof self.gfycats[1] !== 'undefined' ? self.gfycats[1].concat(res.gfycats) : res.gfycats;
          if (res.cursor) {
            self.gfycats[1].cursor = res.cursor;
            resolve(res.gfycats);
          } else {
            reject(res.gfycats);
          }
        });
      });
    };


    /**
     * Get all published gifs of the current user
     */
    ProfileService.prototype.getProfileFeed = function(params) {
      //params = {params: {count: 30}};
      return $q(function(resolve, reject) {
        $http.get(this.apiUrl + '/users/' + this.userName + '/gfycats', params)
          .success(function(response) {
            $log.debug('getProfileFeed response: ', response);
            resolve(response);
          });
      }.bind(this));
    };


    ProfileService.prototype.getProfileFolders = function(folderId) {
      var self = this;
      return $q(function(resolve, reject) {
        if (typeof self.folders[folderId] !== 'undefined') {
          resolve(self.folders[folderId].nodes);
        } else {
          self.getFolderTree().then(function(folderTree) {
            $log.debug('getFolderTree response: ', folderTree);
            self.getNestedFolders(folderId, folderTree).then(function(res) {
              $log.debug('getNestedFolders res', res);
              resolve(res.nodes);
            });
          });
        }
      });
    };


    ProfileService.prototype.getNestedFolders = function(folderId, folderTree) {
      var self = this;
      return $q(function(resolve, reject) {
        if (folderId === 1) {
          return resolve(self.folders[1]);
        }
        var roots = folderTree.nodes;
        roots.forEach(function(root) {
          if (typeof self.folders[root.id] === 'undefined') {
            self.folders[root.id] = {
              nodes: root.nodes,
              //parent: parentId
            };
          }
          if (folderId === root.id) {
            return resolve(self.folders[folderId]);
          }
        });
      });
    };


    ProfileService.prototype.createFolder = function(currentFolder, newFolderName) {
      var self = this;
      $log.debug('currentFolder: ', currentFolder);
      return $q(function(resolve, reject) {
        folderService.createFolder(currentFolder.id, newFolderName).then(function(res) {
          $log.debug('currentFolder: ', self.folders[currentFolder.id], 'folder created: ', res);
          if (typeof self.folders[currentFolder.id] === 'undefined') self.folders[currentFolder.id] = res;
          else self.folders[currentFolderId].nodes.push(res.nodes);
          self.getFolderTree().then(function(response) {
            self.folderTree = response;
            resolve(self.folders[currentFolder.id].nodes);
          });
        });
      });
    };


    /**
     * Get a tree-like object representing the folders in the user's account
     */
    ProfileService.prototype.getFolderTree = function() {
      var self = this;
      return $q(function(resolve, reject) {
        if (self.folderTree.hasOwnProperty(0)) {
          resolve(self.folderTree);
        } else {
          folderService.getFolders()
            .then(function(response) {
              $log.debug('getFolderTree: ', response);
              self.folderTree = response[0];
              self.folders[response[0].id] = {
                title: response[0].title,
                nodes: response[0].nodes,
                parent: null
              };
              resolve(self.folderTree);
            });
        }
      });
    };


    /**
     * Get the cached contents of the current folder. If no cache exists,
     * retrieve the contents, cache it, and return it.
     */
    ProfileService.prototype.getGifsFromFolder = function(folderId) {
      var self = this;
      return $q(function(resolve, reject) {
        if (self.gfycats.hasOwnProperty(folderId)) {
          $log.debug('###returning existing gifs');
          resolve(self.gfycats[folderId]);
        } else {
          var params = {
            count: 10,
            first: 0
          };
          folderService.getContent(folderId, params)
            .then(function(response) {
              $log.debug('folderService.getContents: ', response);
              self.gfycats[folderId] = response;
              self.gfycats[folderId].params = params;
              resolve(self.gfycats[folderId]);
            });
        }
      });
    };


    ProfileService.prototype.getMoreGifsFromFolder = function(folderId) {
      var self = this;
      return $q(function(resolve, reject) {
        if (typeof self.gfycats[folderId] === 'undefined') {
          reject();
        } else {
          self.gfycats[folderId].params.first += self.gfycats[folderId].params.count;
          var params = self.gfycats[folderId].params;
          folderService.getContent(folderId, params).then(function(response) {
            $log.debug('getting more gifs from folder', response);
            self.gfycats[folderId].publishedGfys = self.gfycats[folderId].publishedGfys.concat(response.publishedGfys);
            resolve(self.gfycats[folderId].publishedGfys);
          });
        }
      });
    };


    ProfileService.prototype.getPublicAlbums = function() {
      $log.debug('###getPublicAlbums');
      var self = this;
      return $q(function(resolve, reject) {
        if (self.albums.nodes.length) {
          resolve(self.albums.nodes);
        } else {
          albumService.getPublicAlbums(self.userName).then(function(response) {
            $log.debug('###albumService.getPublicAlbums response: ', response);
            response.items.forEach(function(album, index) {
              if (album.coverImageUrl) self.albums.nodes.push(album);
            });
            resolve(self.albums.nodes);
          }, function(response) {
            reject(response);
          });
        }
      });
    };


    /**
     * Get the list of albums of the current user
     */
    ProfileService.prototype.getProfileAlbums = function() {
      $log.debug('###getProfileAlbums');
      var self = this;
      return $q(function(resolve, reject) {
        $log.debug('self.albums: ', self.albums);
        if (self.albums.nodes.length) {
          $log.debug('returning cached albums');
          resolve(self.albums.nodes);
        } else {
          $log.debug('retrieving albums');
          var promises = [];
          albumService.getAlbumFolders().then(function(response) {
            $log.debug('getAlbumFolders response', response);
            response[0].nodes.forEach(function(cur) {
              promises.push(self.getAlbumCover(cur));
            });
            $q.all(promises).then(function(response) {
              $log.debug('all resolved promises', response, self.albums.nodes);
              self.albums.nodes = response;
              resolve(self.albums.nodes);
            });
          });
        }
      });
    };

    ProfileService.prototype.getAlbumCover = function(album) {
      var params = {count: 1};
      return $q(function(resolve, reject) {
        albumService.getContent(album.id, params).then(function(response) {
          $log.debug('getAlbumCover: ', album, 'response: ', response);
          if (response.gfyCount === 0) response.publishedGfys = [{
            empty: true,
            albumDescription: 'This album is empty!',
            posterUrl: "https://thumbs.gfycat.com/AnotherIncredibleDipper-poster.jpg",
            thumb360Url: "https://thumbs.gfycat.com/AnotherIncredibleDipper-360.mp4",
            thumb360PosterUrl: "https://thumbs.gfycat.com/AnotherIncredibleDipper-thumb360.jpg",
            mobileUrl: "https://thumbs.gfycat.com/AnotherIncredibleDipper-mobile.mp4",
            mobilePosterUrl: "https://thumbs.gfycat.com/AnotherIncredibleDipper-mobile.jpg",
          }];
          //TODO: remove below 2 lines when backend API count gets implemented
          this.albums[album.id] = response.publishedGfys;
          this.albums[album.id].title = album.title;

          response.publishedGfys[0].albumId = album.id;
          response.publishedGfys[0].albumTitle = album.title;
          //response.publishedGfys[0].linkText = album.linkText;
          if (!response.publishedGfys[0].empty) {
            response.publishedGfys[0].albumDescription = album.description;
          }
          resolve(response.publishedGfys[0]);
        }.bind(this), function(response) {
          $log.debug('albumService.getContent reject: ', response);
        });
      }.bind(this));
    };


    ProfileService.prototype.getAlbumGifs = function(albumId, linkText, userName) {
      $log.debug('getAlbumGifs: ', albumId);
      var self = this;
      return $q(function(resolve, reject) {
        if (typeof self.albums[albumId] !== 'undefined') resolve(self.albums[albumId]);
        else if (typeof self.albums[linkText] !== 'undefined') resolve(self.albums[linkText]);
        else {
          if (albumId) {
           albumService.getContentPublicById(albumId, userName).then(function(response) {
             $log.debug('###albumService.getContentPublicById response: ', response);
             self.albums[albumId] = response.publishedGfys;
             self.albums[albumId].title = response.title;
             resolve(self.albums[albumId]);
           }, function(response) {
             reject();
           });
         } else {
            albumService.getContentPublic(linkText, userName).then(function(response) {
              $log.debug('###albumService.getContentPublic response: ', response);
              self.albums[linkText] = response.publishedGfys;
              self.albums[linkText].title = response.title;
              resolve(self.albums[linkText]);
            }, function(response) {
              reject();
            });
          }
        }
      });
    };

    /**
     * Get a tree-like object representing the folders in the user's account
     */
    ProfileService.prototype.getFavoriteFolderTree = function() {
      var self = this;
      return $q(function(resolve, reject) {
        if (self.folderTree.hasOwnProperty('favorites')) {
          resolve(self.folderTree.favorites);
        } else {
          bookmarkService.getBookmarkFolders()
            .then(function(response) {
              $log.debug('getFavoriteFolderTree: ', response);
              self.folderTree.favorites = response[0];
              resolve(self.folderTree.favorites);
            });
        }
      });
    };

    ProfileService.prototype.getFavoritesNodes = function(folderId) {
      var self = this;
      return $q(function(resolve, reject) {
        if (self.favorites[folderId].hasOwnProperty('nodes')) {
          resolve(self.favorites[folderId].nodes);
        }
        self.getFavoriteFolderTree().then(function(response) {
          if (response.id === folderId) {
            resolve(response.nodes);
          } else {
            self.folderTree.favorites.unexplored.push(response.nodes.split);

          }
        });
      });
    };


    ProfileService.prototype.getFavoriteGfys = function(folderId) {
      if (!folderId) folderId = 3; //root folderId for favorites
      var self = this;
      return $q(function(resolve, reject) {
        if (self.isPrivate) {
          if (typeof self.favorites[folderId] !== 'undefined') {
            resolve(self.favorites[folderId]);
          } else {
            $log.debug('###getFavoriteGfys');
            self.getFavoriteGfyContent(folderId).then(function(res) {
              self.favorites[folderId] = res;
              self.favorites[folderId].nodes = self.folderTree.favorites.nodes;
              resolve(self.favorites[folderId]);
            });
          }
        }
      });
    };

    ProfileService.prototype.getMoreFavoriteGfys = function(folderId) {
      var self = this;
      return $q(function(resolve, reject) {
        if (typeof self.favorites[folderId] === 'undefined') {
          reject();
        } else {
          var params = {
            first: self.favorites[folderId].params.first + self.favorites[folderId].params.count,
            count: self.favorites[folderId].params.count
          };
          bookmarkService.getContent(folderId, params).then(function(response) {
            $log.debug('getting more favorites from folder', response);
            self.favorites[folderId].params = params;
            self.favorites[folderId].publishedGfys = self.favorites[folderId].publishedGfys.concat(response.publishedGfys);
            resolve(self.favorites[folderId].publishedGfys);
          });
        }
      });
    };

    ProfileService.prototype.getFavoriteGfyContent = function(folderId) {
      $log.debug('###getFavoriteGfyContent');
      return $q(function(resolve, reject) {
        var params = {
          count: 10,
          first: 0
        };
        bookmarkService.getContent(folderId, params)
          .then(function(response) {
            $log.debug('bookmarkService.getContent response: ', response);
            response.params = params;
            resolve(response);
          });
      });
    };

    return {
      getProfileService: getProfileService
    };
  }
]);
