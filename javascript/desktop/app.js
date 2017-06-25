/* Copyright (C) GfyCat, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Date: 12/1/2015
 */
(function() {
  angular
    .module('gfycatApp')
    .run(runBlock);

  runBlock.$inject = ['gfyAccountTree', 'oauthTokenService', '$injector',
    '$location', '$log', '$rootScope', '$state', '$window'
  ];

  function runBlock(gfyAccountTree, oauthTokenService, $injector, $location,
    $log, $rootScope, $state, $window) {
    if (oauthTokenService.isUserLoggedIn()) {
      gfyAccountTree.loggedIntoAccount = true;
      gfyAccountTree.accountName = oauthTokenService.getUsername();
      gfyAccountTree.getUserFolders()
        .then(function(data) {
          gfyAccountTree.update(data);
          gfyAccountTree.getSomeFolders();
        });
      $rootScope.$broadcast('logged-in');
    }

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams, options) {
        $log.debug('stateChangeStart event: ', event, ' toState: ', toState, ' toParams: ', toParams, ' fromState: ', fromState, ' fromParams: ', fromParams, ' options: ', options);

        if (!gfyAccountTree.loggedIntoAccount && (toState.loginRequired ||
            toState.data && toState.data.loginRequired)) {
          event.preventDefault();
          $state.go('home');
        }

        if (gfyAccountTree.loggedIntoAccount && toState.logoutRequired) {
          event.preventDefault();
          $state.go('home');
        }

        switch (toState.name) {
          case 'profile':
            $log.debug('###profile routing for public vs private: ', gfyAccountTree.loggedIntoAccount, toParams.path.substr(1), gfyAccountTree.accountName.toLowerCase());
            event.preventDefault();
            options.location = false;
            //TODO: if logged in and viewing own account, route to manage page. Otherwise, route to public profile
            if (gfyAccountTree.loggedIntoAccount && gfyAccountTree.accountName === toParams.path.substr(1)
              .toLowerCase()) {
              //$state.go('profile.gifs.private', toParams, options);
              $state.go('profile.gifs.public', toParams, options);
            } else {
              $state.go('profile.gifs.public', toParams, options);
            }
            break;
          case 'settings':
            if (!$rootScope.isMobile) {
              event.preventDefault();
              $state.go('settings.account');
            }
            break;
          case 'profile.albumname':
            event.preventDefault();
            toParams.path = toParams.path.substr(1);
            $state.go('album', toParams, {
              location: 'replace'
            });
            break;
          default:
            $log.debug('#####No special transition logic found');
        }
      });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $log.debug('stateChangeSuccess event: ', event, ' toState: ', toState, ' toParams: ', toParams, ' fromState: ', fromState, ' fromParams: ', fromParams);

      if (!toState.keepScrollTop && !fromState.keepScrollTop) {
        $window.scrollTo(0, 0);
      }

      $window.ga('send', 'pageview', {
        page: $location.path()
      });
    });

    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
      $log.warn(event, unfoundState, fromState, fromParams);
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      $log.error('Error occured while changing states: ', error);
      $state.go('notfound', {}, {
        location: false
      });
    });

    $rootScope.$on('$viewContentLoading', function(event, viewConfig) {
      $log.debug('View loading: ', event, viewConfig);
    });

    $rootScope.$on('$viewContentLoaded', function(event) {
      $log.debug('viewContentLoaded: ', event);
    });

    $rootScope.modalActionShouldStaySamePage = false;
    $rootScope.$state = $state;
    $rootScope.globalSiteUrl = GLOBAL_VARIABLES.globalSiteUrl;
    $rootScope.isMobile = GLOBAL_VARIABLES.isMobile;
  }
})();
