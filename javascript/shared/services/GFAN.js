/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

window.GFAN = function() {
  var utc = 0, stc = 0;
  function generateUUID() {
    var b = new Date().getTime();
    var a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(e) {
      var d = (b + Math.random() * 16) % 16 | 0;
      b = Math.floor(b / 16);
      return (e == 'x' ? d : (d & 3 | 8)).toString(16);
    });

    return a;
  }

  function createCookie(c, d, e) {
    if (e) {
      var b = new Date();
      b.setTime(b.getTime() + (e * 1000));
      var a = '; expires=' + b.toGMTString();
    } else {
      var a = '';
    }

    document.cookie = c + '=' + d + a + ';domain=.gfycat.com;path=/';
  }

  function readCookie(b) {
    var e = b + '=';
    var a = document.cookie.split(';');
    for (var d = 0; d < a.length; d++) {
      var f = a[d];
      while (f.charAt(0) == ' ') {
        f = f.substring(1, f.length);
      }

      if (f.indexOf(e) == 0) {
        return f.substring(e.length, f.length);
      }
    }

    return null;
  }

  function generateUserSessionID() {
    if (!utc) {
      utc = readCookie('_utc');
      if (!utc) {
        utc = generateUUID();
        createCookie('_utc', utc, 2 * 365 * 24 * 60 * 60);
      }
    }

    if (!stc) {
      stc = readCookie('_stc');
      if (!stc) {
        stc = generateUUID();
        createCookie('_stc', stc, 30 * 60);
      }
    }
  }

  function sendViewCount(gfyid, data) {

    generateUserSessionID();

    var _utc = encodeURIComponent(utc);
    var _stc = encodeURIComponent(stc);
    var _gfyid = gfyid;
    var viewDataString = "";
    for (var key in data) {
      if (data[key]) {
        viewDataString += ('&' + key + '=' + data[key]);
      }
    }
    if (window.GLOBAL_VARIABLES) {
      var device_type = window.GLOBAL_VARIABLES.isMobile ? 'mobile': 'desktop';
      viewDataString += '&device_type=' + device_type;
    }
    var url = 'https://px.gfycat.com/pix.gif?gfyid=' + _gfyid + viewDataString +
      '&utc=' + _utc + '&stc=' + _stc + '&rand=' + Math.random()*100000;
    var xhr = createCORSRequest('GET', url);
    if (!xhr) throw new Error('CORS is not supported in your browser');
    xhr.onload = function() {
      if (typeof gfycatSharePageGlobalVariables !== 'undefined') {
        gfycatSharePageGlobalVariables.country = xhr.getResponseHeader('x-geo-country');
      }
    };
    xhr.onerror = function() {
      console.log('CORS Error');
    }
    xhr.send();
  }

  function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.open(method, url, true);
    }
    /* IE support */
    else if (typeof XDomainRequest != 'undefined') {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    }
    /* CORS unsupported */
    else {
      xhr = null;
    }
    return xhr;
  }

  /*
    sendEvent({
      user: 'abc',
      video_id: 'some video'
    });
  */
  function encodeParameters(data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
  }

  var sendEvent = function(kv) {
    generateUserSessionID();

    var ref = 'https://www.gfycat.com';
    if (typeof document.referrer != 'undefined' && document.referrer.length > 1) {
      ref = document.referrer;
    }

    kv.utc = utc;
    kv.stc = stc;
    kv.ref = ref;

    var i = new Image();
    i.src = 'https://metrics.gfycat.com/pix.gif?' + encodeParameters(kv);


    if( typeof ga != 'undefined' && ga && 'event' in kv ) {
      ga('send', 'event', 'gfyEvent', kv['event']);
    }
  };

  var sendEventWithCallback = function(kv, callback) {
    generateUserSessionID();

    var ref = 'https://www.gfycat.com';
    if (typeof document.referrer != 'undefined' && document.referrer.length > 1) {
      ref = document.referrer;
    }

    kv.utc = utc;
    kv.stc = stc;
    kv.ref = ref;

    var i = new Image();
    i.src = 'https://metrics.gfycat.com/pix.gif?' + encodeParameters(kv);


    if( typeof ga != 'undefined' && ga && 'event' in kv ) {
      ga('send', 'event', 'gfyEvent', kv['event'], {'hitCallback': callback});
    }
  };

  return {
    sendEvent: sendEvent,
    sendEventWithCallback: sendEventWithCallback,
    sendViewCount: sendViewCount
  }
}();
