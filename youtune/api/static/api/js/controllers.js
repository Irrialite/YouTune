app = angular.module('youtune', ['youtuneServices']);

function YouTuneCtrl($scope, apiCall, userAccount) {
    $scope.users = apiCall.get({
        type: 'userprofile'
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
    
    $scope.isLoggedInCheck = function() {
        userAccount.getLoggedIn();
    }
    
    $scope.userAccount = userAccount;
}

function YouTuneRegisterCtrl($scope, userAccount, apiCall) {
    $scope.registerUser = {};    
    $scope.dupename = false;
    
    $scope.register = function(registerUser) {
        var users = apiCall.post({
            type: 'userprofile',
            id: 'checkfordupe',
            username: registerUser.name,
        }, function(data) {
            console.log(data);
            if (data.success == true)
                userAccount.register(registerUser);
            else
                $scope.dupename = true;
        });               
    };
}




function ShowCtrl($scope) {
    var visible=false;
    $scope.action = function() {
        visible ? $(".loginForm").fadeOut("slow") : $(".loginForm").css('visibility', 'visible').hide().fadeIn("slow");
        visible=!visible;
    }
}