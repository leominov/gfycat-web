
angular.module('gfycat.shared').service('bookmarkService', ['$rootScope','$location','$http','$q','httpHelperService',
    function($rootScope, $location,$http,$q,httpHelperService)  {

        var apiUrl = "https://api.gfycat.com/v1";

        function getBookmarkFolders(){
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl+ '/me/bookmark-folders'));
        }

        function createBookmarkFolder(bookmarkFolderId, bookmarkFolderName){
            return httpHelperService.wrapDeferredIf200($http.post(apiUrl+"/me/bookmark-folders/"+bookmarkFolderId, {folderName: bookmarkFolderName}));
        }
        function renameBookmarkFolder(bookmarkFolderId, bookmarkFolderName){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/bookmark-folders/" + bookmarkFolderId +"/name", {value: bookmarkFolderName}));
        }
        function moveBookmarkFolder(bookmarkFolderId, parentId){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/bookmark-folders/"+bookmarkFolderId, {parentId:parentId}));
        }
        function deleteBookmarkFolder(bookmarkFolderId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+"/me/bookmark-folders/"+bookmarkFolderId));
        }
        function getContents(bookmarkFolderId, sortKey, first, order, count){
            return httpHelperService.wrapDeferredIf200($http.get(
                apiUrl+'/me/bookmark-folders/' +
                bookmarkFolderId +
                '?sortkey=' + sortKey +
                '&first=' + first +
                '&order=' + order +
                '&count=' + count
            ));
        }
        function getContent(bookmarkFolderId, params) {
            return httpHelperService.wrapDeferredIf200(
              $http.get(apiUrl + '/me/bookmark-folders/' + bookmarkFolderId, {params: params})
            );
        }
        function moveContents(fromBookmarkFolderId, toBookmarkFolderId, contentsGfyIdArray){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+"/me/bookmark-folders/" + fromBookmarkFolderId,
                data: {
                    action : 'move_contents',
                    gfy_ids : contentsGfyIdArray,
                    parent_id: toBookmarkFolderId
                }
            }));
        }
        return {
            getBookmarkFolders: getBookmarkFolders,
            getContents: getContents,
            getContent: getContent,
            createBookmarkFolder: createBookmarkFolder,
            renameBookmarkFolder: renameBookmarkFolder,
            moveBookmarkFolder: moveBookmarkFolder,
            deleteBookmarkFolder: deleteBookmarkFolder,
            moveContents: moveContents
        };

    }]);
