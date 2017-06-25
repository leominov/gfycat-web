window.UTIL = function() {
  var matchYoutube = function(url) {
    var supported_regex = [
    '(?:http://)?(?:www\\.)?break\.com/video/([^/]+)',
    'https?://.*brightcove\.com/(services|viewer).*',
    '(?:http://)?(?:www\\.)?gamespot\.com/video',
    '(?:https?://)?(?:(?:www|(?:player))\\.)?vimeo(?:pro)?\\.com/(?:.*?/)?(?:play_redirect_hls\\?clip_id=)?(?:videos?/)?(?:[0-9]+)/?(?:[?].*)?(?:#.*)?$',
    '(?:https?://)?(?:www\\.)?vine\.co/v/(?:\\w+)',
    'youtube.com',
    'youtu.be',
    '^(?:https?://(?:www\.)blinkx\\.com/ce/|blinkx:)(?:[^?]+)',
    '^(?:https?://)?(?:\w+\\.)?blip\.tv/((.+/)|(play/)|(api\\.swf#))(.+)$',
    'https?://(?:www\\.)?trailers\\.apple\\.com/trailers/(?:[^/]+)/(?:[^/]+)',
    '(?:https?://)?(?:www\\.)?archive\\.org/details/(?:[^?/]+)(?:[?].*)?$',
    'https?://www\\.bloomberg\.com/video/(?:.+?)\\.html',
    'https?://(?:www\\.)?cbs\.com/shows/[^/]+/video/(?:[^/]+)/.*',
    '^https?://(?:www\\.)?channel9\\.msdn\\.com/(?:.+)/?',
    'https?://((edition|www)\\.)?cnn\\.com/video/(data/.+?|\\?)/(?:.+?/(?:[^/]+?)(?:\\.cnn|(?=&)))',
    '^(?:https?://)?(?:www\\.)?collegehumor\.com/(video|embed|e)/(?:[0-9]+)/?(?:.*)$',
    'https?://(?:www.)?comedycentral.com/(video-clips|episodes|cc-studios)/(?:.*)',
    'https?://www\\.criterion\.com/films/(\\d*)-.+',
    '(?:https?://)?(?:(www|touch)\\.)?dailymotion\\.[a-z]{2,3}/(?:(embed|#)/)?video/(?:[^/?_]+)',
    'https?://www\\.ebaumsworld\\.com/video/watch/(?:\\d+)',
    '^(?:https?://)?(?:\\w+\.)?facebook\\.com/(?:[^#?]*#!/)?(?:video/video|photo)\.php\\?(?:.*?)v=(?:\\d+)(?:.*)',
    '(?:https?://)?(?:www\\.|secure\\.)?flickr\\.com/photos/(?:[\\w\\-_@]+)/(?:\\d+).*',
    '^(?:https?://)?(?:www\\.)?funnyordie\\.com/videos/(?:[0-9a-f]+)/.*$',
    'http://www\\.gamekings\\.tv/videos/(?:[0-9a-z\\-]+)',
    '(?:http://)?(?:www\\.)?gamespot\\.com/.*-(?:\\d+)/?',
    'http://www\\.gametrailers\\.com/(?:videos|reviews|full-episodes)/(?:.*?)/(?:.*)',
    '(?:https://)?plus\\.google\\.com/(?:[^/]+/)*?posts/(\\w+)',
    'https?://.+?\\.ign\.com/(?:videos|show_videos|articles|(?:[^/]*/feature))(/.+)?/(?:.+)',
    'http://www\\.imdb\\.com/video/imdb/vi(?:\\d+)',
    '(?:http://)?instagram\\.com/p/(.*?)/',
    'https?://video\\.internetvideoarchive\\.net/flash/players/.*?\\?.*?publishedid.*?',
    '^(?:http://)?(?:\\w+\\.)?liveleak\\.com/view\\?(?:.*?)i=(?:[\\w_]+)(?:.*)',
    'http://new\\.livestream\\.com/.*?/(?:.*?)(/videos/(?:\\d+))?/?$',
    '(?:http://)?(?:www\\.)?metacafe\\.com/watch/([^/]+)/([^/]+)/.*',
    '^(?:https?://)?(?:watch\\.|www\\.)?nba\\.com/(?:nba/)?video(/[^?]*?)(?:/index\\.html)?(?:\\?.*)?$',
    'https?://www\\.nbcnews\\.com/video/.+?/(?:\\d+)',
    'https?://video(?:\\.[^.]*)?\\.nhl\\.com/videocenter/console\\?.*id=(?:\\d+)',
    '^https?://(?:www\\.)?9gag\\.tv/v/(?:[0-9]+)',
    'https?://www\\.rottentomatoes\\.com/m/[^/]+/trailers/(?:\\d+)',
    '(https?://)?(www\\.)?(?:southparkstudios\\.com/(clips|full-episodes)/(?:.+?)(\\?|#|$))',
    'http://teamcoco\\.com/video/(?:.*)',
    'https?://www\\.ustream\\.tv/recorded/(?:\\d+)',
    '^(?:http://)?(?:www\\.)?(?:twitch|justin)\\.tv/',
    'http://(video|www).wired.com/(?:watch|series|video)/(?:.+)',
    'http://(video|www).gq.com/(?:watch|series|video)/(?:.+)',
    'http://(video|www).vogue.com/(?:watch|series|video)/(?:.+)',
    'http://(video|www).glamour.com/(?:watch|series|video)/(?:.+)',
    'http://(video|www).wmagazine.com/(?:watch|series|video)/(?:.+)',
    'http://(video|www).vanityfair.com/(?:watch|series|video)/(?:.+)',
    ];
    var re;
    for (var i = 0; i < supported_regex.length; i++) {
      re = new RegExp(supported_regex[i], 'i');
      if (url.match(re) != null)
      return true;
    }

    return false;
  };

  function padZero(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function secondsToTimeFormat(value) {
    var min = Math.floor(value / 60);
    var sec = (value % 60).toFixed(1);
    return padZero(min, 2) + ':' + padZero(sec, 4);
  }

  function bitwiseFloor(float) {
    // bitwise or, strips decimals of unsigned 32bit number
    return float | 0;
  }

  function formatSecondsWithDecimalPoint(s, d) {
    var minutes = bitwiseFloor(s / 60);
    var seconds = s - (minutes * 60);
    seconds = seconds.toFixed(d);
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
  }

  function copyToClipboard(dom) { //'#url-box'
    var cutTextarea = document.querySelector(dom);
    cutTextarea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Cutting text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  }

  function resizeAspectRatio(width, height, maxWidth, maxHeight) {
    var aspectRatio = height / width;
    width = Math.min(maxWidth, width);
    height =  Math.round(aspectRatio * width);

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height / (aspectRatio));
    }

    console.log('width ', width, ' height ', height);
    return { width: width, height: height };
  }

  function arrayToText(arr) {
    arr = arr.sort();
    return arr.join(',');
  }

  function isEmptyObj(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
      return false;
    }

    return true;
  }

  function getLocale() {
    if (window.navigator.languages && window.navigator.languages.length) {
      return window.navigator.languages[0];
    } else {
      return window.navigator.language;
    }
  }

  function toLocaleNumber(number) {
    if (number === undefined || number === null) {
      return "";
    }
    return number.toLocaleString(getLocale()).replace(/\u00a0/g, " "); //replace nbsp;
  }

  // date in milliseconds
  function toLocaleDate(date) {
    if (date === undefined) {
      return "";
    }
    var format = {day: 'numeric', month: 'long', year: 'numeric'};
    var locale = getLocale();
    var localeDate = new Date(date).toLocaleDateString(locale, format);
    //remove the end for Russian language
    if (locale && locale.startsWith("ru")) {
      localeDate = localeDate.substr(0, localeDate.length - 3);
    }
    return localeDate;
  }

  /**
  * Checks if click happend outside an html element
  * @param {Element} element - html element to check
  * @param {Object} event - click event
  */
  function isClickOutsideElement(element, clickEvent) {
    var clickX = clickEvent.x || clickEvent.pageX ||
      (clickEvent.touches ? clickEvent.touches[0].pageX : undefined);
    var clickY = clickEvent.y || clickEvent.pageY ||
      (clickEvent.touches ? clickEvent.touches[0].pageY : undefined);
    var elemRect = element.getBoundingClientRect();
    // height without padding
    var elemHeight = window.getComputedStyle(element).height;
    elemHeight = parseInt(elemHeight.substr(0, elemHeight.length - 2));
    var elemBottom = elemHeight ? elemRect.top + elemHeight : elemRect.bottom;

    if (clickX < elemRect.left || clickX > elemRect.right ||
        clickY < elemRect.top || clickY > elemBottom) {
      return true;
    }
    return false;
  }

  return {
    matchYoutube: matchYoutube,
    padZero: padZero,
    secondsToTimeFormat: secondsToTimeFormat,
    copyToClipboard: copyToClipboard,
    resizeAspectRatio: resizeAspectRatio,
    arrayToText: arrayToText,
    isEmptyObj: isEmptyObj,
    toLocaleNumber: toLocaleNumber,
    toLocaleDate: toLocaleDate,
    formatSecondsWithDecimalPoint: formatSecondsWithDecimalPoint,
    isClickOutsideElement: isClickOutsideElement
  };
}();
