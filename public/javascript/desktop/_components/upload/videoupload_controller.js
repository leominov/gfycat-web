/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

(function() {

  var URLS = {
    s3_upload: 'https://gifaffe.s3.amazonaws.com/',
    uploadv1: 'https://upload.gfycat.com/transcodeRelease/',
    statusv1: 'https://tracking.gfycat.com/status/',
    uploadv2: 'https://api.gfycat.com/v1/gfycats/fetch',
    statusv2: 'https://api.gfycat.com/v1/gfycats/fetch/status/',

    cutNewKey: function(size) {
      var blankKey = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < size; i++) blankKey += possible.charAt(Math.floor(Math.random() * possible.length));
      return blankKey;
    },
  };

  var keyToFileNameMap = {};

  var filter_empty = function(e) {
    if (e.text == '') {
      return false;
    }

    return true;
  };

  var analyticsCurrentData = {
    flow: "",
    pastedUrlValue: "",
    title: "",
    tags: "",
    fetchLength: 0
  };

  var uploadSuccessExtendData = function(data) {
    var newData = data;
    if (analyticsCurrentData.flow == "pasteUrl") {
      newData.source = analyticsCurrentData.pastedUrlValue;
    }
    newData.title = analyticsCurrentData.title;
    newData.tags = analyticsCurrentData.tags;
    if (analyticsCurrentData.fetchLength) {
      newData.length = parseFloat(analyticsCurrentData.fetchLength.toFixed());
    }
    return newData;
  };

  // Initialize the jQuery File Upload widget:
  $('#fileupload').fileupload({
    xhrFields: {
      withCredentials: true,
    },
    url: URLS.s3_upload,
  });

  // Enable iframe cross-domain access via redirect option:
  $('#fileupload').fileupload(
    'option',
    'redirect',
    window.location.href.replace(
      /\/[^\/]*$/,
      '/cors/result.html?%s'
    )
  );

  angular.module('demo', [
    'blueimp.fileupload',
    'rzModule',
    'progressButton',
  ])
  .config([
    '$httpProvider', 'fileUploadProvider',
    function($httpProvider, fileUploadProvider) {
      angular.extend(fileUploadProvider.defaults, {
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: /Android(?!.*Chrome)|Opera/
        .test(window.navigator.userAgent),
        maxFileSize: 300000000

        //acceptFileTypes: /(\.|\/)()$/i
      });
    },
  ])
  .service('VideoShareData', function($stateParams) {
    var state = {
      multiuploader: $stateParams.flow && $stateParams.flow === 'upload' ? true : false
    };

    return {
      state: state,
    };
  })
  .controller('VideoUploadController', ['$scope', 'gfyModalMachine', 'hotkeys',
    'msgMachine', '$sce', 'VideoShareData', 'gfyAnalytics', '$state', '$stateParams',
    function($scope, gfyModalMachine, hotkeys, msgMachine, $sce, VideoShareData,
       gfyAnalytics, $state, $stateParams) {
    window.upload_scope = $scope;
    window.gfyModalMachine = gfyModalMachine;

    hotkeys.add({
      combo: 'esc',
      description: 'Close modal',
      callback: function() {
        gfyModalMachine.modalUploadsShown = false;
        hotkeys.del('esc');
      }
    });

    $scope.msgs = msgMachine;

    if ($stateParams.flow && $stateParams.flow == 'upload') {
      VideoShareData.state.multiuploader = true;
    } else {
      VideoShareData.state.multiuploader = false;
    }

    $scope.state = VideoShareData.state;

    $scope.options = {
      url: URLS.s3_upload,
      autoUpload: false,
      prependFiles: true,
      disableImageLoad: true,
      formData: {
        key: 'key2',
        AWSAccessKeyId: 'AKIAIT4VU4B7G2LQYKZQ',
        acl: 'private',
        success_action_status: '200',
        policy: 'eyAiZXhwaXJhdGlvbiI6ICIyMDIwLTEyLTAxVDEyOjAwOjAwLjAwMFoiLAogICAgICAgICAgICAiY29uZGl0aW9ucyI6IFsKICAgICAgICAgICAgeyJidWNrZXQiOiAiZ2lmYWZmZSJ9LAogICAgICAgICAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgICAgICAgICAgIHsiYWNsIjogInByaXZhdGUifSwKCSAgICB7InN1Y2Nlc3NfYWN0aW9uX3N0YXR1cyI6ICIyMDAifSwKICAgICAgICAgICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgICAgICAgICBbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwgMCwgNTI0Mjg4MDAwXQogICAgICAgICAgICBdCiAgICAgICAgICB9',
        signature: 'mk9t/U/wRN4/uU01mXfeTe2Kcoc=',
        'Content-Type': 'image/gif',
      },
    };

    $(document).bind('dragover', function(e) {
      var dropZone = $('#gfyEditor2'),
      timeout = window.dropZoneTimeout;
      if (!timeout) {
        dropZone.addClass('in');
      } else {
        clearTimeout(timeout);
      }

      var found = false,
      node = e.target;
      do {
        if (node === dropZone[0]) {
          found = true;
          break;
        }

        node = node.parentNode;
      } while (node != null);
      if (found) {
        dropZone.addClass('hover');
      } else {
        dropZone.removeClass('hover');
      }

      window.dropZoneTimeout = setTimeout(function() {
        window.dropZoneTimeout = null;
        dropZone.removeClass('in hover');
      }, 100);
    });

    $scope.$on('fileuploadadd', function(e, data) {
      if (data.files[0]) {
        gfyAnalytics.sendEvent({
          event: 'upload_selectFile',
          flow: analyticsCurrentData.flow,
          fileType: data.files[0].type.split('/')[1],
          fileSize: data.files[0].size / 100
        });
      }

      $state.go('uploader');
      $scope.tab = 1; //open the from PC tab
      var myrand = URLS.cutNewKey(10);
      data.files[0].formDataCopy = [];
      data.files[0].formDataCopy.push(data.scope.options.formData); // copy the base formData into this file
      data.files[0].formDataCopy.key = myrand; // set the new key value

      var originalFilename = data.files[0].name.substr(0,  data.files[0].name.lastIndexOf('.')) || data.files[0].name;
      keyToFileNameMap[myrand] = originalFilename;

      //console.log("adding to queue",data,myrand);

      // this is to fix the problem in firefox "Error: setting a property that has only a getter" - unable to find  getter definition in original code base
      data.files[0].__defineGetter__('name', function() {
        return name;
      });

      data.files[0].__defineSetter__('name', function(v) {
        name = v;
      });

      data.files[0].name = myrand; //each file needs a copy of it's own form data so we can swap it when we send looks like
      data.files[0].key = myrand; // add this here for ease
      data.files[0].localEdit = false;

      // check if we have image or video
      if (data.files[0].type.match('image')) {
        //console.log("have a gif:"+data.files[0].name);
        data.files[0].gif = true;
      } else {
        // console.log("have not a gif:"+data.files[0].name);
        data.files[0].gif = false;
      }

      // try to read the data
      if (typeof FileReader !== 'undefined') {
        //console.log("getting thumb");
        var oFReader = new FileReader();
        oFReader.readAsDataURL(data.files[0]);
        oFReader.onload = function(oFREvent) {
          var result = oFREvent.target.result;
          data.files[0].thumb = $sce.trustAsResourceUrl(result);
        };
      }

      $scope.msgs.queueCount += 1;
      var not_playable = document.createElement('video').canPlayType(data.files[0].type) === '';

      if (not_playable) {
        console.log(data.files[0].type, ' not playable. fallback to simple uploader');
      }

      if (VideoShareData.state.multiuploader || data.files[0].type == 'image/gif' || data.originalFiles.length > 1 || not_playable) {
        VideoShareData.state.multiuploader = true;

        var fileCounter = data.originalFiles.indexOf(data.files[0]);

        setTimeout(function() {
          data.submit();
        },fileCounter*2200);
      } else {
        data.files[0].localEdit = true;
        $scope.$broadcast('editlocalfile', data);
      }
    });

    $scope.$on('fileuploadprogressall', function(e, data) {
      // Log the current bitrate for this upload:
      var progress = parseInt(data.loaded / data.total * 100, 10);
      $scope.$broadcast('videouploadprogress', progress);
    });

    $scope.$on('fileuploadsubmit', function(e, data) { //console.log("submitting file");
      data.scope.options.formData.key = data.files[0].formDataCopy.key;
    });

    $scope.$on('fileuploaddone', function(e, data) {
    //$scope.gfyTime(data.files[0],false,0);
    //console.log("fileuploaddone", data);

    if (data.local_edit) {} else {
      $scope.$broadcast('videouploaddone', data.files);
    }
  });

    $scope.sendUploadType = function(flow) {
      analyticsCurrentData.flow = flow;
      gfyAnalytics.sendEvent({
        event: 'click_upload',
        flow: analyticsCurrentData.flow
      });
    };
}
])
.controller('MultiFileUploadController', [
  '$scope', '$http', '$sce', 'msgMachine', 'gfyModalMachine', '$timeout', 'gfyAccountTree', 'gfyFeeds', '$rootScope', 'VideoShareData', 'gfyAnalytics', 'oauthTokenService',
  function($scope, $http, $sce,msgMachine, gfyModalMachine, $timeout, gfyAccountTree, gfyFeeds, $rootScope, VideoShareData, gfyAnalytics, oauthTokenService) {
    $scope.msgs = msgMachine;
    $scope.gfyModals = gfyModalMachine;
    $scope.accountTree = gfyAccountTree;
    $scope.feeds = gfyFeeds;
    $scope.fileNoResize = false;
    $scope.fetchQueue = [];

    $scope.goBack = function() {
      //console.log("go to main");
      VideoShareData.state.multiuploader = false;
    };


    $scope.$on('videouploaddone', function(event, data) {
      //console.log("videouploaddone", data);
      $scope.gfyTime(data[0], false, 0);
    });

    function loadURL(imageUrl) {
      if (imageUrl != null && imageUrl.match('http') != null) {
        $scope.gfyModals.modalUploadsShown = true; // open modal
        VideoShareData.state.multiuploader = true;
        $scope.addFetchUrl(imageUrl);
        $scope.gfyTime($scope.fetchQueue[0], true, 0);
      }
    }

    $scope.$on('url_not_supported', function(event, data) {

      console.log('url_not_supported ', data);
      loadURL(data);
    });


    $rootScope.$on('pasted_data', function(event, e) { // watching for pasted data
      //console.log($scope.feeds.pastedData);
      var imageUrl = $scope.feeds.pastedData;
      loadURL(imageUrl);
    });

    // end of listener above

    $scope.addFetchUrl = function(imageUrl) {
      if (!imageUrl) return;
      var file = {};
      file.localEdit = false;
      file.url = imageUrl;
      file.fetching = true;
      file.key = URLS.cutNewKey(10);
      file.fetchSecond = 0;
      file.fetchMinute = 0;
      file.fetchHour = 0;
      file.fetchLength = 15;

      $scope.fetchQueue.unshift(file); // add the file to the top of the list
      //console.log($scope.fetchQueue);
    };

    $scope.submitFetchUrl = function(imageUrl) {
      $scope.addFetchUrl(imageUrl);
      $scope.gfyTime($scope.fetchQueue[0], true, 0);
    };

    $scope.onCopyGfyUrl = function(gfyName) {
      gfyAnalytics.sendEvent({
        event: 'share_attempt',
        flow: 'uploader',
        channel: 'URL',
        device_type: 'desktop',
        gfyid: gfyName.toLowerCase()
      });
    };

    $scope.duplicateGfycat = function(data, isFetch, index) {
      console.log(data);
      if (isFetch) data.key = URLS.cutNewKey(10);
      else {
        var newKey = URLS.cutNewKey(10);
        data.formDataCopy.key = newKey;
        data.name = newKey;
        data.key = newKey;
      }

      data.gfyName = '';
      data.noMd5 = true;
      if (isFetch) $scope.gfyTime(data, isFetch, index);
      else data.$submit();
    };

    $scope.shouldSave = function(queue) {
      if (!queue) return false;

      var saved = true;
      queue.forEach(function(file) {
        saved &= (file.saved == true);
      });

      return !saved;
    };

    // Called when a multi-upload completes, set original filename as gfycat title
    $scope.applyFilename = function(file) {
      file.usersGfyTitle = keyToFileNameMap[file.key].substr(0,60);
      $http.put('https://api.gfycat.com/v1/me/gfycats/' + file.gfyName + '/title', {'value': file.usersGfyTitle}).then(function(response) {
      },
      function(response) {
        console.log("Error: ", response);
      })
    }

    $scope.saveChanges = function(gfyEdit, queue) {
      if (queue) {
        queue.forEach(function(file) {

          var analyticsData = {
            event: 'upload_infoUpdated',
            gfyid: file.gfyName,
            content_type: (file.hasOwnProperty("usersGfyNsfw") && file.usersGfyNsfw !== "Clean") ? 1 : 0
          };
          if (gfyAccountTree.accountName) {
            analyticsData.username = gfyAccountTree.accountName;
          }
          if (file.hasOwnProperty("usersGfyTitle") && file.usersGfyTitle !== "") {
            analyticsData.title = file.usersGfyTitle;
          }
          if (file.hasOwnProperty("usersDescription") && file.usersDescription !== "") {
            analyticsData.text = file.usersDescription;
          }
          if (file.hasOwnProperty("usersGfyTag1") || file.hasOwnProperty("usersGfyTag2") || file.hasOwnProperty("usersGfyTag3")) {
            let tagArray = [];
            if (file.hasOwnProperty("usersGfyTag1") && file.usersGfyTag1 !== "") {
              tagArray.push(file.usersGfyTag1);
            }
            if (file.hasOwnProperty("usersGfyTag2") && file.usersGfyTag2 !== "") {
              tagArray.push(file.usersGfyTag2);
            }
            if (file.hasOwnProperty("usersGfyTag3") && file.usersGfyTag3 !== "") {
              tagArray.push(file.usersGfyTag3);
            }
            analyticsData.tags = tagArray.join();
          }
          gfyAnalytics.sendEvent(analyticsData);

          gfyEdit.saveUsersInfo(file);
        });
      } else {
        console.log('no queue');
      }
    };

    $scope.submitCancel = function(queuedata, fetchQueue) {
      function cleanForArray(queuedata) {
        var validQueue = queuedata.filter(function(file) {
          return file.encodingComplete || file.existing || file.error;
        });

        validQueue.forEach(function(e) {
          queuedata.splice(queuedata.indexOf(e), 1);
        });
      }

      cleanForArray(queuedata);
      cleanForArray(fetchQueue);
    };

    $scope.clearFetch = function(index) {
      $scope.fetchQueue.splice(index, 1);
    };

    $scope.matchYoutube = UTIL.matchYoutube;

    $scope.gfyTime = function(data, isfetch, index) {
      if (!index) index = 0;
      data.progressPercent = 0;
      data.existing = false;

      if (data.fetchSecond != undefined && data.fetchMinute != undefined && data.fetchHour != undefined && data.fetchLength != undefined) data.isTimeOK = true;
      if (data.fetching == true) {
        if ($scope.matchYoutube(data.url) && !data.isTimeOK) {
          if (!data.isFetchYouTube) { // prevents calling $scope.$apply twice in a row... angular is not happy when this happens
            data.isFetchYouTube = true;
            $scope.$apply();
          }

          console.log('youtube video without proper time');
          return;
        }
      }

      console.log('here');

      //var params="?callback=JSON_CALLBACK";
      var params = '?';
      if (data.fetchSecond != undefined) params += '&fetchSeconds=' + data.fetchSecond;
      if (data.fetchMinute != undefined) params += '&fetchMinutes=' + data.fetchMinute;
      if (data.fetchHour != undefined) params += '&fetchHours=' + data.fetchHour;
      if (data.fetchLength != undefined) params += '&fetchLength=' + data.fetchLength;
      if ($scope.fileNoResize == false) params += '&noResize=' + !$scope.fileNoResize; // this is for a global noResize of all files that are added to queue after this is changed
      if (data.noMd5) params += '&noMd5=' + data.noMd5;
      console.log(params);
      if (isfetch == true) {
        var decode = decodeURIComponent(data.url);
        params += '&fetchUrl=' + encodeURIComponent(decode);
      }

      var myrand = '?m=';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++)
      myrand += possible.charAt(Math.floor(Math.random() * possible.length));

      data.encodingGfyTxt = $scope.msgs.textQueueing;

      //console.log("we are waiting: "+$scope.timetowaitfor+" seconds");
      waitingforqueue();

      function waitingforqueue() {
        //console.log("OK GO!");
        if (!data.waiting) data.encodingGfyTxt = $scope.msgs.textEncodingStart;
        data.encodingComplete = false;
        data.stopPolling = false;

          ///////////////////////////////////////////////////
          //var final_request = $.extend(true, {}, $scope.state);

          //if (final_request.title == null) {
          //    final_request.title = 'Untitled';
          //}

          //final_request.captions = $scope.state.captions.filter(filter_empty);
          //final_request.tags = $scope.state.tags.filter(filter_empty);

          //console.log("posting data ", final_request);
          //console.log("Datar");
          //console.log(data);
          var sendData;
          if(data.url){
              sendData = {fetchUrl:data.url};
              if(data.noMd5) {
                sendData.noMd5 = data.noMd5;
              }
          }else{
            sendData = {
              fetchKey:data.key,
              noMd5:data.noMd5
            };
          }
          //console.log("Scope state");
          //console.log($scope.state);
          var uploadUrl = URLS.uploadv1;
          if(oauthTokenService.isUserLoggedIn()){
              $http.post(URLS.uploadv2, sendData).then(function(result) {
                  var data2 = result.data;

                  ///////////////////////////////

//        $http.jsonp(URLS.uploadv1 + data.key + params + '&callback=JSON_CALLBACK').success(function(data2) {
                  // check the data2 to see if this file exists already before trying to encode
                  //    console.log("in post");
                  console.log(data2);

                  //console.log(data2.gfyName);
                  if (data2.gfyName != undefined && !data.noMd5) {
                      data.existing = true;
                      data.gfyName = data2.gfyName;
                      data.encodingGfyTxt = $scope.msgs.textGfyExists + 'gfycat.com/' + data2.gfyName;
                      gfyAnalytics.sendEvent({
                          event: 'upload_selectFile',
                          flow: analyticsCurrentData.flow,
                          type: 'gif',
                          size: data2.gifSize
                      });
                      return;
                  }

                  data.encodingGfyTxt = $scope.msgs.textConverting;
                  data.progressPercent = 10;
                  var timerCount = 0;
                  var timerEncodingCount = 0;
                  var iterations = 0; // used to loop the status incase of error not found being result of delay in file upload being resolved
                  var key;
                  //console.log("Send data");
                  //console.log(sendData);
                  if(sendData.fetchUrl) {
                      key = data2.gfyname;
                  }else {
                      key = data.key;
                  }
                  // initial touch to get possible username into memcache
                  $http.jsonp('/ajax/initiate/' + key + '?&callback=JSON_CALLBACK').success(function() {
                      //console.log("initiated");
                      // heartbeat to poll for conversion status
                      (function tick() {
                          $http.jsonp(URLS.statusv1 + key + myrand + '&callback=JSON_CALLBACK').success(function(status) {
                              //console.log(URLS.statusv1 + key + myrand + '&callback=JSON_CALLBACK');
                              //console.log("Status");
                              //console.log(status);
                              iterations++;
                              timerEncodingCount++;
                              if (data.stopPolling)
                                  return;
                              var time_remaining = status.time;
                              data.waiting = false;
                              if ('error' in status) {
                                  //console.log("oopserr");
                                  if (status.error.indexOf('Sorry, please wait another ') >= 0) {
                                      data.encodingGfyTxt = $scope.msgs.textWaitConverting;
                                      data.waiting = true;
                                      $timeout(waitingforqueue, 500);
                                  } else if (!data.waiting) {
                                      data.error = status.error + '  (logged: ' + data.key + ')';
                                      timerCount = 20000; // done. stop polling
                                      data.stopPolling = true;
                                  }

                                  gfyAnalytics.sendEvent({
                                      event: 'upload_error',
                                      error:  status.error
                                  });

                              } else if (status.task == 'fetchingUpload')
                                  data.encodingGfyTxt = $scope.msgs.textFetchingUpload;
                              else if (status.task == 'fetchingURL')
                                  data.encodingGfyTxt = $scope.msgs.textFetchingURL;
                              else if (status.task == 'exploding')
                                  data.encodingGfyTxt = $scope.msgs.textExploding;
                              else if (status.task == 'encoding') {
                                  if (timerEncodingCount < 30) data.encodingGfyTxt = $scope.msgs.textEncoding;
                                  else if (timerEncodingCount >= 30 && timerEncodingCount < 60) data.encodingGfyTxt = $scope.msgs.textEncoding30sec;
                                  else if (timerEncodingCount >= 60 && timerEncodingCount < 90) data.encodingGfyTxt = $scope.msgs.textEncoding60sec;
                                  else if (timerEncodingCount >= 90) data.encodingGfyTxt = $scope.msgs.textEncodingTip;
                              } else if (status.task == 'uploading')
                                  data.encodingGfyTxt = $scope.msgs.textUploading;
                              else if (status.task == 'NotFoundo' && (iterations >= 30)) {
                                  timerCount = 10000; // done. stop polling
                                  data.stopPolling = true;
                                  data.progressPercent = 100;
                                  data.error = $scope.msgs.textErrorUploadNotFound + '  (logged: ' + data.key + ')';
                              } else if (status.task == 'NotFoundo' && (iterations < 30)) {
                                  data.encodingGfyTxt = $scope.msgs.textTroubleNotFoundA + (30 - iterations) + $scope.msgs.textTroubleNotFoundB;
                                  $timeout(tick, 1000); // wait one second so it looks like we are counting down from 30 in real time
                              } else if (status.md5Found) {
                                  timerCount = 20000; // done. stop polling
                                  data.stopPolling = true;
                                  data.existing = true;
                                  data.gfyName = status.gfyname;
                                  data.encodingGfyTxt = $scope.msgs.textGfyExists + 'gfycat.com/' + status.gfyname;

                              } else if (status.task == 'complete') {
                                  timerCount = 10000; // done. stop polling
                                  data.stopPolling = true;
                                  data.encodingGfyTxt = $scope.msgs.textGfyComplete + 'gfycat.com/' + status.gfyname;
                                  data.gfyName = status.gfyname;
                                  data.progressPercent = 100;
                                  data.encodingComplete = true;

                                  //ajax/getDeleteKey
                                  if (!$scope.accountTree.loggedIntoAccount) {
                                      data.deleteKey = 'Loading delete key';
                                      $http.get('/ajax/getDeleteKey/' + data.gfyName).success(function(dataRx) {
                                          data.deleteKey = dataRx.deleteKey;
                                          console.log(data.deleteKey);
                                      });
                                  }

                                  console.log('complete!');
                                  $scope.applyFilename(data);

                                  var analyticsData = {
                                      event: 'upload_success',
                                      flow: 'simpleUpload',
                                      content_type: data.gif ? 1 : 0,
                                      gfyid: data.gfyName
                                  };
                                  if (data.size > 0) {
                                      analyticsData.size = data.size / 100;
                                  }
                                  if (data.preview && data.preview.duration) {
                                    analyticsCurrentData.fetchLength = data.preview.duration  * 100;
                                  } else {
                                    delete analyticsCurrentData.fetchLength;
                                  }
                                  if (gfyAccountTree.accountName) {
                                    analyticsData.username = gfyAccountTree.accountName;
                                  }
                                  gfyAnalytics.sendEvent(uploadSuccessExtendData(analyticsData));
                              }

                              if (time_remaining < 0.1) {
                                  data.progressPercent = 100;
                              } else {
                                  if (status.task != 'NotFoundo') {
                                      var p = data.progressPercent;
                                      var t = time_remaining;
                                      data.progressPercent = p + (100 - p) / (t);
                                  }
                              }

                              timerCount++;
                              if (status.task != 'complete' &&
                                  status.task != 'NotFoundo' &&
                                  data.stopPolling != true && timerCount < 1800) {
                                  if (timerCount > 120 && !data.encodingGfyTxt.match(/Tip/))
                                      data.encodingGfyTxt = data.encodingGfyTxt + $scope.msgs.textEncodingTip;
                                  $timeout(tick, 500);
                              }

                              //console.log(status.task);
                          },function() {
                              timerCount++;
                              var p = data.progressPercent;
                              data.progressPercent = p + (100 - p) / 10;
                              timerCount++;
                              if (timerCount < 20) {
                                  $timeout(tick, 500);
                              } else {
                                  data.encodingGfyTxt = $scope.msgs.textErrorNetwork;
                                  data.stopPolling = true;
                              }
                          });
                      })();
                  });
              });
          }else{
            callOldCookieUploader();
          }

          function callOldCookieUploader(){
              if (!data.waiting) data.encodingGfyTxt = $scope.msgs.textEncodingStart;
              data.encodingComplete = false;
              data.stopPolling = false;

              $http.jsonp(URLS.uploadv1 + data.key + params + '&callback=JSON_CALLBACK').success(function(data2) {
                  // check the data2 to see if this file exists already before trying to encode
                  console.log(data2);

                  //console.log(data2.gfyName);
                  if (data2.gfyName != undefined && !data.noMd5) {
                      data.existing = true;
                      data.gfyName = data2.gfyName;
                      data.encodingGfyTxt = $scope.msgs.textGfyExists + 'gfycat.com/' + data2.gfyName;
                      gfyAnalytics.sendEvent({
                          event: 'upload_selectFile',
                          flow: analyticsCurrentData.flow,
                          type: 'gif',
                          size: data2.gifSize
                      });
                      return;
                  }

                  data.encodingGfyTxt = $scope.msgs.textConverting;
                  data.progressPercent = 10;
                  var timerCount = 0;
                  var timerEncodingCount = 0;
                  var iterations = 0; // used to loop the status incase of error not found being result of delay in file upload being resolved

                  // initial touch to get possible username into memcache
                  $http.jsonp('/ajax/initiate/' + data.key + '?&callback=JSON_CALLBACK').success(function() {
                      //console.log("initiated");
                      // heartbeat to poll for conversion status
                      (function tick() {
                          $http.jsonp(URLS.statusv1 + data.key + myrand + '&callback=JSON_CALLBACK').success(function(status) {
                              //console.log(status);
                              iterations++;
                              timerEncodingCount++;
                              if (data.stopPolling)
                                  return;
                              var time_remaining = status.time;
                              data.waiting = false;
                              if ('error' in status) {
                                  //console.log("oopserr");
                                  if (status.error.indexOf('Sorry, please wait another ') >= 0) {
                                      data.encodingGfyTxt = $scope.msgs.textWaitConverting;
                                      data.waiting = true;
                                      $timeout(waitingforqueue, 500);
                                  } else if (!data.waiting) {
                                      data.error = status.error + '  (logged: ' + data.key + ')';
                                      timerCount = 20000; // done. stop polling
                                      data.stopPolling = true;
                                  }

                                  gfyAnalytics.sendEvent({
                                      event: 'upload_error',
                                      error:  status.error
                                  });

                              } else if (status.task == 'fetchingUpload')
                                  data.encodingGfyTxt = $scope.msgs.textFetchingUpload;
                              else if (status.task == 'fetchingURL')
                                  data.encodingGfyTxt = $scope.msgs.textFetchingURL;
                              else if (status.task == 'exploding')
                                  data.encodingGfyTxt = $scope.msgs.textExploding;
                              else if (status.task == 'encoding') {
                                  if (timerEncodingCount < 30) data.encodingGfyTxt = $scope.msgs.textEncoding;
                                  else if (timerEncodingCount >= 30 && timerEncodingCount < 60) data.encodingGfyTxt = $scope.msgs.textEncoding30sec;
                                  else if (timerEncodingCount >= 60 && timerEncodingCount < 90) data.encodingGfyTxt = $scope.msgs.textEncoding60sec;
                                  else if (timerEncodingCount >= 90) data.encodingGfyTxt = $scope.msgs.textEncodingTip;
                              } else if (status.task == 'uploading')
                                  data.encodingGfyTxt = $scope.msgs.textUploading;
                              else if (status.task == 'NotFoundo' && (iterations >= 30)) {
                                  timerCount = 10000; // done. stop polling
                                  data.stopPolling = true;
                                  data.progressPercent = 100;
                                  data.error = $scope.msgs.textErrorUploadNotFound + '  (logged: ' + data.key + ')';
                              } else if (status.task == 'NotFoundo' && (iterations < 30)) {
                                  data.encodingGfyTxt = $scope.msgs.textTroubleNotFoundA + (30 - iterations) + $scope.msgs.textTroubleNotFoundB;
                                  $timeout(tick, 1000); // wait one second so it looks like we are counting down from 30 in real time
                              } else if (status.md5Found) {
                                  timerCount = 20000; // done. stop polling
                                  data.stopPolling = true;
                                  data.existing = true;
                                  data.gfyName = status.gfyname;
                                  data.encodingGfyTxt = $scope.msgs.textGfyExists + 'gfycat.com/' + status.gfyname;

                              } else if (status.task == 'complete') {
                                  timerCount = 10000; // done. stop polling
                                  data.stopPolling = true;
                                  data.encodingGfyTxt = $scope.msgs.textGfyComplete + 'gfycat.com/' + status.gfyname;
                                  data.gfyName = status.gfyname;
                                  data.progressPercent = 100;
                                  data.encodingComplete = true;

                                  //ajax/getDeleteKey
                                  if (!$scope.accountTree.loggedIntoAccount) {
                                      data.deleteKey = 'Loading delete key';
                                      $http.get('/ajax/getDeleteKey/' + data.gfyName).success(function(dataRx) {
                                          data.deleteKey = dataRx.deleteKey;
                                          console.log(data.deleteKey);
                                      });
                                  }

                                  console.log('complete!');

                                  var analyticsData = {
                                      event: 'upload_success',
                                      flow: 'simpleUpload',
                                      content_type: data.gif ? 1 : 0,
                                      gfyid: data.gfyName
                                  };
                                  if (data.size > 0) {
                                      analyticsData.size = data.size / 100;
                                  }
                                  if (data.preview && data.preview.duration) {
                                    analyticsCurrentData.fetchLength = data.preview.duration  * 100;
                                  } else {
                                    delete analyticsCurrentData.fetchLength;
                                  }
                                  if (gfyAccountTree.accountName) {
                                    analyticsData.username = gfyAccountTree.accountName;
                                  }
                                  gfyAnalytics.sendEvent(uploadSuccessExtendData(analyticsData));
                              }

                              if (time_remaining < 0.1) {
                                  data.progressPercent = 100;
                              } else {
                                  if (status.task != 'NotFoundo') {
                                      var p = data.progressPercent;
                                      var t = time_remaining;
                                      data.progressPercent = p + (100 - p) / (t);
                                  }
                              }

                              timerCount++;
                              if (status.task != 'complete' &&
                                  status.task != 'NotFoundo' &&
                                  data.stopPolling != true && timerCount < 1800) {
                                  if (timerCount > 120 && !data.encodingGfyTxt.match(/Tip/))
                                      data.encodingGfyTxt = data.encodingGfyTxt + $scope.msgs.textEncodingTip;
                                  $timeout(tick, 500);
                              }

                              //console.log(status.task);
                          }).error(function() {
                              timerCount++;
                              var p = data.progressPercent;
                              data.progressPercent = p + (100 - p) / 10;
                              timerCount++;
                              if (timerCount < 20) {
                                  $timeout(tick, 500);
                              } else {
                                  data.encodingGfyTxt = $scope.msgs.textErrorNetwork;
                                  data.stopPolling = true;
                              }
                          });
                      })();
                  });
              });
          }
      }
    }

    $rootScope.$broadcast('multi_uploader_ready', true);
  }
])

.controller('FileDestroyController', [
  '$scope', '$http',
  function($scope, $http) {
    var file = $scope.file,
    state;
    if (file.url) {
      file.$state = function() {
        return state;
      };

      file.$destroy = function() {
        state = 'pending';
        return $http({
          url: file.deleteUrl,
          method: file.deleteType,
        }).then(
          function() {
            state = 'resolved';
            $scope.clear(file);
          },

          function() {
            state = 'rejected';
          }
        );
      };
    } else if (!file.$cancel && !file._index) {
      file.$cancel = function() {
        $scope.clear(file);
      };
    }

  },
])

.directive('myEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.myEnter);
        });

        event.preventDefault();
      }
    });
  };
})
.directive('myDraggable', ['$document', function($document) {
  return {
    scope: {
      onMove: '&',
      playerHeight: '=',
    },
    link: function(scope, element, attr) {
      var startX = 0,
      startY = 0,
      x = 0,
      y = 0;
      var maxHeight;

      element.on('mousedown', function(event) {
        var vch = element.height();
        maxHeight = angular.element('.caption-box').height() - vch;

        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - element.position().top;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;

        if (y > 0 && y < maxHeight) {
          element.css({
            top: y + 'px',

            // left:  x + 'px'
          });
          scope.onMove()(y);
        }
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    },
  };
},])

.controller('EditorV2Controller', [
  '$scope', '$http', '$window', 'gfyModalMachine', 'VideoShareData', '$rootScope','$location', '$translate', 'gfyAnalytics', '$timeout', 'gfyAccountTree',
  function($scope, $http, $window, $gfyModals, VideoShareData, $rootScope, $location, $translate, gfyAnalytics, $timeout, gfyAccountTree) {

    var default_state = {
      fetchUrl: null,
      fetchHours: 0,
      fetchMinutes: 0,
      fetchSeconds: 0,
      fetchLength: 15,
      noResize: true,
      noMd5: true,
      title: null,
      description: '',
      private: false,
      adultContent: false,
      tags: [//backend to reject more than 3 tags
      ],
      captions: [{
        text: '',
        startMinutes: 0,
        startSeconds: 0,
        duration: 5,
        fontHeightRelative: 7
      },],
    };

    $scope.state = $.extend(true, {}, default_state);
    $scope.result = {};
    $scope.edit_slider = {
      min: 0,
      max: 15,
      ceil: 500,
      floor: 0,
    };
    $scope.duration_slider = 0;

    $translate(['UPLOADER.START_TIME', 'UPLOADER.SEC']).then(function (translations) {
      $scope.editorStartTimeTranslation = translations['UPLOADER.START_TIME'];
      $scope.editorSecTranslation = translations['UPLOADER.SEC'];
    });

    var captionBox = document.getElementsByClassName('caption-box')[0];
    var videoCaption = document.getElementsByClassName('video_caption')[0];

    $rootScope.$on('url_for_uploader' , function(event, data) {
      console.log('received:', data);
      var myURI = decodeURI(data);
      console.log(myURI);
      $scope.submitFetchUrl(data);
    });

    $scope.$on('editlocalfile', function(event, data) {
      console.log('edit local file ');
      $scope.submitLocalFile(data);
    });

    $scope.updateModalFit = function() {
      if ($('#gfyEditor2 .ng-modal-dialog').height() > window.innerHeight) {
        $scope.modal_not_fit = true;
      } else {
        $scope.modal_not_fit = false;
      }
    };

    $scope.updateCaptionStyles = function() {
      var videotag = document.getElementsByClassName('vjs-tech')[0];
      if (videotag && videotag.clientWidth && videotag.clientHeight) {
        captionBox.style.width = videotag.clientWidth + 'px';
        captionBox.style.height = videotag.clientHeight + 'px';
        var fontSize = videotag.clientHeight * 0.07;
        videoCaption.style.fontSize = fontSize + 'px';
        videoCaption.style.bottom = fontSize / 2 + 'px';
      }
    };

    $(window).resize(function() {
      $scope.updateModalFit();
      $scope.updateCaptionStyles();
    });

    $scope.spacebarHandler = function (e) {
      if (e.which === 32 && document.activeElement.tagName !== "INPUT" &&  document.activeElement.tagName !== "TEXTAREA" && $scope.show) {
        e.preventDefault();
        $scope.toggleStop();
      }
    };

    $scope.addSpacebarControl = function () {
      $(document).bind('keypress', $scope.spacebarHandler);
    };

    $scope.removeSpacebarControl = function () {
      $(document).unbind('keypress', $scope.spacebarHandler);
    };

    /**
    *  SCOPE FUNCTIONS
    */

    $scope.switchToMultiuploader = function() {
      VideoShareData.state.multiuploader = true;
    };

    $scope.focusURL = function() {
      $('#urlFetch').focus();
    };

    $scope.startOver = function() {
      $scope.state = $.extend(true, {}, default_state);
      $scope.fetchUrl = '';
      $scope.result = {};
      $scope.step = 0;
      $scope.errorMessage = null;
      $scope.upload_progress = null;
    };

    $scope.togglePlay = function() {
      if ($scope.player.paused()) {
        $scope.player.play();
      } else {
        $scope.player.pause();
      }
    };

    $scope.toggleStop = function() {
      if ($scope.player.paused()) {
        $scope.startPlaybackLoop();
        $scope.player.play();
      } else {
        $scope.player.pause();
        $scope.player.currentTime($scope.edit_slider.min);
        $scope.stopPlaybackLoop();
      }
    };

    $scope.toggleSound = function() {
      if ($scope.muted) {
        $scope.player.muted(false);
        $scope.muted = false;
      } else {
        $scope.player.muted(true);
        $scope.muted = true;
      }
    };

    $scope.urlPasted = function(e) {
      var url = e.originalEvent.clipboardData.getData('text/plain');
      console.log('Url pasted: ', url);
      analyticsCurrentData.flow = "pasteUrl";
      analyticsCurrentData.pastedUrlValue = url;
      setTimeout(function() {
        $scope.submitFetchUrl(url);
      }, 100);
    };

    $scope.submitFetchUrl = function(url) {
      if (url.length < 10) {
        console.log('submitFetchUrl - too short');
        return;
      }
      url = url.trim();

      if (url.match(/\/[\w-._~:?\#\[\]@!\$&'()\*\+,;=%]+\.gif/)) {
        if (!(url.startsWith('https') || url.startsWith('http'))) {
          url = 'http://' + url;
        }
        console.log('might be a gif, send to simple uploader');
        $scope.fetchURL = '';
        $rootScope.$broadcast('url_not_supported', url);

        return;
      }

      console.log('submitFetchUrl... ', url);
      $scope.checkingUrl = true;

      $http.get('https://api.gfycat.com/v1/gfycats/fetch/remoteurlinfo?url=' + url)
      .then(function(response) {
        $scope.startOver();
        $scope.state.fetchUrl = url;
        $scope.fetchURL = '';
        $scope.checkingUrl = false;
        var player = $scope.getPlayer();

        var parser = document.createElement('a');
        parser.href = url;

        if (response.data.url) {
          player.src({
            type: 'video/mp4',
            src: response.data.url,
          });
          if ($location.search().title !== undefined) {
            $scope.state.title = $location.search().title;
          } else {
            $scope.state.title = response.data.title;
          }

          player.muted(true);
          if (player.paused) player.play();

          if (response.data.tags) {
            $scope.state.tags = response.data.tags.slice(0, Math.min(3, response.data.tags.length));
          }

          $scope.hasVideo = true;
          $('.vjs-poster').css('background-image', 'url(' + response.data.thumbnail + ')').show();

          var gfyAnalyticsEvent = {
            event: 'upload_selectFile',
            flow: analyticsCurrentData.flow,
            type: response.data.ext
          }

          // calculating duration of video in sec
          if (response.data.duration && response.data.duration !== "NaN") {
            var durationArr = response.data.duration.split(':'),
                duration = 0, i, j;
            for (i = durationArr.length - 1, j = 0; i >= 0, j < durationArr.length; i--, j++) {
              duration += durationArr[i] * Math.pow(60, j);
            }
            gfyAnalyticsEvent.duration = duration;
          }

          if (response.data.start_time) {
            $scope.start_time_specified = response.data.start_time;
          }

          gfyAnalytics.sendEvent(gfyAnalyticsEvent);

        } else {
          $rootScope.$broadcast('url_not_supported', url);
        }

      }, function(reason) {

        $scope.checkingUrl = false;
      });
    };

    $scope.submitLocalFile = function(data) {
      $scope.hasVideo = true;
      $scope.startOver();
      $scope.data = data;
      $scope.data.local_edit = true; // tag for redirect back

      var file = data.files[0];
      var fileUrl = URL.createObjectURL(file);
      var fileType = file.type;

      //console.log("play ", fileUrl, fileType);
      var player = $scope.getPlayer();
      player.src({
        type: fileType,
        src: fileUrl,
      });
      if (player.paused) player.play();
      player.muted(true);
    };

    var polling = false;
    $scope.$on('videouploadprogress', function(e, p) {
      if (polling) {
        $scope.upload_progress = (p * 0.25) / 100; // reserve first 25% for upload
      }
    });

      $scope.makeGfyCat = function() {
      if (!$scope.hasVideo || polling) {
        console.log('no video - do nothing polling = ', polling);
        return false;
      }

      $scope.removeSpacebarControl();

      $('.progress-overlay').fadeIn(300);
      polling = true;
      $scope.upload_progress = 0.0;
      $scope.progress_text = 'UPLOADER.UPLOADING_TEXT';

      if ($scope.data) {
        $scope.data.submit()
        .success(function(result, textStatus, jqXHR) {
          //console.log("uploaded");

          $scope.state.fetchKey = $scope.data.files[0].key;
          delete $scope.state['fetchUrl'];
          createGfy();
        })
        .error(function(jqXHR, textStatus, errorThrown) {})
        .complete(function(result, textStatus, jqXHR) {});

      } else {
        createGfy();
      }

      function startPoll(fetchKey, gfyName) {
        $scope.progress_text = 'UPLOADER.GFYCATTING_TEXT';

        function doPoll() {
          $http.get(URLS.statusv2 + fetchKey).then(function(result) {
            $scope.poll_result = result.data;
            if (result.data.task == 'error') {
              polling = false;
              $('.progress-overlay').fadeOut(100);
              $scope.errorMessage = {
                description: result.data.error,
              };
              $scope.upload_progress = null;

              gfyAnalytics.sendEvent({
                event: 'upload_error',
                flow: analyticsCurrentData.flow,
                content_type: '0', // video
                error: result.data.error
              });
            } else if (result.data.task == 'complete') {
              //console.log("poll complete");
              polling = false;
              $scope.upload_progress = 1.0;

              setTimeout(function() {
                $scope.startOver();
                $scope.hasVideo = false;
                $('.progress-overlay').hide();
                $scope.upload_progress = null;

                //console.log($scope.data);

                var analyticsData = {
                  event: 'upload_success',
                  flow: analyticsCurrentData.flow,
                  content_type: 0, // video
                  gfyid: result.data.gfyname
                }
                if (gfyAccountTree.accountName) {
                  analyticsData.username = gfyAccountTree.accountName;
                }
                gfyAnalytics.sendEvent(uploadSuccessExtendData(analyticsData));
                $window.open('https://gfycat.com/' + gfyName, '_self');
              }, 300);
            } else {
              $scope.upload_progress = $scope.upload_progress + (1 / 60.0);
              if ($scope.upload_progress > 0.9) {
                $scope.upload_progress = 0.9;
              }
            }

            //console.log("progress ", $scope.upload_progress);

            if (polling) {
              setTimeout(doPoll, 1000);
            }
          });
        }

        doPoll();
      }

      function removeHashCharacter(tags) {
        if (tags && tags.length) {
          for (var i = 0; i < tags.length; i++) {
            tags[i] = tags[i].replace(/^#*/, '');
          }
        }
      };

      function trimCaptionDurations(captions) {
        captions.forEach(function(caption, index) {
          caption.duration -= 0.01;
        });
        return captions;
      };

      function createGfy() {
        var final_request = $.extend(true, {}, $scope.state);

        final_request.captions = $scope.state.captions.filter(filter_empty);
        final_request.captions = trimCaptionDurations(final_request.captions);
        final_request.tags = $scope.state.tags.filter(filter_empty);
        removeHashCharacter(final_request.tags);
        analyticsCurrentData.title = final_request.title ? final_request.title : "";
        analyticsCurrentData.tags = final_request.tags.length ? final_request.tags.join() : "";
        analyticsCurrentData.fetchLength = final_request.fetchLength ? final_request.fetchLength * 100 : 0;

        //console.log("posting data ", final_request);
          console.log("Datar2");
          console.log(final_request);
        $http.post(URLS.uploadv2, final_request).then(function(result) {
          //console.log("results ", result);
          $scope.result.raw = result;

          if ($scope.result.raw.data.errorMessage) {
            $scope.errorMessage = JSON.parse($scope.result.raw.data.errorMessage);

            //console.log("Error! ", $scope.result.raw.data.errorMessage.description);

            gfyAnalytics.sendEvent({
              event: 'upload_error',
              error:  $scope.result.raw.data.errorMessage
            });

            setTimeout(function() {
              $('.progress-overlay').fadeOut(300);
            }, 1000);
          } else {
            //$scope.result.raw.data = JSON.parse($scope.result.raw.data);
            //console.log($scope.result.raw.data);
            $scope.errorMessage = null;
            $scope.result.url = 'https://gfycat.com/' + $scope.result.raw.data.gfyname;

            var statusKey = $scope.state.fetchKey ? $scope.state.fetchKey : $scope.result.raw.data.gfyname;
            startPoll(statusKey, $scope.result.raw.data.gfyname);
            $http.jsonp('/ajax/initiate/' + statusKey + '?&callback=JSON_CALLBACK').success(function() {
              console.log('Associated to account.');
            });
          }
        });
      }
    };

    $scope.stopPoll = function() {
      polling = false;
    };

    /**
    *  Precise looping via window.requestAnimationFrame();
    */

    $scope.startPlaybackLoop = function() {
      $scope.captionIndex = 0;
      if ($scope.editorAnimationId) {
        window.cancelAnimationFrame($scope.editorAnimationId);
      }
      $scope.editorAnimationId = window.requestAnimationFrame($scope.editorLoop);
    };

    $scope.stopPlaybackLoop = function() {
      $scope.captionIndex = 0;
      $scope.buildFrame();
      if ($scope.editorAnimationId) {
        window.cancelAnimationFrame($scope.editorAnimationId);
        $scope.editorAnimationId = null;
      }
    };

    $scope.editorLoop = function (timestamp) {
      $scope.buildFrame();
      $scope.editorAnimationId = window.requestAnimationFrame($scope.editorLoop);
    };

    /**
    *  Call before every new frame
    */

    $scope.buildFrame = function (){
      var currTime = $scope.player.currentTime() - $scope.edit_slider.min;
      var remaining = $scope.edit_slider.ceil - $scope.edit_slider.min;

      $scope.displayCaptions(currTime);

      // calculate left offset percentage of progress ticker (don't allow values < 0 or > 100)
      var stepPerSec = 100 / $scope.max_duration;
      var timechanged = currTime * stepPerSec;
      if (timechanged > 100 || timechanged < 0) timechanged = 0;
      $scope.currentTimePos = timechanged + '%';

      $('.time-cursor').css({
        left: $scope.currentTimePos,
      });

      if ($scope.duration_slider === 0) {
        $scope.player.pause();
        $scope.player.currentTime($scope.edit_slider.min);
        $scope.captionIndex = 0;
      } else if (currTime >= $scope.duration_slider || currTime >= remaining) {
        if (!$scope.player.paused) $scope.player.pause();
        $scope.player.currentTime($scope.edit_slider.min);
        if ($scope.player.paused) $scope.player.play();
        $scope.captionIndex = 0;
      }
    };

    /**
    *  Determine whether a caption needs to be shown or hidden
    */

    $scope.displayCaptions = function(currTime) {
      if ($scope.display_caption) {

        if (currTime >= $scope.display_caption.expires) {

          $('.video_caption').text('');
          $scope.display_caption = null;

        }
      }

      if ($scope.captionIndex < $scope.state.captions.length) {

        var checkCaption = $scope.state.captions[$scope.captionIndex];
        var captionStart = checkCaption.startSeconds;
        var captionEnd = captionStart + checkCaption.duration;

        if (currTime >= captionStart) {

          // show caption
          $('.video_caption').text(checkCaption.text);

          $scope.display_caption = {
            expires: captionEnd
          }

          $scope.captionIndex += 1;
        }
      }
    };

    $scope.add_caption = function() {
      var last = $scope.state.captions[$scope.state.captions.length - 1];
      $scope.state.captions.push({
        text: '',
        startSeconds: last.startSeconds + last.duration,
        duration: 5,
        fontHeightRelative: 7
      });
    };

    $scope.remove_caption = function(index) {
      if ($scope.state.captions.length > 1) {
        //console.log("remove caption at index ", index);
        $scope.state.captions.splice(index, 1);
      }
    };

    var updateCaptions = function() {
      $('.caption-box').width($('#yt_html5_api').width());
      var currTime = $scope.player.currentTime() - $scope.edit_slider.min;
      var captionShown = false;
      $scope.state.captions.forEach(function(e, index) {
        var captionStart = e.startSeconds;
        var captionEnd = e.startSeconds + e.duration;
        if (currTime >= captionStart && currTime <= captionEnd) {
          $scope.current_caption = e;
          captionShown = true;

          var vch = $('.video_caption').height();
          var vh = $scope.player.height();

          if ($('.video_caption').position().top + vch > vh) {
            $('.video_caption').css({
              top: vh - vch - 8,
            });
          }
          // setting default y position (from the top)
          // if (!$scope.current_caption.y && $('#yt video')[0].videoHeight) {
          //   $scope.current_caption.y = $('#yt video')[0].videoHeight - 60;
          // }
        }
      });

      if (captionShown == false) {
        $scope.current_caption = null;
      }
    };

    $scope.captionChanged = function(index) {
      //console.log(index, $scope.state.captions[index].text);
      updateCaptions();
    };

    $scope.captionMoved = function(y) {
      var vh = $('#yt video')[0].videoHeight;
      var r = (y + 15) / $scope.playerHeight;
      //$scope.current_caption.y = r * vh;
    };

    $scope.registerPlayer = function () {
      $scope.player = videojs('yt', {
        techOrder: ['html5'],
        controls: false,
        muted: true,
      }).ready(function() {
        var player = this;

        player.on('durationchange', function() {
          var duration = player.duration().toFixed(1);

          $scope.$apply(function() {
            $scope.edit_slider.ceil = duration;
            $scope.max_duration = duration < 15 ? duration : 15;
            $scope.duration_slider = $scope.max_duration;

            $scope.edit_slider.min = 0;

            if ($scope.start_time_specified) {
              $scope.edit_slider.min = $scope.start_time_specified;
              $scope.start_time_specified = null;
            }

            $scope.onStartTimeSliderChange();
            $scope.onStartTimeSliderEnd();

            var timeBubble = $('rzslider.time-slider > .rz-bubble:last-child');
            timeBubble.css({
              left: '-43px',
            });

            var durationBubble = $("rzslider.duration-slider > .rz-bubble:last-child");
            durationBubble.click(function() {
              if (durationBubble.has("input").length) {
                durationBubble.remove("input");
              } else {
                var duration = $scope.duration_slider;

                function readDuration() {
                  var durationInputValue = durationInput.val();
                  $scope.$apply(function() {
                    if (durationInputValue.length != 0) {
                      duration = parseFloat(durationInputValue);
                    }
                    if(duration >= 0 && duration <= $scope.max_duration) {
                      $scope.duration_slider = duration;
                      setTimeout(function() {
                        $scope.onStartTimeSliderEnd();
                        $scope.onDurationSliderEnd();
                      }, 10);
                    }
                  });

                  setTimeout(function() {
                    durationInput.remove();
                  },500);
                }
                var durationInput = angular.element("<input class=\"duration_edit\" value=\""+ duration + "\"/>");

                durationInput.keypress(function(e) {
                  if(e.which == 13) {
                    readDuration();
                  }
                }).focusout(function() {
                  readDuration();
                });
                durationBubble.remove("input").append(durationInput);
              }
            });

            timeBubble.click(function() {
              if (timeBubble.has('input').length) {
                timeBubble.remove('input');
              } else {
                var fetchMinutes = Math.floor($scope.edit_slider.min / 60);
                var fetchSeconds = $scope.edit_slider.min - (fetchMinutes * 60);

                var time = UTIL.formatSecondsWithDecimalPoint($scope.edit_slider.min, 2);

                function readStartTime() {
                  var val = element.val();
                  $scope.$apply(function() {
                    var timecomp = val.split(':');
                    var timeInSec = 0;
                    if (timecomp.length > 1) {
                      timeInSec = (parseFloat(timecomp[0]) * 60) + parseFloat(timecomp[1]);
                    } else {
                      timeInSec = (parseFloat(timecomp[0]) * 60);
                    }

                    console.log('enter! time in Sec ',  timeInSec);
                    if (timeInSec >= 0 && timeInSec < $scope.edit_slider.ceil) {
                      $scope.edit_slider.min = timeInSec;
                      setTimeout(function() {
                        $scope.player.currentTime(timeInSec);
                        $scope.player.pause();
                        $scope.onStartTimeSliderEnd();
                        $scope.onDurationSliderEnd();
                      }, 10);
                    }
                  });

                  setTimeout(function() {
                    element.remove();
                  }, 500);
                }

                var element = angular.element('<input class="time_edit" value="' + time + '"/>');
                element.keypress(function(e) {
                  if (e.which == 13) {
                    readStartTime();
                  }
                }).focusout(function() {
                  readStartTime();
                });

                angular.element('rzslider.time-slider > .rz-bubble:last-child').remove('input').append(element);
              }

              return false;
            });
          });
        });

        player.on('loadedmetadata', function() {
          $scope.playerHeight = player.height();
          $scope.updateModalFit();
          $scope.updateCaptionStyles();
          $(".vjs-loading-spinner").hide();

          var activeElement = document.activeElement;

          if (activeElement) {
            activeElement.blur();
          }

          // enable inline video playback on iPhone and iPod touch if < iOS 10
          if (makeVideoPlayableInline.isWhitelisted) {
            var video = document.querySelector('video');

            makeVideoPlayableInline(video, false);
            video.play();
          }

          $scope.removeSpacebarControl();
          $scope.addSpacebarControl();
        });
        player.on('ended', function(e){
          e.stopPropagation();
          e.preventDefault();
          player.play();
          player.currentTime($scope.edit_slider.min);
          $scope.startPlaybackLoop();
        });
      });

      $scope.muted = true;
    };

    $(document).bind('orientationchange', function(){
      if ($scope.player) {
        $scope.onStartTimeSliderEnd();
        $scope.onDurationSliderEnd();
      }
    });

    $scope.getPlayer = function() {
      if (!$scope.player) {
        $scope.registerPlayer();
      }
      return $scope.player;
    };

    /**
    *  SLIDER CHANGES
    */

    $('#accordion').on('hide.bs.collapse', function() {
      var openAnchor = $(this).find('[data-toggle=collapse].collapsed');
      openAnchor.find($('.toggle-icon')).addClass('ic-angle-left').removeClass('ic-angle-down');
    });

    $('#accordion').on('show.bs.collapse', function() {
      var openAnchor = $(this).find('[data-toggle=collapse]:not(.collapsed)');
      openAnchor.find($('.toggle-icon')).removeClass('ic-angle-left').addClass('ic-angle-down');
    });

    $scope.translateStartTime = function(s) {
      return $scope.editorStartTimeTranslation + ' ' + UTIL.formatSecondsWithDecimalPoint(s, 2);
    };

    $scope.translateDuration = function(s) {
      return s + ' ' + $scope.editorSecTranslation;
    };

    /**
    *  Get offset without waiting for DOM to update
    */

    $scope.calcOffsetLeft = function() {
      var barWidth = $('rzslider.time-slider')[0].getBoundingClientRect();
      barWidth = barWidth.right - barWidth.left - 4;
      var offsetPixels = ($scope.edit_slider.min) * barWidth / $scope.edit_slider.ceil;
      return offsetPixels;
    }

    /**
    *  Start Time Slider Events
    */

    $scope.onStartTimeSliderStart = function() {
      if (!$scope.player.paused()) $scope.player.pause();
      $scope.stopPlaybackLoop();
    };

    $scope.onStartTimeSliderChange = function() {
      var offsetLeft = $scope.calcOffsetLeft();

      var remainSpace = $('rzslider.time-slider').width() - offsetLeft;

      $('.duration-container').css({
        left: offsetLeft + 'px',
      });

      if (remainSpace < 97) {
        $('rzslider.time-slider .rz-bubble').css({
          'margin-left': '-80px',
        });
      } else {
        $('rzslider.time-slider .rz-bubble').css({
          'margin-left': '65px',
        });
      }

      $scope.player.currentTime($scope.edit_slider.min);
    };

    $scope.onStartTimeSliderEnd = function() {
      if ($scope.player.paused()) $scope.player.play();
      $scope.startPlaybackLoop();

      $scope.state.fetchHours = 0;
      $scope.state.fetchMinutes = Math.floor($scope.edit_slider.min / 60);
      $scope.state.fetchSeconds = $scope.edit_slider.min % 60;

      // prevent start time and duration slider misalignment
      $('.duration-container').css({
        left: $scope.calcOffsetLeft() + 'px',
      });

      // ensures that translated time is always accurate
      setTimeout(function() {
        $scope.$broadcast('rzSliderForceRender');
      }, 100);
    };

    /**
    *  Duration Slider Events
    */

    $scope.onDurationSliderStart = function() {
      if ($scope.player.paused()) $scope.player.play();
    };

    $scope.onDurationSliderEnd = function() {
      if ($scope.player.paused()) $scope.player.play();

      $scope.state.fetchLength = $scope.duration_slider;

      // ensures that translated time is always accurate
      setTimeout(function() {
        $scope.$broadcast('rzSliderForceRender');
      }, 100);
    };

    $rootScope.$broadcast('uploader_ready', true);
  },

]);
}());
