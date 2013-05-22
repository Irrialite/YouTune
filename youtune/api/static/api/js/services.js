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
                apiCall.post({
                    type: 'userprofile',
                    id: 'checkfordupe',
                    username: user.name
                }, function(data) {
                    if (data.success == false)
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
            $rootScope.$broadcast('userAccount::successLogin', this.properties.loggedIn);
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
                avatar: 'http://gravatar.com/avatar/14c12d6119e8e84cbc980af600b3586a?s=128',
                id: null,
            }, function(data) {
                parentObj.logIn({name: registerUser.name, pw: registerUser.pw});
            }, function(data) {
            });
        };
             
        this.simpleSessionCheck = function() {
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
            if (this.properties.resource != undefined)
                return { "background-image" : "url('" + this.properties.resource.avatar + "')" };
            return { "background-image" : "url('" + "')" };
        }
        
    }])
    .service('logBoxService', ['$rootScope', 'userAccount', function($rootScope, userAccount) {
        var properties = {};
        properties.toAnimate = ".loginForm";
        properties.visible = false;

        this.display = function(arg, arg2) {
            //animate appropriate window
            properties.visible ? $(properties.toAnimate).fadeOut("slow") : $(properties.toAnimate).css('visibility', 'visible').hide().fadeIn("slow");
            properties.visible = !properties.visible;

            //hide/show appropriate window
            if(userAccount.properties.loggedIn || arg){
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
        this.settings.selectedGroup = undefined;
        this.settings.changes = {};
        this.settings.changes.general = {};
        this.settings.changes.avatar = {};

        this.setSelectedGroup = function(setting) {
            if (this.settings.groups.indexOf(setting) > -1) {
                this.settings.selectedGroup = setting;
            }
        };
    }])

