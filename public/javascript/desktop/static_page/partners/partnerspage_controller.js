(function() {
	angular.module('gfycatApp').controller('partnerPageCtrl', function($scope, gfyPartner, $timeout, $q, $http, oauthTokenService, profileHelperService) {
	  $scope.partnerList = gfyPartner;
	  $scope.apiUrl = 'https://api.gfycat.com/v1';

	  $scope.isLast = function ($last) {
	    if ($last) {
	      $timeout(function() {
	        if (gfyCollection) gfyCollection.init();
	      });
	    }
	  };

	  function fetchDescriptions(){
	  	$scope.partnerList.map(function(partner){
		  	partner.description = '';
		  	profileHelperService.getPublicProfile(partner.profile.substring(2)).then(
		  		function(response){
		  			partner.description = response.data.description;
		  		},
		  		function(response){
		  			console.log(response);
		  		}
		  	);
		  }.bind(this));
		 };

	  // proactively check that API calls are possible before making (# of partners) API requests
	  profileHelperService.validateAccessToken().then(
	  	function() {
	  		fetchDescriptions();
	  	},
	  	function() {
	  		profileHelperService.getAccessToken().then(
	    		function() {
	    			fetchDescriptions();
	    		},
	    		function() {
	    			console.log('unable to aquire access token');
	    		}
	    	);
	  	}
	  );
	});
})();

