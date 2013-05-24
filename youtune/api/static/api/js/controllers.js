var app = angular.module('youtune', ['youtuneServices', 'ngCookies']);

function YouTuneCtrl($scope, $http, $cookies, apiCall, userAccount, userSettings, logBoxService) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $http.defaults.headers.put['X-CSRFToken'] = $cookies.csrftoken;
    $http.defaults.headers.patch = $http.defaults.headers.post;
    $http.defaults.headers.patch['X-CSRFToken'] = $cookies.csrftoken;
    
    $scope.userAccount = userAccount;
    $scope.userSettings = userSettings;

    //if (res)
      //  userAccount.wasAlreadyLoggedIn(res);

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
        logBoxService.display();
    };
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
        //logBoxService.display();
        //$location.path('user/test');
    });
}


function YouTuneLoginWindowCtrl($scope, $location, logBoxService) {
    $scope.$on('userAccount::successLogin', function(event, state) {
        logBoxService.display("arg");
    });
    $scope.displayLogBox = logBoxService.display;
    
    $scope.goChannel = function() {
        $location.path("user/" + ($scope.userAccount.properties.loggedIn ? $scope.userAccount.properties.resource.username:""));
        logBoxService.display();
    }
    
    $scope.goUpload = function() {
        $location.path("upload");
        logBoxService.display();
    }
    
    $scope.goSettings = function() {
        $location.path("user/" + ($scope.userAccount.properties.loggedIn ? $scope.userAccount.properties.resource.username:"") + "/settings");
        logBoxService.display();
    }
    
    $(document).click(function() {
        if(logBoxService.properties.visible){
            //logBoxService.display();
            //$("#settings").stopPropagation(); //maybe ?
        }
    });
}

function YouTuneUploadCtrl($scope) {
    $scope.disabled = true;
}

function YouTuneUploadDelete($scope, $routeParams) {
    $scope.page = 'upload/delete/' + $routeParams.id;
}


function SearchBarCtrl($scope, logBoxService) {
    $scope.displayLogBox = logBoxService.display;
}

function SettingsCtrl($scope, userSettings, userAccount) {
    $scope.isSelected = function(setting) {
        return setting === userSettings.settings.selectedGroup;
    };
    
    $scope.selectGroup = function(setting) {
        userSettings.setSelectedGroup(setting);
    };
    
    $scope.saveChanges = userSettings.saveChanges;
    
    userSettings.settings.changes.channel.description = userAccount.properties.resource.channel.description;
}

SettingsCtrl.resolve = {
    userResolve: function ($q, $route, $timeout, userAccount) {
        var deferred = $q.defer();
        var successCb = function() {
            deferred.resolve("woot");
        };
        
        userAccount.initUser(successCb);
        
        return deferred.promise;
    }
}

function ChannelCtrl($scope, $routeParams, userRes)
{
    $scope.user = userRes;
    if (userRes)
        $scope.channelPage = '/static/api/templates/partial/channel.html';
    else
        $scope.channelPage = '/static/api/templates/partial/user_not_exist.html';
    
    // check here if userRes != null etc
    
}

ChannelCtrl.resolve = {
    userRes: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb = function(result) {
            deferred.resolve(result.objects[0]);
        };
        apiCall.get({
            type: 'userprofile',
            username: $route.current.params.name,
        }, successCb);
        
        return deferred.promise;
    }
}

function IndexCtrl($scope, tracksRes, apiCall)
{
    $scope.increment = 1; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.tracks = tracksRes;
    $scope.offset = $scope.increment;
    if (tracksRes.length > $scope.increment)
    {
        $scope.hasMore = true;
        $scope.tracks = tracksRes.splice(0, $scope.increment);
    }
    
    $scope.loadMore = function() {
        apiCall.get({
            type: 'music',
            sortby: '-upload_date',
            offset: $scope.offset,
            limit: $scope.increment + 1,
        }, function(success) {
            if (success.objects.length > $scope.increment)
                $scope.hasMore = true;
            else
                $scope.hasMore = false;
            var extraTracks = success.objects.splice(0, $scope.increment)
            for (var i = 0; i < extraTracks.length; i++ )
                $scope.tracks.push(extraTracks[i]);
            $scope.offset = $scope.offset + $scope.increment;
        });
    }
    
}

IndexCtrl.resolve = {
    tracksRes: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb = function(result) {
            deferred.resolve(result.objects);
        };
        apiCall.get({
            type: 'music',
            sortby: '-upload_date',
            limit: 2,
        }, successCb);
        
        return deferred.promise;
    }
}

function PlaybackCtrl($scope, $routeParams, trackRes, apiCall, userAccount, commentService)
{
    $scope.track = trackRes;
    $scope.increment = 1; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.offset = 0;
    
    // check here if musicRes != null etc
    if ($scope.track)
    {
        $scope.track.fulltitle = trackRes.artist + " - " + trackRes.title;
        $scope.playbackPage = '/static/api/templates/partial/playback.html'
        $scope.$on('doneRender', function(){
            $("#jquery_jplayer_1").jPlayer({
                ready: function () {
                    $(this).jPlayer("setMedia", {
                        mp3: "http://127.0.0.1:8000" + trackRes.file,
                    }).jPlayer("play"); // Attempts to Auto-Play the media
                },
                swfPath: "static/api/swf/",
                solution: "flash, html",
                supplied: "mp3",
                volume: 0.2
            });
        });
    }
    else
        $scope.playbackPage = '/static/api/templates/partial/file_not_exist.html'
    
    $scope.vote = function(voteType) {
        if (userAccount.properties.resource)
        {
            apiCall.post({
                type: 'music',
                id: 'vote',
                base64id: $scope.track.base64id,
                vote: voteType,
                userid: userAccount.properties.resource.id,
            }, function(data) {
                if (data.success) {
                    $scope.track.likes = data.likes;
                    $scope.track.dislikes = data.dislikes;
                }
            });
        }
        else
        {
            // send msg that you can't vote if not logged in
        }
    }
    
    $scope.loadMore = function() {
        apiCall.get({
            type: 'comment',
            sortby: '-post_date',
            offset: $scope.offset,
            limit: $scope.increment + 1,
        }, function(success) {
            if (success.objects.length > $scope.increment)
                $scope.hasMore = true;
            else
                $scope.hasMore = false;
            var extraComments = success.objects.splice(0, $scope.increment)
            console.log(extraComments);
            for (var i = 0; i < extraComments.length; i++ )
                $scope.comments.push(extraComments[i]);
            $scope.offset = $scope.offset + $scope.increment;
        });
    }
    
    $scope.addComment = function() {
        console.log(commentService.properties.text);
        apiCall.post({
            type: 'comment',
            id: 'post',
            fileid: $scope.track.id,
            commenttext: commentService.properties.text,
        });
    };
    $scope.commentService = commentService;
    $scope.comments = new Array();
    $scope.loadMore();
}

PlaybackCtrl.resolve = {
    trackRes: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb = function(result) {
            //if (result.objects.length != 1)
                //console.log(result.status);
                
            deferred.resolve(result.objects[0]);
        };
        apiCall.get({
            type: 'music',
            base64id: $route.current.params.id,
        }, successCb);
        
        return deferred.promise;
    }
}

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
