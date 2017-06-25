angular.module('gfycatApp').controller('teamPageCtrl',
  function($scope, gfyTeamFactory, $timeout) {
    $scope.teamMembers = gfyTeamFactory;
    $scope.isLast = function ($last) {
      if ($last) {
        $timeout(function() {
          if (gfyCollection) gfyCollection.init();
        });
      }
    };
});
