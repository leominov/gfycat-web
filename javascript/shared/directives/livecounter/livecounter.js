angular.module('gfycat.shared').directive('livecounter', function($rootScope, websocketService){
  return {

    restrict: 'A',
    link: function($scope, element, attr) {
      var oldGfyLiveViews = [];
      function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while(el.offsetParent) {
          el = el.offsetParent;
          top += el.offsetTop;
          left += el.offsetLeft;
        }
        return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
        );
      }
      function subscribeAndUpdateElement(GfyId, ViewType){
        websocketService.subscribeToGfy(GfyId);
        if($rootScope.mainLivecountDict[GfyId]) {
          var views = $rootScope.mainLivecountDict[GfyId].split(',');
          var liveViews = views[0];
          var totalViews = views[1];
          if(ViewType=="live") {
            oldGfyLiveViews[GfyId] = liveViews;
            element.html((Number(liveViews)+1).toLocaleString());
          }else{
            if(Number(totalViews)>0) {
              element.html(Number(totalViews).toLocaleString());
            }
          }
        }
      }
      function processWebsocketResponseAndApplyViews(data, gfy_id, view_type){
        var split =  data.split('#').slice(0,-1);
        var len = split.length;
        for(var i=0;i< len;i++) {
          var it = split[i].split('*');
          var gfyid = it[0];
          var views = it[1].split(',');
          var liveViews = views[0];
          var totalViews = views[1];
          if(gfyid==gfy_id) {
            if(view_type=="live") {
              oldGfyLiveViews[gfy_id] = liveViews;
              element.html((Number(liveViews)+1).toLocaleString());
            }else{
              if($rootScope.mainLivecountDict[gfy_id]) {
                var oldViews = $rootScope.mainLivecountDict[gfy_id].split(',');
                var oldTotalViews = oldViews[1];
                if (oldTotalViews > totalViews) {
                  element.html(Number(oldTotalViews).toLocaleString());
                } else {
                  if(Number(totalViews)>0) {
                    element.html(Number(totalViews).toLocaleString());
                  }
                }
              }else{
                if(Number(totalViews)>0) {
                  element.html(Number(totalViews).toLocaleString());
                }
              }
            }
          }
        }
      }
      var previousGfyId = attr.gfyid;
      var lastSubscribed = null;
      var visible = false;
      attr.$observe('gfyid', function(actual_value) {
        if(typeof attr.viewtype === 'undefined') {

        }else {
          if (attr.viewtype == "live") {

            if ($rootScope.mainLivecountDict[actual_value]) {
              //var oldViews = $rootScope.mainLivecountDict[actual_value].split(',');
              //var oldTotalViews = oldViews[1];
              var oldViews = oldGfyLiveViews[actual_value];
              // if the historical data exists for this gfyid then display that instead of 1, if not then display 1

              if(Number(oldViews)>0){
                element.html(Number(oldViews).toLocaleString());
              }else{
                element.html("1");
              }
            }else{
              element.html("1");
            }
          }
        }
      });
      var clearEventListen = function(){};
      setTimeout(onVisibleHidden, 500);
      function onVisibleHidden(){
        if(previousGfyId!=attr.gfyid){

          subscribeAndUpdateElement(attr.gfyid,attr.viewtype);
          lastSubscribed = [attr.gfyid, true];
          clearEventListen = $rootScope.$on("applyViewcounts", function(event, args){
            processWebsocketResponseAndApplyViews(args.data, attr.gfyid, attr.viewtype);
          });
          visible=true;
        }else if(elementInViewport(element[0])&&visible==false){
          subscribeAndUpdateElement(attr.gfyid,attr.viewtype);
          lastSubscribed = [attr.gfyid, true];
          clearEventListen = $rootScope.$on("applyViewcounts", function(event, args){
            processWebsocketResponseAndApplyViews(args.data, attr.gfyid, attr.viewtype);
          });
          visible=true;

        }else if((elementInViewport(element[0])==false)&&visible==true){
          websocketService.unsubscribeFromGfy(lastSubscribed[0]);
          lastSubscribed = [lastSubscribed[0], false];
          clearEventListen();
          visible=false;
        }
        setTimeout(onVisibleHidden, 500);
      }
    }
  };

});