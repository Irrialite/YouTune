angular.module('youtuneServices', ['ngResource'])
    .factory('apiCall', function($http, $resource) {
        delete $http.defaults.headers.common['X-Requested-With'];
        
        var apiCall = $resource('/api/v1/:type/:id',
            {type: '@type', id: '@id'},
            {
                get: {method: 'GET'},
                post: {method: 'POST', headers: {'Content-Type': 'application/json'}},
                del: {method: 'DELETE', headers: {'Content-Type': 'application/json'}}
            }
        );
        
     return apiCall;
})
    .service('userAccount', ['$rootScope', 'apiCall', function($rootScope, apiCall) {
        var accName = undefined;
        var loggedIn = undefined;

        this.setAccName = function(name) {
            this.accName = name;
        }
        this.logIn = function(user) {
            apiCall.post({
                type: 'userprofile',
                id: 'login',
                username: user.name,
                password: user.pw
            }, function(data) {
                if (data.success == true)
                {
                    this.accName = user.name;
                    this.loggedIn = true;
                }
            });
        };
        this.logOut = function() {
            apiCall.get({
                type: 'userprofile',
                id: 'logout'
            });
            this.setAccName(undefined);
            this.loggedIn = false;
        };
        this.register = function(registerUser) {
            apiCall.post({
                type: 'userprofile',
                username: registerUser.name,
                password: registerUser.pw,
                email: registerUser.email,
                first_name: 'Pwn',
                last_name: 'Master',
                //birthdate: '',
                gender: registerUser.gender,
                id: null
            });
        };
        this.getLoggedIn = function() {
            apiCall.get({
                type: 'userprofile',
                id: 'loggedin'
            }, function(data) {
                if (data.success == true)
                    this.loggedIn = true;
                else
                    this.loggedIn = false;
            });
        };
    }])


//TODO: [] create function/service that returns number of days in applied month



