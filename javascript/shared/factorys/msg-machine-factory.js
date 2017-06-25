/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('msgMachine', ['$http', function($http) {
  return {
    getCurrentMsgs: function() {
      var promise = $http.get('https://s3.amazonaws.com/dev-feedback-msg.gfycat.com/ExtraJiffier').success(function(data) { // on successful get request populate the data
        return data;
      });

      return promise;
    },

    update: function(data) {
      if (data.warnUnpublishMsg !== undefined)              this.warnUnpublishMsg =                 data.warnUnpublishMsg;
      if (data.askReallyUnpublishMsg !== undefined)         this.askReallyUnpublishMsg =            data.askReallyUnpublishMsg;
      if (data.hintMoveFilesMsg !== undefined)              this.hintMoveFilesMsg =                 data.hintMoveFilesMsg;
      if (data.askReallyDeleteMsg !== undefined)            this.askReallyDeleteMsg =               data.askReallyDeleteMsg;
      if (data.askReallyDeleteMsgYes !== undefined)         this.askReallyDeleteMsgYes =            data.askReallyDeleteMsgYes;
      if (data.askReallyDeleteMsgNo !== undefined)          this.askReallyDeleteMsgNo =             data.askReallyDeleteMsgNo;
      if (data.askReallyDeleteMsgStatus !== undefined)      this.askReallyDeleteMsgStatus =         data.askReallyDeleteMsgStatus;
      if (data.textQueueing !== undefined)                  this.textQueueing =                     data.textQueueing;
      if (data.textEncodingStart !== undefined)             this.textEncodingStart =                data.textEncodingStart;
      if (data.textConverting !== undefined)                this.textConverting =                   data.textConverting;
      if (data.textWaitConverting !== undefined)            this.textWaitConverting =               data.textWaitConverting;
      if (data.textFetchingUpload !== undefined)            this.textFetchingUpload =               data.textFetchingUpload;
      if (data.textFetchingURL !== undefined)               this.textFetchingURL =                  data.textFetchingURL;
      if (data.textExploding !== undefined)                 this.textExploding =                    data.textExploding;
      if (data.textEncoding !== undefined)                  this.textEncoding =                     data.textEncoding;
      if (data.textUploading !== undefined)                 this.textUploading =                    data.textUploading;
      if (data.textEncoding30sec !== undefined)             this.textEncoding30sec =                data.textEncoding30sec;
      if (data.textEncoding60sec !== undefined)             this.textEncoding60sec =                data.textEncoding60sec;
      if (data.textEncoding90sec !== undefined)             this.textEncoding90sec =                data.textEncoding90sec;
      if (data.textEncodingTip !== undefined)               this.textEncodingTip =                  data.textEncodingTip;
      if (data.textErrorUploadNotFound !== undefined)       this.textErrorUploadNotFound =          data.textErrorUploadNotFound;
      if (data.textTroubleNotFoundA !== undefined)          this.textTroubleNotFoundA =             data.textTroubleNotFoundA;
      if (data.textTroubleNotFoundB !== undefined)          this.textTroubleNotFoundB =             data.textTroubleNotFoundB;
      if (data.textErrorNetwork !== undefined)              this.textErrorNetwork =                 data.textErrorNetwork;
      if (data.textGfyExists !== undefined)                 this.textGfyExists =                    data.textGfyExists;
      if (data.textGfyComplete !== undefined)               this.textGfyComplete =                  data.textGfyComplete;
      if (data.folderEmptyGfycats !== undefined)            this.folderEmptyGfycats =               data.folderEmptyGfycats;
      if (data.folderEmptyAlbums !== undefined)             this.folderEmptyAlbums =                data.folderEmptyAlbums;
      if (data.folderEmptyBookmarks !== undefined)          this.folderEmptyBookmarks =             data.folderEmptyBookmarks;
      if (data.folderSuggestUpload !== undefined)           this.folderSuggestUpload =              data.folderSuggestUpload;
      if (data.sortByText !== undefined)                    this.sortByText =                       data.sortByText;
      if (data.textSortButtonNewest !== undefined)          this.textSortButtonNewest =             data.textSortButtonNewest;
      if (data.textSortButtonDropNewest !== undefined)      this.textSortButtonDropNewest =         data.textSortButtonDropNewest;
      if (data.textSortButtonOldest !== undefined)          this.textSortButtonOldest =             data.textSortButtonOldest;
      if (data.textSortButtonDropOldest !== undefined)      this.textSortButtonDropOldest =         data.textSortButtonDropOldest;
      if (data.textSortButtonAZ !== undefined)              this.textSortButtonAZ =                 data.textSortButtonAZ;
      if (data.textSortButtonDropAZ !== undefined)          this.textSortButtonDropAZ =             data.textSortButtonDropAZ;
      if (data.textSortButtonZA !== undefined)              this.textSortButtonZA =                 data.textSortButtonZA;
      if (data.textSortButtonDropZA !== undefined)          this.textSortButtonDropZA =             data.textSortButtonDropZA;
      if (data.textSortButtonViewMost !== undefined)        this.textSortButtonViewMost =           data.textSortButtonViewMost;
      if (data.textSortButtonDropViewMost !== undefined)    this.textSortButtonDropViewMost =       data.textSortButtonDropViewMost;
      if (data.textSortButtonViewLeast !== undefined)       this.textSortButtonViewLeast =          data.textSortButtonViewLeast;
      if (data.textSortButtonDropViewLeast !== undefined)   this.textSortButtonDropViewLeast =      data.textSortButtonDropViewLeast;
      if (data.busyLoadingAccountContent !== undefined)     this.busyLoadingAccountContent =        data.busyLoadingAccountContent;
      if (data.busyLoadingGallery !== undefined)            this.busyLoadingGallery =               data.busyLoadingGallery;
      if (data.busyLoadingTagGfys !== undefined)            this.busyLoadingTagGfys =               data.busyLoadingTagGfys;
      if (data.textJiffiestHeading !== undefined)           this.textJiffiestHeading =              data.textJiffiestHeading;
      if (data.textTrendingHeading !== undefined)           this.textTrendingHeading =              data.textTrendingHeading;
      if (data.gfyAnnouncements !== undefined)              this.gfyAnnouncements =                 data.gfyAnnouncements;

    },

    // these are the default text messages shown on the page
    warnUnpublishMsg: 'You are about to remove the visibility of this Gfycat from public eyes. It will be removed from the Gfycat homepage content (including Site Search), however the link will still remain shareable.',
    askReallyUnpublishMsg: 'Are you sure you want to unpublish this Gfycat?',
    hintMoveFilesMsg: 'HINT: You can quickly move Gfycats into folders by dragging and dropping the thumbnail image!',
    askReallyDeleteMsg: 'Are you sure you want to delete this Gfycat?',
    askReallyDeleteMsgYes: 'Yes',
    askReallyDeleteMsgNo: 'No',
    askReallyDeleteMsgStatus: 'Deleting...',
    textQueueing: 'Getting into Encoding queue', // this text may not be seen anymore... used when we were purposefully delaying encoding queue
    textEncodingStart: 'Initiating', // text when we start transcode
    textConverting: 'Converting', // text when we start polling status requests
    textWaitConverting: 'Converting...',
    textFetchingUpload: 'Getting uploaded file', // text from status request (upload from PC)
    textFetchingURL: 'Fetching remote URL', // text from status request (fetch from URL)
    textExploding: 'Exploding frames', // text from status request
    textEncoding: 'Encoding gfy video', // text from status request (this is the one that takes a while... we might be able to add more? based on time)
    textEncoding10sec: 'Still encoding gfy video',
    textEncoding30sec: 'More encoding of your gfy video happening now',
    textEncoding60sec: 'We Love encoding your gfy video sooooo much!',
    textEncoding90sec: 'Yikes!  This is a big one, be patient!',
    textEncodingTip: ' (Tip: In Account Settings you can choose to receive an email notice instead of waiting)',
    textUploading: 'Uploading final content', // text from status request
    textErrorUploadNotFound: 'Not Found', // error most people should never see
    textTroubleNotFoundA: 'Trouble finding file (Searching another: ', // needs part A and B
    textTroubleNotFoundB: 's )', // needs part A and B
    textErrorNetwork: 'Oops! An error has occurred. (Network connected?)', // failed post request
    textGfyExists: 'Error: Gfycat already Exists.', // gfy already existing
    textGfyComplete: 'Your Gfycat is ready: ', //gfy is done
    folderEmptyGfycats: 'This folder contains no Gfycats',
    folderSearchEmptyGfycats: 'There are no Results for your current Search',
    folderEmptyAlbums: 'This Album contains no Gfycats',
    folderEmptyBookmarks: 'This folder contains no Bookmarks',
    folderSuggestUpload: 'UPLOAD to ',
    sortByText: 'Sort by: ',
    textSortButtonNewest: 'New',
    textSortButtonDropNewest: 'Newest',
    textSortButtonOldest: 'Old',
    textSortButtonDropOldest:' Oldest',
    textSortButtonAZ: '(A-Z)',
    textSortButtonDropAZ: 'File Name (A-Z)',
    textSortButtonZA: '(Z-A)',
    textSortButtonDropZA: 'File Name (Z-A)',
    textSortButtonViewMost: '? to 1',
    textSortButtonDropViewMost: 'Views : Most',
    textSortButtonViewLeast: '1 to ?',
    textSortButtonDropViewLeast: 'Views : Least',
    busyLoadingAccountContent: 'Loading Content...',
    busyLoadingGallery: 'Loading Gallery Content...',
    busyLoadingTagGfys:'Loading More Gfys...',
    textEndOfGalleryTags:'Please wait a moment and try Scrolling Again!',
    textJiffiestHeading: 'Jiffiest Gfycats', //main page heading 1
    textTrendingHeading: 'Trending Tags', // main page heading 2
    gfyAnnouncements: '',

    // added by zhongwu
    defaultJiffiestHeading: 'Trending',

  };
},]);
