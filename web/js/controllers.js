angular.module('appname.controllers',[])
.controller('BaseCtrl', ['$scope', 'logoutService','toastr','$location','$rootScope', function ($scope,logoutService,toastr,$location,$rootScope) {
        $scope.logout = function () {
        	logoutService.logout();
        };
 }])
.controller('homeCtrl', ['$scope', 'logoutService','toastr','$location','$rootScope', function ($scope,logoutService,toastr,$location,$rootScope,universities) {
 	
 }])
.controller('storyCtrl', ['$scope','$routeParams', 'storyService', 'toastr', function ($scope,$routeParams,storyService) {
	$scope.init = function () {
		$scope.userid = $routeParams.userid;
		if ($scope.userid) { 
			storyService.getSafeUserInfo($scope.userid).then(function (result){
				if (result.status === 'OK') {
					$scope.user = result.data;
				}
			});
		}
	};
	$scope.submitQuestion = function (question) {
		// alert('Are you sure you want to submit the question?');
		$scope.question = $routeParams.question;
		if ($scope.question) {
			storyService.getQuestion($scope.question).then( function (result){
				if (result.status === 'OK') {
					toastr.success('Question submitted');
				}
			});
		} else {
			toastr.error('Must enter a question');
		}
	};
	$scope.init();
 }])
.controller('tempCtrl',['$scope', 'logginService', 'logoutService','toastr','$rootScope','$location', function($scope, logginService,logoutService,toastr,$rootScope,$location){
	$scope.login = function () {
		if ($scope.email && $scope.password) {
			logginService.loggin($scope.email,$scope.password).then(function (result) {
				if(result.status === 'OK'){
					$rootScope.currentUser = result.user;
					$location.path('/profile');
					toastr.success('Logged In');
				}
			});
		} else {
			toastr.error('Must provide a valid email and password');
		}
	};
}])
.controller('signupCtrl',['$scope','signupService','toastr','$rootScope','$location','universities', function($scope,signupService,toastr,$rootScope,$location,universities){
	$scope.signup = function () {
		if($scope.firstName && $scope.lastName && $scope.email && $scope.password){
			var data= {
				email: $scope.email,
				password: $scope.password,
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				department: $scope.department,
				university: $scope.university
			};
			signupService.signup(data).then(function (result) {
				if(result.status === 'OK'){
					toastr.success('We have emailed you a link to confirm your email. Please confirm your email and you will ready to go!');
					$location.path('/login');
				}
			});
		} else {
			toastr.error('All fields are required');
		}
	};
	$scope.universities = universities.names.sort(); //need to make it so list is already sorted
	$scope.departments = universities.departments.sort();

	
}])
.controller('profileCtrl',['$scope','profileService','$rootScope','toastr', function($scope,profileService,$rootScope,toastr){
	$scope.getuserinfo = function () {
		profileService.getUserInfo().then(function (result) {
			if (result.status === 'OK') {
				$scope.user = result.data;
			} 
		});
	};
	$scope.saveStory = function (story) {
		profileService.updateStory(story).then(function (result) {
			if (result.status === 'OK') {
				toastr.success('Story Saved');
				$scope.editstory = false;
			}
		});
	};
	$scope.editstory =false;
	$scope.getuserinfo();
}])
.controller('confirmCtrl',['$scope','profileService','$rootScope','toastr','$location', function($scope,profileService,$rootScope,toastr,$location){
	$scope.confirmUserEmail = function (confirmationCode) {
		profileService.confirmUserEmail(confirmationCode).then(function(result){
			if(result.status === 'OK') {
				$scope.emailConfirmed = true;
				toastr.success('You can now login');
				$location.path('/login');
			}
		});
	};
	$scope.confirmUserEmail($location.search().c);
}])
.controller('qandaCtrl',['$scope','profileService','$rootScope','toastr', function($scope,profileService,$rootScope,toastr){
	$scope.getAnswered = function () {
		console.log('in getAnswered');
		profileService.getAnswered().then(function (result) {
			if (result.status === 'OK') {
				console.log(result.data);
				$scope.QandAs = result.data;
			}
		});
	};
	$scope.getUnanswered = function (story) {
		console.log('in getUnanswered');
		profileService.getUnanswered().then(function (result) {
			if (result.status === 'OK') {
				console.log(result.data);
				$scope.QandAs = result.data;
			}
		});
	};

	// $scope.saveQuestion = function (question) {
	// 	profileService.submitQuestion(question).then(function (result) {
	// 		if (result.status === 'OK') {
	// 			toastr.success('Question Submitted');
	// 			$scope.askquestion = false;
	// 		}
	// 	});
	// };

	$scope.askquestion = false;

}]);

