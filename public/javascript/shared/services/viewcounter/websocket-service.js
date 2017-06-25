
angular.module('gfycat.shared').service('websocketService', ['$rootScope',function($rootScope)  {

    var Service = {};
    var ws = new WebSocket("wss://1.sockets.gfycat.com/websocket");
    var subscribeQueue=[];
    $rootScope.subscriptionDict = {};
    $rootScope.mainLivecountDict = {};

    ws.onopen = function(){
        if(subscribeQueue.length>0){
            for(var i=0;i<subscribeQueue.length;i++){
                Service.subscribeToGfy(subscribeQueue[i]);
            }
        }
    };

    Service.unsubscribeFromGfy = function unsubscribeFromGfy(gfyId){
        if(ws.readyState == ws.OPEN){
            if(gfyId.length>0){
                if($rootScope.subscriptionDict[gfyId]<=1) {
                    $rootScope.subscriptionDict[gfyId] = 0;
                    ws.send("%" + gfyId);
                }else{
                    $rootScope.subscriptionDict[gfyId] = $rootScope.subscriptionDict[gfyId] - 1;
                }
            }
        }
    };

    Service.subscribeToGfy = function subscribeToGfy(gfyId) {
        if(ws.readyState == ws.OPEN){
            if(gfyId.length>0){
                increaseSubscriptionCounter(gfyId);
                ws.send("!"+gfyId);
            }
        } else {
            if(gfyId.length>0) {
                subscribeQueue.push(gfyId);
            }
        }
    };
    function increaseSubscriptionCounter(gfyId){
        if($rootScope.subscriptionDict[gfyId]){
            $rootScope.subscriptionDict[gfyId] = $rootScope.subscriptionDict[gfyId]+1;

        }else{
            $rootScope.subscriptionDict[gfyId] = 1;
            // could decide to send to socket only here
        }
    }
    Service.subscribeToGfys = function subscribeToGfys(data) {
        if(ws.readyState == ws.OPEN){
            var datar = "(";
            for(var i=0;i<data.length;i++) {
                datar+= data[i]+",";
                increaseSubscriptionCounter(data[i]);
            }
            if(datar.length>0){
                datar = datar.substr(0,datar.length-1);
                ws.send(datar);
            }
        }
    };

    ws.onmessage = function(message) {
        $rootScope.$emit('applyViewcounts', { data: message.data});
        updateMainLivecountDict(message.data);
    };

    function updateMainLivecountDict(data){
        var split = data.split('#').slice(0,-1);
        var len = split.length;
        for(var i=0;i< len;i++) {
            var it = split[i].split('*');
            var gfyid = it[0];
            var views = it[1];
            var livecountViews = views[0];
            var totalViews = views[1];
            if($rootScope.mainLivecountDict[gfyid]) {
                var oldViews = $rootScope.mainLivecountDict[gfyid].split(',');
                var oldTotalViews = oldViews[1];
                if(oldTotalViews>totalViews){
                    $rootScope.mainLivecountDict[gfyid] = livecountViews + "," + oldTotalViews;
                }

            }
            $rootScope.mainLivecountDict[gfyid] = views;
        }
    }

    $rootScope.$on('subscribeToLivecount', function(event, args) { Service.subscribeToGfys(args.data); });

    return Service;
}]);