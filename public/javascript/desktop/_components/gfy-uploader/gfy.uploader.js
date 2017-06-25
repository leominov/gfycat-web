angular.module('gfycatApp')
  .directive('gfyUploader',
      ['gfyAccountTree', 'userSettings', 'gfyEditorOld', 'gfyEditor', 'gfyFeeds','oauthTokenService',
      function(gfyAccountTree, userSettings, gfyEditorOld, gfyEditor, gfyFeeds, oauthTokenService) {
    return {
      restrict: 'E',
      templateUrl: '/javascript/desktop/_components/gfy-uploader/gfy-uploader.html',
      link: function(scope, element, attrs) {
        scope.ups = userSettings;
        scope.accountTree = gfyAccountTree;
        scope.gfyEdit = function() {
            if (oauthTokenService.isUserLoggedIn()) {
                return gfyEditor;
            } else {
                return gfyEditorOld;
            }
        };
        scope.feeds = gfyFeeds;

        scope.doBookmark = function(file) {
          if (scope.accountTree.loggedIntoAccount) scope.feeds.saveBookmarkState(file);
          else scope.createA();
        };

        scope.changeUploadFolder = function(folder, file) {
          file.usersGfyUpFolderTitle = folder.title;
          file.usersGfyUpFolderId = folder.id;
          scope.gfyEdit.saveUsersInfo(file);
        };

        scope.createA = function() {
          scope.createNew = !scope.createNew;
        };
      }
    }
  }
]);
