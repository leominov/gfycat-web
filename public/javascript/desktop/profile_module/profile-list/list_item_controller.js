var app = angular.module('profileApp');
app.controller('listItemController', function($scope, $stateParams, accountService, $rootScope) {

  $scope.userName = $stateParams.path;
  var pathUsername = $scope.userName.toLowerCase().substr(1);
  $scope.gif.selected = false;
  $scope.gif.titleString = '';
  $scope.gif.isDragged = false;
  if (!$scope.gif.title || $scope.gif.title === 'Untitled') {
    $scope.gif.title = '';
    $scope.gif.titleString = '';
  } else {
    $scope.gif.titleString = $scope.gif.title.trim();
  }

  if (!$scope.gif.tags) {
    $scope.gif.tags = [];
    $scope.gif.tagsString = '';
  } else {
    $scope.gif.tagsString = $scope.gif.tags.map(function(val) {return val.trim();}).join(', ');
  }

  if ($scope.gif.description === undefined || !$scope.gif.description) {
    $scope.gif.description = '';
    $scope.gif.descriptionString = '';
  } else {
    $scope.gif.descriptionString = $scope.gif.description;
  }

  function updateGfyTitle(oldValue, newValue) {
    if (newValue !== oldValue && newValue.length !== 0) {
      accountService.setGfycatTitle($scope.$parent.gif.gfyId, newValue).then(function(response) {
        $scope.gif.title = newValue;
        $scope.gif.titleString = $scope.gif.title;
        GFAN.sendEvent(
          {
            event : 'edit_title',
            username : pathUsername,
            text: newValue
          }
        );
      }, function(response) {
        console.error('failed to set title', response);
        $scope.gif.title = oldValue;
        $scope.gif.titleString = oldValue;
      });
    } else {
      $scope.gif.title = oldValue;
      $scope.gif.titleString = oldValue;
    }
  }

  function updateGfyTags(oldValue, newValue) {
    if (!angular.equals(oldValue, newValue)) {
      accountService.setGfyTags($scope.$parent.gif.gfyId, newValue).then(function(response) {
        $scope.gif.tags = newValue;
        $scope.gif.tagsString = $scope.gif.tags.map(function(val) {return val.trim();}).join(', ');
        GFAN.sendEvent(
          {
            event : 'edit_tag',
            username : pathUsername,
            text : newValue
          }
        );
      }, function(response) {
        console.error('failed to set gfy tags', response);
        $scope.gif.tags = oldValue;
        $scope.gif.tagsString = oldValue.map(function(val) {return val.trim();}).join(', ');
      });
    } else {
      $scope.gif.tags = oldValue;
      $scope.gif.tagsString = oldValue.map(function(val) {return val.trim();}).join(', ');
    }
  }

  function updateAlbumRow() {
    var albumId = $scope.$parent.gif.id;
    accountService.albumService.getContent(albumId, null).then(function(response) {
      $scope.$parent.gif.linkText = response.linkText;
    }, function(response) {
      console.error('error retrieving album content', response);
    });
  }

  function updateAlbumTitle(oldValue, newValue) {
    if (newValue !== oldValue && newValue.length !== 0) {
      accountService.albumService.renameAlbum($scope.$parent.gif.id, newValue).then(function(response) {
        $scope.gif.title = newValue;
        $scope.gif.titleString = $scope.gif.title;
        updateAlbumRow();
      }, function(response) {
        console.error('failed to set title', response);
        $scope.gif.title = oldValue;
        $scope.gif.titleString = oldValue;
      });
    } else {
      $scope.gif.title = oldValue;
      $scope.gif.titleString = oldValue;
    }
  }

  function updateAlbumTags(oldValue, newValue) {
    if (!angular.equals(oldValue, newValue)) {
      accountService.albumService.saveTags($scope.$parent.gif.id, newValue).then(function(response) {
        $scope.gif.tags = newValue;
        $scope.gif.tagsString = $scope.gif.tags.map(function(val) {return val.trim();}).join(', ');
      }, function(response) {
        console.error('failed to set gfy tags', response);
        $scope.gif.tags = oldValue;
        $scope.gif.tagsString = $scope.gif.tags.map(function(val) {return val.trim();}).join(', ');
      });
    } else {
      $scope.gif.tags = oldValue;
      $scope.gif.tagsString = $scope.gif.tags.map(function(val) {return val.trim();}).join(', ');
    }
  }

  function updateAlbumDescription(oldValue, newValue) {
    if (newValue !== oldValue && newValue !== '') {
      accountService.albumService.saveDescription($scope.$parent.gif.id, newValue).then(function(response) {
        $scope.gif.description = newValue;
        $scope.gif.descriptionString = $scope.gif.description.trim();
      }, function(response) {
        console.error('failed to set album description', response);
        $scope.gif.description = oldValue;
        $scope.gif.descriptionString = $scope.gif.description.trim();
      });
    } else if (newValue === '') {
      accountService.albumService.deleteDescription($scope.$parent.gif.id).then(function(response) {
        $scope.gif.description = newValue;
        $scope.gif.descriptionString = $scope.gif.description.trim();
      }, function(response) {
        console.error('failed to delete album description', response);
        $scope.gif.description = oldValue;
        $scope.gif.descriptionString = $scope.gif.description.trim();
      });
    } else {
      $scope.gif.description = oldValue;
      $scope.gif.descriptionString = $scope.gif.description.trim();
    }
  }

  $scope.$watch('gif.title', function(newValue, oldValue) {
    if (oldValue === undefined) oldValue = '';
    if (newValue === undefined) newValue = '';
    if (newValue !== oldValue) {
      if ($scope.$parent.gif.folderSubType === 'Album') {
        updateAlbumTitle(oldValue, newValue);
      } else {
        updateGfyTitle(oldValue, newValue);
      }
    }
  }, true);

  $scope.$watch('gif.tags', function(newValue, oldValue) {
    if (oldValue === undefined) oldValue = [];
    if (newValue === undefined) newValue = [];
    if (newValue !== oldValue) {
      if ($scope.$parent.gif.folderSubType === 'Album') {
        updateAlbumTags(oldValue, newValue);
      } else {
        updateGfyTags(oldValue, newValue);
      }
    }
  }, true);

  $scope.$watch('gif.description', function(newValue, oldValue) {
    if (oldValue === undefined) oldValue = '';
    if (newValue === undefined) newValue = '';
    if (newValue !== oldValue && oldValue !== null) {
      updateAlbumDescription(oldValue, newValue);
    }
  }, true);

  $scope.dragStart = function() {
    $scope.gif.isDragged = true;
  };

   $scope.dragStop = function() {
    $scope.gif.isDragged = false;
  };

  $scope.onDragComplete = function(index, gif) {
    $rootScope.$broadcast('gifDragSuccess', gif.gfyId, index);
  };

  $scope.onDropComplete = function(index, gif) {
    $rootScope.$broadcast('gifDropSuccess', gif.gfyId, index);
    $scope.gif.isDragged = false;
  };

  $scope.mouseEnter = function() {
    $scope.show_video = true;
  };

  $scope.mouseLeft = function() {
    $scope.show_video = false;
  };

  $scope.isVideoShown = function() {
    return $scope.show_video;
  };

  $scope.focus = function(event) {
    event.stopPropagation();
  };

  $scope.blur = function(event, submit) {
    event.stopPropagation();
    event.target.blur();
    if (submit) {
      switch (event.target.attributes['ng-model'].value) {
        case 'gif.titleString':
          $scope.gif.title = $scope.gif.titleString.trim();
          break;
        case 'gif.tagsString':
          $scope.gif.tags = $scope.gif.tagsString.split(',')
          .filter(function(tag) {
            return tag.trim().length;
          }).map(function(tag) {
            return tag.trim();
          });
          break;
        case 'gif.descriptionString':
          $scope.gif.description = $scope.gif.descriptionString.trim();
          break;
        default:
          break;
      }
    } else {
      switch (event.target.attributes['ng-model'].value) {
        case 'gif.titleString':
          $scope.gif.titleString = $scope.gif.title !== undefined ? $scope.gif.title.trim() : '';
          break;
        case 'gif.tagsString':
          $scope.gif.tagsString = $scope.gif.tags !== undefined ? $scope.gif.tags.map(function(val) {return val.trim();}).join(', ') : [];
          break;
        case 'gif.descriptionString':
          $scope.gif.descriptionString = $scope.gif.description !== undefined ? $scope.gif.description.trim() : '';
          break;
        default:
          break;
      }
    }
  };

  $scope.keyup = function(event) {
    event.stopPropagation();
    if (event.keyCode === 13) {
      //event.target.blur();
      $scope.blur(event, true);
    } else if (event.keyCode === 27) {
      //event.target.blur();
      $scope.blur(event, false);
    }
  };
});
