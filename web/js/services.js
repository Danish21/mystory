angular.module('appname.services',[])
.factory('ulhttp', function ($http,toastr) {
	return {
		handleError: function (result) {
			result = result.data;
			if(result.status!== 'OK'){
				toastr.error(result.message);
			} 
			return result;
		},
		post: function (url, data) {
			return $http.post(url,data);
		},
		get: function (url,data) { 
			return $http.get(url, data);
		}
	};
})
.factory('logginService', function(ulhttp){
	return {
		loggin: function (email,password) {
			var url = "http://localhost:3000/api/login";
			var data = {
				email: email,
				password: password
			};
			return ulhttp.post(url,data).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		}
	};
})
.factory('logoutService', function(ulhttp,$rootScope,toastr, $location){
	return {
		logout: function (email,password) {
			var url = "http://localhost:3000/api/logout";
			ulhttp.get(url).then(function (result) {
				if(result.data.status === 'OK'){
					toastr.success('Logged Out');
					$location.path('/login');
				} else {
					toastr.error('Something went wrong');
				}
			});
		}
	};
})
.factory('signupService', function(ulhttp){
	return {
		signup: function (data) {
			var url = "http://localhost:3000/api/signup";
			return ulhttp.post(url,data).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		}
	};
})
.factory('profileService', function(ulhttp){
	return {
		getUserInfo: function (data) {
			var url = "http://localhost:3000/api/getuserinfo";
			return ulhttp.get(url,data).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},
		updateStory: function (story) {
			var url = "http://localhost:3000/api/updatestory";
			return ulhttp.post(url,{story: story}).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},
		getAnswered:  function () {
			var url = "http://localhost:3000/api/getansweredquestions";
			return ulhttp.get(url).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},
		getUnanswered: function () {
			var url = "http://localhost:3000/api/getunansweredquestions";
			return ulhttp.get(url).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},

		updateQuestion: function (question) {
			var url = "http://localhost:3000/api/updatequestion";
			return ulhttp.post(url,{question: question}).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},
		confirmUserEmail: function (confirmationCode) {
			var url = "http://localhost:3000/api/confirmemail";
			return ulhttp.post(url,{confirmationCode: confirmationCode}).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		}

	};
})
.factory('storyService', function(ulhttp){
	return {
		getSafeUserInfo: function (userid) {
			var url = "http://localhost:3000/api/getsafeuserinfo";
			return ulhttp.post(url,{userid:userid}).then(function (result) {
				result = ulhttp.handleError(result);
				return result;
			});
		},
	};
});