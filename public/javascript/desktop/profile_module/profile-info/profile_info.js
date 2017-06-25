angular.module('profileApp').directive('profileInfo',
    ['$rootScope', '$window', function($rootScope, $window) {
  return {
    restrict: 'E',
    templateUrl: function(elem, attr) {
      return '/javascript/desktop/profile_module/profile-info/profile-info-' + attr.type + '.html';
    },
    link: function(scope, element, attrs) {
      scope.imageSrc = "images/desktop/ic_no_avatar.svg";
      scope.fixedHeaderShown = false;

      var window = angular.element($window),
          infoContainer = element.find('.profile-info-container'),
          fixedHeader = element.find('.fixed-header');

      window.bind("scroll", function() {
        scope.updateFixedHeaderVisibility();
      });

      window.bind("resize", function() {
        scope.updateFixedHeaderVisibility();
      });

      /**
      * Show/hide fixedHeader depends on infoContainer position
      */
      scope.updateFixedHeaderVisibility = function() {
        if (window.scrollTop() >= infoContainer.outerHeight()) {
          fixedHeader.css({display: 'block'});
        } else {
          fixedHeader.css({display: 'none'});
        }
      };

      /**
      * Handles "add info" click
      * @param {String} infoType - name/url/description/etc
      */
      scope.addInfoClick = function(infoType) {
        var eventName = 'add-' + infoType + '-click';
        scope.openEdit();
        setTimeout(function () {
          $rootScope.$broadcast(eventName);
        }, 500);
      };

      /**
      * Formats url for the view
      * @return {String} formatted url
      */
      scope.formatUrl = function() {
        if (scope.currInfo.profileUrl) {
          var url = scope.currInfo.profileUrl;
          if (url.startsWith('https://')) {
            url = url.substr(8);
          } else if (url.startsWith('http://')) {
            url = url.substr(7);
          }
          return decodeURIComponent(url);
        }
      };
    }
  };
}]);
