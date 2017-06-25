(function() {
  'use strict';

  angular
    .module('gfycatApp')
    .controller('vineController', vineController);

  vineController.$inject = ['gfyAnalytics', 'vineService', '$rootScope', '$scope'];

  function vineController(gfyAnalytics, vineService, $rootScope, $scope) {
    var vm = this;

    vm.visibility = !!vm.loading ? "{'visibility':'hidden'}" : "{'visibility':'visible'}";
    vm.siteUrl = $rootScope.globalSiteUrl;

    $scope.$watch('vm.vineUrl', (cur, prev) => {
      if (cur !== prev && vm.urlPasted) {
        vm.showVines();
      }
    });

    vm.getVines = function() {
      if (vm.loading || !vm.vineUrl || !vm.isUserLoggedIn || vm.invalidUrl) {
        return;
      }

      gfyAnalytics.sendEvent({
        event: 'import_vines_clicked',
        vine_profile_url: vm.vineUrl
      });

      vm.loading = true;
      vm.style = {'visibility':'hidden'};
      if (vm.vineUrl.slice(0, 7) !== 'http://' && vm.vineUrl.slice(0, 8) !== 'https://') {
        vm.vineUrl = 'https://' + vm.vineUrl;
      }
      var userPath = new URL(vm.vineUrl).pathname.split('/');
      var userType = typeof userPath[2] !== 'undefined' ? 'id' : 'username';
      var user = userType === 'id' ? userPath[2] : userPath[1];

      vineService.getVines({user: user, type: userType}).then( data => {
        gfyAnalytics.sendEvent({
          event: 'import_vines_success',
          vine_profile_url: vm.vineUrl
        });
        vm.done = 'success';
        vm.loading = false;
        vm.style = {'visibility':'visible'};
        $rootScope.$apply();
      }, err => {
        gfyAnalytics.sendEvent({
          event: 'import_vines_error',
          vine_profile_url: vm.vineUrl
        });
        vm.done = 'error';
        vm.loading = false;
        vm.style = {'visibility':'visible'};
        $rootScope.$apply();
      });
    };

    vm.showVines = function() {
      if (vm.vineUrl.slice(0, 7) !== 'http://' && vm.vineUrl.slice(0, 8) !== 'https://') {
        vm.vineUrl = 'https://' + vm.vineUrl;
      }

      var userPath = new URL(vm.vineUrl).pathname.split('/');
      var userType = typeof userPath[2] !== 'undefined' ? 'id' : 'username';
      var user = userType === 'id' ? userPath[2] : userPath[1];

      vineService.showVines({user: user, type: userType}).then( data => {
        if (data.username) {
          vm.vineUserProfile = data;
          vm.invalidUrl = false;
        } else {
          vm.vineUserProfile = null;
          vm.invalidUrl = true;
        }
        $rootScope.$apply();
      }, err => {
        console.err('err', err);
        vm.invalidUrl = true;
      });
    }

    vm.pasteUrl = function() {
      vm.urlPasted = true;
    };

    vm.isUserLoggedIn = vineService.isUserLoggedIn();
  }

})();
