app = angular.module('youtune', ['youtuneServices']);

function YouTuneCtrl($scope, apiCall, userAccount) {
    $scope.users = apiCall.get({
        type: 'userprofile',
        });

    $scope.goBack = function() {
        window.history.back();
    }
    
    $scope.user = {};
    
    $scope.login = function(user) {
        userAccount.logIn(user);
    };
    
    $scope.logout = function() {
        userAccount.logOut();
    };
}

function YouTuneRegisterCtrl($scope, userAccount) {
    $scope.registerUser = {};    
    
    $scope.register = function(registerUser) {
        userAccount.register(registerUser);
    };
}