angular.module('ipri', ['ipriServices']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: 'static/students/templates/index.html',   controller: IpriCtrl}).
            //when('/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: PhoneDetailCtrl}).
            otherwise({redirectTo: '/'});
    }]);
