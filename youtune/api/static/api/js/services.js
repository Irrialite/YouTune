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
            arg2 = arguments[1];
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
                            $('#loginButton .inner').text(success.username);
                            parentObj.properties.resource = success;
                            if (arg2)
                                $location.path('/user/' + success.username);
                            else
                                location.reload(false);
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
            parentObj = this;
            apiCall.get({
                type: 'userprofile',
                id: 'logout',
            }, function (success) {
                if (success.success)
                {
                    parentObj.properties.loggedIn = false;
                    parentObj.properties.sessionid = undefined;
                    parentObj.properties.resource = undefined;
                    $location.path('');
                    $('#loginButton .inner').text('Login');
                    location.reload(false);
                }
            });
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
                parentObj.logIn({name: registerUser.name, pw: registerUser.pw}, true);
            }, function(data) {
            });
        };
             
        this.simpleSessionCheck = function(scope) {
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
        
        this.initUser = function (callback) {
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
                            if (callback)
                                callback();
                            parentObj.properties.sessionid = $cookies.sessionid;
                            parentObj.properties.loggedIn = true;
                            parentObj.properties.incorrectLoginInfo = false;
                            parentObj.properties.resource = success;
                            $('#loginButton .inner').text(success.username);
                        });
                    }
                    else {
                        if (callback)
                            callback();
                        parentObj.properties.loggedIn = false;
                        parentObj.properties.sessionid = undefined;
                        parentObj.properties.resource = undefined;
                        //$location.path('');
                    }
                });
            }
            else
            {
                if (callback)
                    callback();
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
    .service('userSettings', ['$rootScope', 'userAccount', 'apiCall', function($rootScope, userAccount, apiCall) {
        userSettingsObj = this;
        this.settings = {};
        this.settings.general = {
            name: "General",
            template: "/static/api/templates/partial/settings_general.html",
            successAlert: '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>Successfully saved general settings to the database.</div>',
            poptions: ["Yes", "No"],
            pformats: ["Flash", "HTML5"],
        };
        this.settings.avatar = {
            name: "Avatar",
            template: "/static/api/templates/partial/settings_avatar.html",
        };
        this.settings.channel = {
            name: "Channel",
            template: "/static/api/templates/partial/settings_channel.html",
            successAlert: '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>Successfully saved channel settings to the database.</div>',
        };
        this.settings.groups = [this.settings.general, this.settings.avatar, this.settings.channel];
        this.settings.selectedGroup = this.settings.general;
        this.settings.changes = {};
        this.settings.changes.general = {};
        this.settings.changes.avatar = {};
        this.settings.changes.channel = {};

        this.setSelectedGroup = function(setting) {
            if (this.settings.groups.indexOf(setting) > -1) {
                this.settings.selectedGroup = setting;
            }
        };
        
        this.saveChanges = function(setting) {
            if (setting == userSettingsObj.settings.channel.name)
            {
                if (userSettingsObj.settings.changes.channel.description != userAccount.properties.resource.channel.description)
                {
                    apiCall.post({
                        type: 'channel',
                        id: 'update',
                        description: userSettingsObj.settings.changes.channel.description,
                    }, function (success) {
                        $('#settings_top').prepend(userSettingsObj.settings.channel.successAlert);
                    });
                    userAccount.properties.resource.channel.description = userSettingsObj.settings.changes.channel.description;
                }
            }
            else if (setting == userSettingsObj.settings.general.name)
            {
                if (userSettingsObj.settings.changes.general.player_volume)
                {
                    var vol = userSettingsObj.settings.changes.general.player_volume,
                        ap = userSettingsObj.settings.changes.general.player_autoplay == "Yes" ? true:false,
                        rep = userSettingsObj.settings.changes.general.player_repeat == "Yes" ? true:false,
                        format = userSettingsObj.settings.changes.general.player_format == "Flash" ? 0:1;
                    apiCall.post({
                        type: 'userprofile',
                        id: 'update',
                        player_volume: vol,
                        player_autoplay: ap,
                        player_repeat: rep,
                        player_format: format,
                    }, function (success) {
                        $('#settings_top').prepend(userSettingsObj.settings.general.successAlert);
                    });
                    userAccount.properties.resource.player_volume = vol;
                    userAccount.properties.resource.player_autoplay = ap;
                    userAccount.properties.resource.player_repeat = rep;
                    userAccount.properties.resource.player_format = format;
                }
            }
        };
    }])
    .service('commentService', ['$rootScope', 'userAccount', 'apiCall', function($rootScope, userAccount, apiCall) {
        this.properties = {};
    }])
    .service('searchService', ['$rootScope', '$location', function($rootScope, $location) {
        var searchServiceObj = this;
        this.properties = {};
        this.properties.search = "";
        this.doSearch = function() {
            $location.path('/search').search({q: searchServiceObj.properties.search});
        }
    }])

