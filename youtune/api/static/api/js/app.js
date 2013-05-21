var app = angular.module('youtune');

app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {templateUrl: '/static/api/templates/index.html'})
            .when('/details', {templateUrl: '/static/api/templates/details.html'})
            .when('/register', {templateUrl: '/static/api/templates/registration.html'})
            .when('/upload', {templateUrl: '/static/api/templates/upload.html'})
            .when('/upload/delete/:id', {templateUrl: '/static/api/templates/upload_delete.html', controller: YouTuneUploadDelete})
            .when('/user/:name/settings', {templateUrl: '/static/api/templates/settings.html'})

            // TODO: [ ] fix /chanel/test to a regexp path
            .when('/user/:name', {templateUrl: '/static/api/templates/channel.html'})

            .otherwise({redirectTo: '/'});
    }]);