(function() {
  angular.module('gfycatApp')
    .config(['$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', 'debug', function($urlMatcherFactory, $stateProvider, $urlRouterProvider, $locationProvider, $logProvider, debug) {
      $logProvider.debugEnabled(debug);
      $urlMatcherFactory.caseInsensitive(true);
      $urlMatcherFactory.strictMode(false);
      $urlRouterProvider.otherwise('/');
      $locationProvider.html5Mode(true);

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: '/javascript/desktop/main_page/mainpage.html',
          controller: 'mainPageCtrl',
          title: 'Gfycat | Create, discover and share awesome GIFs',
          onExit: function() {
            var twitterScriptEl = angular.element('#twitter-wjs');
            twitterScriptEl.remove();
          }
        })
        .state('home.detail', {
          url: 'detail/{gfyname:[a-zA-Z0-9]+}?tagname&tvmode',
          name: 'detail',
          keepScrollTop: true,
          onEnter: ['$stateParams', 'gfyHttpFactory', 'gfyFeeds', 'detailModalFactory', '$location', function($stateParams, gfyHttpFactory, gfyFeeds, detailModalFactory, $location) {
            var list;
            // Detail player was opened:
            // 1 - from click on tvmode
            // 0 - from click on thumb
            if (parseInt($stateParams.tvmode)) {
              list = gfyFeeds.currentGfyChannel;
            } else {
              for (var i = 0; i < gfyHttpFactory.MasterTags.tags.length; i++) {
                if (gfyHttpFactory.MasterTags.tags[i].tag == $stateParams.tagname) {
                  list = gfyHttpFactory.MasterTags.tags[i];
                  break;
                }
              }
            }

            detailModalFactory.showModal($stateParams.gfyname, list, function() {
              $location.path('/')
                .search('tagname', null)
                .search('tvmode', null);
            });
          }],
          onExit: ['gfyModalMachine', function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }]
        })
        .state('home.login', {
          title: 'Log In to Gfycat',
          url: 'login?redirect_uri',
          logoutRequired: true,
          onEnter: ['$state', '$rootScope', function($state, $rootScope) {
            $rootScope.gfyModals.modalLoginShown = true;
            $rootScope.$on('loginModalClosed', function() {
              $state.go('^');
            });
          }],
        })
        .state('uploader', {
          url: '/upload?flow',
          title: 'Create and Upload custom GIFs with Gfycat',
          name: 'uploader',
          controller: 'VideoUploadController'
        })
        .state('uploader_url', {
          url: '/upload/url?url',
          onEnter: ['$stateParams', '$rootScope',
            function($stateParams, $rootScope) {
              $rootScope.$on('uploader_ready', function(event, data) {
                $rootScope.uploader_ready = true;
                if ($rootScope.multi_uploader_ready) {
                  $rootScope.$broadcast('url_for_uploader', $stateParams.url);
                }
              });
              $rootScope.$on('multi_uploader_ready', function(event, data) {
                $rootScope.multi_uploader_ready = true;
                if ($rootScope.uploader_ready) {
                  $rootScope.$broadcast('url_for_uploader', $stateParams.url);
                }
              });
            }
          ],
          title: 'Create and Upload custom GIFs with Gfycat',
          name: 'uploader_url'
        })
        .state('channel', {
          url: '/channels',
          templateUrl: '/javascript/desktop/channels_page/channels-page.html',
          controller: 'channelsPageController',
          name: 'channel',
          title: 'GIF Channels - Browse Gaming, Sports, Cute & More on Gfycat'
        })
        .state('signup', {
          url: '/signup?redirect_uri',
          templateUrl: '/javascript/desktop/signup_page/signup-page.html',
          controller: 'signupCtrl',
          name: 'signup',
          logoutRequired: true,
          title: 'Sign Up for Gfycat'
        })
        .state('partnersignup', {
          url: '/partners/signup',
          templateUrl: '/javascript/desktop/partner_signup_page/partner-signup-page.html',
          controller: 'partnerSignupCtrl',
          name: 'partnersignup',
          title: 'Partner with Gfycat'
        })
        .state('partner', {
          url: '/partners',
          templateUrl: '/javascript/desktop/static_page/partners/partners.html',
          controller: 'partnerPageCtrl',
          name: 'partner',
          title: 'Gfycat Partners - Become a partner and host official branded GIF channels',
          static: true
        })
        .state('partnerterms', {
          url: '/partners/terms',
          templateUrl: '/javascript/desktop/static_page/partners/partnerterms.html',
          name: 'about',
          static: true,
          title: 'Gfycat Partner Terms and Conditions'
        })
        .state('about', {
          url: '/about',
          templateUrl: '/javascript/desktop/static_page/about/about.html',
          name: 'about',
          static: true,
          title: 'About Gfycat'
        })
        .state('slack', {
          url: '/slack?auth',
          templateUrl: '/javascript/desktop/static_page/apps/slack.html',
          name: 'slack',
          static: true,
          title: 'Gfycat for Slack',
          controller: 'slackController',
          controllerAs: 'vm',
          bindToController: true
        })
        .state('vine', {
          url: '/vine-transfer',
          templateUrl: '/javascript/desktop/static_page/apps/vine-transfer/vine.html',
          name: 'vine',
          static: true,
          title: 'Gfycat + Vine',
          controller: 'vineController',
          controllerAs: 'vm',
          bindToController: true
        })
        .state('gifbrewery', {
          url: '/gifbrewery',
          templateUrl: '/javascript/desktop/static_page/apps/gifbrewery/gifbrewery.html',
          name: 'gifbrewery',
          static: true,
          title: 'GIF Brewery by Gfycat',
          controller: 'gifbreweryController',
          controllerAs: 'gifBr',
          bindToController: true
        })
        .state('gifbrewery.tutorials', {
          url: '/tutorials',
          templateUrl: '/javascript/desktop/static_page/apps/gifbrewery/tutorials.html',
          name: 'gifbreweryTutorials',
          static: true,
          title: 'GIF Brewery by Gfycat - Tutorials'
        })
        .state('gifbrewery.tutorials.basics', {
          url: '/basics',
          templateUrl: '/javascript/desktop/static_page/apps/gifbrewery/tutorials-basics.html',
          name: 'tutorialsBasics',
          static: true,
          title: 'GIF Brewery by Gfycat - Tutorial: The Basics'
        })
        .state('gifbrewery.tutorials.frames', {
          url: '/frames',
          templateUrl: '/javascript/desktop/static_page/apps/gifbrewery/tutorials-frames.html',
          name: 'tutorialsFrames',
          static: true,
          title: 'GIF Brewery by Gfycat - Tutorial: Frames'
        })
        .state('gifbrewery.tutorials.recordings', {
          url: '/recordings',
          templateUrl: '/javascript/desktop/static_page/apps/gifbrewery/tutorials-recordings.html',
          name: 'tutorialsRecordings',
          static: true,
          title: 'GIF Brewery by Gfycat - Tutorial: Make a Recording'
        })
        .state('privacy', {
          url: '/privacy',
          templateUrl: '/javascript/desktop/static_page/privacy/privacy.html',
          name: 'privacy',
          static: true,
          title: 'Gfycat Privacy Policy'
        })
        .state('terms', {   
           url: '/terms',    
           templateUrl: '/javascript/desktop/static_page/terms/terms.html',
           name: 'terms',
           static: true,
          title: 'Gfycat Terms and Conditions'
        })
        .state('dmca', {
          url: '/dmca',
          templateUrl: '/javascript/desktop/static_page/dmca/dmca.html',
          name: 'dmca',
          static: true,
          title: 'Gfycat DMCA Policy'
        })
        .state('api', {
          url: '/api',
          templateUrl: '/javascript/desktop/static_page/api/api.html',
          name: 'api',
          static: true,
          title: 'Gfycat Developer API'
        })
        .state('jobs', {
          url: '/jobs',
          templateUrl: '/javascript/desktop/static_page/jobs/jobs.html',
          name: 'jobs',
          static: true,
          title: 'Jobs at Gfycat'
        })
        .state('faq', {
          url: '/faq',
          templateUrl: '/javascript/desktop/static_page/faq/faq.html',
          name: 'faq',
          static: true,
          title: 'Frequently Asked Questions'
        })
        .state('support', {
          url: '/support',
          templateUrl: '/javascript/desktop/static_page/support/support.html',
          name: 'support',
          static: true,
          title: 'Support'
        })
        // .state('team', {
        //   url: '/team',
        //   templateUrl: '/javascript/desktop/static_page/team/team.html',
        //   name: 'team',
        //   static: true,
        //   title: 'Team',
        //   controller: 'teamPageCtrl'
        // })
        // .state('gif-categories', {
        //   url: '/gif-categories',
        //   templateUrl: '/javascript/desktop/gif_categories/gif-categories.html',
        //   name: 'gif-categories',
        //   title: 'Categories & Reactions',
        //   controller: 'gifCategoriesController',
        //   controllerAs: 'categories'
        // })
        .state('oldsearch', {
          url: '/search/:path?page',
          name: 'oldsearch',
          controller: function($state, $stateParams) {
            $state.go('search', {
              path: $stateParams.path
            }, {
              location: 'replace'
            });
          }
        })
        .state('search', {
          url: '/gifs/search/:path?page',
          reloadOnSearch: false,
          templateUrl: '/javascript/desktop/search_page/search-page.html',
          controller: 'searchCtrl',
          name: 'home',
          onEnter: ['$state', '$stateParams', function($state, $stateParams) {
            if ($stateParams.path.indexOf(' ') > -1) {
              $state.go('search', {
                path: $stateParams.path.split(' ').join('-')
              },
              {
                location: 'replace'
              });
            }
          }]
        })
        .state('sharepageSearch', {
          url: '/search?request',
          name: 'sharepageSearch',
          controller: function($state, $stateParams) {
            $state.go('search', {
              path: $stateParams.request.split(' ').join('-')
            },
            {
              location: 'replace'
            });
          }
        })
        .state('search.detail', {
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          keepScrollTop: true,
          onEnter: function($state, $stateParams, searchFactory, detailModalFactory, gfyModalMachine, $location) {
            var list = searchFactory.getPagedSearchService($stateParams.path, 'search');
            detailModalFactory.showModal($stateParams.gfyname, list, function() {
              $location.path('/gifs/search/' + $stateParams.path);
              //gfyModalMachine.modalDetailPlayerShown = false;
            });
          },
          onExit: ['gfyModalMachine', function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }]
        })
        .state('useraccount', {
          url: '/useraccount/:username',
          templateUrl: '/javascript/desktop/account_module/account-page.html',
          controller: 'accountListingController',
          loginRequired: true,
          title: 'Gfycat Manage',
          onEnter: function($stateParams) {
            GFAN.sendEvent({
              event: 'view_manage_page',
              username: $stateParams.username.toLowerCase()
                .substr(1)
            });
          }
        })
        .state('library', {
          name: 'library',
          url: '/{path:@[A-Za-z0-9_.-]+}/library',
          templateUrl: '/javascript/desktop/profile_module/profile-list/profile-gifs.private.html',
          controller: 'profileListController',
          loginRequired: true,
          title: 'My Library'
        })
        .state('tag', {
          url: '/tag/:path?page',
          templateUrl: '/javascript/desktop/search_page/search-page.html',
          controller: 'searchCtrl',
          name: 'tag',
          resolve: {
            title: function($stateParams) {
              var title = $stateParams.path;
              title = title.charAt(0)
                .toUpperCase() + title.slice(1);
              return title + ' GIFs | Create, Share & Browse GIFs on Gfycat';
            }
          }
        })
        .state('tag.detail', {
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          keepScrollTop: true,
          onEnter: ['$stateParams', 'searchFactory', 'detailModalFactory', '$location', function($stateParams, searchFactory, detailModalFactory, $location) {
            var list = searchFactory.getSearchService($stateParams.path, 'tag');
            detailModalFactory.showModal($stateParams.gfyname, list, function() {
              $location.path('/tag/' + $stateParams.path);
            });
          }],
          onExit: ['gfyModalMachine', function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }]
        })
        .state('settings', {
          url: '/settings',
          templateUrl: '/javascript/desktop/settings_page/settings-page.html',
          name: 'settings',
          title: 'Gfycat Settings',
          data: {
            loginRequired: true
          },
          controller: function($scope, $state, gfyAccountTree, profileFactory) {
            var profileService = profileFactory.getProfileService({
              userName: gfyAccountTree.accountName
            });
            $scope.isVerified = profileService.getCurrentProfileData()
              .info.verified;
            if (!$scope.isVerified) {
              $state.go('settings.account');
            }
          },
          resolve: {
            checkProfileData: function(gfyAccountTree, profileFactory) {
              var profileService = profileFactory.getProfileService({
                userName: gfyAccountTree.accountName
              });
              return profileService.checkCurrentProfileData();
            }
          }
        })
        .state('settings.account', {
          url: '/account',
          templateUrl: '/javascript/desktop/settings_page/settings-account/settings-account.html',
          name: 'settings.account',
          controller: 'settingsAccountCtrl',
          title: 'Gfycat Account'
        })
        .state('settings.password', {
          url: '/password',
          templateUrl: '/javascript/desktop/settings_page/settings-password/settings-password.html',
          name: 'settings.password',
          controller: 'settingsPasswordCtrl',
          title: 'Gfycat Password'
        })
        .state('settings.notifications', {
          url: '/notifications',
          templateUrl: '/javascript/desktop/settings_page/settings-notifications/settings-notifications.html',
          name: 'settings.notifications',
          controller: 'settingsNotificationsCtrl',
          title: 'Gfycat Notifications'
        })
        .state('settings.partner', {
          url: '/partner',
          templateUrl: '/javascript/desktop/settings_page/settings-partner-preferences/settings-partner-preferences.html',
          name: 'settings.partner',
          controller: 'settingsPartnerPrefCtrl',
          title: 'Partner Preferences'
        })
        .state('profile', {
          url: '/{path:@[A-Za-z0-9_.-]+}',
          templateUrl: '/javascript/desktop/profile_module/profile-page.html',
          resolve: {
            profileInfoData: function($stateParams, profileFactory) {
              var pathUsername = $stateParams.path.toLowerCase()
                .substr(1),
                profileService = profileFactory.getProfileService({
                  userName: pathUsername
                });
              return profileService.checkCurrentProfileData();
            }
          },
          controller: 'profileCtrl',
          name: 'profile'
        })
        .state('profile.gifs', {
          abstract: true,
          url: '',
          template: '<ui-view/>',
          data: 5,
          name: 'profile.gifs'
        })
        /*.state('profile.gifs.private', {
          name: 'profile.gifs.private',
          url: '/library',
          templateUrl: '/javascript/desktop/profile_module/profile-list/profile-gifs.private.html',
          controller: 'profileListController',
          loginRequired: true,
          title: 'My Library'
        })*/
        .state('profile.gifs.public', {
          name: 'profile.gifs.public',
          authenticate: false, //Any user can view this state regardless of login state
          url: '',
          templateUrl: '/javascript/desktop/profile_module/profile-list/profile-gifs.public.html',
          controller: function($log, $scope, $state, $stateParams, profileFactory, detailModalFactory, $location) {
            $log.debug('###profile.gifs.public controller');
            var pathUsername = $stateParams.path.toLowerCase()
              .substr(1),
              profileService = profileFactory.getProfileService({
                userName: pathUsername
              });
            var info = profileService.getCurrentProfileData()
              .info;
            var name = info.hasOwnProperty('name') ? info.name : '';
            var title = name ? name + ' (@' + pathUsername + ')' : '@' + pathUsername;
            $state.current.title = title + ' | Gfycat GIFs';

            $scope.isLoading = function() {
              if (!$scope.scrollDisabled) {
                return $scope.loading;
              } else {
                return true;
              }
            };

            $scope.loadMoreInfinite = function() {
              if (!$scope.gifList) {
                $scope.loading = true;
                profileService.getPublicGifs()
                  .then(function(response) {
                    $scope.gifList = response;
                    $scope.buttonEnabled = true;
                    $scope.scrollDisabled = true;
                    $scope.loading = false;
                  });
              } else {
                $scope.buttonEnabled = false; //button clicked
                $scope.loading = true;
                profileService.getMorePublicGifsPaginate()
                  .then(function(response) {
                    $scope.gifList = $scope.gifList.concat(response);
                    $scope.scrollDisabled = false;
                    $scope.loading = false;
                  }, function(response) {
                    $scope.gifList = $scope.gifList.concat(response);
                    $scope.gifList.cursor = null;
                    $scope.scrollDisabled = true;
                    $scope.loading = false;
                  });
              }
            };

            $scope.generateUrl = function(gif) {
              return $state.href($state.current.name + ".detail", {
                gfyname: gif.gfyName
              });
            };
          }
        })
        .state('profile.gifs.public.detail', {
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          keepScrollTop: true,
          onEnter: function($state, $stateParams, detailModalFactory, profileFactory, $location) {
            var pathUsername = $stateParams.path.toLowerCase()
              .substr(1),
              profileService = profileFactory.getProfileService({
                userName: pathUsername
              });
            profileService.getPublicGifs()
              .then(function(response) {
                var list = {
                  gfycats: response
                };
                detailModalFactory.showModal($stateParams.gfyname, list, function() {
                  $state.go('^');
                });
              });
          },
          onExit: function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }
        })
        .state('profile.albums', {
          abstract: true,
          name: 'profile.albums',
          url: '/albums',
          template: '<ui-view/>'
        })
        .state('profile.albums.public', {
          name: 'profile.albums.public',
          url: '',
          templateUrl: '/javascript/desktop/profile_module/profile-list/profile-albums.html',
          controller: function(profileFactory, $scope, $state, $stateParams, $log) {
            var pathUsername = $stateParams.path.toLowerCase()
              .substr(1);
            var profileService = profileFactory.getProfileService({
              userName: pathUsername
            });
            var info = profileService.getCurrentProfileData()
              .info;
            var name = info.hasOwnProperty('name') ? info.name : '';
            var title = name ? name + ' (@' + pathUsername + ')' : '@' + pathUsername;
            $state.current.title = 'Albums by ' + title + ' | Gfycat GIFs';
            $scope.isLoading = true;
            profileService.getPublicAlbums()
              .then(function(res) {
                $log.debug('###profile.albums_public -> getPublicAlbums', res);
                $scope.gifList = res;
                $scope.isLoading = false;
              }, function(res) {
                $log.debug('###profile.albums_public -> getPublicAlbums error', res);
                $scope.empty = true;
                $scope.isLoading = false;
              });
          }
        })
        .state('profile.album', {
          name: 'profile.album',
          url: '/albums/{linkText}',
          params: {
            albumId: null
          },
          templateUrl: '/javascript/desktop/profile_module/profile-list/profile-album.html',
          controller: function(profileFactory, $stateParams, $scope, $state, $log) {
            var pathUsername = $stateParams.path.toLowerCase()
              .substr(1);
            var profileService = profileFactory.getProfileService({
              userName: pathUsername
            });
            var albumId = $stateParams.albumId;
            var linkText = $stateParams.linkText.toLowerCase();
            $scope.isLoading = true;
            profileService.getAlbumGifs(albumId, linkText, pathUsername)
              .then(function(response) {
                $log.debug('###profile.album getAlbumGifs response: ', response);
                $scope.isLoading = false;
                $scope.gifList = response;
              }, function(response) {
                $scope.isLoading = false;
                $scope.gifList = [];
              });
            var info = profileService.getCurrentProfileData()
              .info;
            var name = info.hasOwnProperty('name') ? info.name : '';
            var title = name ? name + ' (@' + pathUsername + ')' : '@' + pathUsername;
            $state.current.title = 'GIF album \'' + linkText + '\' by ' + title + ' | Gfycat GIFs';

            $scope.generateUrl = function(gif) {
              return $state.href($state.current.name + ".detail", {
                gfyname: gif.gfyName
              });
            };
          }
        })
        .state('profile.album.detail', {
          name: 'profile.album.detail',
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          keepScrollTop: true,
          onEnter: function($state, $stateParams, detailModalFactory, profileFactory, $location) {
            var pathUsername = $stateParams.path.toLowerCase()
              .substr(1),
              profileService = profileFactory.getProfileService({
                userName: pathUsername
              });
            var albumId = $stateParams.albumId;
            var linkText = $stateParams.linkText;
            profileService.getAlbumGifs(albumId, linkText, pathUsername)
              .then(function(response) {
                var list = {
                  gfycats: response
                };
                detailModalFactory.showModal($stateParams.gfyname, list, function() {
                  $state.go('^');
                });
              });
          },
          onExit: function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }
        })
        .state('detail', {
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          onEnter: ['$stateParams', 'searchFactory', 'detailModalFactory', '$location', function($stateParams, searchFactory, detailModalFactory, $location) {
            var list = searchFactory.getSearchService($stateParams.path, 'profile');
            detailModalFactory.showModal($stateParams.gfyname, list, function() {
              $location.path('/@' + $stateParams.path);
            });
          }],
          onExit: ['gfyModalMachine', function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }]
        })
        .state('resetPassword', {
          url: '/reset_key?username&reset_key',
          templateUrl: '/javascript/desktop/reset_password_page/reset-password-page.html',
          controller: 'resetPasswordCtrl',
          name: 'resetPassword',
        })
        .state('verifyEmail', {
          url: '/verifyEmail?token',
          templateUrl: '/javascript/desktop/verify_email_page/verify-email-page.html',
          controller: 'verifyEmailCtrl',
          name: 'verifyEmail',
          resolve: {
            emailVerified: function(accountService, $stateParams) {
              var token = $stateParams.token;
              return accountService.verifyEmail(token);
            }
          }
        })
        .state('newalbum', {
          name: 'newalbum',
          url: '/{path:@[A-Za-z0-9_.-]+}/{albumname}',
          templateUrl: '/javascript/desktop/album_page/album-page.html',
          data: {
            gifs: []
          },
          controller: function($log, $scope, albumService, $state, $stateParams) {
            var linkText = $stateParams.albumname;
            var userId = $stateParams.path.substr(1);
            $scope.isLoading = true;
            albumService.getContentPublic(linkText, userId)
              .then(function(data) {
                if (!data.hasOwnProperty('publishedGfys')) {
                  //TODO: Remove error checking when 404 flow is implemented
                  $scope.error = 404;
                } else {
                  $scope.title = data.title;
                  $scope.gifList = data.publishedGfys;
                  $state.current.title = 'GIF album \'' + $scope.title + '\' by @' + $stateParams.path.substr(1);
                  $state.current.data.gifs = $scope.gifList;
                }
                $scope.isLoading = false;
              }, function() {
                $scope.error = 404;
                $scope.isLoading = false;
              });

            $scope.generateUrl = function(gif) {
              return $state.href($state.current.name + ".detail", {
                gfyname: gif.gfyName,
                data: {
                  gifs: $scope.gifList
                }
              });
            };
          }
        })
        .state('album', {
          url: '/:username/:albumname',
          name: 'album',
          controller: function($state, $stateParams) {
            $state.go('newalbum', {
              path: '@' + $stateParams.username,
              albumname: $stateParams.albumname
            });
          }
        })
        .state('newalbum.detail', {
          url: '/detail/{gfyname:[a-zA-Z0-9]+}',
          keepScrollTop: true,
          onEnter: function($state, $stateParams, detailModalFactory, albumService) {
            var list = $state.current.data ? {
              gfycats: $state.current.data.gifs
            } : [];
            detailModalFactory.showModal($stateParams.gfyname, list, function() {
              $state.go('^', null, {
                location: 'replace'
              });
            });
          },
          onExit: function(gfyModalMachine) {
            gfyModalMachine.modalDetailPlayerShown = false;
          }
        })
        .state('olddetail', {
          url: '/:gfycatname',
          templateUrl: '/javascript/desktop/detail_page/detailpage.html',
          controller: 'videoPageCtrl',
          resolve: {
            gfyExists: function($stateParams, gfyHelperService) {
              var gfyName = $stateParams.gfycatname ? $stateParams.gfycatname : '';
              return gfyHelperService.checkGfyExists(gfyName);
            }
          },
          onEnter: function() {
            document.body.style.background = "#eee";
          },
          onExit: function() {
            document.body.style.background = "#fff";
          }
        })
        .state('notfound', {
          //url: '/{random:.+}',
          template: "<not-found></not-found>",
          title: 'Error 404 (Not Found)'
        });
    }]);

})();
