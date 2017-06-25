var app = angular.module('profileApp');

app.filter('commaToHash', function() {
  return function(input) {
    input = input.length !== 0 ? input.toString() : 'Click to enter tag';
    return '#' + input.split(',').join(' #');
  };
});

app.controller('profileListController',
  function($document, $filter, $interval, $q, $scope, $stateParams, $window, accountService, hotkeys, profileFactory, searchFactory, folderService) {
    var pathUsername = $stateParams.path.toLowerCase()
      .substr(1),
      profileService = profileFactory.getProfileService({
        userName: pathUsername
      }, true);
    GFAN.sendEvent({
      event: 'view_my_library',
      username: pathUsername
    });
    $scope.gifCount = null;
    $scope.userName = $stateParams.path;
    $scope.albumModal = {shown: false};
    $scope.deleteModal = {shown: false};
    $scope.detailsModal = {shown: false};
    $scope.overlayModal = {shown: false, overlay:''};
    $scope.loaded = false;
    $scope.loading = true;
    $scope.deleting = [];
    $scope.detailed = null;
    $scope.isMobileSearching = false;
    $scope.isButtonDisabled = false;
    $scope.lastClickedGif = null;
    $scope.holdingShift = false;
    $scope.isPending = {
      createAlbum: false,
      delete: false,
      rename: false,
      edit_tags: false,
      edit_description: false,
      is_searching: false
    };

    /** 
     * boolean to selectively listen for drop events 
     * when a matching drag event has occured
     */
    $scope.drag = false;
    $scope.dragged = {};
    $scope.activeAlbum = [];
    profileService.getPrivateGifs(20)
      .then(function(response) {
        $scope.gifList = response;
        $scope.gifList.type = 'library';
        $scope.gifList.current = $filter('translate')('LIBRARY.MY_LIBRARY');
        $scope.gifList.albumId = '';
        $scope.library = response;
        $scope.buttonEnabled = true;
        $scope.loading = false;
      });

    $document.bind("keydown", function(event) {
      if (event.which === 16) {
        $scope.holdingShift = true;
      }
    });

   $document.bind("keyup", function(event) {
      if (event.which === 16) {
        $scope.holdingShift = false;
      }
    });

    $scope.$on('$destroy', function() {
      $document.unbind("keydown");
      $document.unbind("keyup");
    });

    $scope.getTotalGifCount = function() {
      folderService.getContents(1, 'age', 0, "SORT_DESC", 1).then(function(response) {
        $scope.gifCount = response.gfyCount;
      },
      function(response) {
        console.log("Unable to get gif count");
      });
    };

    $scope.getTotalGifCount();

    $scope.moreData = function() {
      if ($scope.input.searchText) {
        $scope.moreSearchData();
      } else {
        $scope.moreLibraryData();
      }
    };

    $scope.windowWidth = function(width) {
      if (window.innerWidth <= width) return true;
      else return false;
    }

    $scope.moreLibraryData = function() {
      $scope.loading = true;
      profileService.getMorePrivateGifs().then(function(response) {
        if (response) {
          for (var i = 0; i < response.length; i++) {
            $scope.gifList.push(response[i]);
          }
          $scope.library = $scope.gifList;
          $scope.input.allSelected = false;
          $scope.loading = false;
        } else {
          $scope.loaded = true;
        }
      }, function(response) {
        $scope.loading = false;
        console.error('more data failed: ', response);
      });
    };

    $scope.moreSearchData = function(searchText, count) {
      $scope.loading = true;
      folderService.searchFolders(searchText, 20).then(function(response) {
        if (response) {
          for (var i = 0; i < response.length; i++) {
            $scope.gifList.push(response[i]);
          }
          $scope.input.allSelected = false;
          $scope.loading = false;
        } else {
          $scope.loaded = true;
        }
      }, function(response) {
        $scope.loading = false;
        console.error('more data failed: ', response);
      });
    };

    $scope.moreDataDisabled = function() {
      var disabled = false;
      if ($scope.gifList) disabled = $scope.gifList.type !== 'library' ? true : false;
      return $scope.loading || $scope.loaded || disabled || $scope.scrollDisabled;
    };

    var folderService = accountService.folderService;
    folderService.getFolders().then(function(response) {
      accountService.constructFolderTree(response[0]);
      $scope.folderList = accountService.getDirectChildren(1);
    });

    var albumService = accountService.albumService;
    $scope.getAlbumList = function() {
      albumService.getAlbumFolders().then(function(response) {
        /*$scope.albumList = response[0].nodes;
        $scope.albumList.type = 'albums';*/
        $scope.albumList = [];
        for (var i = 0; i < response[0].nodes.length; i++) {
          if (response[0].nodes[i].folderSubType !== undefined) {
            $scope.albumList.push(response[0].nodes[i]);
          }
        }
      }, function(response) {
        console.error('Error retrieving album list', response);
      });
    };

    $scope.updateAlbumList = function() {
      return $q(function(resolve, reject) {
        albumService.getAlbumFolders().then(function(response) {
          $scope.albumList = [];
          var nodes = response[0].nodes;
          for (var i = 0; i < response[0].nodes.length; i++) {
            if (response[0].nodes[i].folderSubType !== undefined) {
              $scope.albumList.push(response[0].nodes[i]);
            }
          }
          $scope.albumList.type = 'albums';
          $scope.albumList.current = $filter('translate')('LIBRARY.MY_ALBUMS');
          //$scope.gifList = $scope.albumList;
          //$scope.gifList.current = 'My Albums';
          resolve($scope.albumList);
        }, function(response) {
          console.error('Error retrieving album list', response);
        });
      });
    };

    $scope.getAlbumList();
    //$scope.updateAlbumList();

    $scope.input = {
      searchText: '',
      allSelected: false
    };

    $scope.toggleAllSelected = function(toggleValue) {
      var searchFiltered = $filter('filter')($scope.gifList, $scope.input.searchText);
      $scope.isMobileSearching = false;
      if (searchFiltered.length === $scope.gifList.length) {
        if (toggleValue !== undefined) $scope.input.allSelected = toggleValue;
        angular.forEach($scope.gifList, function(gif) {
          gif.selected = $scope.input.allSelected;
        });
        $scope.selectedCounter = ($scope.input.allSelected) ? $scope.gifList.length : 0;
      } else {
        angular.forEach(searchFiltered, function(gif) {
          gif.selected = $scope.input.allSelected;
        });
        $scope.selectedCounter = searchFiltered.length;
      }
    };

    // Initialize sorting to show most recently created gifs first
    $scope.reverse = true;
    $scope.predicate = 'createDate';
    $scope.sort = function(predicate) {
      $scope.predicate = predicate;
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.toggleAllSelected(false);
      $scope.lastClickedGif = null;
    };

    $scope.setReverse = function(bool) {
      $scope.reverse = bool;
    };

    angular.element($window).bind('scroll', function(event) {
      $scope.scrolled = $window.scrollY === 0 ? false : true;
      $scope.$apply();
    });

    $scope.checkSelected = function() {
      var selection = $filter("filter")($scope.gifList, {
        selected: true
      });
      if (selection === undefined) selection = [];
      return selection.length;
    };

    $scope.getSelected = function() {
      var selection = $filter('filter')($scope.gifList, {
        selected: true
      });
      if (selection === undefined) selection = [];
      return selection;
    };

    $scope.checkSelectedAttribute = function(attribute, value) {
      var selected = $scope.getSelected();
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].hasOwnProperty(attribute) && selected[i][attribute] == value) {
          return true;
        }
      }
      return false;
    };

    $scope.handleShiftClickTo = function(selectedGif) {
      var orderedGifList = $filter('orderBy')($scope.gifList, $scope.predicate);

      if ($scope.reverse) {
        orderedGifList.reverse();
      }

      var toIndex = orderedGifList.indexOf(selectedGif);
      var fromIndex = 0;
      if ($scope.lastClickedGif) {
        fromIndex = orderedGifList.indexOf($scope.lastClickedGif);
      }       

      switch (Math.sign(toIndex - fromIndex)) {
        case 1:
          var gifRange = orderedGifList.slice(fromIndex, toIndex + 1);
          break;
        case 0:
          return;
        case -1:
          var gifRange = orderedGifList.slice(toIndex, fromIndex + 1);
          break;
      }

      var allSelected = gifRange.every(function(gif) {
        return gif.selected === true;
      });

      gifRange.forEach(function(gif, index) {
        gif.selected = !allSelected;
      });

      $scope.selectedCounter = orderedGifList.filter(function(gif) {
        return gif.selected === true;
      }).length;
    };

    $scope.selectedCounter = 0;
    $scope.updateSelection = function(item, isCheckbox) {
      if ($scope.holdingShift){
        $scope.handleShiftClickTo(item);
      } else {
        $scope.lastClickedGif = item;
        if (isCheckbox === undefined) item.selected = !item.selected;
        if ($scope.checkSelectedAttribute('published', 0)) {
          $scope.publishEnabled = true;
        } else {
          $scope.publishEnabled = false;
        }
        if (item.selected) {
          $scope.selectedCounter++;
          if ($scope.selectedCounter === $scope.gifList.length) {
            $scope.input.allSelected = true;
          }
        }
        else {
          $scope.selectedCounter--;
          $scope.input.allSelected = false;
        }
      }
    };

    $scope.copyToClipboard = function($event, id) {
      $event.stopPropagation();
      if (id) {
        GFAN.sendEvent({
          event: 'copy_url',
          username: pathUsername,
          gfyid: id
        });
      } else {
        GFAN.sendEvent({
          event: 'copy_url',
          username: pathUsername,
          albumLinkText: id
        });
      }
    };

    $scope.removeGif = function(gfyId) {
      for (var i = 0; i < $scope.gifList.length; i++) {
        if ($scope.gifList[i].gfyId === gfyId) {
          $scope.gifList.splice(i, 1);
        }
      }
    };

    $scope.showDeleteConfirmation = function() {
      $scope.deleteModal.shown = true;
    };

    $scope.delete = function() {
      $scope.isButtonDisabled = true;
      $scope.isPending.delete = true;
      var apiUrl = 'https://api.gfycat.com/v1/me/gfycats/';
      var selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
        return value.selected === true;
      });
      var failed = [], succeeded = [];
      $scope.deleting = selectedGifs;
      accountService.batchDeleteGfycat(selectedGifs).then(function(response) {
        /*if (response.length === 1 && response[0].length === 0) response = [];
        for (var i = 0; i < response.length; i++) {
          if (typeof response[i] === 'object') {
            var url = response[i].config.url;
            var gfyId = url.slice(apiUrl.length, url.length);
            if (response[i].status === -1) {
              //TODO: Try delete again
              failed.push(gfyId);
            }
          }
        }*/
        var length = $scope.gifList.length;
        for (var i = 0; i < selectedGifs.length; i++) {
          for (var j = 0; j < length; j++) {
            if(selectedGifs[i].gfyId === $scope.gifList[j].gfyId) {
              $scope.gifList.splice(j, 1);
              length--;
              break;
            }
          }
        }
        $scope.deleting = [];
        $scope.isPending.delete = false;
        $scope.cleanView();
      });
    };

    $scope.isDeleting = function(gfyId) {
      if (typeof $scope.deleting != "undefined" && $scope.deleting != null && $scope.deleting.length > 0) {
        if ($scope.gifList.type === "albums") {
          for (var i = 0; i < $scope.deleting.length; i++) {
            if ($scope.deleting[i].linkText === gfyId) {
              return true;
            }
          }
        } else{
          for (var i = 0; i < $scope.deleting.length; i++) {
            if ($scope.deleting[i].gfyId === gfyId) {
              return true;
            }
          }
        }
      }
      return false;
    };

    $scope.getAlbumContent = function(albumId) {
      return $q(function(resolve, reject) {
        albumService.getContent(albumId, null).then(function(response) {
          var gfyIdArray = [];
          if (response.publishedGfys !== undefined && response.publishedGfys.length) {
            for (var i = 0; i < response.publishedGfys.length; i++) {
              gfyIdArray.push(response.publishedGfys[i].gfyId);
            }
          } 
          var data = {
            id: albumId,
            gfyIdArray: gfyIdArray
          };
          resolve(data);
        }, function(response) {
          console.error('Error retrieving album content', response);
          reject(response);
        });
      });
    };

    $scope.getAllAlbumContent = function(albumArray) {
      return $q(function(resolve, reject) {
        var promises = [];
        for (var i = 0; i < albumArray.length; i++) {
          promises.push($scope.getAlbumContent(albumArray[i].id));
        }
        $q.all(promises).then(function(response) {
          resolve(response);
        }, function(response) {
          console.error('error getting all album content');
          reject(response);
        });
      });
    };

    $scope.deleteAlbumContent = function(albumArray) {
      return $q(function(resolve, reject) {
        var promises = [];
        $scope.getAllAlbumContent(albumArray).then(function(response) {
          for (var i = 0; i < response.length; i++) {
            if (response[i].gfyIdArray.length !== 0) {
              promises.push(albumService.removeContents(response[i].id, response[i].gfyIdArray));
            }
          }
          $q.all(promises).then(function(response) {
            resolve(response);
          }, function(response) {
            console.error('Error deleting all contents from albums', response);
            reject(response);
          });
        });
      });
    };

    $scope.deleteAlbum = function() {
      $scope.isButtonDisabled = true;
      $scope.isPending.delete = true;
      var apiUrl = 'https://api.gfycat.com/v1/me/albums/';
      var selectedAlbums = $filter('filter')($scope.gifList, function(value, index, array) {
        return value.selected === true;
      });
      $scope.deleteAlbumContent(selectedAlbums).then(function(response) {
        var failed = [], successful = [];
        $scope.deleting = selectedAlbums;
        albumService.batchDeleteAlbum(selectedAlbums).then(function(response) {
          if (response) {
            for (var i = 0; i < response.length; i++) {
              if (response[i] === '' && typeof response.deletedAlbumIds[i]) {
                //Successful delete TODO: remove deleted albums from list
                successful.push(response.deletedAlbumIds[i]);
              } else {
                //Failed delete TODO: call delete again depending on error code
                failed.push(response[i]);
              }
            }
            //TODO: process succeeded/failed arrays
            var length = $scope.gifList.length;
            for (var j = 0; j < successful.length; j++) {
              for (var k = 0; k < length; k++) {
                if (successful[j] === $scope.gifList[k].id) {
                  $scope.gifList.splice(k, 1);
                  length--;
                  break;
                }
              }
            }
          }
          //$scope.deleteModal.shown = false;
          $scope.deleting = [];
          $scope.isPending.delete = false;
          $scope.cleanView();
        });
      });
    };

    $scope.addToNewAlbum = function() {
      return $q(function(resolve, reject) {
        var parentFolderId = 2;
        var albumName = $scope.albumModal.title;
        albumService.createAlbum(parentFolderId, albumName).then(function(response) {
          var albumId = response;
          var selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
            return value.selected === true;
          });
          var selectedGfyIdArray = [];
          for (var i = 0; i < selectedGifs.length; i++) {
            selectedGfyIdArray.push(selectedGifs[i].gfyId);
          }
          if (selectedGifs.length) {
            albumService.renameAlbum(albumId, albumName);
            $scope.addContentToAlbum(albumId, selectedGfyIdArray).then(function(response) {
              resolve(response);
              GFAN.sendEvent({
                event: 'add_video_to_album',
                username: pathUsername,
                gfyid: selectedGfyIdArray,
                length: selectedGifs.length,
                keyword: albumName,
                albumId: albumId,
                type: 'new'
              });
            }, function(response) {
              console.error('Error adding content to album', response);
            });
          }
        }, function(response) {
          console.error('album create fail', response);
          $scope.albumModal.shown = false;
          $scope.albumModal.title = '';
          reject();
        });
      });
    };

    $scope.hasModal = function() {
      if($scope.albumModal.shown || $scope.deleteModal.shown || $scope.detailsModal.shown || $scope.overlayModal.shown) {
        $rootScope.bodyClass = 'scroll-lock';
      }
    };

    $scope.showFullOverlay = function(selection){
      $scope.closeDetailsModal();
      $scope.overlayModal.shown = true;
      $scope.overlayModal.overlay = selection;
    };

    $scope.showDetailsModal = function(gif) {
      $scope.detailed = gif;
      $scope.toggleAllSelected(false);
      $scope.selectedCounter = 1;
      $scope.detailsModal.shown = true;
    };

    $scope.closeDetailsModal = function() {
      $scope.detailsModal.shown = false;
    };

    $scope.showAlbumModal = function() {
      $scope.albumModal.shown = true;
    };

    $scope.submitAlbumCreate = function(isValid) {
      $scope.isPending.createAlbum = true;
      $scope.isButtonDisabled = true;
      if (isValid) {
        $scope.addToNewAlbum().then(function(response) {
          var albumId = response, albumTitle = $scope.albumModal.title;
          $scope.updateAlbumList().then(function(response) {
            $scope.cleanView();
            $scope.showAlbum(albumId, albumTitle);
            $scope.isPending.createAlbum = false;
          });
        }, function(response) {
          console.error('addToNewAlbum error', response);
          $scope.isPending.createAlbum = false;
        });
      }
    };

    $scope.cleanView = function() {
      $scope.input.allSelected = false;
      $scope.input.searchText = '';
      $scope.selectedCounter = 0;
      $scope.albumModal.shown = false;
      $scope.albumModal.title = null;
      $scope.deleteModal.shown = false;
      $scope.detailed = null;
      $scope.detailsModal.shown = false;
      $scope.overlayModal.shown = false;
      $scope.overlayModal.overlay = '';
      $scope.toggleAllSelected(false);
      $scope.isButtonDisabled = false;
    };

    $scope.renameTitle = function(text) {
      $scope.isButtonDisabled = true;
      $scope.isPending.rename = true;
      for (var i = 0; i < $scope.gifList.length; i++) {
        if ($scope.gifList[i].selected === true) {
          $scope.gifList[i].titleString = text;
          $scope.gifList[i].title = text;
          $scope.isPending.rename = false;
          return;
        }
      }
    };

    $scope.editTags = function(text) {
      $scope.isButtonDisabled = true;
      $scope.isPending.edit_tags = true;
      for (var i = 0; i < $scope.gifList.length; i++) {
        if ($scope.gifList[i].selected === true) {
          $scope.gifList[i].tags = text.replace(/#/g, '').split(', ');
          $scope.isPending.edit_tags = false;
          return;
        }
      }
    };

    $scope.editDescription = function(text) {
      $scope.isButtonDisabled = true;
      $scope.isPending.edit_description = true;
      for (var i = 0; i < $scope.gifList.length; i++) {
        if ($scope.gifList[i].selected === true) {
          $scope.gifList[i].description = text;
          $scope.gifList[i].descriptionString = text;
          $scope.isPending.edit_description = false;
          return;
        }
      }
    };

    $scope.getOrderArray = function() {
      var orderList = []; 
      $scope.gifList.forEach(function(gif) {
        orderList[gif.order] = gif.gfyId;
      });
      return orderList;
    };

    $scope.getAlbumArray = function(albumId) {
      return $q(function(resolve, reject) {
        albumService.getContent(albumId).then(function(response) {
          $scope.activeAlbum = (response.publishedGfys === undefined) ? [] : response.publishedGfys;
          $scope.activeAlbum.type = 'album';
          $scope.activeAlbum.albumId = albumId;

          for (var i = 0; i < $scope.activeAlbum.length; i++) {
            $scope.activeAlbum[i].order = i;
          }

          var orderList = []; 
          $scope.activeAlbum.forEach(function(gif) {
            orderList[gif.order] = gif.gfyId;
          });
          resolve(orderList);
        }, function(response) {
          console.log("failed to get previous album ordering");
          reject(response);
        });
      });
    };

    $scope.reorderAlbum = function(dragged, dropped) {
      var orders = $scope.getOrderArray();
      var dragItem = orders.splice(dragged.index, 1);
      orders.splice(dropped.index, 0, dragItem[0]);
      orders.forEach(function(gfyId, index) {
        $scope.gifList.forEach(function(gif) {
          if (gif.gfyId ===  gfyId) {
            gif.order = index;
            gif.selected = false;
          }
        });
      });
      $scope.selectedCounter = 0;
      $scope.input.allSelected = false;
      albumService.saveOrder($scope.gifList.albumId, orders);
      // $scope.saveNewOrder(orders);
    };

    $scope.$on('gifDragSuccess', function(dragEvent, dragGif, dragIndex) {
      $scope.drag = true;
      $scope.dragged = { 
        gfyId: dragGif,
        index: dragIndex
      }     
    });

    $scope.$on('gifDropSuccess', function(dropEvent, dropGif, dropIndex) {
      if ($scope.drag) {
        var dropId = String(dropGif);
        $scope.reorderAlbum( 
          $scope.dragged, 
          { 
            gfyId: dropGif,
            index: dropIndex 
          }
        );
        $scope.drag = false;
        $scope.dragged = {};
      }
    });

    $scope.saveNewOrderPromise = function(id, list) {
      return $q(function(resolve, reject) {
        albumService.saveOrder(id, list).then(
          function(res) {
            resolve(res);
          },
          function(res) {
            console.log("failed to save order");
            reject(res);
          }
        );
      });
    };

    $scope.addHashTags = function(tags) {
      if (tags) {
        return tags.map(function(val) {
          return "#" + val.trim();
        }).join(', ');
      }
    };

    $scope.searchKey = function(event, text) {
      event.stopPropagation();
      if (event.which === 13 && text !== undefined && text.length > 0 && $scope.gifList.type === 'library') {
        $scope.search(text);
        event.target.blur();
      } else if (event.which === 13 && text !== undefined && text.length > 0 && $scope.gifList.type !== 'library') {
        event.target.blur();
      }
      else if (event.keyCode === 27) {
        $scope.input.searchText = '';
        event.target.blur();
      }
    };

    $scope.search = function(searchText) {
      // Do not search for albums until feature is provided
      $scope.isPending.search = true;
      if ($scope.gifList.type === 'albums') {
        return;
      }
      if (searchText !== undefined && searchText.length > 0) {
        $scope.loaded = true;
        var prevList = $scope.gifList;
        $scope.gifList = [];
        folderService.searchFolders(searchText, 50).then(function(response) {
          $scope.input.searchText = '';
          $scope.gifList = response.gfycats ? response.gfycats : [];
          $scope.gifList.current = prevList.current;
          $scope.reverse = true;
          $scope.predicate = 'createDate';
          $scope.gifList.type = 'library';
          $scope.gifList.title = $filter('translate')('LIBRARY.MY_LIBRARY');
          $scope.albumList.title = null;
          $scope.isPending.search = false;
        }, function(response) {
          $scope.gifList = prevList;
        });
      }
    };

    $scope.toggleSearch = function(bool) {
      $scope.isMobileSearching = bool;
      angular.element('#menu-sort-dropdown').toggleClass('shown', false);
      angular.element('#menu-nav-dropdown').toggleClass('shown', false);
      angular.element('#dropdown-title-nav').toggleClass('dropdown-highlight', false);
      angular.element('#dropdown-title-sort').toggleClass('dropdown-highlight', false);
    }

    $scope.cancelSearch = function() {
      $scope.input.searchText = '' ;
      $scope.toggleSearch(false);
      if ($scope.gifList.type === 'albums') {
        $scope.showAlbums();
      } else if ($scope.gifList.type === 'library') {
        $scope.showLibrary();
      } else if ($scope.gifList.type === 'album'){
        $scope.showAlbum($scope.gifList.albumId, $scope.gifList.current);
      } else{
        console.error('Type Exception');
      }
    };

    $scope.showAlbum = function(albumId, albumTitle) {
      if ($scope.albumList.title === albumTitle) return;
      if (!albumTitle) albumTitle = null;
      //$scope.input.allSelected = false;
      $scope.cleanView();
      $scope.reverse = false;
      $scope.predicate = 'order';
      var params = {};
      $scope.gifList = [];
      //var albumId = album.id;
      albumService.getContent(albumId, params).then(function(response) {
        $scope.gifList = (response.publishedGfys === undefined) ? [] : response.publishedGfys;
        $scope.gifList.type = 'album';
        $scope.gifList.albumId = albumId;
        if (albumTitle) {
          $scope.albumList.title = albumTitle;
          $scope.gifList.current = albumTitle;
        }
        for (var i = 0; i < $scope.gifList.length; i++) {
          $scope.gifList[i].order = i;
        }

        GFAN.sendEvent({
          event : 'view_album_page',
          username : pathUsername,
          keyword : albumTitle,
          albumId : albumId
        });
      });
    };

    $scope.showAlbums = function() {
      $scope.cleanView();
      $scope.reverse = false;
      $scope.predicate = 'title';
      //$scope.input.allSelected = false;
      $scope.gifList = [];
      $scope.gifList = $scope.albumList;
      $scope.gifList.type = 'albums';
      $scope.gifList.current = $filter('translate')('LIBRARY.MY_ALBUMS');
      $scope.albumList.title = null;
      GFAN.sendEvent({
        event : 'view_my_albums_page',
        username : pathUsername
      });
    };

    $scope.showLibrary = function() {
      $scope.gifList = [];
      $scope.cleanView();
      $scope.reverse = true;
      $scope.predicate = 'createDate';
      //$scope.input.allSelected = false;
      $scope.gifList = $scope.library;
      $scope.gifList.type = 'library';
      $scope.gifList.title = $filter('translate')('LIBRARY.MY_LIBRARY');
      $scope.albumList.title = null;
    };

    $scope.addContentToAlbum = function(albumId, selectedGfyIdArray) {
      return $q(function(resolve, reject) {
        var albumOrder = $scope.getAlbumArray(albumId).then(function(albumList) {
          // get previous album order to restore after insertion
          albumList = albumList.concat(selectedGfyIdArray);

          albumService.addContents(albumId, selectedGfyIdArray).then(function(response) {
            //TODO: show success confirmation
            $scope.saveNewOrderPromise(albumId, albumList).then(function() {
              resolve(albumId);
            },
            function() {
              reject();
            });    
            
          }, function(response) {
            console.error('add to album fail: ', response);
            reject(response);
            //TODO: show error dialog
          });
        });
      });
    };

    $scope.addToAlbum = function(albumId, albumTitle) {
      var selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
        return value.selected === true;
      });
      var selectedGfyIdArray = [];
      for (var i = 0; i < selectedGifs.length; i++) {
        selectedGfyIdArray.push(selectedGifs[i].gfyId);
      }
      $scope.addContentToAlbum(albumId, selectedGfyIdArray).then(function(response) {
        GFAN.sendEvent({
          event: 'add_video_to_album',
          username: pathUsername,
          lengt: selectedGifs.length,
          gfyi: selectedGfyIdArray,
          keyword: albumTitle,
          albumId: albumId,
          type: 'existing'
        });
        $scope.updateAlbumList().then(function(response) {
          $scope.showAlbum(albumId, albumTitle);
        });
      }, function(response) {
        console.error('Error adding content to album', response);
      });
    };

    $scope.removeFromAlbum = function(albumId, selectedGifs) {
      if (selectedGifs === undefined) {
        selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
          return value.selected === true;
        });
      }
      $scope.deleting = selectedGifs;
      var selectedGfyIdArray = [];
      for (var i = 0; i < selectedGifs.length; i++) {
        selectedGfyIdArray.push(selectedGifs[i].gfyId);
      }
      albumService.removeContents(albumId, selectedGfyIdArray).then(function(response) {
        //TODO: update gifList
        $scope.updateAlbumList().then(function(resolve) {
          $scope.showAlbum(albumId, $scope.gifList.current);
        });
      }, function(response) {
        console.error('remove from album fail: ', response);
        //TODO: show error dialog
      });
      $scope.deleting = [];
    };

    /*$scope.togglePrivacy = function(published) {
      var results = [];
      function push(gfyId) {
        results.push(gfyId);
      }
      return $q(function(resolve, reject) {
        var promises = [];
        var selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
          return value.selected === true;
        });
        for (var i = 0; i < selectedGifs.length; i++) {
          var gfyId = selectedGifs[i].gfyId;
          promises.push(accountService.setGfycatPublished(gfyId, published)
            .then(push.bind(null, gfyId))
            .catch(push.bind(null, gfyId))
          );
        }
        $q.all(promises).then(function(response) {
          console.log('toggle privacy response', response, results);
          resolve(results);
        });
      });
    };*/

    $scope.togglePrivacy = function(published) {
      var selectedGifs = $filter('filter')($scope.gifList, function(value, index, array) {
        return value.selected === true;
      });

      selectedGifs.forEach(function(gif, i) {
        if ($scope.gifList.type === 'album' || $scope.gifList.type === 'library') {
          var gfyId = selectedGifs[i].gfyId;
          accountService.setGfycatPublished(selectedGifs[i].gfyId, published).then(function(response) {
            GFAN.sendEvent({
              event: 'change_video_privacy',
              username: pathUsername,
              gfyid: gfyId,
              context: published ? 'public' : 'hidden'
            });
          }, function(response) {
            console.error('set published failure', response);
          });
        } else if ($scope.gifList.type === 'albums') {
          albumService.savePublished(selectedGifs[i].id, published).then(function(response) {
            GFAN.sendEvent({
              event: 'change_video_privacy',
              username: pathUsername,
              gfyid: selectedGifs[i].id,
              context: published ? 'public' : 'hidden'
            });
          }, function(response) {
            console.error('set published album failure', response);
          });
        }
        selectedGifs[i].published = published;
      });

      $scope.publishEnabled = !$scope.publishEnabled;
      // $scope.input.allSelected = false;
      // $scope.selectedCounter = 0;
    };

    $scope.closeModals = function() {
      $scope.albumModal.shown = false;
      $scope.deleteModal.shown = false;
      $scope.detailsModal.shown = false;
      $scope.overlayModal.shown = false;
      $scope.overlayModal.overlay = '';
      $scope.detailed = null;
    };

    $scope.submitModal = function(event, isValid) {
      if (event.keyCode === 13 && isValid) {
        $scope.submitAlbumCreate(isValid);
      }
    };

    $scope.isMobileSorting = function() {
      if (angular.element('#menu-sort-dropdown').hasClass('shown')) {
        return true;
      }
      return false;
    };

    $scope.isHighlighted = function() {
      if (angular.element('#menu-sort-dropdown').hasClass('shown') || angular.element('#menu-nav-dropdown').hasClass('shown')) {
        return true;
      }
      return false;
    };

    $scope.toggleMenu = function(type) {
      if ($scope.isMobileSorting() === true && type !== 'sort') {
        return;
      }
      $scope.isMobileSearching = false;
      if (type === 'nav') {
        angular.element('#menu-nav-dropdown').toggleClass('shown');
        angular.element('#dropdown-title-nav').toggleClass('dropdown-highlight');
        angular.element('#menu-sort-dropdown').toggleClass('shown', false);
        angular.element('#dropdown-title-sort').toggleClass('dropdown-highlight', false);
      } else if (type === 'action') {
        angular.element('#menu-action-dropdown').toggleClass('shown');
      } else if (type === 'sort') {
        angular.element('#menu-sort-dropdown').toggleClass('shown');
        angular.element('#dropdown-title-sort').toggleClass('dropdown-highlight');
        angular.element('#menu-nav-dropdown').toggleClass('shown', false);
        angular.element('#dropdown-title-nav').toggleClass('dropdown-highlight', false);
      }
    };

    $scope.toLocaleNumber = UTIL.toLocaleNumber;
    $scope.toLocaleDate = UTIL.toLocaleDate;
  }
);
