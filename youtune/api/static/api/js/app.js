var app = angular.module('youtune');

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/api/templates/index.html',
                controller: YouTuneLoginWindowCtrl, 
                resolve: {
                    res: function ($q, $route, $timeout, apiCall) {
                        var deferred = $q.defer();
                        var successCb = function(result) {
                            if (angular.equals(result, [])) {
                                deferred.reject("test");
                            }
                            else {
                                deferred.resolve(result);
                            }
                        };
                        $timeout(function () {
                            apiCall.get({
                                type: 'userprofile',
                                id: 'loggedin',
                            }, successCb);
                        }, 2000);
                        
                        return deferred.promise;
                    }
                }
            })
            .when('/details', {
                templateUrl: '/static/api/templates/details.html'
            })
            .when('/register', {
                templateUrl: '/static/api/templates/registration.html'
            })
            .when('/upload', {
                templateUrl: '/static/api/templates/upload.html'
            })
            .when('/upload/delete/:id', {
                templateUrl: '/static/api/templates/upload_delete.html', 
                controller: YouTuneUploadDelete
            })
            .when('/user/:name/settings', {
                templateUrl: '/static/api/templates/settings.html', 
                controller: SettingsCtrl
            })
            .when('/user/:name', {
                templateUrl: '/static/api/templates/channel.html', 
                controller: ChannelCtrl,
                resolve: ChannelCtrl.resolve
            })
            .otherwise({redirectTo: '/'});
    }]);
/*
app.run(function($rootScope, userAccount) {
    $rootScope.$on('$routeChangeSuccess', function () {
        userAccount.initUser($rootScope);
    });
})
*/