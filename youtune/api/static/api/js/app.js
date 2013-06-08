var app = angular.module('youtune');

app.config([ '$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
			$routeProvider.when('/', {
				templateUrl : '/static/api/templates/index.html',
				controller : IndexCtrl,
				resolve : IndexCtrl.resolve
			}).when('/details', {
				templateUrl : '/static/api/templates/details.html'
			}).when('/register', {
				templateUrl : '/static/api/templates/registration.html'
			}).when('/upload', {
				templateUrl : '/static/api/templates/upload.html',
				controller : YouTuneUploadCtrl
			}).when('/upload/delete/:id', {
				templateUrl : '/static/api/templates/upload_delete.html',
				controller : YouTuneUploadDelete
			}).when('/user/:name/settings', {
				templateUrl : '/static/api/templates/settings.html',
				controller : SettingsCtrl,
				resolve : SettingsCtrl.resolve,
			}).when('/user/:name', {
				templateUrl : '/static/api/templates/channel.html',
				controller : ChannelCtrl,
				resolve : ChannelCtrl.resolve
			}).when('/listen/:id', {
				templateUrl : '/static/api/templates/playback.html',
				controller : PlaybackCtrl,
				resolve : PlaybackCtrl.resolve
			}).when('/search', {
				templateUrl : '/static/api/templates/search.html',
				controller : SearchCtrl,
				resolve : SearchCtrl.resolve
			}).otherwise({
				redirectTo : '/'
			});
		} ]);

app.run(function($rootScope, userAccount) {
	userAccount.initUser();
});

app.directive('imageFit', function() {
	return {
		link : function(scope, element, attrs) {
			$(window).load(function() {
				$(element).imagefit();
			});
		}
	};
});

app.directive('social', function($http) {
	return {
		restrict : 'A',
		scope : true,
		link : function($scope, el, $attrs) {
			(function(d) {
				var fb, tw, po, fid = 'facebook-jssdk', tid = 'twitter-jssdk', gid = 'google-jssdk';
				
				if (!d.getElementById(fid)) {
					fb = d.createElement('script');
					fb.id = fid;
					fb.async = true;
					fb.src = "//connect.facebook.net/en_US/all.js";
					el.append(fb);
				}
				
				if (!d.getElementById(tid)) {
					tw = d.createElement('script');
					tw.id = tid;
					tw.src = '//platform.twitter.com/widgets.js';
					el.append(tw);
				}
				
				if (!d.getElementById(gid)) {
					po = d.createElement('script');
					po.id = gid;
					po.async = true;
					po.src = 'https://apis.google.com/js/plusone.js';
					el.append(po);
				}
			}(document));
		}
	}
});
