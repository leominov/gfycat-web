
angular.module('gfycat.shared').service('folderService', ['$rootScope','$location','$http','$q','httpHelperService',
    function($rootScope, $location,$http,$q, httpHelperService)  {

        var apiUrl = "https://api.gfycat.com/v1";

        function getFolders() {
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl+'/me/folders'));
        }

        function searchFolders(searchText, count){
            return httpHelperService.wrapDeferredIf200($http.get('https://api.gfycat.com/v1/me/gfycats/search?search_text=' + searchText + '&count=' + count));
        }

        function getContents (folderId, sortKey, first, order, count){
            return httpHelperService.wrapDeferredIf200($http.get(
                apiUrl+'/me/folders/' +
                folderId +
                '?sortkey=' + sortKey +
                '&first=' + first +
                '&order=' + order +
                '&count=' + count
            ));
        }

        function getContent (folderId, params) {
          return httpHelperService.wrapDeferredIf200($http.get(apiUrl + '/me/folders/' + folderId, {params: params}));
        }

        function createFolder(folderId, folderName){
            return httpHelperService.wrapDeferredIf200($http.post(apiUrl+"/me/folders/"+folderId, {folderName: folderName}));
        }

        function renameFolder(folderId, folderName){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/folders/" + folderId +"/name", {value: folderName}));
        }

        function moveFolder(folderId, parentId){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/folders/"+folderId, {parentId:parentId}));
        }

        function deleteFolder(folderId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+"/me/folders/"+folderId));
        }

        function moveContents(fromFolderId, toFolderId, contentsGfyIdArray){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+"/me/folders/" + fromFolderId,
                data: {
                    action: 'move_contents',
                    gfy_ids: contentsGfyIdArray,
                    parent_id: toFolderId
                }
            }));
        }
        return {
            getFolders: getFolders,
            getContents: getContents,
            getContent: getContent,
            createFolder: createFolder,
            renameFolder: renameFolder,
            searchFolders: searchFolders,
            moveFolder: moveFolder,
            deleteFolder: deleteFolder,
            moveContents: moveContents
        };


}]);
