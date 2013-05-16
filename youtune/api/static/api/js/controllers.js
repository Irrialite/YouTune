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
            username: registerUser.name
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





//TODO: [x] create function/service that returns number of days in applied month
// fix: [x] yearCtrl, daysCtrl
// fix: [x] update choice in month,year


var year=0;
var month=0;
var days = [];

function yearCtrl($scope) {
    $scope.years = new Array (108);

    var startYear = 1900;
    for (var i = 0; i < $scope.years.length; i++){
        $scope.years[i] = startYear;
        startYear++;
    }

    $scope.updateChoice = function(msg){
        year = msg;
        $("#yearBtn").text(year);
        updateDay();
    }

}


function monthsCtrl($scope) {
    $scope.monthStr = "";
    $scope.months = [
        {text:'1 - Jan'},
        {text:'2 - Feb'},
        {text:'3 - Mar'},
        {text:'4 - Apr'},
        {text:'5 - May'},
        {text:'6 - Jun'},
        {text:'7 - Jul'},
        {text:'8 - Aug'},
        {text:'9 - Sep'},
        {text:'10 - Okt'},
        {text:'11 - Nov'},
        {text:'12 - Dec'}
        ]

    $scope.updateChoice = function(msg){
        month = msg.length == 2 ? msg.substring(0,1) : msg.substring(0,2); //this is for number only
        $scope.monthStr = msg.substring(msg.length-3,msg.length);
        $("#monthBtn").text($scope.monthStr);
        updateDay();
    }

}

function updateDay(){

    //check if number of days still ok after month change
    var pickedValue = $("#dayBtn").text();
    var newMax = days.length;
    if( pickedValue > newMax ){
        $("#dayBtn").text(newMax);
    }

    //actual days update
    if(month!=0 && year!=0){
        var daysNum = new Date(year, month, 0).getDate();
        days.length=0; //reset array, strange however it may be, it works :)
        for (var i=0; i<daysNum; i++){
            days[i] = i+1;
        }
    }
}


function daysCtrl($scope) {
    $scope.days = days;

    $scope.updateChoice = function(msg){
        $("#dayBtn").text(msg);
    }

}
