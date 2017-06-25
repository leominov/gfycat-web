angular.module('gfycatApp').controller('settingsPartnerPrefCtrl',
  ['$scope', 'profileFactory', 'gfyAccountTree', '$http', '$q', '$window',
    function($scope, profileFactory, gfyAccountTree, $http, $q, $window) {

    $scope.isClickOutsideElement = UTIL.isClickOutsideElement;

    var countryDropdownElement = document.getElementById('country-dropdown');
    var countryListElement = document.getElementById('country-list');

    $scope.profileService = profileFactory.getProfileService({
      userName: gfyAccountTree.accountName
    });
    $scope.profileInfo = $scope.profileService.getCurrentProfileData().info;

    // Saved for comparison after view data changed
    $scope.domainString = $scope.profileInfo.domainWhitelist.join(', ');
    $scope.geoArray = $scope.profileInfo.geoWhitelist;

    // Toggle variables
    $scope.isDomainRestricted = $scope.domainString.length ? true : false;
    $scope.isGeoRestricted = $scope.geoArray.length ? true : false;
    $scope.isPictureVisible = $scope.profileInfo.iframeProfileImageVisible;

    // Save button
    $scope.isDisabled = true;

    // Flags are used to enable/disable Save button
    $scope.isDomainToggleChanged = false;
    $scope.isGeoToggleChanged = false;
    $scope.isPictureVisibleToggleChanded = false;
    $scope.isDomainsChanged = false;
    $scope.isGeoChanged = false;

    // Used in a view for domens and countries
    $scope.data = {
      domainsList: $scope.profileInfo.domainWhitelist.join(', ')
    };
    $scope.countryCodes = {};

    $scope.isPending = false;
    $scope.isCountryDropdownOpened = false;
    $scope.error = {
      domains: false
    };

    /**
    * Initializes countries list and updates countries list view
    */
    $scope.initGeoWhitelistView = function() {
      $http.get('javascript/shared/iso_country_codes.json').then(
        function(response) {
          $scope.countries = response.data;
          $scope.updateChosenCountries();
      });
    };

    /**
    * Sets checked=true for chosen countries
    */
    $scope.updateChosenCountries = function() {
      $scope.countryCodes = {};
      for (var i = 0; i < $scope.geoArray.length; i++) {
        $scope.countryCodes[$scope.geoArray[i]] = {checked: true};
      }
    };

    $scope.initGeoWhitelistView();

    /**
    * Closes countries dropdown on outside click
    * @param {Object} - click event
    */
    $scope.dropdownOutsideClick = function(event) {
      if ($scope.isCountryDropdownOpened &&
          $scope.isClickOutsideElement(countryDropdownElement, event) &&
          $scope.isClickOutsideElement(countryListElement, event)) {
        $scope.isCountryDropdownOpened = false;
        $scope.$apply();
      }
    };

    $window.addEventListener('click', $scope.dropdownOutsideClick);

    // Click should work only for a partner preferences state
    $scope.$on('$destroy', function() {
      $window.removeEventListener('click', $scope.dropdownOutsideClick);
    });

    /**
    * Handler for click on country name
    * Updates checkbox value
    * @param {Object} event
    * @param {Integer} index - index of country in a list
    */
    $scope.onCountryClick = function(event, index) {
      if (event.target.tagName == 'LI') {
        var checkbox = event.target.getElementsByTagName('input')[0];
        checkbox.checked = !checkbox.checked;
        var code = $scope.countries[index].code;
        if (checkbox.checked) {
          $scope.countryCodes[code] = {checked: checkbox.checked};
        } else {
          delete $scope.countryCodes[code];
        }
        $scope.onGeoWhitelistChanged();
      }
    };

    /**
    * Updates $scope.isGeoChanged variable
    */
    $scope.onGeoWhitelistChanged = function() {
      var newGeoWhitelist = $scope.getNewGeoArray();
      if ($scope.geoArray.length != newGeoWhitelist.length) {
        $scope.isGeoChanged =  true;
        return;
      }
      $scope.isGeoChanged =
        !angular.equals($scope.geoArray.sort(), newGeoWhitelist.sort());
    };

    /**
    * Returns an array of currently chosen countries for geoWhitelist
    * @return {Array}
    */
    $scope.getNewGeoArray = function() {
      return Object.keys($scope.countryCodes);
    };

    /**
    * Checkes if a string is a valid domain
    * @param {String} domain
    * @return {Boolean} - is valid domain
    */
    $scope.isValidDomain = function(domain) {
      var regex = /^[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/;
      return regex.test(domain);
    };

    /**
    * Returns an array of valid domains
    * @return {Array|Boolean} newDomainsArray if list was valid, false if not
    */
    $scope.getValidDomainsArray = function() {
      var newDomainsArray = [];
      if ($scope.data.domainsList) {
        $scope.data.domainsList = $scope.data.domainsList.trim();
        newDomainsArray = $scope.data.domainsList.split(/, */);
        for (var i = 0; i < newDomainsArray.length; i++) {
          if (!$scope.isValidDomain(newDomainsArray[i])) {
            $scope.error.domains = true;
            return null;
          }
        }
      }
      return newDomainsArray;
    };

    /**
    * Updated isDomainToggleChanged variable
    */
    $scope.onDomainToggle = function() {
      var isDomainRestricted = $scope.domainString.length ? true : false;
      $scope.isDomainToggleChanged =
        (isDomainRestricted !== $scope.isDomainRestricted);
      $scope.error.domains = false;
    };

    /**
    * Updates isGeoToggleChanged variable
    */
    $scope.onGeoToggle = function() {
      var isGeoRestricted = $scope.geoArray.length ? true : false;
      $scope.isGeoToggleChanged =
        (isGeoRestricted !== $scope.isGeoRestricted);
    };

    $scope.onPictureVisibilityToggle = function() {
      $scope.isPictureVisibleToggleChanded =
        !$scope.isPictureVisibleToggleChanded;
    };

    $scope.toggleCountryDropdown = function() {
      if (!$scope.isGeoRestricted) return;
      $scope.isCountryDropdownOpened = !$scope.isCountryDropdownOpened;
    };

    /**
    * Updates domain whitelist if the new list is valid
    * @return {Object} promise
    */
    $scope.updateDomainsWhitelist = function() {
      if ($scope.data.domainsList) {
        $scope.data.domainsList = $scope.data.domainsList.trim();
      }

      return $q(function(resolve, reject) {
        if ($scope.isDomainToggleChanged && !$scope.isDomainRestricted ||
            $scope.isDomainRestricted && $scope.isDomainsChanged && !$scope.data.domainsList) {
          $scope.profileService.deleteDomainWhitelist().then(
            function() {
              $scope.data.domainsList = "";
              $scope.domainString = "";
              $scope.onDomainWhitelistResolved(resolve);
            },
            function() { $scope.onDomainWhitelistUpdateError(reject); }
          );
        } else if ($scope.isDomainRestricted && $scope.isDomainsChanged &&
            $scope.data.domainsList && $scope.data.domainsList.length) {
          var newDomainsArray = $scope.getValidDomainsArray();
          if (!newDomainsArray) {
            reject();
          } else {
            $scope.profileService.updateDomainWhitelist(newDomainsArray).then(
              function() {
                $scope.data.domainsList = newDomainsArray.join(', ');
                $scope.domainString = $scope.data.domainsList;
                $scope.onDomainWhitelistResolved(resolve);
              },
              function() { $scope.onDomainWhitelistUpdateError(reject); }
            );
          }
        } else {
          $scope.onDomainWhitelistResolved(resolve);
        }
      });
    };

    $scope.onDomainWhitelistResolved = function(resolve) {
      $scope.isDomainToggleChanged = false;
      $scope.isDomainsChanged = false;
      $scope.isDomainRestricted = $scope.domainString.length ? true : false;
      resolve();
    };

    $scope.onDomainWhitelistUpdateError = function(reject) {
      $scope.error.domains = true;
      reject();
    };

    /**
    * Updates geo whitelist if the new list is valid
    * @return {Object} promise
    */
    $scope.updateGeoWhitelist = function() {
      return $q(function(resolve, reject) {

        var newGeoArray = $scope.getNewGeoArray();

        if ($scope.isGeoToggleChanged && !$scope.isGeoRestricted ||
            $scope.isGeoRestricted && $scope.isGeoChanged && !newGeoArray.length) {
          $scope.profileService.deleteGeoWhitelist().then(
            function() {
              $scope.geoArray = [];
              $scope.updateChosenCountries();
              $scope.onGeoWhitelistResolved(resolve);
            },
            function() { reject(); }
          );
        } else if ($scope.isGeoRestricted && $scope.isGeoChanged && newGeoArray.length) {
          $scope.profileService.updateGeoWhitelist(newGeoArray).then(
            function() {
              $scope.geoArray = newGeoArray;
              $scope.onGeoWhitelistResolved(resolve);
            },
            function() { reject(); }
          );
        } else {
          $scope.onGeoWhitelistResolved(resolve);
        }
      });
    };

    $scope.onGeoWhitelistResolved = function(resolve) {
      $scope.isGeoToggleChanged = false;
      $scope.isGeoChanged = false;
      $scope.isGeoRestricted = $scope.geoArray.length ? true : false;
      resolve();
    };

    /**
    * Clears domain list error for any input change
    */
    $scope.onDomainsListInputChange = function() {
      if ($scope.domainString !== $scope.data.domainsList) {
        $scope.isDomainsChanged = true;
      } else {
        $scope.isDomainsChanged = false;
      }
      $scope.error.domains = false;
    };

    /**
    * Updates iframe profile image visibility
    */
    $scope.updateIframeProfileImageVisibility = function() {
      return $q(function(resolve, reject) {
        if (!$scope.isPictureVisibleToggleChanded)  {
          resolve();
          return;
        }
        $scope.profileService
          .updateIframeImageVisibility($scope.isPictureVisible).then(
            function() {
              $scope.isPictureVisibleToggleChanded = false;
              resolve();
            },
            function() { reject(); }
          );
      });
    };

    /**
    * Save button click handler
    */
    $scope.savePartnerPreferencesForm = function() {
      $scope.isPending = true;
      $q.all([$scope.updateDomainsWhitelist(),
              $scope.updateGeoWhitelist(),
              $scope.updateIframeProfileImageVisibility()])
        .finally(function() {
          $scope.isPending = false;
        });
    };

    /**
    * Checks if save form button disabled
    * @return {Boolean} isDisabled
    */
    $scope.isSaveButtonDisabled = function() {
      $scope.isDisabled = $scope.isPending || $scope.isPartnerPreferencesFormError() ||
        !$scope.isDomainToggleChanged && !$scope.isGeoToggleChanged &&
        !$scope.isPictureVisibleToggleChanded &&
        !$scope.isDomainsChanged && !$scope.isGeoChanged;
      return $scope.isDisabled;
    };

    /**
    * Saves form on Enter press
    */
    $scope.onPartnerPreferencesFormKeyup = function(event) {
      if (!$scope.isDisabled && event.keyCode === 13) {
        $scope.savePartnerPreferencesForm();
      }
    };

    /**
    * Checks if there's a PartnerPreferencesForm error
    * @return {Boolean}
    */
    $scope.isPartnerPreferencesFormError = function() {
      return $scope.error.domains;
    };
}]);
