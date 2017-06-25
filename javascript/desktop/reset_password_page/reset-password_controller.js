angular.module('gfycatApp').controller('resetPasswordCtrl',
  function($scope, $http, $location, gfyAccountTree, accountService,
     oauthTokenService, $stateParams) {
    $scope.accountTree = gfyAccountTree;
    $scope.account = {};
    $scope.account.username = $stateParams.username;
    $scope.isResetSuccess = false;
    $scope.isPending = false;

    /**
    * Sends a request to change password
    */
    $scope.sendNewPassword = function() {
      $scope.isPending = true;
      oauthTokenService.setAccessToken($stateParams.reset_key);
      $http({
        method: 'PUT',
        url: 'https://api.gfycat.com/v1/me/password',
        headers: {
          'Authorization': "Bearer " + $stateParams.reset_key
        },
        data: {
          'value': $scope.account.password
        }
      }).then(
        function(response) {
          if (response.status == 200) {
            accountService.login($scope.account.username,
              $scope.account.password, true).then(
                function(response) {
                  if (response.login) {
                    $scope.onLoginSuccess();
                    $scope.isResetSuccess = true;
                  }
                }
              )
          }
        },
        function(response) {
          // password reset error
          console.log(response);
        }
      ).finally(function() {
        $scope.isPending = false;
      });
    };

    /**
    * Redirects to the home page
    */
    $scope.goToGfycat = function() {
      $location.path('/').search({});
    };

    /**
    * Sets data for accountTree on login
    */
    $scope.onLoginSuccess = function() {
      $scope.accountTree.loggedIntoAccount = true;
      $scope.accountTree.accountName = $scope.account.username;
      $scope.accountTree.getUserFolders().then(function (data) {
        $scope.accountTree.update(data);
        $scope.accountTree.getSomeFolders();
      });
    };
});
