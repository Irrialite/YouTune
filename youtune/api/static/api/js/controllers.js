app = angular.module('youtune', ['youtuneServices', 'ngCookies']);

function YouTuneCtrl($scope, $http, $cookies, apiCall, userAccount, logBoxService) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $http.defaults.headers.put['X-CSRFToken'] = $cookies.csrftoken;
    $http.defaults.headers.patch = $http.defaults.headers.post;
    $http.defaults.headers.patch['X-CSRFToken'] = $cookies.csrftoken;

    /* 
     * How to update objects
     
    $scope.user1 = apiCall.get({
        type: 'userprofile',
        id: '4'
        }, function(obj) {
            obj.avatar = 'xa';
            obj.$update({type: 'userprofile', id: '4'});
            console.log(obj);
        });
    */
    
    $scope.goBack = function() {
        window.history.back();
    };
    
    $scope.user = {};

    $scope.login = function(user) {
        userAccount.logIn(user);
    };
    
    $scope.logout = function() {
        userAccount.logOut();
        logBoxService.toggleLogin();
    };
    
    $scope.isLoggedInCheck = function() {
        userAccount.getLoggedIn();
    }
    
    $scope.thing = {};
    $scope.thing.style = { "background-image" : "url('../../../../media/default/avatar.jpg')" };
    $scope.selectThing = function(thing) {
        thing.style = { "background-color" : "red" };
    }
    $scope.style = function(thing) {
        return thing.style || {};
    }   
    
    $scope.testS = function(item) {
        console.log(item);
        console.log("{ background-image: url('../../.." + item + "'); }");
        return "{ background-image: url('../../../../media/" + item + "'); }"
    }
}

function YouTuneRegisterCtrl($scope, $location, userAccount, apiCall) {
    $scope.registerUser = {};    
    $scope.dupename = false;
    $scope.registerUser.birthdate = null;
    
    $scope.register = function(registerUser) {
        tempDate = new Date(year, month - 1, day);
        $scope.registerUser.birthdate = tempDate.getFullYear() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getDate();
        var users = apiCall.post({
            type: 'userprofile',
            id: 'checkfordupe',
            username: registerUser.name
        }, function(data) {
            if (data.success == true)
                userAccount.register(registerUser);
            else
                $scope.dupename = true;
        });               
    };
    
    $scope.$on('userAccount::successLogin', function(event, state) {
        $scope.loggedIn = state;
        $location.path('user/test');
    });
}


function YouTuneLoginWindowCtrl($scope, $location, logBoxService) {
    $scope.$on('userAccount::failedLogin', function(event, state) {
        $scope.incorrectLoginInfo = state;
    });
    $scope.$on('userAccount::successLogin', function(event, state) {
        $scope.loggedIn = state;
        $location.path('user/test');
    });
    $scope.displayLogBox = logBoxService.display;

}

function YouTuneUploadDelete($scope, $routeParams) {
    $scope.page = 'upload/delete/' + $routeParams.id;
}


function SearchBarCtrl($scope, logBoxService) {
    $scope.displayLogBox = logBoxService.display;
}



//TODO: [x] create function/service that returns number of days in applied month
// fix: [x] yearCtrl, daysCtrl
// fix: [x] update choice in month,year


var year=0;
var month=0;
var day=0;
var days = [];

function yearCtrl($scope) {
    $scope.years = new Array (108);

    var startYear = 2007;
    for (var i = 0; i < $scope.years.length; i++){
        $scope.years[i] = startYear;
        startYear--;
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

    //actual days update
    if(month!=0 && year!=0){
        var daysNum = new Date(year, month, 0).getDate();
        days.length=0; //reset array, strange however it may be, it works :)
        for (var i=0; i<daysNum; i++){
            days[i] = i+1;
        }
    }
    
    //check if number of days still ok after month change
    var pickedValue = $("#dayBtn").text();
    var newMax = days.length;
    if( pickedValue > newMax ){
        day = newMax;
        $("#dayBtn").text(newMax);
    }
}


function daysCtrl($scope) {
    $scope.days = days;

    $scope.updateChoice = function(msg){
        day = msg;
        $("#dayBtn").text(msg);
    }

}
