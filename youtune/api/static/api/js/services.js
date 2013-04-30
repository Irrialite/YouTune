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
    .service('userAccount', ['$rootScope', 'apiCall', '$timeout', function($rootScope, apiCall, $timeout) {
        this.accName = undefined;
        this.loggedIn = undefined;
        this.incorrectLoginInfo = false;
        
        this.setAccName = function(name) {
            this.accName = name;
        }
        this.logIn = function(user) {
            apiCall.post({
                type: 'userprofile',
                id: 'login',
                username: user.name,
                password: user.pw,
            }, function(data) {
                this.accName = user.name;
                this.loggedIn = true;
                this.incorrectLoginInfo = false;
                $rootScope.$broadcast('userAccount::failedLogin', this.incorrectLoginInfo);
                $rootScope.$broadcast('userAccount::successLogin', this.loggedIn);
            }, function(data) { 
                this.incorrectLoginInfo = true;
                $rootScope.$broadcast('userAccount::failedLogin', this.incorrectLoginInfo);
                $timeout(function() {
                    this.incorrectLoginInfo = false;
                    $rootScope.$broadcast('userAccount::failedLogin', this.incorrectLoginInfo);
                }, 5000); 
            });
        };
        this.logOut = function() {
            apiCall.get({
                type: 'userprofile',
                id: 'logout',
            });
            this.setAccName(undefined);
            this.loggedIn = false;
            $rootScope.$broadcast('userAccount::successLogin', this.loggedIn);
        };
        this.register = function(registerUser) {
            apiCall.post({
                type: 'userprofile',
                username: registerUser.name,
                password: registerUser.pw,
                email: registerUser.email,
                first_name: 'Pwn',
                last_name: 'Master',
                // TODO:
                // Fix birthdate field
                //birthdate: '',
                gender: registerUser.gender,
                id: null,
            }, function(data) {
                // Whyyyyyy won't this work
                //this.logIn({name: registerUser.name, pw: registerUser.pw});
                // Login and redirect
                apiCall.post({
                    type: 'userprofile',
                    id: 'login',
                    username: registerUser.name,
                    password: registerUser.pw,
                }, function(data) {
                    this.accName = registerUser.name;
                    this.loggedIn = true;
                    this.incorrectLoginInfo = false;
                    $rootScope.$broadcast('userAccount::failedLogin', this.incorrectLoginInfo);
                    $rootScope.$broadcast('userAccount::successLogin', this.loggedIn);
                });
            }, function(data) {
            });
        };
        this.getLoggedIn = function() {
            apiCall.get({
                type: 'userprofile',
                id: 'loggedin',
            }, function(data) {
                if (data.success == true)
                    this.loggedIn = true;
                else
                    this.loggedIn = false;
            });
        };
    }]);
