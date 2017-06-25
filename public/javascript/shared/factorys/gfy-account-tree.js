/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('gfyAccountTree', ['$http', 'folderService', 'albumService', 'bookmarkService',
    function($http, folderService, albumService, bookmarkService) {
    return {
        loggedIntoAccount: false,
        accountName: 'Login',
        userClosedBanner: false,
        accountGfys: [],
        searchingAccount: false,
        usersLibQuery: null,
        checkLoggedIn: function() {
            if (this.loggedIntoAccount) return;
            var thisScope = this;
            return folderService.get().success(function(data) { // on successful get request populate the folder data
                if (data.gfyCount != undefined) {
                    thisScope.loggedIntoAccount = true;
                    thisScope.getSomeFolders();
                }
            }).error(function(data) {
                thisScope.loggedIntoAccount = false;
            });
        },

        userFolders: [{
            id: 1,
            title: 'fetching...', // show temporarily while getting data... users should never see this as we try to pre-load on the mainpage
            nodes: []
        },],
        userAlbums: [{
            id: 2,
            title: 'fetching...', // show temporarily while getting data
            nodes: []
        },],
        userBookmarks: [{
            id: 3,
            title: 'fetching...', // show temporarily while getting data
            nodes: []
        },],
        update: function(data) {
            if (data[0].id == 1) {
                this.userFolders = data; this.userFolders[0].title = 'My Gfycats';
            }

            if (data[0].id == 2) {
                this.userAlbums = data; this.userAlbums[0].title = 'Albums';
            }

            if (data[0].id == 3) {
                this.userBookmarks = data; this.userBookmarks[0].title = 'Bookmarks';
            }
        },

        singleItemMoveId: 0,
        getUserFolders: function() {
            return folderService.getFolders().then(function(data) { // on successful get request populate the data
                return data;
            });
        },

        getUserAlbums: function() {
            return albumService.getAlbumFolders().then(function(data) { // on successful get request populate the data
                return data;
            });
        },

        getUserBookmarkFolders: function() {
            return bookmarkService.getBookmarkFolders().then(function(data) { // on successful get request populate the data
                return data;
            });
        },

        // ********************************************** function to Load users account folders ********************************************************************************************
        getSomeFolders: function() {
            var thisScope = this;
            this.getUserFolders().then(function(data) {
                thisScope.update(data);
            });

            this.getUserAlbums().then(function(data) {
                thisScope.update(data);
            });

            this.getUserBookmarkFolders().then(function(data) {
                thisScope.update(data);
            });

        }// end of function

    };
},]);
