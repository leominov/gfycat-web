angular.module('gfycatApp').directive('shareButtons', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl:'/javascript/desktop/_components/share-buttons/share-buttons.html',
    link: function($scope, $element, attr) {
    	$element.bind('$destroy', function() {
        var twitterScriptEl = angular.element('#twitter-wjs');
        twitterScriptEl.remove();
     	});
    }
  };
});
