
angular.module('gfycat.shared').service('albumService', ['$rootScope','$location','$http','$q','httpHelperService',
    function($rootScope, $location,$http,$q,httpHelperService)  {

        var apiUrl = "https://api.gfycat.com/v1";

        function getAlbumFolders(){
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl+'/me/album-folders'));
        }
        function createAlbum(albumId, albumName){
            return httpHelperService.wrapDeferredIf200($http.post(apiUrl+"/me/albums/"+albumId, {folderName: albumName}));
        }
        function saveTags(albumId, tags){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+ '/me/albums/' + albumId + '/tags',
                data: {value: tags}
            }));
        }
        function saveDescription(albumId, description){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/albums/' + albumId + '/description', {value:description}));
        }
        function deleteDescription(albumId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+'/me/albums/' + albumId + '/description'));
        }
        function saveNsfw(albumId, nsfw){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/albums/' + albumId + "/nsfw", {value:nsfw}));
        }
        function saveOrder(albumId, order){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+'/me/albums/' + albumId + "/order", {value:order}));
        }
        function savePublished(albumId, published){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/albums/" + albumId + "/published", {value:published}));
        }
        function createAlbumFolder(albumId, albumName){
            return httpHelperService.wrapDeferredIf200($http.post(apiUrl+"/me/album-folders/"+albumId, {folderName: albumName}));
        }
        function renameAlbum(albumId, albumName){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/albums/" + albumId +"/name", {value: albumName}));
        }
        function renameAlbumFolder(albumId, albumName){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/album-folders/" + albumId +"/name", {value: albumName}));
        }
        function moveAlbum(albumId, parentId){
            return httpHelperService.wrapDeferredIf200($http.put(apiUrl+"/me/albums/"+albumId, {parentId:parentId}));
        }
        function deleteAlbum(albumId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+"/me/albums/"+albumId));
        }
        function batchDeleteAlbum(albumArray) {
          var results = [];
          results.deletedAlbumIds = [];

          function push(response) {
            results.push(response);
          }

          return $q(function(resolve, reject) {
            var promises = [];
            for (var i = 0; i < albumArray.length; i++) {
              results.deletedAlbumIds.push(albumArray[i].id);
              promises.push(
                httpHelperService.wrapDeferredIf200(
                  $http.delete(apiUrl + '/me/albums/' + albumArray[i].id)
                )
                .then(function(response) {
                  push(response);
                })
                .catch(push)
              );
            }
            $q.all(promises)
              .then(function() {
                resolve(results);
              });
          });
        }
        function deleteAlbumFolder(albumId){
            return httpHelperService.wrapDeferredIf200($http.delete(apiUrl+"/me/album-folders/"+albumId));
        }
        function getPublicAlbums(userId) {
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl + '/users/' + userId + '/albums'));
        }
        function getContentPublic(linkText, userId) {
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl + '/users/' + userId + '/album_links/' + linkText));
        }
        function getContentPublicById(albumId, userId) {
            return httpHelperService.wrapDeferredIf200($http.get(apiUrl + '/users/' + userId + '/albums/' + albumId));
        }
        function getContents (albumId, sortKey, first, order, count){
            return httpHelperService.wrapDeferredIf200($http.get(
                apiUrl+'/me/albums/' +
                albumId +
                '?sortkey=' + sortKey +
                '&first=' + first +
                '&order=' + order +
                '&count=' + count
            ));
        }
        function getContent (albumId, params) {
          return httpHelperService.wrapDeferredIf200($http.get(apiUrl + '/me/albums/' + albumId, {params: params}));
        }
        function moveContents(fromAlbumFolderId, toAlbumFolderId, contentsAlbumIdArray){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+"/me/albums/" + fromAlbumFolderId,
                data: {
                    action : 'move_contents',
                    gfy_ids : contentsAlbumIdArray,
                    parent_id: toAlbumFolderId
                }
            }));
        }
        function removeContents(fromAlbumId, contentsGfyIdArray){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+'/me/albums/' + fromAlbumId,
                data: {
                    action: "remove_contents",
                    gfy_ids: contentsGfyIdArray
                }
            }));
        }
        function addContents(toAlbumId, contentsGfyIdArray){
            return httpHelperService.wrapDeferredIf200($http({
                method: "PATCH",
                url: apiUrl+"/me/albums/" + toAlbumId,
                data: {
                    action : 'add_to_album',
                    gfy_ids : contentsGfyIdArray
                }
            }));
        }
        return {
            getAlbumFolders: getAlbumFolders,
            createAlbum: createAlbum,
            createAlbumFolder: createAlbumFolder,
            renameAlbum: renameAlbum,
            renameAlbumFolder: renameAlbumFolder,
            saveTags: saveTags,
            saveDescription: saveDescription,
            saveNsfw: saveNsfw,
            savePublished: savePublished,
            saveOrder: saveOrder,
            deleteDescription: deleteDescription,
            moveAlbum: moveAlbum,
            deleteAlbum: deleteAlbum,
            batchDeleteAlbum: batchDeleteAlbum,
            deleteAlbumFolder: deleteAlbumFolder,
            getPublicAlbums: getPublicAlbums,
            getContentPublic: getContentPublic,
            getContentPublicById: getContentPublicById,
            getContents: getContents,
            getContent: getContent,
            moveContents: moveContents,
            removeContents: removeContents,
            addContents: addContents
        };
    }]);
