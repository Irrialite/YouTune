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

    $scope.login = function() {
        var user = {name:$scope.user.name, pw:$scope.user.pw};
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


function SearchBarCtrl($scope, $location, logBoxService) {
    $scope.displayLogBox = logBoxService.display;
    $scope.search = '';
    $scope.doSearch = function () {
        $location.path('/search').search({q: $scope.search});
    };
}

function SettingsCtrl($scope, $routeParams, userSettings, userAccount) {
    if (userAccount.properties.resource &&
        userAccount.properties.resource.username.toLowerCase() == $routeParams.name.toLowerCase() )
    {
        $scope.properUser = true;
        $scope.isSelected = function(setting) {
            return setting === userSettings.settings.selectedGroup;
        };
        
        $scope.selectGroup = function(setting) {
            userSettings.setSelectedGroup(setting);
        };
        
        $scope.saveChanges = userSettings.saveChanges;
      
        userSettings.settings.changes.channel.description = userAccount.properties.resource.channel.description;
        userSettings.settings.changes.general.player_volume = userAccount.properties.resource.player_volume;
        userSettings.settings.changes.general.player_autoplay = userAccount.properties.resource.player_autoplay ? "Yes":"No";
        userSettings.settings.changes.general.player_repeat = userAccount.properties.resource.player_repeat ? "Yes":"No";
        userSettings.settings.changes.general.player_format = userAccount.properties.resource.player_format == 0 ? "Flash":"HTML5";
    }
    else
    {
        $scope.properUser = false;
        $scope.realUser = $routeParams.name;
        $scope.invalidUserURL = '/static/api/templates/partial/login_required.html';
    }
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

function ChannelCtrl($scope, $routeParams, apiCall, userRes)
{
    $scope.user = userRes;
    
    $scope.increment = 5; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.offset = 0;
    
    $scope.loadMore = function() {
        apiCall.get({
            type: 'music',
            owner: $scope.user.id,
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
                $scope.uploads.push(extraTracks[i]);
            $scope.offset = $scope.offset + extraTracks.length;
        });
    }
    
        
    if (userRes)
    {
        $scope.channelPage = '/static/api/templates/partial/channel.html';
        
        
        apiCall.get({
            type: 'music',
            owner: userRes.id,
            sortby: "-upload_date",
            limit: $scope.increment + 1,
        }, function (success) {
            $scope.owner = $scope.userAccount.properties.resource && userRes.id == $scope.userAccount.properties.resource.id;
            if (success.objects.length > $scope.increment)
                $scope.hasMore = true;
            else
                $scope.hasMore = false;
            $scope.uploads = success.objects.splice(0, $scope.increment);
            $scope.offset += $scope.uploads.length;
        });
    }
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
            username__iexact: $route.current.params.name,
        }, successCb);
        
        return deferred.promise;
    }
}

function IndexCtrl($scope, tracksRes, tracksRes2, apiCall)
{
    $scope.increment = 5; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.tracks1 = tracksRes;
    $scope.tracks2 = tracksRes2;
    $scope.offset = $scope.increment;
    
    if (tracksRes.length > $scope.increment)
    {
        $scope.hasMore = true;
        $scope.tracks1 = tracksRes.splice(0, $scope.increment);
        $scope.tracks2 = tracksRes2.splice(0, $scope.increment);
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
                $scope.tracks2.push(extraTracks[i]);
            $scope.offset = $scope.offset + extraTracks.length;
        });
        apiCall.get({
            type: 'music',
            sortby: '-views',
            offset: $scope.offset,
            limit: $scope.increment + 1,
        }, function(success) {
            if (success.objects.length > $scope.increment)
                $scope.hasMore = true;
            else
                $scope.hasMore = false;
            var extraTracks = success.objects.splice(0, $scope.increment)
            for (var i = 0; i < extraTracks.length; i++ )
                $scope.tracks1.push(extraTracks[i]);
            $scope.offset = $scope.offset + extraTracks.length;
        });
    }
    
}

IndexCtrl.resolve = {
    tracksRes: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb1 = function(result) {
            deferred.resolve(result.objects);
        };
        apiCall.get({
            type: 'music',
            sortby: '-views',
            limit: 6,
        }, successCb1);
        
        return deferred.promise;
    },
    
    tracksRes2: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb2 = function(result) {
            deferred.resolve(result.objects);
        };
        apiCall.get({
            type: 'music',
            sortby: '-upload_date',
            limit: 6,
        }, successCb2);
        
        return deferred.promise;
    }
}

function PlaybackCtrl($scope, $routeParams, trackRes, apiCall, userAccount, commentService)
{
    $scope.track = trackRes;
    $scope.increment = 5; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.offset = 0;
    $scope.voteallowed = true;
    $scope.votedlike = false;
    $scope.voteddislike = false;
    $scope.renderedPlayer = 0;
    
    // check here if musicRes != null etc
    if ($scope.track)
    {
        $scope.track.fulltitle = trackRes.artist + " - " + trackRes.title;
        $scope.playbackPage = '/static/api/templates/partial/playback.html'
        $scope.$on('doneRender', function(){
            $scope.renderedPlayer++;
            if ($scope.renderedPlayer < 5)
            {
                $("#jquery_jplayer_1").jPlayer({
                    ready: function () {
                        $(this).jPlayer("setMedia", {
                            mp3: trackRes.file,
                        });
                        if (userAccount.properties.resource)
                        {
                            if (userAccount.properties.resource.player_autoplay)
                                $(this).jPlayer("play"); // Attempts to Auto-Play the media
                        }
                        else
                            $(this).jPlayer("play"); // Attempts to Auto-Play the media
                    },
                    loop: userAccount.properties.resource ? userAccount.properties.resource.player_repeat:false,
                    swfPath: "static/api/swf/",
                    solution: userAccount.properties.resource ? (userAccount.properties.resource.player_format == 0 ? "flash, html":"html, flash"):"flash, html",
                    supplied: "mp3",
                    volume: userAccount.properties.resource ? userAccount.properties.resource.player_volume:0.5
                });
            }
        });
        $scope.loadMore = function() {
            apiCall.get({
                type: 'comment',
                sortby: '-post_date',
                base64id: $scope.track.base64id,
                offset: $scope.offset,
                limit: $scope.increment + 1,
            }, function(success) {
                if (success.objects.length > $scope.increment)
                    $scope.hasMore = true;
                else
                    $scope.hasMore = false;
                var extraComments = success.objects.splice(0, $scope.increment)
                for (var i = 0; i < extraComments.length; i++ )
                    $scope.comments.push(extraComments[i]);
                $scope.offset = $scope.offset + extraComments.length;
            });
        }
        
        $scope.addComment = function() {
            var text = commentService.properties.text;
            commentService.properties.text = '';
            apiCall.post({
                type: 'comment',
                id: 'post',
                fileid: $scope.track.id,
                commenttext: text,
            }, function(done) {
                $scope.comments.splice(0,0,{owner:userAccount.properties.resource.username, body:text, avatar:userAccount.properties.resource.avatar});
                $scope.offset += 1;
            });
        };
        
        if (trackRes.voted == "disallowed")
            $scope.voteallowed = false;
        else if (trackRes.voted == "like")
            $scope.votedlike = true;
        else if (trackRes.voted == "dislike")
            $scope.voteddislike = true;
    
        if (!$scope.voteallowed)
        {
            commentService.properties.text = 'Please login to post comments.';
            $scope.loginPlz = 'Login to vote.';
        }
        $scope.commentService = commentService;
        $scope.comments = new Array();
        $scope.loadMore();
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
                    if (voteType == "like")
                    {
                        $scope.votedlike = true;
                        $scope.voteddislike = false;
                    }
                    else
                    {
                        $scope.votedlike = false;
                        $scope.voteddislike = true;
                    }
                }
            });
        }
        else
        {
            // send msg that you can't vote if not logged in
        }
    }
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

function SearchCtrl($scope, $routeParams, apiCall, $timeout)
{
    $scope.increment = 10; // controls how many it will load per click
    $scope.hasMore = false;
    $scope.offset = 0;
    
    $scope.loading = '/static/api/img/loading.gif';
    $timeout(function() {
        apiCall.get({
            type: 'music',
            sortby: '-views',
            query: $routeParams.q,
            limit: 100,
        }, function (success) {
            $scope.allResults = success.objects;
            var len = success.objects.length;
            $scope.hasMore = len > $scope.increment;
            $scope.offset = len > $scope.increment ? $scope.increment:len;
            if (len == 0)
                $scope.noResults = 'No matches found!';
            else
                $scope.results = (0, 0, $scope.allResults.splice(0, $scope.increment));
            $scope.loading = undefined;
        });

    }, 3000); 
    
    $scope.loadMore = function () {
        var objs = $scope.allResults.splice($scope.offset, $scope.increment)
        if (objs.length <= $scope.increment)
            hasMore = false;
        $scope.results.splice(0, 0, objs);
        $scope.offset += objs.length;
    };
}

SearchCtrl.resolve = {
    resultsRes: function ($q, $route, $timeout, apiCall) {
        var deferred = $q.defer();
        var successCb1 = function(result) {
            deferred.resolve(result.objects);
        };
        apiCall.get({
            type: 'music',
            sortby: '-views',
            limit: 100,
        }, successCb1);
        
        return deferred.promise;
    },
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
