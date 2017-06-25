
angular.module('ngModal').provider('ngModalDefaults', function() {
  return {
    options: {
      closeButtonHtml: "<span class='ng-modal-close-x'>X</span>"
    },
    $get: function() {
      return this.options;
    },

    set: function(keyOrHash, value) {
      var k, v, _results;
      if (typeof keyOrHash === 'object') {
        _results = [];
        for (k in keyOrHash) {
          v = keyOrHash[k];
          _results.push(this.options[k] = v);
        }

        return _results;
      } else {
        return this.options[keyOrHash] = value;
      }
    }
  };
})

//################################################### directive and controller for gfy modals
    .directive('gfyModals', function() {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/_components/modals/gfy-modals.html',
        controller: function($scope, $rootScope, gfyModalMachine) {
          // trying some modal app stuff here
          $scope.gfyModals = gfyModalMachine;

          $rootScope.$on('escape_key', function(event, e) {
            $scope.closeAll();

            //console.log('got escape');
          /* implementation here */ });

          $rootScope.$on('route_change', function(event, e) {
            $scope.closeAll();

            //console.log('got route change');
          /* implementation here */ });

          $scope.closeAll = function() {
            $scope.gfyModals.modalLoginShown = false;
            $scope.gfyModals.modalDialogShown = false;
            $scope.gfyModals.modalUserAccountShown = false;
            $scope.gfyModals.modalLoginShown = false;
            $scope.gfyModals.modalHowTosShown = false;
            $scope.gfyModals.modalDetailPlayerShown = false;
          };
        },

        controllerAs: 'gfyModalsCtrl'
      };
    })// end directive

// ************************************************ this displays modalDialog ************************************************************************************************
    .directive('modalDialog', [
        'ngModalDefaults', '$sce', function(ngModalDefaults, $sce) {
          return {
            restrict: 'E',
            scope: {
              show: '=',
              dialogTitle: '@',
              onClose: '&?'
            },
            replace: true,
            transclude: true,
            link: function(scope, element, attrs) {
              var setupCloseButton, setupStyle;
              setupCloseButton = function() {
                return scope.closeButtonHtml = $sce.trustAsHtml(ngModalDefaults.closeButtonHtml);
              };

              setupStyle = function() {
                scope.dialogStyle = {};
                if (attrs.width) {
                  scope.dialogStyle['width'] = attrs.width;
                }

                if (attrs.height) {
                  return scope.dialogStyle['height'] = attrs.height;
                }
              };

              scope.hideModal = function() {
                return scope.show = false;
              };

              scope.$watch('show', function(newVal, oldVal) {
                if (newVal && !oldVal) {
                  document.getElementsByTagName('body')[0].style.overflow = 'hidden';
                } else {
                  document.getElementsByTagName('body')[0].style.overflow = '';
                }

                if ((!newVal && oldVal) && (scope.onClose != null)) {
                  return scope.onClose();
                }
              });

              setupCloseButton();
              return setupStyle();
            },

            templateUrl: '/javascript/desktop/_components/modals/modal-template.html'
          };
        },
    ])// end directive
// ************************************************ this displays modalHowTos ************************************************************************************************
    .directive('modalHowTos', [
        'ngModalDefaults', '$sce', function(ngModalDefaults, $sce) {
          return {
            restrict: 'E',
            scope: {
              show: '=',
              dialogTitle: '@',
              onClose: '&?',
            },
            replace: true,
            transclude: true,
            link: function(scope, element, attrs) {
              var setupCloseButton, setupStyle;
              setupCloseButton = function() {
                return scope.closeButtonHtml = $sce.trustAsHtml(ngModalDefaults.closeButtonHtml);
              };

              setupStyle = function() {
                scope.dialogStyle = {};
                if (attrs.width) {
                  scope.dialogStyle['width'] = attrs.width;
                }

                if (attrs.height) {
                  return scope.dialogStyle['height'] = attrs.height;
                }
              };

              scope.hideModal = function() {
                return scope.show = false;
              };

              scope.$watch('show', function(newVal, oldVal) {
                if (newVal && !oldVal) {
                  document.getElementsByTagName('body')[0].style.overflow = 'hidden';
                } else {
                  document.getElementsByTagName('body')[0].style.overflow = '';
                }

                if ((!newVal && oldVal) && (scope.onClose != null)) {
                  return scope.onClose();
                }
              });

              setupCloseButton();
              return setupStyle();
            },

            templateUrl: '/javascript/desktop/_components/modals/modal-how-tos.html',
          };
        },
    ])// end directive
// ************************************************ this displays modalUploads ************************************************************************************************
    .directive('modalUploads', [
        'ngModalDefaults', '$sce', 'gfyAccountTree', 'userSettings', '$http', 'gfyEditorOld', 'gfyEditor', '$rootScope','gfyFeeds','oauthTokenService', '$location', '$state',
        function(ngModalDefaults, $sce, gfyAccountTree, userSettings, $http, gfyEditorOld, gfyEditor, $rootScope ,gfyFeeds, oauthTokenService, $location, $state) {
          return {
            restrict: 'E',
            scope: {
              show: '=',
              createNew: '=', // check if we are creating a new account
              tempFolderTitle:'=', // temp upload folder title
              tempFolderId:'=', //temp upload folder id
              dialogTitle: '@',
              onClose: '&?',
            },
            replace: true,
            transclude: true,
            link: function(scope, element, attrs) {

              scope.ups = userSettings;
              scope.accountTree = gfyAccountTree;
              scope.gfyEdit = function(){
                  if(oauthTokenService.isUserLoggedIn()) {
                      return gfyEditor;
                  }else{
                      return gfyEditorOld;
                  }
              };
              scope.feeds = gfyFeeds;

              var setupCloseButton, setupStyle;
              setupCloseButton = function() {
                return scope.closeButtonHtml = $sce.trustAsHtml(ngModalDefaults.closeButtonHtml);
              };

              setupStyle = function() {
                scope.dialogStyle = {};
                if (attrs.width) {
                  scope.dialogStyle['width'] = attrs.width;
                }

                if (attrs.height) {
                  return scope.dialogStyle['height'] = attrs.height;
                }
              };

              scope.doBookmark = function(file) {
                if (scope.accountTree.loggedIntoAccount) scope.feeds.saveBookmarkState(file);
                else scope.createA();
              };

              scope.hideModal = function() {
                if ($state.current &&
                    $state.current.name === "home.uploader" ||
                    $state.current.name === "home.uploader_url") {
                  $location.path('/').search({});
                }
                return scope.show = false;
              };

              scope.$watch('show', function(newVal, oldVal) {
                if (newVal && !oldVal) {
                  document.getElementsByTagName('body')[0].style.overflow = 'hidden';
                } else {
                  document.getElementsByTagName('body')[0].style.overflow = '';
                }

                if ((!newVal && oldVal) && (scope.onClose != null)) {
                  return scope.onClose();
                }
              });

              scope.changeUploadFolder = function(folder, file) {
                file.usersGfyUpFolderTitle = folder.title;
                file.usersGfyUpFolderId = folder.id;
                scope.gfyEdit.saveUsersInfo(file);
              };

              scope.createA = function() {
                scope.createNew = !scope.createNew;

                scope.hideModal();
              };

              setupCloseButton();
              return setupStyle();
            },

            templateUrl: '/javascript/desktop/_components/upload/modal-uploads.html?5',

          };
        },
    ])// end directive

function displayCharLimit(input) {
  var $this = $(input),
      $charDisplay = $this.next('.charsRemaining');

  // show character count
  $charDisplay.removeClass('fadeOut');

  //run char counter
  countChar(input, $this.data('char-limit'), $charDisplay);

  // count characters (counts down)
  function countChar(input, limit, $charDisplay) {
    var len = input.value.length;
    if (len > limit)
        input.value = input.value.substring(0, limit);
    else if (len <= limit)
        $charDisplay.text(limit - len);

    // fade out character count after typing
    setTimeout(function() {
      if (!$charDisplay.hasClass('fadeOut') && (len >= input.value.length))
          $charDisplay.addClass('fadeOut');
    }, 2700);
  };
}

// !!! This $templates var is set up on line 75,
// and needs to be removed for production
var $templates;

function newQueueAnimation(queueExists) {
  var $upPnl = $('.uploadPanel.computer');

  // remove templates from the DOM
  if ($upPnl.hasClass('hideTemplateListItems'))
      $('.template').remove();

  if (queueExists) {//} || !$upPnl.hasClass('haveStuffInQueue')) { // run animation to display the queue
    $upPnl.addClass('haveStuffInQueue');

    // number of list items (videos in queue)
    // *the selector excludes my template li's (which will be deleted eventually)
    var count; //= $('ol.fileList li').length;
    if ($upPnl.hasClass('hideTemplateListItems'))
        count = $upPnl.find('ol.fileList > li:not(.template)').length;
    else
        count = $upPnl.find('ol.fileList > li').length;

    if (count > 0) {
      var $fileList = $('ol.fileList');

      if ($('.ng-modal').is(':visible')) {

        // height of list item in pixels (height: 40 + padding-bottom: 10)
        var liHeight = 50;

        // set the initial margin-top of the list to slide down from
        // minus 10 extra pixels for the last li (no padding-bottom)
        var olInitMarginTop = ((liHeight * count) - 10) * -1;

        // set the margin of the list based on files uploaded
        $fileList.css({ 'margin-top': olInitMarginTop, display: 'none', 'z-index': '90' });

        setTimeout(function() {
          // give the list items their dimensions (after margin adjustment), and temporarily hide overflow
          $upPnl.addClass('renderDimensions').css('overflow', 'hidden');

          //***// set fileList to display block
          $fileList.show();

          // add animation class to enable the slideDown transition
          $fileList.addClass('animateFiles');

          //***// minimize upload text
          $upPnl.addClass('uploadsInQueue');

          setTimeout(function() {
            // slide file list into view
            $fileList.css({ 'margin-top': '0', display: 'block', 'z-index': '90' });

            setTimeout(function() {
              // remove overflow hidden from panel
              $upPnl.attr('style', '');
            }, 1000);
          }, 50);
        }, 50);
      }      else {
        //// show fileList
        $fileList.show();

        // give the list items their dimensions //***// minimize upload text
        $upPnl.addClass('renderDimensions').addClass('uploadsInQueue');
      }

      //positionDialog();

      return true;
    }    else {
      if (!$('uploadPanel.computer').hasClass('hideTemplateListItems'))
          alert('No items detected...');

      return false;
    }
  }  else { //reverse animation to hide the queue

    //positionDialog();

    $('.uploadPanel.computer').removeClass('renderDimensions uploadsInQueue').children('form').removeClass('haveStuffInQueue');//***// uploadsInQueue');
    $('ol.fileList').removeClass('animateFiles');//.children('li').remove();
  }
}

function setListItemsResolved() {
  $('ol.fileList').find('.uploadMessage > span').removeClass('ng-hide');
  $('ol.fileList > li > div').removeClass('pending warning rejected encoding errorEnc').addClass('resolved');
  $('ol.fileList > li').removeClass('showDetails').find('.uploadMessage').show().next('.detailsPanel').hide();
}

function setListItemsWarning() {
  $('ol.fileList').find('.uploadMessage > span').removeClass('ng-hide');
  $('ol.fileList > li > div').removeClass('pending resolved rejected encoding errorEnc').addClass('resolved encoding warning');
  $('ol.fileList > li').removeClass('showDetails').find('.uploadMessage').show().next('.detailsPanel').hide();
}

function setListItemsRejected() {
  $('ol.fileList').find('.uploadMessage > span').removeClass('ng-hide');
  $('ol.fileList > li > div').removeClass('pending warning resolved encoding errorEnc').addClass('rejected');
  $('ol.fileList > li').removeClass('showDetails').find('.uploadMessage').show().next('.detailsPanel').hide();
}

function templates(show) {
  if (show) {
    $('.uploadPanel.computer').removeClass('hideTemplateListItems');
    $('ol.fileList').append($templates);
    newQueueAnimation(true);
  }  else {
    $('.template').remove();
    newQueueAnimation(false);
  }
}
