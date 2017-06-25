angular.module('gfycatApp').directive('spinnerAnimation', function() {
  return {
    restrict: 'E',
    templateUrl: '/javascript/desktop/_components/spinner/spinner.html',
    link: function(scope, elem, attr) {
      var spinnerTagElem =  angular.element(elem),
          spinner = angular.element(elem).find('.spinner'),
          spinnerBlades = spinner.find('.spinner-blade');
      if (attr.color) {
        spinnerBlades.css({'background': attr.color});
      }
      if (attr.width && attr.height) {
        spinner.css({
          width: attr.width,
          height: attr.height
        });
      }
      var halfHeight = attr.height ? attr.height / 2 : spinner.height() / 2;
      spinnerTagElem.css({top: 'calc(50% - ' + halfHeight + 'px)'});
    }
  }
});
