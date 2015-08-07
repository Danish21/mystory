angular.module('appname.controllers',[])
.controller('BaseCtrl', ['$scope', 'logoutService','toastr','$location','$rootScope', function ($scope,logoutService,toastr,$location,$rootScope) {
        $scope.logout = function () {
        	logoutService.logout();
        };
 }])
.controller('homeCtrl', ['$scope', 'logoutService','toastr','$location','$rootScope', function ($scope,logoutService,toastr,$location,$rootScope,universities) {
 	
 }])
.controller('storyCtrl', ['$scope','$rootScope','$routeParams', 'storyService','toastr','$location', function ($scope,$rootScope,$routeParams,storyService,toastr,$location) {
	//Include anything we want to use in t controller in the array and the function that meaning any service or adittioanl libraries like the toastr, the place in the array and place of 
	//inclusion in the fuction must match. I.E ['$scope','toastr', function(toastr,$scope)] will not work as $scope should be first in the function
	$scope.init = function () {
		$scope.userid = $routeParams.userid;
		if ($scope.userid) { 
			storyService.getSafeUserInfo($scope.userid).then(function (result) {
				if (result.status === 'OK') {
					$scope.user = result.data;
				} else {
					$location.path('/login');
				}
			});
			storyService.getPublicQuestions($scope.userid).then(function (result) {
				if(result.status === 'OK') {
					$scope.questions = result.data;
					console.log($scope.questions);
				}
			});
		}
	};

	$scope.submitQuestion = function () {
		if ($scope.questionText) { //check if there actually text typed in
			var question = { //creating a question object because this what the 
				text: $scope.questionText,
				author: $scope.user._id //look at the function to see where $scope.user is set
			};
			storyService.submitQuestion(question).then(function (result) { //calling the service right here to prevent code reuse if some other place needs to calls this method
			//If you follow this service that ultimately all this lead to is an $http.post("http://localhost:3000/api/submitquestion", question); which we could of done right here if we want to
			//and included //$http in our controller
			if(confirm("Are you sure you want to submit the question?")){
				if(result.status === 'OK') {
					if(confirm("Are you sure you want to submit the question?")){
						toastr.success('Your Question has been Submitted');
						$scope.questionText = null;
						$scope.askquestion = false;
					}
				}
			}
			});
		} else {
			toastr.error('Please ask a question');
		}
	};
	$scope.init(); //this code is function is called as soon as the controller is intialized or soon as story.html page loads and basically gets the story
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
	$scope.updateStoryPublicity = function () {
		profileService.updateStoryPublicity($scope.user.public).then(function (result) {
			if (result.status === 'OK') {
				toastr.success('Story publicity saved');
			}
		});
	}
	$scope.init = function () {
		$scope.editstory =false;
		$scope.getuserinfo();
	};
	$scope.init();
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
		profileService.getAnswered().then(function (result) {
			if (result.status === 'OK') {
				$scope.questions = result.data;
				$scope.showAnswered = true;
			}
		});
	};
	$scope.getUnanswered = function () {
		profileService.getUnanswered().then(function (result) {
			if (result.status === 'OK') {
				$scope.questions = result.data;
				$scope.showAnswered = false;
			}
		});
	};
	$scope.updateAnswer = function (question) {
		profileService.updateAnswer(question).then(function (result) {
			if (result.status === 'OK') {
				toastr.success('Answer Updated');
				question.showAnswerField = false;	
			}
		});
	};
	$scope.updateQuestionPublicity = function (question) {
		profileService.updateQuestionPublicity(question).then(function (result) {
			if (result.status === 'OK') {
				toastr.success('Question publicity updated');
			}
		});
	};
	$scope.init = function () {
		$scope.getAnswered();
		$scope.showAnswered = true;
	};
	$scope.init();
}]);

