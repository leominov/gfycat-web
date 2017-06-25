angular.module('gfycatApp').controller('settingsViewPrefCtrl',
  ['$scope', function($scope) {
    $scope.lightModeOn = false;
    $scope.hdGifsOn = false;


    $scope.toggleLightMode = function() {
      $scope.lightModeOn = !$scope.lightModeOn;
    };

    $scope.toggleHdGifs = function() {
      $scope.hdGifsOn = !$scope.hdGifsOn;
    };
}]);
