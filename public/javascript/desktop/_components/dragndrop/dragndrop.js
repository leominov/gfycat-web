/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

(function() {
  var app = angular.module('dragDrop', []);

  app.directive('draggable', function() {
    return function(scope, element) {
      // this gives us the native JS object
      var el = element[0];

      el.draggable = true;

      el.addEventListener(
          'dragstart',
                function(e) {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('Text', this.id);
                  this.classList.add('drag');
                  return false;
                },

                false
            );

      el.addEventListener(
          'dragend',
                function(e) {
                  this.classList.remove('drag');
                  return false;
                },

                false
            );
    };
  });

  app.directive('droppable', ['gfyAccountTree', function(gfyAccountTree) {

    return {
      scope: {
        drop: '&', //parent
        bin:'=' // bi-directional scope
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
            'dragover',
                    function(e) {
                      e.dataTransfer.dropEffect = 'move';

                      // allows us to drop
                      if (e.preventDefault) e.preventDefault();
                      this.classList.add('over');
                      return false;
                    },

                    false
                );
        el.addEventListener(
            'dragenter',
                    function(e) {
                      this.classList.add('over');
                      return false;
                    },

                    false
                );
        el.addEventListener(
            'dragleave',
                    function(e) {
                      this.classList.remove('over');
                      return false;
                    },

                    false
                );
        el.addEventListener(
            'drop',
                    function(e) {
                      // Stops some browsers from redirecting.
                      if (e.preventDefault)  e.preventDefault();
                      if (e.stopPropagation) e.stopPropagation();

                      this.classList.remove('over');

                      var binId = this.id;
                      var item = document.getElementById(e.dataTransfer.getData('Text'));

                      //this.appendChild(item);

                      // call the drop passed drop function
                      scope.$apply(function(scope) {
                        //console.log(item.id);
                        gfyAccountTree.singleItemMoveId = item.id; // in ng-repeat we create an 'id' for the element based on the gfyNumber so we are getting this number for the single item event case
                        var fn = scope.drop();
                        if ('undefined' !== typeof fn) {
                          fn(item.id, binId);

                        }
                      });

                      return false;
                    },

                    false
                );

      },
    };
  },]);

})();//end java wrapper function
