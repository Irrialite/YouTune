angular.module('youtuneServices', ['ngResource', 'ngCookies'])
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
    .service('userAccount', ['$rootScope', 'apiCall', '$timeout', '$cookies', '$location', function($rootScope, apiCall, $timeout, $cookies, $location) {
        this.properties = {};
        this.properties.resource = undefined;
        this.properties.sessionid = undefined;
        this.properties.loggedIn = false;
        this.properties.incorrectLoginInfo = false;
        
        this.logIn = function(user) {
            parentObj = this;
            apiCall.post({
                type: 'userprofile',
                id: 'login',
                username: user.name,
                password: user.pw,
            }, function(data) {
                apiCall.get({
                    type: 'userprofile',
                    id: 'loggedin',
                }, function(data) {
                    if (data.success == true)
                    {
                        apiCall.get({
                            type: 'userprofile',
                            id: data.id
                        }, function(success) {
                            parentObj.properties.resource = success;
                            $location.path('user/' + success.username); 
                        });
                    }
                });              
                parentObj.properties.sessionid = $cookies.sessionid;
                parentObj.properties.loggedIn = true;
                parentObj.properties.incorrectLoginInfo = false;
                $rootScope.$broadcast('userAccount::successLogin', parentObj.properties.loggedIn);
                user.name = '';
                user.pw = '';
            }, function(data) { 
                parentObj.properties.incorrectLoginInfo = true;
                user.pw = '';
                $timeout(function() {
                    parentObj.properties.incorrectLoginInfo = false;
                }, 3000); 
            });

        };
        this.logOut = function() {
            apiCall.get({
                type: 'userprofile',
                id: 'logout',
            });
            this.properties.loggedIn = false;
            this.properties.sessionid = undefined;
            this.properties.resource = undefined;
            $location.path('');
        };
        this.register = function(registerUser) {
            parentObj = this;
            apiCall.post({
                type: 'userprofile',
                username: registerUser.name,
                password: registerUser.pw,
                email: registerUser.email,
                first_name: registerUser.firstname,
                last_name: registerUser.lastname,
                birthdate: registerUser.birthdate,
                gender: registerUser.gender,
                id: null,
            }, function(data) {
                parentObj.logIn({name: registerUser.name, pw: registerUser.pw});
            }, function(data) {
            });
        };
             
        this.simpleSessionCheck = function(scope) {
            console.log(this.properties.sessionid);
            console.log(scope);
            if (this.properties.sessionid != $cookies.sessionid)
                return true;
            return false;
        }
        
        this.wasAlreadyLoggedIn = function(resource)
        {
            this.properties.loggedIn = true;
            this.properties.resource = resource;
            this.properties.sessionid = $cookies.sessionid;
        }
        
        this.getAvatarStyle = function() {
            if (arguments.length == 1)
            {
                if (this.properties.resource != undefined)
                    return { "background-image" : "url('" + this.properties.resource.avatar + "?s=" + arguments[0] + "')" };
            }
            else if (arguments.length == 2)
                return { "background-image" : "url('" + arguments[1] + "?s=" + arguments[0] + "')" };
            return { "background-image" : "url('" + "')" };
        }
        
        this.initUser = function () {
            parentObj = this;
            if (!this.properties.loggedIn)
            {
                apiCall.get({
                    type: 'userprofile',
                    id: 'loggedin',
                }, function (data) {
                    if (data.success == true) {
                        apiCall.get({
                            type: 'userprofile',
                            id: data.id
                        }, function(success) {
                            parentObj.properties.sessionid = $cookies.sessionid;
                            parentObj.properties.loggedIn = true;
                            parentObj.properties.incorrectLoginInfo = false;
                            parentObj.properties.resource = success;
                        });
                    }
                    else {
                        parentObj.properties.loggedIn = false;
                        parentObj.properties.sessionid = undefined;
                        parentObj.properties.resource = undefined;
                        $location.path('');
                    }
                });
            }
        }         
    }])
    .service('logBoxService', ['$rootScope', 'userAccount', function($rootScope, userAccount) {
        logBoxServiceObj = this;
        this.properties = {};
        this.properties.toAnimate = ".loginForm";
        this.properties.visible = false;

        this.display = function(arg, arg2) {
            //animate appropriate window
            logBoxServiceObj.properties.visible ? $(logBoxServiceObj.properties.toAnimate).fadeOut("slow") : $(logBoxServiceObj.properties.toAnimate).css('visibility', 'visible').hide().fadeIn("slow");
            logBoxServiceObj.properties.visible = !logBoxServiceObj.properties.visible;

            //hide/show appropriate window
            if(userAccount.properties.loggedIn || arg){
                //alert("loged in");
                $(".loggedForm").css('visibility','visible');
                $(".loginForm").css('visibility','hidden');
                logBoxServiceObj.properties.toAnimate=".loggedForm";
            }
            else{
                //alert("loged out");
                $(".loggedForm").css('visibility','hidden');
                $(".loginForm").css('visibility','visible');
                logBoxServiceObj.properties.toAnimate=".loginForm";
            }



        }
    }])
    .service('userSettings', ['$rootScope', 'apiCall', function($rootScope, apiCall) {
        this.settings = {};
        this.settings.general = {
            name: "General",
            template: "/static/api/templates/partial/settings_general.html",
        };
        this.settings.avatar = {
            name: "Avatar",
            template: "/static/api/templates/partial/settings_avatar.html",
        };
        this.settings.test = {
            name: "Ulalala",
            template: "/static/api/templates/partial/settings_avatar.html",
        };
        this.settings.groups = [this.settings.general, this.settings.avatar, this.settings.test];
        this.settings.selectedGroup = this.settings.general;
        this.settings.changes = {};
        this.settings.changes.general = {};
        this.settings.changes.avatar = {};

        this.setSelectedGroup = function(setting) {
            if (this.settings.groups.indexOf(setting) > -1) {
                this.settings.selectedGroup = setting;
            }
        };
    }])

