angular.module('gfycatApp').directive("notFound", ['$translate', function($translate) {
  return {
    restrict: 'E',
    templateUrl: '/javascript/desktop/_components/not-found/not-found.html',
    link: function(scope, elem, attrs) {
      scope.title = "";
      scope.text = "";
      scope.keyword = attrs.keyword ? attrs.keyword: '';

      scope.translateTitle = function() {
        var translateKey = attrs.title ? attrs.title : 'PAGE_NOT_FOUND.TITLE';
        $translate(translateKey).then(function (translation) {
          scope.title = translation;
        });
      };

      scope.translateText = function() {
        var translateKey = attrs.text ? attrs.text : 'PAGE_NOT_FOUND.TEXT';
        $translate(translateKey, {keyword: scope.keyword}).then(function (translation) {
          scope.text = translation;
        });
      };

      scope.translateTitle();
      scope.translateText();
    }
  }
}]);
