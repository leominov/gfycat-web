
angular.module('gfycat.shared').service('httpHelperService', ['$http','$q',function($http,$q)  {
    function wrapDeferred(fun){
        var deferred = $q.defer();
        fun.then(function(response){
            deferred.resolve(response.data);
        },function(){
            deferred.reject();
        });
        return deferred.promise;
    }
    function wrapDeferredIf200(fun){
        var deferred = $q.defer();
        fun.then(function(response) {
            if(response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(response);
                }
            }else{
                deferred.reject();
            }
        }, function(response){
            deferred.reject(response);
        });
        return deferred.promise;
    }
    return {
        wrapDeferredIf200: wrapDeferredIf200
    };

}]);
