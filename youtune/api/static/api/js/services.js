angular.module('youtuneServices', ['ngResource'])
    .factory('apiCall', function($http, $resource) {
        delete $http.defaults.headers.common['X-Requested-With'];
        
        var apiCall = $resource('/api/v1/:type/:id',
            {type: '@type', id: '@id'},
            {
                get: {method: 'GET'},
                post: {method: 'POST', headers: {'Content-Type': 'application/json'}},
                del: {method: 'DELETE', headers: {'Content-Type': 'application/json'}},
                update: {method: 'PATCH', headers: {'Content-Type': 'application/json'}, params: {type: "@type", id: "@id"}}
            }
        );
        
     return apiCall;
    })
    .service('userAccount', ['$rootScope', 'apiCall', 'logBoxService', '$timeout', function($rootScope, apiCall, logBoxService, $timeout) {
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
                user.name = '';
                user.pw = '';
                logBoxService.toggleLogin();
            }, function(data) { 
                this.incorrectLoginInfo = true;
                user.pw = '';
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
                first_name: registerUser.firstname,
                last_name: registerUser.lastname,
                birthdate: registerUser.birthdate,
                gender: registerUser.gender,
                avatar: 'default/avatar.jpg',
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
                id: 'loggedin'
            }, function(data) {
                if (data.success == true)
                    this.loggedIn = true;
                else
                    this.loggedIn = false;
            });
        };
    }])
    .service('loginBoxService', ['$rootScope', function($rootScope) {
        var properties = {};
        properties.visible = false;

        this.display = function() {
            properties.visible ? $(".loginForm").fadeOut("slow") : $(".loginForm").css('visibility', 'visible').hide().fadeIn("slow");
            properties.visible = !properties.visible;

        }
    }])
    .service('logBoxService', ['$rootScope', function($rootScope) {
        var properties = {};
        properties.toAnimate = ".loginForm";
        properties.logged = false;
        properties.visible = false;

        this.toggleLogin = function(){
            this.display();
            properties.logged=!properties.logged;
        }


        this.display = function() {
            //animate appropriate window
            properties.visible ? $(properties.toAnimate).fadeOut("slow") : $(properties.toAnimate).css('visibility', 'visible').hide().fadeIn("slow");
            properties.visible = !properties.visible;

            //hide/show appropriate window
            if(properties.logged){
                //alert("loged in");
                $(".loggedForm").css('visibility','visible');
                $(".loginForm").css('visibility','hidden');
                properties.toAnimate=".loggedForm";
            }
            else{
                //alert("loged out");
                $(".loggedForm").css('visibility','hidden');
                $(".loginForm").css('visibility','visible');
                properties.toAnimate=".loginForm";
            }



        }
    }])




