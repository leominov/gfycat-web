/* Copyright (C) GfyCat, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Date: 12/1/2015
 */

angular.module('gfycat.shared')
  .filter('gfyBytes', function() {
    return function(bytes, type) { // type - can be 'bin' (binary) - 'dec' (decimal) - 'longDec' (decimal with words) - 'longBin' (binary with words
      if (bytes == undefined || bytes == null || bytes <= 0) return 'pending...';

      //bytes=parseInt(bytes);
      //if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return 0;
      var precision = 1; // number of decimal spaces
      var unitType = 1024; // defaults to binary
      if (type == 'dec' || type == 'longDec') unitType = 1000; // 1000 (decimal) or 1024 (binary)
      var units;
      if (type == 'bin') units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      else if (type == 'dec') units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      else if (type == 'longDec') units = ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes', 'petabytes', 'exabytes', 'zettabytes', 'yottabytes'];
      else if (type == 'longBin') units = ['bytes', 'kibibytes', 'mebibytes', 'gibibytes', 'tebibytes', 'pebibytes', 'exbibytes', 'zebibytes', 'yobibytes'];
      var number = Math.floor(Math.log(bytes) / Math.log(unitType));
      return (bytes / Math.pow(unitType, Math.floor(number)))
        .toFixed(precision) + ' ' + units[number];
    };
  });
