angular.module('ipriServices', ['ngResource'])
    .factory('Team', function($resource){
        return $resource('/api/v1/team', {}, {
            query: {method:'GET', isArray:false}
        });
    })
    .factory('Student', function($resource){
        return $resource('/api/v1/student', {}, {
            query: {method:'GET', isArray:false}
        });
    });
