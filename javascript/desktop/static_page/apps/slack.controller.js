(function() {
  'use strict';

  angular
    .module('gfycatApp')
    .controller('slackController', slackController);

  function slackController($stateParams) {
    var vm = this;

    vm.auth = $stateParams.auth;

    switch (vm.auth) {
      case 'success':
        vm.class = 'bg-info';
        vm.showMessage = true;
        break;
      case 'fail':
        vm.class = "bg-danger";
        vm.showMessage = false;
        break;
      default:
        vm.class = '';
        vm.showMessage = false;
        break;
    }
  }

})();
