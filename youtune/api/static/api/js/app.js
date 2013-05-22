var app = angular.module('youtune');

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/api/templates/index.html',
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

app.run(function($rootScope, userAccount) {
    userAccount.initUser();
})
