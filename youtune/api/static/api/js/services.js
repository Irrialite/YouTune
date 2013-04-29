angular.module('youtuneServices', ['ngResource'])
    .factory('User', function($resource){
        return $resource('/api/v1/userprofile', {}, {
            query: {method:'GET', isArray:false}
        });
    });
