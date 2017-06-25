/**
 * Created by jeff on 2014-09-29.
 */

//(function(){ //java wrapper function

angular.module('accountFilesApp', ['infinite-scroll', 'ui.tree', 'ngModal', 'dragDrop', 'demo', 'blueimp.fileupload', 'gfyPaginationApp', 'autoapp', 'ngAnimate'])

// this is the factory/service to store/share users settings with other app modules etc... **********************************************
    .factory('userSettings', function() {
      return {
        // users settings - initialize until we can fetch them from server
        infiniteScroller: false,
        emailAddress: null,
        notifyByEmail: false,
        notifyByEmailHighViews: false,
        updatePassword: false,
        usersPassword: '',
        usersNewPassword: '',

        autoPublish: true,

        defaultUploadFolderTitle: 'My Gfycats',
        defaultUploadFolderId: '',

        useAutoDelete: false,
        purgeableFolderTitle: ' Nothing Selected ',
        purgeableFolderId: '',
        delHour: '00',
        delMin: '05',
        delSec: '00'

      };
    })

//???????????????????????????????????????????? controller to populate the users information
    .controller('accountListingController', function($scope, $rootScope, $http, gfyAccountTree, userSettings, gfyPageView, msgMachine, gfyModalMachine, $location, $timeout, accountService) {

      //first run through the page need defaults set
      $scope.first = 0; // used in backend request string - based on increments of fetchIncrement - starting point in user gfy list to fetch from
      $scope.sortKey = 'age'; // used in backend request string - type of sorting to fetch
      $scope.order = 'SORT_DESC'; // used in backend request string - order of the fetch- ascending or descending

      $scope.orderProperty = '-createDate'; // used in angular to filter list of gfys fetched
      $scope.haveAllGfys = false; // used to let us know if the whole list of gfys in the current folder view has been fetched
      $scope.selectAll = false; // used to let us know if select all check box has been checked
      $scope.totalSelected = 0;
      $scope.totalGfySelected = 0;
      $scope.totalFolderSelected = 0;
      $scope.isGfyListEmpty = false; // used to let us know if the current folder view contains any files
      $scope.gfyCount = 0; //initialize as empty because page loads before data loads
      //$scope.accountGfys=[]; // initialiaze as empty because page loads before data loads - used to store the current folder views list of files
      $scope.albumToEdit = {};

      //$scope.name="Login"; // initialize placeholder name before data loads - user account name // affects line 35-37 of gfyheaderbar
      $scope.busySignal = false; // used by ng-infinite load to slow down page requests if the last promised request was not yet fullfilled
      $scope.gfysOnPage = 0;

      $scope.accountTree = gfyAccountTree; //initialize a blank service so we can bind/watch the entire object
      $scope.currentFolderRootId = $scope.accountTree.userFolders[0].id; // current root ID of folder/album/bookmark
      $scope.currentFolderRootTitle = $scope.accountTree.userFolders[0].title;
      $scope.currentFolderId = $scope.accountTree.userFolders[0].id; //default user folder to load gfys - used to determine wich view we are in
      $scope.currentFolderTitle = $scope.accountTree.userFolders[0].title; // title of the currently selected folder
      $scope.currentFolderChildren = []; // array to hold the names of the children in the current folder (if any) to display above gfys
      $scope.currentFolderAlbums = []; //array to hold the names of the albums in current folder
      $scope.currentContentType = 'folders'; //used to load the current folder view
      $scope.tempUploadFolderTitle = ''; //used for place holding an upload from current folder button if no gfycats dialog displayed
      $scope.tempUploadFolderId = ''; //used for place holding an upload from current folder button if no gfycats dialog displayed

      $scope.acctViewSettings = 'main'; //main, settings, editpage,,editbookmark
      $scope.gfyModals = gfyModalMachine;
      $scope.gfyPage = gfyPageView; //initialize a blank service so we can bind/watch the entire object
      $scope.usersProfileSettings = userSettings; //initialize a blank service so we can bind/watch the entire object
      $scope.msgs = msgMachine; //initialize a blank service so we can bind/watch the entire object
      // while we are here lets load the latest feedback messages from the server

      $scope.sortButtonText = $scope.msgs.textSortButtonNewest; // initialize text that will be displayed on the Sort Button

        $scope.getFunctionFromContentType = function(){
            var fun;
            switch ($scope.currentContentType){
                case 'folders':
                    fun = accountService.folderService;
                    break;
                case 'albums':
                    fun = accountService.albumService;
                    break;
                case 'bookmark-folders':
                    fun = accountService.bookmarkService
                    break;
            }
            return fun;
        };
      // ********************************************** function to load 10 gfys at a time ********************************************************************************************
      $scope.getSomeGfys = function() {
        if ($scope.busySignal) return; // if we are still waiting for the last get request to finish exit function so we don't ask for another one too soon
        if ($scope.usersProfileSettings.infiniteScroller == false) $scope.first = $scope.gfyPage.fetchLimiter * ($scope.gfyPage.currentPage - 1); // increment fetch index

        if (!$scope.haveAllGfys) {

          $scope.busySignal = true; // we are making a get http request so set a busy state until we get the info back from server--used for infinite scrolling


            if ($scope.accountTree.searchingAccount) {
                accountService.folderService.searchFolders($scope.accountTree.searchTerm,$scope.gfyPage.fetchLimiter).then(
                    function(data) { // on successful get request populate the data
                    if (!$scope.accountTree.searchingAccount) $scope.gfyCount = data['found']; //get total number of gfys in account
                    else if (data['gfycats'] != undefined) $scope.gfyCount = data['gfycats'].length;

                    if ($scope.gfyCount) {
                        $scope.isGfyListEmpty = false;
                        var newgfys = data['gfycats']; // get first 10 images or if fetchlimiter is set
                        var len = newgfys.length;
                        $scope.gfysOnPage = len; // variable to let us know how many gfys we have on the current page view
                        if (!len) return;
                        for (var i = 0; i < len; i++) $scope.accountTree.accountGfys.push(newgfys[i]); // move into main buffer array
                        //$scope.name = $scope.accountTree.accountGfys[0].userName; //get account users name
                        var length = $scope.accountTree.accountGfys.length;
                        for (i = length - len; i < length; i++) {
                            $scope.accountTree.accountGfys[i].views = parseInt($scope.accountTree.accountGfys[i].views); // adjust views to be an integer instead of a string value
                            $scope.accountTree.accountGfys[i].createDate = new Date($scope.accountTree.accountGfys[i].createDate * 1000); // adjust time to be java/unix time compatible
                            if ($scope.accountTree.accountGfys[i].published == undefined || $scope.accountTree.accountGfys[i].published === '1' || $scope.accountTree.accountGfys[i].published === 1) $scope.accountTree.accountGfys[i].published = true;// check if this gfy has a publish index key... if not it is an older version and assumed to be published
                            else if ($scope.accountTree.accountGfys[i].published === '0' || $scope.accountTree.accountGfys[i].published === 0) $scope.accountTree.accountGfys[i].published = false;
                            if ($scope.accountTree.accountGfys[i].nsfw === '0') $scope.accountTree.accountGfys[i].nsfw = 'Clean';
                            else if ($scope.accountTree.accountGfys[i].nsfw === '1') $scope.accountTree.accountGfys[i].nsfw = 'Porn';
                            else if ($scope.accountTree.accountGfys[i].nsfw === '3') $scope.accountTree.accountGfys[i].nsfw = 'NSFW';
                            if ($scope.accountTree.accountGfys[i].likes != undefined) $scope.accountTree.accountGfys[i].likes = parseInt($scope.accountTree.accountGfys[i].likes);
                            else $scope.accountTree.accountGfys[i].likes = 0;
                            if ($scope.accountTree.accountGfys[i].dislikes != undefined) $scope.accountTree.accountGfys[i].dislikes = parseInt($scope.accountTree.accountGfys[i].dislikes);
                            else $scope.accountTree.accountGfys[i].dislikes = 0;
                            if ($scope.accountTree.accountGfys[i].shares != undefined) $scope.accountTree.accountGfys[i].shares = parseInt($scope.accountTree.accountGfys[i].shares);
                            else $scope.accountTree.accountGfys[i].shares = 0;

                            $scope.accountTree.accountGfys[i].savingPublishState = false; // used for saving of publish state
                            $scope.accountTree.accountGfys[i].publishStateChangingToFalse = false; // used for changing from true to false publish state
                            $scope.accountTree.accountGfys[i].deleteBusy = false;
                            $scope.accountTree.accountGfys[i].reallyDelete = false;
                        }

                        if ($scope.usersProfileSettings.infiniteScroller == true) {
                            $scope.first += $scope.gfyPage.fetchLimiter; // increment to next set
                            if ($scope.first >= $scope.gfyCount) { // check if next set will be bigger than the total  in the list
                                $scope.haveAllGfys = true;

                            }
                        }              else {
                            if (($scope.first + $scope.gfyPage.fetchLimiter) >= $scope.gfyCount) { // check if next set of fetched will be bigger than the total  in the list
                                $scope.haveAllGfys = true;
                            }
                        }
                        $scope.busySignal = false; // busySignal is reset on successful get http

                        $scope.gfyPage.totalPages = Math.ceil($scope.gfyCount / $scope.gfyPage.fetchLimiter);
                        $scope.gfyPage.setPagingLimits();
                        $scope.gfyPage.setViewRange($scope.gfyCount); //initialize the page
                    }            else {
                        $scope.isGfyListEmpty = true;
                        $scope.busySignal = false;
                    }

                }.bind($scope),function(data, status) { //if we had an error loading the user probably has no files to load... or we couldn't get to them
                        $scope.isGfyListEmpty = true;
                        $scope.busySignal = false;
                        $scope.gfyCount = 0;

                    });
            }else {

                //var getPath = 'https://api.gfycat.com/v1/me/' + $scope.currentContentType + '/' + $scope.currentFolderId +
                //    '?sortkey=' + $scope.sortKey + '&first=' + $scope.first + '&order=' + $scope.order + '&count=' +
                //    $scope.gfyPage.fetchLimiter;
                var fun;
                if($scope.currentContentType=='folders'){
                    fun = accountService.folderService;
                }
                else if($scope.currentContentType=='albums'){
                    fun = accountService.albumService;
                }
                else if($scope.currentContentType=='bookmark-folders'){
                    fun = accountService.bookmarkService;
                }
                fun.getContents($scope.currentFolderId,$scope.sortKey,$scope.first,$scope.order,$scope.gfyPage.fetchLimiter).then(function (data) { // on successful get request populate the data
                    if (!$scope.accountTree.searchingAccount) $scope.gfyCount = data['gfyCount']; //get total number of gfys in account
                    else if (data['gfycatResults'] != undefined) $scope.gfyCount = data['gfycatResults'].length;

                    if ($scope.gfyCount) {
                        $scope.isGfyListEmpty = false;
                        if (!$scope.accountTree.searchingAccount) var newgfys = data['publishedGfys']; // get first 10 images or if fetchlimiter is set
                        else newgfys = data['gfycatResults'];

                        var len = newgfys.length;
                        $scope.gfysOnPage = len; // variable to let us know how many gfys we have on the current page view
                        if (!len) return;
                        for (var i = 0; i < len; i++) $scope.accountTree.accountGfys.push(newgfys[i]); // move into main buffer array
                        //$scope.name = $scope.accountTree.accountGfys[0].userName; //get account users name
                        var length = $scope.accountTree.accountGfys.length;
                        for (i = length - len; i < length; i++) {
                            $scope.accountTree.accountGfys[i].views = parseInt($scope.accountTree.accountGfys[i].views); // adjust views to be an integer instead of a string value
                            $scope.accountTree.accountGfys[i].createDate = new Date($scope.accountTree.accountGfys[i].createDate * 1000); // adjust time to be java/unix time compatible
                            if ($scope.accountTree.accountGfys[i].published == undefined || $scope.accountTree.accountGfys[i].published === '1' || $scope.accountTree.accountGfys[i].published === 1) $scope.accountTree.accountGfys[i].published = true;// check if this gfy has a publish index key... if not it is an older version and assumed to be published
                            else if ($scope.accountTree.accountGfys[i].published === '0' || $scope.accountTree.accountGfys[i].published === 0) $scope.accountTree.accountGfys[i].published = false;
                            if ($scope.accountTree.accountGfys[i].nsfw === '0') $scope.accountTree.accountGfys[i].nsfw = 'Clean';
                            else if ($scope.accountTree.accountGfys[i].nsfw === '1') $scope.accountTree.accountGfys[i].nsfw = 'Porn';
                            else if ($scope.accountTree.accountGfys[i].nsfw === '3') $scope.accountTree.accountGfys[i].nsfw = 'NSFW';
                            if ($scope.accountTree.accountGfys[i].likes != undefined) $scope.accountTree.accountGfys[i].likes = parseInt($scope.accountTree.accountGfys[i].likes);
                            else $scope.accountTree.accountGfys[i].likes = 0;
                            if ($scope.accountTree.accountGfys[i].dislikes != undefined) $scope.accountTree.accountGfys[i].dislikes = parseInt($scope.accountTree.accountGfys[i].dislikes);
                            else $scope.accountTree.accountGfys[i].dislikes = 0;
                            if ($scope.accountTree.accountGfys[i].shares != undefined) $scope.accountTree.accountGfys[i].shares = parseInt($scope.accountTree.accountGfys[i].shares);
                            else $scope.accountTree.accountGfys[i].shares = 0;

                            $scope.accountTree.accountGfys[i].savingPublishState = false; // used for saving of publish state
                            $scope.accountTree.accountGfys[i].publishStateChangingToFalse = false; // used for changing from true to false publish state
                            $scope.accountTree.accountGfys[i].deleteBusy = false;
                            $scope.accountTree.accountGfys[i].reallyDelete = false;
                        }

                        if ($scope.usersProfileSettings.infiniteScroller == true) {
                            $scope.first += $scope.gfyPage.fetchLimiter; // increment to next set
                            if ($scope.first >= $scope.gfyCount) { // check if next set will be bigger than the total  in the list
                                $scope.haveAllGfys = true;

                            }
                        } else {
                            if (($scope.first + $scope.gfyPage.fetchLimiter) >= $scope.gfyCount) { // check if next set of fetched will be bigger than the total  in the list
                                $scope.haveAllGfys = true;

                            }
                        }

                        $scope.busySignal = false; // busySignal is reset on successful get http

                        $scope.gfyPage.totalPages = Math.ceil($scope.gfyCount / $scope.gfyPage.fetchLimiter);
                        $scope.gfyPage.setPagingLimits();
                        $scope.gfyPage.setViewRange($scope.gfyCount); //initialize the page
                    } else {
                        $scope.isGfyListEmpty = true;
                        $scope.busySignal = false;

                    }

                }.bind($scope),function (data, status) { //if we had an error loading the user probably has no files to load... or we couldn't get to them
                    $scope.isGfyListEmpty = true;
                    $scope.busySignal = false;
                    $scope.gfyCount = 0;

                });
            }
        }
      };// end of function
      //// ********************************************** function to search users account folders ********************************************************************************************
      $scope.doAccountSearch = function(searchTerm) {
        if (searchTerm == undefined || searchTerm == '') return;
        $scope.accountTree.searchingAccount = true;
        $scope.accountTree.searchTerm = searchTerm;
        $scope.resetCurrentSearch();

      };// end of function
      //// ********************************************** function to Load users account folders ********************************************************************************************
      //    $scope.getSomeFolders=function(){
      //
      //        $scope.accountTree.getUserFolders().success(function(data){
      //            $scope.accountTree.update(data);
      //            $scope.setFolderChildren($scope.accountTree.userFolders[0]); // initialize the current view folders childrens
      //        });
      //        $scope.accountTree.userFolders[0].title='fetching..';
      //        $scope.accountTree.getUserAlbums().success(function(data){
      //            $scope.accountTree.update(data);
      //        });
      //        $scope.accountTree.userAlbums[0].title='fetching..';
      //        $scope.accountTree.getUserBookmarkFolders().success(function(data){
      //            $scope.accountTree.update(data);
      //        });
      //        $scope.accountTree.userAlbums[0].title='fetching..';
      //
      //
      //    };// end of function

      // ********************************************** function to set the View sorting filter ********************************************************************************************
      $scope.setFilter = function(value) {

        switch (value) {
          case 1://by newest
            $scope.orderProperty = '-createDate';
            $scope.sortKey = 'age';
            $scope.order = 'SORT_DESC';
            $scope.sortButtonText = $scope.msgs.textSortButtonNewest;//"New";
            break;
          case 2://by oldest
            $scope.orderProperty = 'createDate';
            $scope.sortKey = 'age';
            $scope.order = 'SORT_ASC';
            $scope.sortButtonText = $scope.msgs.textSortButtonOldest;//"Old";
            break;
          case 3://alphabetical A-Z
            $scope.orderProperty = 'title||gfyName';
            $scope.sortKey = 'alpha';
            $scope.order = 'SORT_ASC';
            $scope.sortButtonText = $scope.msgs.textSortButtonAZ;//"(A-Z)";
            break;
          case 4://aplhabetical Z-A
            $scope.orderProperty = '-(title||gfyName)';
            $scope.sortKey = 'alpha';
            $scope.order = 'SORT_DESC';
            $scope.sortButtonText = $scope.msgs.textSortButtonZA;//"(Z-A)";
            break;
          case 5://most views
            $scope.orderProperty = '-views';
            $scope.sortKey = 'views';
            $scope.order = 'SORT_DESC';
            $scope.sortButtonText = $scope.msgs.textSortButtonViewMost;//"? to 1";
            break;
          case 6://least views
            $scope.orderProperty = 'views';
            $scope.sortKey = 'views';
            $scope.order = 'SORT_ASC';
            $scope.sortButtonText = $scope.msgs.textSortButtonViewLeast;//"1 to ?";
            break;
          default:// by newest
            $scope.orderProperty = '-createDate';
            $scope.sortKey = 'age';
            $scope.order = 'SORT_DESC';
            $scope.sortButtonText = $scope.msgs.textSortButtonNewest;//"New";
            break;
        }

        //reset loaded files if there are less than 10 items
        $scope.clearSearch();//clear the search bar... probably do this a better way?
        if ($scope.gfyCount != $scope.accountTree.accountGfys.length) $scope.resetCurrentSearch();//reset the search terms

      };// end of function

      // ********************************************** function to Clear Search words filter ********************************************************************************************
      $scope.clearSearch = function() {
        $scope.usersLibQuery = '';//clear the search bar
      };// end of function
      // ********************************************** function to reset Search words filter for fetching from server ********************************************************************************************
      $scope.resetCurrentSearch = function(page) {
        $scope.first = 0;
        $scope.accountTree.accountGfys = [];
        $scope.haveAllGfys = false;
        if ($scope.selectAll == true) $scope.selectAll = false;
        $scope.totalSelected = 0;
        $scope.totalGfySelected = 0;
        $scope.totalFolderSelected = 0;
        $scope.viewRangelow = 0;
        $scope.viewRangeHigh = 0;
        if (page) $scope.gfyPage.currentPage = page;
        else $scope.gfyPage.currentPage = 1;

        $scope.getSomeGfys();
        $scope.updateSubFolderFileCount(); // get the real file count from subfolders also count albums
        $scope.updateSubAlbumFileCount(); // get the real file count from subalbums
      };// end of function
      // ********************************************** function to select all ********************************************************************************************
      $scope.setAllAlbumSelected = function() {
        $scope.albumToEdit.selectAll = !$scope.albumToEdit.selectAll;
        var length = $scope.albumToEdit.publishedGfys.length;
        for (var i = 0; i < length; i++) $scope.albumToEdit.publishedGfys[i].selected = $scope.albumToEdit.selectAll; // set the state of the selected array variable
        var length2 = 0;//$scope.currentFolderChildren.length;
        //for(i=0; i < length2; i++) $scope.currentFolderChildren[i].selected = $scope.selectAll; // set the state of the selected array variable
        // if all selected add the totals and set the total count
        //            if ($scope.selectAll==true) {
        //                $scope.totalGfySelected=length;
        //                $scope.totalFolderSelected=length2;
        //                $scope.totalSelected=length+length2;
        //            }
        //            else{ // else all unselected so zero all counts
        //                $scope.totalGfySelected=0;
        //                $scope.totalFolderSelected=0;
        //                $scope.totalSelected=0;
        //            }
      };// end of function
      // ********************************************** function to select all ********************************************************************************************
      $scope.setAllSelected = function() {
        $scope.selectAll = !$scope.selectAll;
        var length = $scope.accountTree.accountGfys.length;
        for (var i = 0; i < length; i++) $scope.accountTree.accountGfys[i].selected = $scope.selectAll; // set the state of the selected array variable
        var length2 = 0;//$scope.currentFolderChildren.length;
        //for(i=0; i < length2; i++) $scope.currentFolderChildren[i].selected = $scope.selectAll; // set the state of the selected array variable
        // if all selected add the totals and set the total count
        if ($scope.selectAll == true) {
          $scope.totalGfySelected = length;
          $scope.totalFolderSelected = length2;
          $scope.totalSelected = length + length2;
        }        else { // else all unselected so zero all counts
          $scope.totalGfySelected = 0;
          $scope.totalFolderSelected = 0;
          $scope.totalSelected = 0;
        }
      };// end of function
      // ********************************************** function to Publish all currently selected ********************************************************************************************
      //
      // val - variable for the function we want to set the new state to:
      //              options:
      //                      - true
      //                      - false
      // ****************************************************************************************************************************************************************************************
      $scope.publishSelected = function(val) {
        var gfyList = [];
        var length = $scope.accountTree.accountGfys.length;

        // count al the selected gfys
        for (var i = 0; i < length; i++) {
          if ($scope.accountTree.accountGfys[i].selected == true) {
            gfyList.push($scope.accountTree.accountGfys[i].gfyNumber);
          }
        }

        // check if we actually selected some gfys
        if (gfyList.length) {
          // if we are setting to false prompt for are you sure?
          if (!val) var result = confirm($scope.msgs.warnUnpublishMsg);
          else result = true; // if we are setting to Publish state then result if set to true so we can continue into function
          if (result) {
            for (i = 0; i < length; i++) {
              if ($scope.accountTree.accountGfys[i].selected == true) {
                //$scope.accountTree.accountGfys[i].savingPublishState = true; // set the 'busy' signal for publishing change to server
                (function(i) { // need to wrap this in a function or http does not see the value of 'i' as it changes
                  $scope.publishSingleSelected($scope.accountTree.accountGfys[i], i);

                  //$http.post('/ajax/account/PublishGfy/',$scope.accountTree.accountGfys[i].gfyNumber).error(function (data2, status) {
                  //    if (status == 404) {
                  //        $scope.accountTree.accountGfys[i].published = val;//TODO val for now... but should be whatever data2 we get back from server...also change this to SUCCESSFUL result code
                  //
                  //        $scope.accountTree.accountGfys[i].savingPublishState = false;
                  //    }
                  //});
                })(i);
              }
            }

            $scope.clearSelected(); //deselect
          }
        }        else alert('Nothing selected');
      };// end of function
      // ********************************************** function to Publish all currently selected ********************************************************************************************
      // keep a separate function for single gfy publish as it will be faster than looping to see what is selected
      //
      $scope.publishSingleSelected = function(item, index) {

        var dataT = {};
        dataT['gfyId'] = item.gfyName;
        var tempPublished;
        if (item.published == false) tempPublished = 1;
        else tempPublished = 0;
        dataT['value'] = tempPublished; // using 1 or 0
        item.publishStateChangingToFalse = false; // turn off the really unpublish question if asked
        item.savingPublishState = true;

        $http.post('/ajax/setPublished', dataT).success(function(data2) {

          item.savingPublishState = false;
          item.published = tempPublished;

        }).error(function(data2) {
          item.savingPublishState = false;
        });

      };// end of function
      // ********************************************** function to clear currently selected items ********************************************************************************************
      $scope.clearAlbumGfysSelected = function() {
        var length = $scope.albumToEdit.publishedGfys.length;
        for (var i = 0; i < length; i++) $scope.albumToEdit.publishedGfys[i].selected = false; // set the state of all gfys to not selected
        if ($scope.albumToEdit.selectAll == true) $scope.albumToEdit.selectAll = false;
      };// end of function
      // ********************************************** function to clear currently selected items ********************************************************************************************
      $scope.clearSelected = function() {
        var length = $scope.accountTree.accountGfys.length;
        for (var i = 0; i < length; i++) $scope.accountTree.accountGfys[i].selected = false; // set the state of all gfys to not selected
        var length2 = $scope.currentFolderChildren.length;
        for (i = 0; i < length2; i++) $scope.currentFolderChildren[i].selected = false; // set the state of all folders to not selected
        if ($scope.selectAll == true) $scope.selectAll = false;
        $scope.totalSelected = 0;
        $scope.totalFolderSelected = 0;
        $scope.totalGfySelected = 0;
      };// end of function
      // ********************************************** function to move the selected stuff into a different folder ********************************************************************************************
      // val - value from ng-repeat telling us the name of the folder we selected in the drop down
      // folderType - http variable for the function we want to use:
      //              options:
      //                      -moveFolderContents
      //                      -moveAlbumContents
      //                      -moveBookmarkFolderContents
      //                      -addToAlbum -default from ng-repeat if called
      // ****************************************************************************************************************************************************************************************
      $scope.moveSelected = function(val, folderType) {
        //var data = {};
        //data['fromFolderId'] = $scope.currentFolderId;//current folder
        //data['toFolderId'] = val.id;//new folder to go to
        var gfyList = [];
        var length = $scope.accountTree.accountGfys.length;
        for (var i = 0; i < length; i++) {
          if ($scope.accountTree.accountGfys[i].selected == true) {
            //$scope.accountTree.accountGfys[i].published=false;
            gfyList.push($scope.accountTree.accountGfys[i].gfyId);
          }
        }

        if (gfyList.length) {
          //data['gfyNumberList'] = gfyList;
          $scope.clearSelected(); //deselect
          if (folderType == 'pick') {
            if ($scope.currentFolderRootId == $scope.accountTree.userFolders[0].id) folderType = 'moveFolderContents';
            else if ($scope.currentFolderRootId == $scope.accountTree.userAlbums[0].id) folderType = 'moveAlbumContents';
            else if ($scope.currentFolderRootId == $scope.accountTree.userBookmarks[0].id) folderType = 'moveBookmarkFolderContents';
          }

            var fun;
            if(folderType=="moveFolderContents"){
                fun = accountService.folderService.moveContents($scope.currentFolderId, val.id, gfyList);
            }else if(folderType=="moveAlbumContents"){
                fun = accountService.albumService.moveContents($scope.currentFolderId, val.id, gfyList);
            }else if(folderType=="moveBookmarkFolderContents"){
                fun = accountService.bookmarkService.moveContents($scope.currentFolderId, val.id, gfyList);
            }else if(folderType=="addToAlbum"){
                fun = accountService.albumService.addContents(val.id, gfyList);
            }

            fun.then(function() {
                if (gfyList.length == $scope.gfysOnPage) $scope.gfyPage.setCurrentPage(1);// we selected everything on the page that is left... so force the page 'previous' if it exists
                $scope.resetCurrentSearch($scope.gfyPage.currentPage);
            }.bind($scope));
        }        else alert('Nothing selected');

      };// end of function
      // ********************************************** function to set the current folder we are looking at  and it's immediate children ********************************************************************************************
      // nodeData - value from ng-repeat telling us the name of the folder we selected from the angular ui tree app
      // rootId - ID of the root Folder, root Album or root Bookmark
      //
      // ****************************************************************************************************************************************************************************************
      $scope.setFolderView = function(nodeData, rootId) {
        if (nodeData.clicked) {
          $scope.doNameInput(nodeData);
          return;
        }        else {
          if (!nodeData.nameInput) { // if we are not renaming the folder reset the view
            nodeData.clicked = true;
            $timeout(function() {  // delay for second click of folder to initiate renaming
              nodeData.clicked = false;
            }, 1000);

            $scope.clearNameInput();
            $scope.clearDeleteCheck();
          }          else return;
        }

        $scope.accountTree.searchingAccount = false;
        $scope.accountTree.usersLibQuery = null;

        if (rootId) $scope.currentFolderRootId = rootId;
        $scope.currentFolderId = nodeData.id;
        $scope.currentFolderTitle = nodeData.title;

        // set the content type variable for fetching content in the folder
        if ($scope.currentFolderRootId == $scope.accountTree.userFolders[0].id) {
          $scope.currentContentType = 'folders';
          $scope.currentFolderRootTitle = $scope.accountTree.userFolders[0].title;
        }        else if ($scope.currentFolderRootId == $scope.accountTree.userAlbums[0].id) {
          $scope.currentContentType = 'albums';
          $scope.currentFolderRootTitle = $scope.accountTree.userAlbums[0].title;
        }        else if ($scope.currentFolderRootId == $scope.accountTree.userBookmarks[0].id) {
          $scope.currentContentType = 'bookmark-folders';
          $scope.currentFolderRootTitle = $scope.accountTree.userBookmarks[0].title;
        }

        // populate the childrens array for display above gfys
        $scope.setFolderChildren(nodeData);


        $scope.gfyPage.currentPage = 1; //reset the page
        $scope.resetCurrentSearch();

      };// end of function

      // ********************************************** function to initilize the children view of the current folder ********************************************************************************************
      // nodeData - value from ng-repeat telling us the name of the folder we selected from the angular ui tree app
      // ****************************************************************************************************************************************************************************************
      $scope.setFolderChildren = function(nodeData) {

        // populate the childrens array for display above gfys
        while ($scope.currentFolderChildren.length) $scope.currentFolderChildren.pop(); //reset the children array to empty
        while ($scope.currentFolderAlbums.length) $scope.currentFolderAlbums.pop(); //reset the albums array to empty
        var length = nodeData.nodes.length; // check if the current folder has children
        if (length) {
          var j = 0, k = 0;
          for (var i = 0; i < length; i++) { //populate the album
            if (nodeData.nodes[i].folderSubType == 'Album') {
              $scope.currentFolderAlbums.push(nodeData.nodes[i]);
              $scope.currentFolderAlbums[j]['selected'] = false;
              $scope.currentFolderAlbums[j].gfyCount = 0;// initialize the count to zero
              j++;
            }

            if (nodeData.nodes[i].folderSubType != 'Album') { //populate the folder children
              $scope.currentFolderChildren.push(nodeData.nodes[i]);
              $scope.currentFolderChildren[k]['selected'] = false;
              $scope.currentFolderChildren[k].gfyCount = 0;// initialize the count to zero
              $scope.currentFolderChildren[k].albumCount = 0;//initialize the count to zero
              k++;
            }
          }

          $scope.updateSubFolderFileCount(); // get the real file count from subfolders also count albums
          $scope.updateSubAlbumFileCount(); // get the real file count from subalbums

        }


      };// end of function
      // ********************************************** function to get the count of files in the sub folders we are displaying ********************************************************************************************
      // ****************************************************************************************************************************************************************************************
      $scope.updateSubFolderFileCount = function() {
        var length = $scope.currentFolderChildren.length; // check if the current folder has children
        if (length) {
          for (var i = 0; i < length; i++) {
            var len = $scope.currentFolderChildren[i].nodes.length; // check if the current Sub folder has children
            if (len) {
              $scope.currentFolderChildren[i].albumCount = 0;//initialize the count to zero
              for (var j = 0; j < len; j++) {
                if ($scope.currentFolderChildren[i].nodes[j].folderSubType == 'Album') $scope.currentFolderChildren[i].albumCount += 1;
              }
            }

            //get the gfyCount the hard way for now
            if ($scope.currentFolderChildren[i].folderSubType != 'Album') {

              (function(i) { // need to wrap this in a function or http does not see the value of 'i' as it changes
                  $scope.getFunctionFromContentType().getContents($scope.currentFolderChildren[i].id,$scope.sortKey,$scope.first,$scope.order,$scope.gfyPage.fetchLimiter).then(function(data){
                      $scope.currentFolderChildren[i].gfyCount = data['gfyCount']; //get total number of gfys in account
                  });
              })(i);
            }
          }
        }

      };// end of function
      // ********************************************** function to get the count of files in the sub albums we are displaying ********************************************************************************************
      // ****************************************************************************************************************************************************************************************
      $scope.updateSubAlbumFileCount = function() {
        var length = $scope.currentFolderAlbums.length; // check if the current folder has children
        if (length) {
          for (var i = 0; i < length; i++) {
            //get the gfyCount the hard way for now
            (function(i) { // need to wrap this in a function or http does not see the value of 'i' as it changes
                accountService.albumService.getContents($scope.currentFolderAlbums[i].id,$scope.sortKey,$scope.first,$scope.order,$scope.gfyPage.fetchLimiter)
                    .then(function(data){
                        $scope.currentFolderAlbums[i].gfyCount = data['gfyCount']; //get total number of gfys in account
              });
            })(i);
          }
        }
      };// end of function
      // ********************************************** function to set temp upload folder if we enter using upload button in no gfycats dialog ********************************************************************************************
      // ****************************************************************************************************************************************************************************************
      $scope.setTempUploadFolder = function(title, id) {
        $scope.tempUploadFolderTitle = title;
        $scope.tempUploadFolderId = id;
      };// end of function

      // ********************************************** function to delete the selected stuff from current folder ********************************************************************************************
      $scope.deleteSelectedAlbumGfys = function() {
          var gfyList = [];
          var length = $scope.albumToEdit.publishedGfys.length;
          for (var i = 0; i < length; i++) {
              if ($scope.albumToEdit.publishedGfys[i].selected == true) {
                  gfyList.push($scope.albumToEdit.publishedGfys[i].gfyId);
              }
          }
          if (gfyList.length) {
              var result = confirm('Are you sure you want to DELETE these?');
              if (result) {
                  accountService.albumService.removeContents($scope.albumToEdit.id, gfyList).then(function() {
                      $scope.goAlbumPage($scope.albumToEdit);
                  });
              }
          }        else alert('Nothing selected');
      };// end of function

        // ********************************************** function to select one item and then delete it ********************************************************************************************
        // val - value from ng-repeat telling us the name of the folder we selected in the drop down
        // ****************************************************************************************************************************************************************************************
        $scope.deleteThisOne = function(val, index) {
        //var result=confirm("Are you sure you want to delete: "+(val.gfyitem.title||val.gfyitem.gfyName));
        //if (result) {

        //data['fromFolderId'] = $scope.currentFolderId;//current folder
        //data['gfyId'] = val.gfyitem.gfyId;

        $scope.accountTree.accountGfys[index].deleteBusy = true;
        accountService.deleteGfycat(val.gfyitem.gfyId)
            .then(function() {
                $scope.resetCurrentSearch();
            }.bind($scope));

        //}

      };// end of function
      // ********************************************** function to change title of current gfy ********************************************************************************************
      // val - value from ng-repeat telling us the name of the folder we selected in the drop down
      // ****************************************************************************************************************************************************************************************

      // ********************************************** this function will add a new folder when you click the Add to New Folder and move the selected Gfys into it ********************************************************************************************
      // folderType - http variable for the function we want to use to create a folder or album:
      //              options:
      //                      -createFolder
      //                      -createAlbum
      // folderType2 - http variable for the function we want to use to move files into new folder or album:
      //              options:
      //                      -moveFolderContents
      //                      -addToAlbum
      // ****************************************************************************************************************************************************************************************
      $scope.addSelectedToNew = function(folderType, folderType2) {

        var gfyList = [];
        var length = $scope.accountTree.accountGfys.length;
        for (var i = 0; i < length; i++) {
          if ($scope.accountTree.accountGfys[i].selected == true) {
            //$scope.accountTree.accountGfys[i].published=false;
            gfyList.push($scope.accountTree.accountGfys[i].gfyNumber);
          }
        }

        if (gfyList.length) {// check if anything was even selected
          var newname = '';//prompt("Please enter new folder name:", "New Folder");//replace prompt function with nicer looking request
          if (newname) {
            var data = {};
            if (folderType == 'createFolder') {
              data['parentId'] = $scope.currentFolderId; //parent folder
              newname = 'New Folder';
            }            else {
              data['parentId'] = $scope.accountTree.userAlbums[0].id;
              newname = 'New Album';
            }

            data['folderName'] = newname;//new folder name

            $http.post('/ajax/account/' + folderType, data).success(function(data2, status) {
              if (status == 200) {
                $scope.accountTree.update(data2['folders']);//load new folders list
                data = {};
                data['title'] = newname;
                data['id'] = data2['newFolderId'];
                $scope.moveSelected(data, folderType2);

              }
            });
          }
        }        else alert('No Gfys Selected');

      };// end of function
      // ********************************************** this function will move individual and selected Gfys based on dragDrop app between folders and albums only ********************************************************************************************
      // dragToFolderID - from ng-repeat gives us the folder the mouse lets go over
      // dragToRootID - root folder of the type where the mouse let go... incase we are going from folders to albums (albums to folders is not allowed)
      // dragItemType - type of item we are dragging (gfy or folder)
      // ****************************************************************************************************************************************************************************************

      $scope.handleDrop = function(dragToFolderID, dragToRootID) {
        var gfyList = [];

        var length = $scope.accountTree.accountGfys.length;

        // auto select the one we are dragging if it is not selected (if there are others selected they will also go with it
        for (var i = 0; i < length; i++) {
          if ($scope.accountTree.accountGfys[i].gfyNumber == $scope.accountTree.singleItemMoveId) $scope.accountTree.accountGfys[i].selected = true;
        }

        // auto select the folders if any in current view
        //        var length2=$scope.currentFolderChildren.length;
        //        for(i=0; i < length2; i++) {
        //            if ($scope.currentFolderChildren[i].id==$scope.accountTree.singleItemMoveId) $scope.currentFolderChildren[i].selected=true;
        //        }

        var data = {};
        data['id'] = dragToFolderID; // move to this folder
        data['title'] = 'hello from handleDrop';

        var folderType;
        if ($scope.currentFolderRootId == $scope.accountTree.userFolders[0].id) { // if we are in Folders moving to a folder or adding to an album
          if (dragToRootID == $scope.accountTree.userFolders[0].id) folderType = 'moveFolderContents';
          else folderType = 'addToAlbum';
          $scope.moveSelected(data, folderType); //do the move
        }        else if ($scope.currentFolderRootId == $scope.accountTree.userAlbums[0].id) {  // if we are in Albums moving to another album only
          if (dragToRootID == $scope.accountTree.userAlbums[0].id) {
            folderType = 'moveAlbumContents';
            $scope.moveSelected(data, folderType); //do the move
          }
        }        else if ($scope.currentFolderRootId == $scope.accountTree.userBookmarks[0].id) { // if we are in Bookmarks moving to another bookmarkfolder  only
          if (dragToRootID == $scope.accountTree.userBookmarks[0].id) {
            folderType = 'moveBookmarkFolderContents';
            $scope.moveSelected(data, folderType); //do the move

          }
        }
      };// end of function
      // ********************************************** this function will move track the number of gfyitems currently selected ********************************************************************************************
      // isItemSelected - "selected" value of the current gfy
      //
      // ****************************************************************************************************************************************************************************************
      $scope.gfySelectedChange = function(itemIsSelected) {
        if (itemIsSelected == true) $scope.totalGfySelected++;
        else {
          $scope.totalGfySelected--;
          if ($scope.selectAll) $scope.selectAll = false;
        }

        $scope.totalSelected = $scope.totalGfySelected + $scope.totalFolderSelected;
      };// end of function
      // ********************************************** this function will move track the number of gfyitems currently selected ********************************************************************************************
      // isItemSelected - "selected" value of the current gfy
      //
      // ****************************************************************************************************************************************************************************************
      $scope.folderSelectedChange = function(itemIsSelected) {
        if (itemIsSelected == true) $scope.totalFolderSelected++;
        else {
          $scope.totalFolderSelected--;
          if ($scope.selectAll) $scope.selectAll = false;
        }

        $scope.totalSelected = $scope.totalGfySelected + $scope.totalFolderSelected;
      };// end of function
        $scope.updateFolderListFun = function(internalFunction, id) {
            internalFunction.then(function (data) {
                $scope.accountTree.update(data);//load new folders list
                $scope.resetCurrentSearch();
                var data3 = $scope.findIdInArray(data, id); // need to find the parent data again in the new array we just got back
                $scope.setFolderChildren(data3);

            });
        };

        $scope.updateFolderListFun2 = function(internalFunction, id) {
            internalFunction.then(function (data) {
                $scope.accountTree.update(data);//load new folders list
                //$scope.resetCurrentSearch();
                var data3 = $scope.findIdInArray(data, id); // need to find the parent data again in the new array we just got back
                $scope.setFolderView(data3);//jump up to parent folder when this one disappears
            })
        };

      // ********************************************** this function is to delete the selected folder ********************************************************************************************
      // scope - value from ng-repeat telling us the name of the folder we selected from the angular ui tree app can be individual indexed item or 'this'
      // folderType - http variable for the function we want to use:
      //              options:
      //                      -'deleteFolder'
      //                      -'deleteAlbum'
      //                      -'deleteAlbumFolder'
      //                      -'deleteBookmarkFolder'
      // ****************************************************************************************************************************************************************************************
      $scope.removeN = function(scope, folderType) {
        var nodeData = scope.$modelValue;

        if (nodeData.id == $scope.accountTree.userFolders[0].id || nodeData.id == $scope.accountTree.userAlbums[0].id || nodeData.id == $scope.accountTree.userBookmarks[0].id) return; // don't remove top folder--there shouldn't be a button to do this at this point though
        else {
          nodeData.deleting = true;
            function fun(){
                nodeData.deleting = false;
                nodeData.deleteCheck = false;
            }
            if(folderType=="deleteFolder"){
                accountService.folderService.deleteFolder(nodeData.id).then(function(data){
                    $scope.updateFolderListFun($scope.accountTree.getUserFolders(), scope.$parentNodeScope.$modelValue.id);
                }, fun);
            }else if(folderType=="deleteAlbumFolder"){
                accountService.albumService.deleteAlbumFolder(nodeData.id).then(function(data){
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), scope.$parentNodeScope.$modelValue.id);
                }, fun);
            }else if(folderType=="deleteAlbum"){
                accountService.albumService.deleteAlbumFolder(nodeData.id).then(function(data){
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), scope.$parentNodeScope.$modelValue.id);
                }, fun);
            }else if(folderType=="deleteBookmarkFolder"){
                accountService.bookmarkService.deleteBookmarkFolder(nodeData.id).then(function(data){
                    $scope.updateFolderListFun($scope.accountTree.getUserBookmarkFolders(), scope.$parentNodeScope.$modelValue.id);
                }, fun);
            }
          //$http.delete($url).success(function(data2, status) {
          //  if (status >= 200 && status <300 && !data2.error) {
          //      $scope.updateFolderListFun(fun, rootid);
          //  } else {
          //    if (data2.error != undefined) {
          //      alert(data2.error);
          //      nodeData.deleting = false;
          //      nodeData.deleteCheck = false;
          //    }
          //  }
          //}.bind($scope));


          //}
        }
      };

      $scope.setFolderDepth = function(o) {
        if (o.nodes != undefined) {
          for (var n in o.nodes) {
            if (!o.depth) o.depth = 0;
            o.nodes[n].depth = o.depth + 1;
            o.nodes[n].depthOffset = 30 + o.depth * 20;
            $scope.setFolderDepth(o.nodes[n]);
          }
        }
      };

      $scope.doDeleteCheck = function(node) {
        $scope.setFolderDepth($scope.accountTree.userFolders[0]);
        $scope.setFolderDepth($scope.accountTree.userAlbums[0]);
        $scope.setFolderDepth($scope.accountTree.userBookmarks[0]);
        node.deleteCheck = true;
      };

      $scope.clearFolderDeleteCheck = function(o) {
        if (o.nodes != undefined) {
          for (var n in o.nodes) {
            if (o.nodes[n].deleteCheck) o.nodes[n].deleteCheck = false;
            $scope.clearFolderDeleteCheck(o.nodes[n]);
          }
        }
      };

      $scope.clearDeleteCheck = function() {
        $scope.clearFolderDeleteCheck($scope.accountTree.userFolders[0]);
        $scope.clearFolderDeleteCheck($scope.accountTree.userAlbums[0]);
        $scope.clearFolderDeleteCheck($scope.accountTree.userBookmarks[0]);
      };

      // ********************************************** this function is original --- used to toggle folder expansion ********************************************************************************************
      $scope.toggle = function(scope) {
        scope.toggle();
      };

      // ********************************************** this function will traverse an array and find the node with 'id' = nodeId ********************************************************************************************
      // object - the array object to search through
      // nodeId - the id numer we are looking for
      // ****************************************************************************************************************************************************************************************
      $scope.findIdInArray = function(object, nodeId) {
        if (object.hasOwnProperty('id') && object['id'] == nodeId)
            return object;
        for (var i = 0; i < Object.keys(object).length; i++) {
          if (typeof object[Object.keys(object)[i]] == 'object') {
            var o = $scope.findIdInArray(object[Object.keys(object)[i]], nodeId);
            if (o != null)
                return o;
          }
        }

        return null;
      };

      $scope.setParent = function(o) {
        if (o.nodes != undefined) {
          for (var n in o.nodes) {
            o.nodes[n].parentId = o.id;
            $scope.setParent(o.nodes[n]);
          }
        }
      };

      $scope.findParentIdInArray = function(object, nodeId) {
        $scope.setParent(object[0]);
        var temp = $scope.findIdInArray(object, nodeId);
        return temp.parentId;
      };

      $scope.newSubAlbum = function() {
        var node = {};
        node['id'] = $scope.currentFolderId;
        node['title'] = $scope.currentFolderTitle;

        $scope.newSubItem(node, 'createAlbum');
      };


      // ********************************************** this function will add a new folder when you click the add batch button ********************************************************************************************
      // scope - value from ng-repeat telling us the name of the folder we selected from the angular ui tree app
      // folderType - http variable for the function we want to use:
      //              options:
      //                      -'createFolder'
      //                      -'createAlbum'
      //                      -'createAlbumFolder'
      //                      -'createBookmarkFolder'
      // ****************************************************************************************************************************************************************************************
      $scope.newSubItem = function(nodeData, folderType) {

        nodeData.addingFolder = true;

        var newname = 'New Folder'; //prompt("Please enter new folder name:", "New Folder");//replace prompt function with nicer looking request
        if (folderType == 'createAlbum') newname = 'New Album';
        if (newname) {
            if(folderType=="createFolder") {
                accountService.folderService.createFolder(nodeData.id, newname).then(function() {
                    $scope.updateFolderListFun($scope.accountTree.getUserFolders(), nodeData.id);
                });
            }else if(folderType=="createAlbumFolder"){
                accountService.albumService.createAlbumFolder(nodeData.id, newname).then(function() {
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), nodeData.id);
                });
            }else if(folderType=="createAlbum"){
                accountService.albumService.createAlbum(nodeData.id, newname).then(function() {
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), nodeData.id);
                });
            }else if(folderType=="createBookmarkFolder"){
                accountService.bookmarkService.createBookmarkFolder(nodeData.id, newname).then(function() {
                    $scope.updateFolderListFun($scope.accountTree.getUserBookmarkFolders(), nodeData.id);
                });
            }

            //$http.post($url, data).then(function(data) {
            //        $scope.updateFolderListFun(fun, nodeData.id);
            //}.bind($scope));
        }
      };

      // ********************************************** this function will select the folder for name change ********************************************************************************************
      // scope - value from ng-repeat telling us the name of the folder we selected from the angular ui tree app
      // folderType - http variable for the function we want to use:
      //              options:
      //                      -'renameFolder'
      //                      -'renameAlbum'
      //                      -'renameAlbumFolder'
      //                      -'renameBookmarkFolder'
      // ****************************************************************************************************************************************************************************************
      $scope.changeName = function(nodeData, folderType) {

        var newname = nodeData.newName;//prompt("Please enter new name:", nodeData.title);//replace prompt function with nicer looking request
        if (newname && newname != nodeData.title) {

            nodeData.renaming = true;
            if(folderType=="renameFolder"){
                accountService.folderService.renameFolder(nodeData.id, newname).then(function(){
                    $scope.updateFolderListFun($scope.accountTree.getUserFolders(), nodeData.id);
                });
            }else if(folderType=="renameAlbumFolder"){
                accountService.albumService.renameAlbumFolder(nodeData.id, newname).then(function(){
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), nodeData.id);
                });
            }else if(folderType=="renameAlbum"){
                accountService.albumService.renameAlbum(nodeData.id, newname).then(function(){
                    $scope.updateFolderListFun($scope.accountTree.getUserAlbums(), nodeData.id);
                });
            }else if(folderType=="renameBookmarkFolder"){
                accountService.bookmarkService.renameBookmarkFolder(nodeData.id, newname).then(function(){
                    $scope.updateFolderListFun($scope.accountTree.getUserBookmarkFolders(), nodeData.id);
                });
            }

        }        else nodeData.nameInput = false;
      };

      $scope.doNameInput = function(node) {
        $scope.setFolderDepth($scope.accountTree.userFolders[0]);
        $scope.setFolderDepth($scope.accountTree.userAlbums[0]);
        $scope.setFolderDepth($scope.accountTree.userBookmarks[0]);
        node.nameInput = true;
      };

      $scope.clearFoldersNameInput = function(o) {
        if (o.nodes != undefined) {
          for (var n in o.nodes) {
            if (o.nodes[n].nameInput) o.nodes[n].nameInput = false;
            $scope.clearFoldersNameInput(o.nodes[n]);
          }
        }
      };

      $scope.clearNameInput = function() {
        $scope.clearFoldersNameInput($scope.accountTree.userFolders[0]);
        $scope.clearFoldersNameInput($scope.accountTree.userAlbums[0]);
        $scope.clearFoldersNameInput($scope.accountTree.userBookmarks[0]);
      };

      $scope.changeSubName = function(nodeData, folderType) {

        var newname = prompt('Please enter new name:', nodeData.title);//replace prompt function with nicer looking request
        if (newname) {
          var data = {};

          //else
          data['folderId'] = nodeData.id;
          data['folderName'] = newname;
          $http.post('/ajax/account/' + folderType, data).success(function(data2, status) {
            if (status == 200) {
              $scope.accountTree.update(data2);//load new folders list
              // the promise may take a while to happen so prematurely set the folder name
              $scope.resetCurrentSearch();
              var data3 = $scope.findParentIdInArray(data2, nodeData.id); // need to find the parent data again in the new array we just got back
              $scope.setFolderView(data3);
            }
          }.bind($scope));
        }
      };

      $scope.toggleEditPageOn = function(item) {
        $scope.gfyFileToEdit = item;

        $scope.acctViewSettings = 'editpage';
      };

      $scope.toggleEditPageOff = function() {
        $scope.acctViewSettings = 'main';
      };

      $scope.toggleEditPage = function(item) {
        if ($scope.acctViewSettings == 'main') {
          if (item.published == undefined || item.published === '1' || item.published === 1) item.published = true;// check if this gfy has a publish index key... if not it is an older version and assumed to be published
          else if (item.published === '0' || item.published === 0) item.published = false;
          $scope.gfyFileToEdit = item;

          $scope.acctViewSettings = 'editpage';
        }        else if ($scope.acctViewSettings == 'editpage') $scope.acctViewSettings = 'main';
      };

      $scope.goAlbumPage = function(item) {
        $scope.albumToEdit.loading = true;

          accountService.albumService.getContents(item.id, $scope.sortKey, $scope.first, $scope.order, $scope.gfyPage.fetchLimiter).then(function(data) { // on successful get request populate the data
          $scope.albumToEdit = data;
          if ($scope.albumToEdit.published == '1' || $scope.albumToEdit.published == 1) $scope.albumToEdit.published = true;// check if this gfy has a publish index key... if not it is an older version and assumed to be published
          else if ($scope.albumToEdit.published == '0' || $scope.albumToEdit.published == 0) $scope.albumToEdit.published = false;

          if ($scope.albumToEdit.nsfw == '0' || $scope.albumToEdit.nsfw == 0) $scope.albumToEdit.nsfw = 'Clean';
          else if ($scope.albumToEdit.nsfw == '1' || $scope.albumToEdit.nsfw == 1) $scope.albumToEdit.nsfw = 'Porn';
          else if ($scope.albumToEdit.nsfw == '3' || $scope.albumToEdit.nsfw == 3) $scope.albumToEdit.nsfw = 'NSFW';
          $scope.albumToEdit['id'] = item.id;
          $scope.albumToEdit['parentId'] = $scope.findParentIdInArray($scope.accountTree.userAlbums, item.id);

          if ($scope.albumToEdit.publishedGfys != undefined && $scope.albumToEdit.publishedGfys.length != undefined) {
            var length = $scope.albumToEdit.publishedGfys.length;
            $scope.albumToEdit.albumOrder = [];
            for (var i = 0; i < length; i++) {
              $scope.albumToEdit.publishedGfys[i].id = i + 'alb';
              $scope.albumToEdit.albumOrder[i] = $scope.albumToEdit.publishedGfys[i].gfyNumber;
            }
          }

          $scope.toggleAlbumsOn();

        });
      };

      $scope.toggleAlbums = function() {
        if ($scope.acctViewSettings != 'editalbum') $scope.acctViewSettings = 'editalbum';
        else if ($scope.acctViewSettings == 'editalbum') $scope.acctViewSettings = 'main';
      };

      $scope.toggleBookmark = function(item) {
        if ($scope.acctViewSettings != 'editbookmark') {
          $scope.gfyFileToEdit = item;
          $scope.gfyFileToEdit.bookmarkState = 1; /// we know we have this state cause it is a bookmark we can see, so no need to go to backend to verify
          $scope.acctViewSettings = 'editbookmark';
        }        else if ($scope.acctViewSettings == 'editbookmark') $scope.acctViewSettings = 'main';
      };

      $scope.toggleAlbumsOn = function() { // over ride for click on side folder
        if ($scope.acctViewSettings != 'editalbum') $scope.acctViewSettings = 'editalbum';
      };

      $scope.deleteAlbum = function(file) {
        file.deleting = true;
          accountService.albumService.deleteAlbum(file.id).then(function(data2) {
              file.deleting = false;
              $scope.updateFolderListFun2($scope.accountTree.getUserAlbums(), 2);
              //also add to move out of the album once deleted
          });
      };

      $scope.goToPage = function(path1, path2) {
        if (path1 && path2 && path1.length && path2.length) {
          $scope.feeds.searchPageList = [];
          $location.path(path1 + path2);
        }
      };

    })//end controller   ????????????????????????????????????????????

//################################################### directive and controller for side Menu bar
    .directive('accountSideMenu', function() {

      return {
        restrict: 'E',
        require: 'uiTree',
        templateUrl: '/javascript/desktop/account_module/sidemenu/account-side-menu.html',
        controller: function($scope) {
          $scope.accountTree.checkLoggedIn();// on creation of sidemenu we call this function to load the folders from server
          //$scope.setFolderChildren($scope.accountTree.userFolders[0]); // initialize the current view folders childrens
          $scope.resetCurrentSearch(); // reset search so we don't duplicate content if we were here before

          $scope.toggleViewsOff = function() {
            $scope.acctViewSettings = 'main';
          };

          $scope.toggleSettings = function() {
            if ($scope.acctViewSettings != 'settings') $scope.acctViewSettings = 'settings';
            else if ($scope.acctViewSettings == 'settings') $scope.acctViewSettings = 'main';
          };

        },

        controllerAs: 'accountMenu'
      };
    })// end directive
//################################################### directive and controller for sort filter
    .directive('accountSortFilter', function() {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/sortfilter/account-sort-filter.html',
        controller: function() {

        },

        controllerAs: 'accountSort'
      };
    })// end directive
//################################################### directive and controller for folder file listing
    .directive('accountFolderFilesList', function() {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/filelisting/account-folder-files-list.html',
        controller: function() {

        },

        controllerAs: 'accountFolderList'
      };
    })// end directive
//################################################### directive and controller for Sub header
    .directive('accountSubHeader', function() {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/filelisting/account-sub-header.html',
        controller: function() {

        },

        controllerAs: 'accountSubHeaderCtrl'
      };
    })// end directive
//################################################### directive and controller for Sub Folders listing
    .directive('accountSubFolderList', function($timeout, gfyAccountTree) {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/sidemenu/account-sub-folder-list.html',
        controller: function($scope) {
          $scope.accountTree = gfyAccountTree;
          var waitForFolders = function() {
            if ($scope.accountTree.userFolders[0].title == 'fetching...') {
              $timeout(waitForFolders, 250);
            }            else if (!$scope.firstAccountLoadDone) {
              //$scope.currentFolderRootTitle='My Gfycats';
              //$scope.currentFolderTitle='My Gfycats';
              $scope.setFolderChildren($scope.accountTree.userFolders[0]);
              $scope.firstAccountLoadDone = true;
              //$scope.$apply();
            }
          };

          waitForFolders();// initialize the initial current view folders childrens

        },

        controllerAs: 'accountSubFolderCtrl'
      };
    })// end directive
//################################################### directive and controller for Sub Folders listing
    .directive('accountSubAlbumList', function() {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/sidemenu/account-sub-album-list.html',
        controller: function() {

        },

        controllerAs: 'accountSubAlbumCtrl'
      };
    })// end directive
//################################################### directive and controller for gfy edit page
    .directive('accountEditGfyPage', function(gfyAccountTree, gfyEditor) {

      return {
        restrict: 'E',
        templateUrl: '/javascript/desktop/account_module/editgfy/account-edit-gfy.html',
        controller: function($scope) {
          $scope.accountTree = gfyAccountTree;
          $scope.gfyEdit = gfyEditor;

        },

        controllerAs: 'accountEditGfyCtrl'
      };
    })// end directive
    //################################################### directive and controller for gfy edit album page
.directive('accountEditAlbumPage', function(gfyAccountTree, albumEditor) {

  return {
    restrict: 'E',
    templateUrl: '/javascript/desktop/account_module/editalbum/account-edit-album.html',
    controller: function($scope) {
      $scope.accountTree = gfyAccountTree;
      $scope.albumEdit = albumEditor;

    },

    controllerAs: 'accountEditAlbumCtrl'
  };
})// end directive
//################################################### directive and controller for gfy edit bookmark page
.directive('accountEditBookmarkPage', function(gfyAccountTree, gfyEditor, gfyFeeds) {

  return {
    restrict: 'E',
    templateUrl: '/javascript/desktop/account_module/editbookmark/account-edit-bookmark.html',
    controller: function($scope) {
      $scope.accountTree = gfyAccountTree;
      $scope.gfyEdit = gfyEditor;
      $scope.feeds = gfyFeeds;

      $scope.removeBookmark = function(item) {
        $scope.feeds.saveBookmarkState(item).then(function() {
          $scope.resetCurrentSearch();
          $scope.toggleBookmark();
        });

      };

    },

    controllerAs: 'accountEditBookmarkCtrl'
  };
});// end directive
    //.config(['$httpProvider', function($httpProvider) {
    //  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    //},]);

//})();//end java wrapper function

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
