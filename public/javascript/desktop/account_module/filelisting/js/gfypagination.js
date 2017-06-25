
/**
 * Note: one extra space on top for concat/compress with comment block on top hitting comment block of previous file
 * Created by dave on 2014-12-03.
 */
(function() { //java wrapper function

  angular.module('gfyPaginationApp', [])

//################################################### directive and controller for folder file listing
        .directive('accountGfyPagination', function() {
          return {
            restrict: 'E',
            templateUrl: '/javascript/desktop/account_module/filelisting/account-gfy-pagination.html',
            controller: function($scope) {
              if (!$scope.gfyCount) $scope.getSomeGfys(); // on creation we call this function to load the first set of gfys -if called once we don't call again (prevents double gfys)

            },

            controllerAs: 'accountGfyListCtrl',
          };
        })// end directive
//################################################### service for pagination
        .factory('gfyPageView', function() {

          // initialize all the variables
          var totalPages = 0;
          var pageLimits = [];
          var currentPage = 1; //initialize page
          var fetchLimits = [25, 50, 100];// this is the 3 choices of index fetch increment TODO currently set to 10 will be 25 (25,50,100)
          var fetchLimiter = fetchLimits[0]; // used in backend request string - this is the number of items to display per page
          var viewRangeLow = 0;
          var viewRangeHigh = 0;

          return {
            totalPages: totalPages,
            pageLimits: pageLimits,
            currentPage: currentPage,
            fetchLimits: fetchLimits,
            fetchLimiter: fetchLimiter,
            viewRangeLow: viewRangeLow,
            viewRangeHigh: viewRangeHigh,

            // ********************************************** this function will set the fetch increment based on index ********************************************************************************************
            //  index - choice 0,1 or 2 (25,50,100)
            // ****************************************************************************************************************************************************************************************
            setFetchLimiter: function(index) {
              this.fetchLimiter = this.fetchLimits[index];
              this.currentPage = 1;
            },

            // ********************************************** this function will check if the current fetch increment is set to this index number ********************************************************************************************
            //  index - choice 0,1 or 2 (25,50,100) - returns true or false
            // ****************************************************************************************************************************************************************************************
            isFetchLimiter: function(index) {
              return (this.fetchLimiter == this.fetchLimits[index]);
            },

            // ********************************************** this function will set the pagingLimits array information ********************************************************************************************
            // ****************************************************************************************************************************************************************************************
            setPagingLimits: function() {
              while (this.pageLimits.length) this.pageLimits.pop(); //clear this array so we can rebuild it--- we have the technology!
              this.pageLimits[0] = 'First'; // always this
              this.pageLimits[1] = '< Prev'; // always this
              var start = 1;
              var length = this.totalPages;
              if (length > 5) {
                length = 5; // only populate 5 or less indices in the array space
                if (this.currentPage <= 3) start = 1; // force start the 1 if we are on pages 1,2,3
                else start = this.currentPage - 2; // else hold the current page in the centre and start array space 2 numbers back
                if (start >= (this.totalPages - 3)) start = this.totalPages - 4; // force start at 5 pages less the total pages if we are on the last 3 pages
              }

              for (var i = 0; i < length; i++) {
                this.pageLimits[i + 2] = i + start;
              } //actually add the five or less numbers here
              this.pageLimits[length + 2] = 'Next >'; // always this
              this.pageLimits[length + 3] = 'Last'; // always this
            },

            // ********************************************** this function will set the fetch increment based on index ********************************************************************************************
            //  index - choice 0,1 or 2 (25,50,100)
            // ****************************************************************************************************************************************************************************************
            setCurrentPage: function(index, gfyCount) {
              if (index <= 1 || index >= (this.pageLimits.length - 2)) {
                if (index == 0) {
                  if (this.currentPage == 1) return false;
                  else this.currentPage = 1;
                }                else if (index == 1) {
                  if (this.currentPage == 1) return false;
                  else this.currentPage--;
                }                else if (index == (this.pageLimits.length - 2)) {
                  if (this.currentPage == this.totalPages) return false;
                  else this.currentPage++;
                }                else if (index == (pageLimits.length - 1)) {
                  if (this.currentPage == this.totalPages) return false;
                  else this.currentPage = this.totalPages;
                }
              }              else {
                if (this.pageLimits[index] == this.currentPage) return false;
                this.currentPage = this.pageLimits[index];
              }

              // if you actually changed the page do this stuff
              this.setViewRange(gfyCount);
              return true;

            },

            // ********************************************** this function will check if the current fetch increment is set to this index number ********************************************************************************************
            //  index - choice 0,1 or 2 (25,50,100) - returns true or false
            // ****************************************************************************************************************************************************************************************
            isCurrentPage: function(index) {
              return (this.currentPage == this.pageLimits[index]);
            },

            // ********************************************** this function will check if we need to hide items from the pageLimits display ********************************************************************************************
            //  index - current index number of ng-repeat loop in the pageLimits array
            // ****************************************************************************************************************************************************************************************
            hideCheck: function(index) {
              if ((index < 2 || index > (this.pageLimits.length - 3)) && this.totalPages < 6) return true;
              else if (index < 2 && this.currentPage < 4) return true;
              else if ((this.totalPages - this.currentPage) < 3 && index > (this.pageLimits.length - 3)) return true;
              return false;
            },

            // ********************************************** this function display the current (rangelow to rangehigh)/total we are fetching in the pagination view ********************************************************************************************
            //  index - choice 0,1 or 2 (25,50,100) - returns true or false
            // ****************************************************************************************************************************************************************************************
            setViewRange: function(gfyCount) {
              this.viewRangeLow = (this.currentPage - 1) * this.fetchLimiter + 1;
              this.viewRangeHigh = this.currentPage * this.fetchLimiter;
              if (this.viewRangeHigh > gfyCount) this.viewRangeHigh = gfyCount;
            },

          };

        });
})();//end java wrapper function
