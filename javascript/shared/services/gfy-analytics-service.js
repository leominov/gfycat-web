/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').service('gfyAnalytics', ['$http', 'gfyFeeds', function($http, gfyFeeds) {

  return {
    sendViewCount: function(gfyid) {
      var ref = 'https://www.gfycat.com',
          data = {};
      if (typeof document.referrer != 'undefined' && document.referrer.length > 1 && !gfyFeeds.refererSent) {
        ref = encodeURIComponent(document.referrer);
        gfyFeeds.refererSent = true;
      }
      data.ref = ref;
      return GFAN.sendViewCount(gfyid, data);
    },
    sendEvent: GFAN.sendEvent,
    fetchAndSendViewCount:function(gfyId, contextData) {
          GFAN.sendViewCount(gfyId, contextData);
    }

  };

},]);
