angular.module('youtune', ['youtuneServices']).
    config(['$routeProvider', function($routeProvider) {

        $routeProvider
            .when('/', {templateUrl: '/static/api/templates/index.html',   controller: YouTuneCtrl})
            .when('/details', {templateUrl: '/static/api/templates/details.html',   controller: YouTuneCtrl})
            .otherwise({redirectTo: '/'});





    }]);
