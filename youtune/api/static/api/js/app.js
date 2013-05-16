var app = angular.module('youtune');

app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {templateUrl: '/static/api/templates/index.html',   controller: YouTuneCtrl})
            .when('/details', {templateUrl: '/static/api/templates/details.html',   controller: YouTuneCtrl})
            .when('/register', {templateUrl: '/static/api/templates/registration.html',   controller: YouTuneCtrl})

            // TODO: [ ] fix /chanel/test to a regexp path
            .when('/user/test', {templateUrl: '/static/api/templates/channel.html',   controller: YouTuneCtrl})

            .otherwise({redirectTo: '/'});
    }]);