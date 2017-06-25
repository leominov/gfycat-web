angular.module('gfycatApp').controller('verifyEmailCtrl',
  function($scope, $location, emailVerified) {
    $scope.isVerified = emailVerified;

    /**
    * Redirects to the home page
    */
    $scope.goToGfycat = function() {
      $location.path('/').search({});
    };
});
