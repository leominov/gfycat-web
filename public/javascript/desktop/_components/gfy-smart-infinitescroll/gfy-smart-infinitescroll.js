
angular.module('gfycatApp').directive('smartInfiniteScrollV2', function($window, $interval, $rootScope) {
	return {
  	restrict: 'AE',
    multiElement: true,
    priority: 1000,
    terminal: true,
    transclude: true,
    scope: {
      moreData: '&',
      moreDataDisable: '&',
      smartRepeat: '@',
      maxColumns: '=',
      maxColumnWidth: '=',
      minColumnWidth: '=',
      borderWidth: '='
    },
    compile: function(tElem, tAttrs) {
      //console.log('cmpl', tAttrs);
      var match = tAttrs.smartRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
      if (!match) {
        console.log("match error!");
        throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_' but got '{0}'.",
          expression);
      }
      var indexString = match[1]; // item
      var maxColumns = tAttrs.maxColumns;
      var maxColumnWidth = tAttrs.maxColumnWidth;
      var minColumnWidth = tAttrs.minColumnWidth;
      var borderWidth = tAttrs.borderWidth;
      var borderPadding = borderWidth/2 + 'px';
      var collectionString = '$parent.' + match[2]; // collection (of parent element)

    	return function(scope, iElem, iAttrs, controller, transclude) {
        //console.log('pstlnk');
        scope.columnElements = [];
        //scope.maxColumns = iAttrs.maxColumns;

        var buildLayout = function() {
          var windowWidth = iElem.parent().width();
          if (windowWidth < maxColumnWidth) {
            scope.columns = 1;
          } else {
            scope.columns = maxColumns;
            while (windowWidth/scope.columns < minColumnWidth && scope.columns > 1) {
              scope.columns--;
            }
          }
          //scope.columnWidth = Math.floor(100/scope.columns) + '%';
          //TODO: take the if conditional out as buildLayout is only called initially or on resize
          if (scope.columnElements.length !== scope.columns) {
            for (var i = 1; i <= scope.columns; i++) {
              var columnElement = angular.element('<div class="column-' + i + '"></div>');
              columnElement.css('display', 'inline-flex').css('flex-direction', 'column').css('flex-basis', '100%').css('padding', borderPadding);
              iElem.css('display', 'flex');
              iElem.append(columnElement);
              scope.columnElements.push(columnElement);
            }
          }
        }();

        var getShortestColumnIndex = function() {
          if (scope.columnElements.length === 1) return 0;
          var shortestColumn = {
            height: scope.columnElements[0].height(),
            index: 0
          };

          for (var i = 1; i < scope.columnElements.length; i++) {
            console.log(i, ': ', scope.columnElements[i].height());
            var curHeight = scope.columnElements[i].height();
            if (shortestColumn.height > curHeight) {
              shortestColumn = {
                height: curHeight,
                index: i
              };
            }
          }
          console.log('height: ', shortestColumn.height, ' index: ', shortestColumn.index);
          return shortestColumn.index;
        };

        var elements = [];
        scope.$watchCollection(collectionString, function(newCollection, oldCollection) {
          //console.log('newCollection: ', newCollection, 'oldCollection: ', oldCollection);
          if (oldCollection === undefined) oldCollection = [];
          if (newCollection === undefined) newCollection = [];
          if (oldCollection === newCollection) oldCollection = [];
          for (var i = oldCollection.length; i < newCollection.length; i++) {
            var customScope = scope.$new();
            customScope[indexString] = newCollection[i];
            var linkedClone = transclude(customScope, function(clone, cloneScope) {
              clone.css('visibility', 'hidden');
              scope.columnElements[i % scope.columns].append(clone);
            });
            linkedClone.css('visibility', 'visible').css('padding-bottom', '10px');
            var block = {
              el: linkedClone,
              scope: customScope
            };
            elements.push(block);
          }
        });

        var distributeElements = function(deltaColumnNumber) {
          console.log('distributing elements');
          var deltaColumn = scope.columnElements[deltaColumnNumber];
          var sliceInterval = deltaColumn.length / deltaColumnNumber;
          if (!Number.isInteger(sliceInterval)) {
            var remainder = deltaColumn.length % deltaColumnNumber;
            sliceInterval = (deltaColumn.length - remainder) / deltaColumnNumber;
          }
          for (var i = 0; i < deltaColumnNumber; i++) {
            angular.element(scope.columnElements[i][scope.columnElements[i].length - 1]).after(deltaColumn.slice(sliceInterval * i, sliceInterval * (i + 1)));
          }
        };

        var rebuildLayout = function() {
          for (var l = 0; l < elements.length; l++) {
            elements[l].scope.$destroy();
            elements[l].el.remove();
          }
          for (var i = 0; i < scope.columnElements.length; i++) {
            scope.columnElements[i].remove();
          }
          scope.columnElements = [];
          for (var j = 1; j <= scope.columns; j++) {
            var columnElement = angular.element('<div class="column-' + i + '"></div>');
            columnElement.css('display', 'inline-flex').css('flex-direction', 'column').css('flex-basis', '100%').css('padding', borderPadding);
            iElem.css('display', 'flex');
            iElem.append(columnElement);
            scope.columnElements.push(columnElement);
          }
          for (var k = 0; k < elements.length; k++) {
            var customScope = scope.$new();
            customScope[indexString] = elements[k].scope[indexString];
            transclude(customScope, function(clone) {
              clone.css('visibility', 'visible').css('padding-bottom', '10px');
              scope.columnElements[k % scope.columns].append(clone);
            });
          }
        };

        window.addEventListener('resize', function(event) {
          var width = angular.element(scope.columnElements[0]).width();
          var columns;
          //console.log('width: ', width, 'minWidth: ', minColumnWidth, 'scope.columns: ', scope.columns);
          if (width <= minColumnWidth && scope.columns > 1) {
            scope.columns--;
            rebuildLayout();
          } else if (width / (scope.columns + 1) * scope.columns >= minColumnWidth && scope.columns < scope.maxColumns) {
            scope.columns++;
            rebuildLayout();
          }
        });
      };
    },
    controller: function($scope, $window, $interval, $document) {
      //console.log('ctrl');
      $scope.moreData();

      /**
       * Helper function to throttle scroll event handling
       */
      var throttle = function(func, wait) {
        var timeout = null;
        var previous = 0;
        var later = function() {
          previous = new Date().getTime();
          $interval.cancel(timeout);
          timeout = null;
          return func.call();
        };
        return function() {
          var now = new Date().getTime();
          var remaining = wait - (now - previous);
          if (remaining <= 0) {
            $interval.cancel(timeout);
            timeout = null;
            previous = now;
            return func.call();
          } else {
            if (!timeout) {
              timeout = $interval(later, remaining, 1);
              return timeout;
            }
          }
        };
      };

      var busy = false;
      var lastScrollValue = 0;
      var windowHeight = $window.innerHeight;

      $window.addEventListener('scroll', throttle(function(event) {
        var scrollTop = angular.element($window).scrollTop();
        //console.log('document height: ', $document.height(), ' current scroll height: ', scrollTop, ' windowheight: ', windowHeight);
        if (scrollTop > lastScrollValue && !$scope.moreDataDisable() && $document.height() - windowHeight <= scrollTop + 100) {
          //console.log('moredata');
          $scope.moreData();
        }
        lastScrollValue = scrollTop;
      }, 350), false);
    }
  };
});


angular.module('gfycatApp').directive('smartInfiniteScroll', function($compile, $window, $animate) {
    return {
      restrict: 'EA',
      transclude: true,
      priority: 1000,
      terminal: true,
      multiElement: true,

      scope: {
        smartRepeat: '@',
        moreData: '&',
        moreDataDisable: '&',
        columns: '='
      },

      compile: function compile(element, attrs, transclude) {
        var match = attrs.smartRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
        if (!match) {
          console.log("match error!");
          throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_' but got '{0}'.",
            expression);
        }
        var self = this;
        var busy = false;
        var lastScrollValue;

        var doWork = function(value, transclude) {
          busy = true;
          self.scrollTop = value;
          self.processScroll(transclude);
          busy = false;

          if (lastScrollValue != self.scrollTop) {
            doWork(lastScrollValue, transclude);
          }
        };

        $window.addEventListener('scroll', function() {
          lastScrollValue = angular.element($window)
            .scrollTop();

          if (!busy) {
            doWork(angular.element($window)
              .scrollTop(), transclude);
          } else {
            console.log("*busy*");
          }

        }, false);

        this.height = $window.innerHeight; //used for calculating min and max range
        this.scrollTop = 0;
        this.key = match[1];
        this.collection = "$parent." + match[2];
        this.processScroll = processScroll;
        this.buildScrollLayout = buildScrollLayout;
        this.element = element;
        this.data2Grid = {};
        this.gapWidth = 10; //specifies the width of the gap between inner elements
        this.width = angular.element(element)
          .width(); //width of the parent div
        this.columnWidthMin = 285; //minimum value for the column width
        if (!attrs.columns) attrs.columns = 4;
        this.columns = (this.width >= 1000) ? attrs.columns : Math.max(Math.floor(this.width / this.columnWidthMin), 1);
        this.containerWidth = this.width - ((this.columns - 1) * this.gapWidth);
        //Column width cannot be greater than min column width. Set it to full width if viewport can only support 1 column
        if (this.columns === 1) {
          this.columnWidth = this.containerWidth;
        } else {
          this.columnWidth = this.containerWidth / this.columns;
        }
        this.columnsMax = new Array(this.columns);
        this.$animate = $animate;
        this.prevColumns = this.columns; //store previous number of columns
        //this.element.css('width', this.columns * this.columnWidth + (this.columns - 1) * this.gapWidth).css('margin', '0 auto');

        var initialWidth = angular.element(self.element.parent()).width();
        $window.addEventListener('resize', function(event) {
          self.width = angular.element(self.element.parent())
            .width();
          self.element.css('width', self.containerWidth);
          self.columns = Math.max(Math.floor(self.width / self.columnWidthMin), 1);
          if (self.columns > attrs.columns) self.columns = attrs.columns;
          //if (self.columns * self.columnWidth > self.width) self.columnWidth = self.width / self.columns;
          self.containerWidth = self.width - ((self.columns - 1) * self.gapWidth);
          self.element.css('width', self.columns * self.columnWidth + (self.columns - 1) * self.gapWidth);
          if (self.columns != self.prevColumns) {
            self.prevColumns = self.columns;
            angular.forEach(self.element.children(), function(e) {
              var index = angular.element(e)
                .attr('index');
              var renderInfo = self.data2Grid[index];
              renderInfo.scope.$destroy();
              renderInfo.visible = false;
              renderInfo.scope = null;
              renderInfo.el.remove();
            });
            self.columnsMax = new Array(self.columns);
            self.data2Grid = {};
            self.buildScrollLayout();
            self.processScroll(transclude);
          } /*else {
            if (self.columns === 1) {
              console.log('resizing: ', self.width);
              //self.buildScrollLayout();
              angular.forEach(self.element.children(), function(e) {
                e = angular.element(e);
                var width = self.width;
                var delta = width / initialWidth;
                console.log('delta: ', delta);
                var index = e.attr('index');
                var renderInfo = self.data2Grid[index];
                var top = renderInfo.top * delta;

                e.css('width', width).css('top', top);
              });
                //console.log("insert ", i, self.data2Grid);
            }
          }*/
        }, false);

        function compileFn(scope, element, iAttrs, controller, transclude) {
          var self = this;
          self.scope = scope;

          scope.$watchCollection(this.collection, function(newVal, oldVal) {
            //console.log('more data!');
            self.data = newVal;
            self.buildScrollLayout();
            self.processScroll(transclude);
          });

          scope.moreData();
        }

        return compileFn.bind(this);
      }
    };
  });

var getOffsetTop = function(elem) {
  if (!elem[0].getBoundingClientRect || elem.css('none')) {
    return;
  }
  return elem[0].getBoundingClientRect()
    .top + pageYOffset(elem);
};
var getHeight = function(elem) {
  //return 0;
  elem = elem[0] || elem;
  if (isNaN(elem.offsetHeight)) {
    return elem.document.documentElement.clientHeight;
  } else {
    return elem.offsetHeight;
  }
};

function inViewport($el) {
  var elH = $el.outerHeight(),
    H = $(window)
    .height(),
    r = $el[0].getBoundingClientRect(),
    t = r.top,
    b = r.bottom;
  return Math.max(0, t > 0 ? Math.min(elH, H - t) : (b < H ? b : H));
}

var buildScrollLayout = function() {
  var self = this;
  self.containerHeight = 0;
  if (self.data === undefined) self.data = [];

  for (var i = 0; i < self.data.length; i++) {

    if (self.data2Grid[i] !== undefined) {
      continue;
    }

    var h = Math.floor((self.columnWidth * self.data[i].height) / self.data[i].width);

    // algo to pick the column element falls into
    var renderInfo = {
      height: h,
      visible: false
    };

    if (i < self.columns) {
      renderInfo.top = 0;
      renderInfo.left = (self.columnWidth + self.gapWidth) * (i % self.columns);
      renderInfo.column = i % self.columns;
      renderInfo.bottom = h;
    } else {
      var columnMin = Number.MAX_SAFE_INTEGER;
      var minimumFound = 0;

      for (var k in self.columnsMax) {
        var e = self.columnsMax[k];
        if (e.bottom < columnMin) {
          columnMin = e.bottom;
          minimumFound = e;
        }
      }
      renderInfo.top = minimumFound.top + minimumFound.height + self.gapWidth;
      renderInfo.bottom = renderInfo.top + h;
      renderInfo.left = (self.columnWidth * minimumFound.column) + (minimumFound.column * self.gapWidth);
      renderInfo.column = minimumFound.column;
      //console.log('renderInfo: ' + JSON.stringify(renderInfo));
    }
    self.containerHeight = Math.max(self.containerHeight, renderInfo.bottom);
    self.columnsMax[renderInfo.column] = renderInfo;
    self.data2Grid[i] = renderInfo;
  }
};

var processScroll = function(transclude) {
  //console.time("scroll");

  var self = this;
  var minRange = self.scrollTop - (1.5 * self.height);
  var maxRange = self.scrollTop + (2 * self.height);
  //console.log('scrollTop: ', this.scrollTop, '\nheight: ', this.height, '\nminRange: ', minRange, '\nmaxRange: ', maxRange);

  // build the new list
  //console.log("building list");
  if (self.data === undefined) self.data = [];
  for (var i = 0; i < self.data.length; i++) {
    var renderInfo = self.data2Grid[i];
    if (renderInfo.top >= minRange && renderInfo.top <= maxRange &&
      (self.data2Grid[i] === undefined || self.data2Grid[i].visible === false)) {
      var item_scope = self.scope.$new();
      item_scope[self.key] = self.data[i];
      renderInfo.scope = item_scope;
      renderInfo.visible = true;

      var child = null;

      if (self.columns !== 1) {
        var e = transclude(item_scope, function(cloned) {
          var width = (self.columns === 1) ? self.columnWidth : self.columnWidth - self.gapWidth;
          cloned.css("top", renderInfo.top + "px")
            .css("left", renderInfo.left + "px")
            .css("width", width);
          cloned.attr("index", i);
          child = cloned;
        });
      } else {
        var e = transclude(item_scope, function(cloned) {
          var width = (self.columns === 1) ? self.columnWidth : self.columnWidth - self.gapWidth;
          cloned.css("top", renderInfo.top + "px")
            .css("left", renderInfo.left + "px")
            .css("width", width);
          cloned.attr("index", i);
          child = cloned;
        });
      }

      renderInfo.el = child;
      self.element.append(child);
      self.$animate.enter(child, self.element);

      if (renderInfo.bottom > angular.element(self.element)
        .height()) {
        angular.element(self.element)
          .height(renderInfo.bottom);
      }
    }
  }
  angular.element(self.element).height(self.containerHeight);
  // recycle anything far off on the screen
  var recycled = 0;
  angular.forEach(self.element.children(), function(e) {
    var index = angular.element(e)
      .attr("index");
    var renderInfo = self.data2Grid[index];

    if (renderInfo.scope && (renderInfo.top < minRange || renderInfo.top > maxRange)) {
      //self.elementRecycledQueue.push(e);
      renderInfo.scope.$destroy();
      renderInfo.visible = false;
      renderInfo.scope = null;
      renderInfo.el.remove();
      recycled++;
    }
  });

  var elementBottom = this.scrollTop + inViewport(this.element);
  var remaining = getHeight(this.element) - elementBottom;

  if (remaining < 0 && self.data2Grid[self.data.length - 1] && self.data2Grid[self.data.length - 1].visible) {
    if (!this.scope.moreDataDisable()) {
      this.scope.moreData();
    }
  }
  //console.log("recycled ", recycled, "DOM elements ", self.element.children().length);
  //console.timeEnd("scroll");
};
