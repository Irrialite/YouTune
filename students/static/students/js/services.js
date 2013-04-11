angular.module('ipriServices', ['ngResource'])
    .factory('Team', function($resource){
        return $resource('api/v1/team/?format=json', {}, {
            query: {method:'GET', isArray:false}
        });
    })
    .factory('Student', function($resource){
        return $resource('api/v1/student/?format=json', {}, {
            query: {method:'GET', isArray:false}
        });
    });
