angular.module('summerproject',['ngRoute', 'ngResource','appname.controllers', 'appname.services','ngAnimate','toastr','textAngular','UniversityService','ui.bootstrap']).
	config(['$routeProvider', function($routeProvider){
		'use strict';
		$routeProvider.
		 when('/', {title: 'Home', templateUrl: 'partials/home.html', navLocation: 'navHome', controller: 'homeCtrl', resolve: {loginRedirect: loginRedirect}})
		.when('/login', {title: 'Home', templateUrl: 'partials/login.html', navLocation: 'navLogin', controller: 'tempCtrl', resolve: {loginRedirect: loginRedirect }})
		.when('/signup', {title: 'signup', templateUrl: 'partials/signup.html', navLocation: 'navSignup', controller: 'signupCtrl'})
		.when('/profile', {title: 'Profile', templateUrl: 'partials/profile.html', navLocation: 'navProfile', controller: 'profileCtrl', resolve: {logincheck: checkLogin}})
		.when('/q&a', {title: 'Q&A', templateUrl: 'partials/qanda.html', navLocation: 'navQandA', controller: 'qandaCtrl', resolve: {logincheck: checkLogin}})

		.when('/confirm', {title: 'Confirm Email', templateUrl: 'partials/confirm.html', navLocation: 'navConfirm', controller: 'confirmCtrl'})
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
		var deferred = $q.defer();

		$http.get('/api/loggedin').success(function (user) {
			//User is authenticated
			if (user!=0) {
				$rootScope.currentUser = user;
				deferred.resolve();
			} 
			//User is not Authenticated
			else {
				$rootScope.currentUser = undefined;
				deferred.reject();
				$location.url('/');
				toastr.error('Please Login First');
			}
		}).error(function(result){
			$location.url('/');
		});
		
	};

	var loginRedirect = function ($q, $http, $location,$rootScope) {
		var deferred = $q.defer();
		$http.get('/api/loggedin').success(function (user) {
			//User is authenticated
			if (user!=0) {
				$rootScope.currentUser = user;
				deferred.reject();
				$location.url('/profile');
			} 
			//User is not Authenticated
			else {
				$rootScope.currentUser = undefined;
				deferred.resolve();
			}
		})
	};


	