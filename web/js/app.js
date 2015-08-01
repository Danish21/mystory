angular.module('summerproject',['ngRoute', 'ngResource','appname.controllers', 'appname.services','ngAnimate','toastr','textAngular']).
	config(['$routeProvider', function($routeProvider){
		'use strict';
		$routeProvider.
		 when('/', {title: 'Home', templateUrl: 'partials/home.html', navLocation: 'navHome', controller: 'homeCtrl'})
		.when('/login', {title: 'Home', templateUrl: 'partials/login.html', navLocation: 'navLogin', controller: 'tempCtrl', resolve: {loginRedirect: loginRedirect }})
		.when('/signup', {title: 'signup', templateUrl: 'partials/signup.html', navLocation: 'navSignup', controller: 'signupCtrl'})
		.when('/profile', {title: 'Profile', templateUrl: 'partials/profile.html', navLocation: 'navProfile', controller: 'profileCtrl', resolve: {logincheck: checkLogin}})
		.when('/story/:userid', {title: 'Story', templateUrl: 'partials/story.html', navLocation: 'navStory', controller: 'storyCtrl'})
		.otherwise({ redirectTo: '/login'});
	}]).
    run(['$rootScope', '$q', '$http', '$location', '$routeParams', function ($rootScope, $q, $http, $location, $routeParams) {

    	var loginSetIntialData = function () {

			$http.get('/api/loggedin').success(function (user) {
				if (user!=0) {
					$rootScope.currentUser = user;
				} 
				//User is not Authenticated
				else {
					$rootScope.currentUser =undefined;
				}
			}).error(function(result){
				$rootScope.currentUser =undefined;
			});
		}();
		$rootScope.$on('$routeChangeSuccess', function (scope, current, pre) {
            //console.log('$routeChangeSuccess: ' + $location.path());
            var path = $location.path();
            path = path.substring(1, path.length);

            // Set the current route path for current page tab highlighting
            $rootScope.navLocation = current.$$route.navLocation;
        });

    }]);

	var checkLogin =  function  ($q, $http, $location,$rootScope,toastr) {
		var deffered = $q.defer();

		$http.get('/api/loggedin').success(function (user) {
			//User is authenticated
			if (user!=0) {
				$rootScope.currentUser = user;
				deffered.resolve();
			} 
			//User is not Authenticated
			else {
				$rootScope.currentUser = undefined;
				deffered.reject();
				$location.url('/login');
				toastr.error('Please Login First');
			}
		}).error(function(result){
			$location.url('/login');
		});
		
	};

	var loginRedirect = function ($q, $http, $location,$rootScope) {
		var deffered = $q.defer();
		$http.get('/api/loggedin').success(function (user) {
			//User is authenticated
			if (user!=0) {
				$rootScope.currentUser = user;
				deffered.reject();
				$location.url('/profile');
			} 
			//User is not Authenticated
			else {
				$rootScope.currentUser = undefined;
				deffered.resolve();
			}
		})
	};


	