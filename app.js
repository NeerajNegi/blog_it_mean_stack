//application name and dependencies
var app = angular.module('myApp', ["ui.router","ngToast","textAngular"]);

app.run(function($rootScope, AuthService, $state, $transitions){
	//checks if user is already logged in or not
	/*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if(toState.authenticate == true){
			AuthService.isAuthenticated()
			.then(function(res){
				if(res == false){
					$state.go('login');
				}
			});
		}
		console.log(fromState);
		console.log(toState);
	})*/
	$transitions.onStart({}, function(transition){
		if(transition.$to().self.authenticate == true){
			AuthService.isAuthenticated()
			.then(function(res){
				console.log(res);
				if(res == false){
					$state.go('login');
				}
			});
		}
	});
});

app.config(function($stateProvider,$locationProvider,$urlRouterProvider) {
	//Stamplay app name, also edit stamplay.json if changes are to be made
	Stamplay.init('blogitneeraj');
	//setting location prefix for url
	$locationProvider.hashPrefix('');
	//defining states
    $stateProvider
    .state('home', {
    	url: '/home',
        templateUrl : "template/home.html",
        controller: "HomeCtrl"
    })
    .state('login', {
    	url: '/login',
        templateUrl : "template/login.html",
        controller: "LoginCtrl"
    })
    .state('MyBlogs',{
    	url: '/myBlogs',
    	templateUrl: 'template/myBlogs.html',
    	controller: 'MyBlogsCtrl',
    	authenticate: true
    })
    .state('Create',{
    	url: '/create',
    	templateUrl: 'template/create.html',
    	controller: 'CreateCtrl',
    	authenticate: true
    })
    .state('Edit',{
    	url: '/edit/:id',
    	templateUrl: 'template/edit.html',
    	controller: 'EditCtrl',
    	authenticate: true
    })
    .state('View',{
    	url: '/view/:id',
    	templateUrl: 'template/view.html',
    	controller: 'ViewCtrl'
    })
    .state('signup',{
    	url: '/signup',
    	templateUrl : "template/signup.html",
    	controller: "SignupCtrl"
    });			
    $urlRouterProvider.otherwise("/home");
});

app.factory('AuthService',function($q,$rootScope){
	return{
		isAuthenticated : function(){
			var defer = $q.defer();
			Stamplay.User.currentUser(function(err,res){
				if(err){
					defer.resolve(false);
					$rootScope.loggedIn = false;
				}
				if(res.user){
					defer.resolve(true);
					$rootScope.loggedIn = true;
				}
				else {
					defer.resolve(false); 
					$rootScope.loggedIn = false;
				}
			});
			return defer.promise;
		}
	}
});

app.filter('htmlToPlainText',function(){
	return function(text){
		return text ? String(text).replace(/<[^>]+>/gm, '') : '';
	}
});
app.controller('ViewCtrl',function(taOptions, $state, $scope, $stateParams, $timeout, ngToast){
	$scope.blog = {};
	$scope.upVoteCount = 0;
	$scope.downVoteCount = 5;
	Stamplay.Object("blogs").get({_id: $stateParams.id})
	.then(function(res){
		console.log(res);
		$scope.blog=res.data[0];
		$scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
		$scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
		$scope.$apply();
		console.log($scope.blog);
	}, function(err){
		console.log(err);
	});

	$scope.postComment = function(){
		Stamplay.Object("blogs").comment($stateParams.id, $scope.comment)
		.then(function(res){
			console.log(res);
			$scope.blog = res;
			$scope.comment = "";
			$scope.comment = $rootScope.newUser.displayName+"";
			$scope.$apply();
		}, function(err){
			console.log(err);
			if(err.code == 403){
				console.log("Login first!");
				$timeout(function(){
					ngToast.create('<a href="#/login" class="">Please Login First.</a>');
				});
			}
		});
	}

	$scope.upVote = function(){
		Stamplay.Object("blogs").upVote($stateParams.id)
		.then(function(res){
			console.log(res);
			$scope.blog = res;
			$scope.comment = "";
			$scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
			$scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
			$scope.$apply();
		}, function(err){
			if(err.code == 403){
				console.log("Login First");
				$timeout(function(){
					ngToast.create('<a href="#/login" class="">Please Login First.</a>');
				});
			}
			if(err.code == 406){
				console.log("Already Voted!");
				$timeout(function(){
					ngToast.create('You have already voted on this Post!');
				});
			}
		})
	}
	$scope.downVote = function(){
		Stamplay.Object("blogs").downVote($stateParams.id)
		.then(function(res){
			console.log(res);
			$scope.blog = res;
			$scope.comment = "";
			$scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
			$scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
			$scope.$apply();
		}, function(err){
			if(err.code == 403){
				console.log("Login First");
				$timeout(function(){
					ngToast.create('<a href="#/login" class="">Please Login First.</a>');
				});
			}
			if(err.code == 406){
				console.log("Already Voted!");
				$timeout(function(){
					ngToast.create('You have already voted on this Post!');
				});
			}
		})
	}
});

app.controller('EditCtrl',function(taOptions, $state, $scope, $stateParams, $timeout, ngToast){
	$scope.Post = {};
	taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  	];
  	Stamplay.Object("blogs").get({_id: $stateParams.id})
  	.then(function(res){
  		console.log(res);
  		$scope.Post=res.data[0];
  		$scope.$apply();
  		console.log($scope.Post);
  	}, function(err){
  		console.log(err);
  	});
  	$scope.update = function(){
  		Stamplay.User.currentUser().then(function(res){
  			if(res.user){
  				if(res.user._id == $scope.Post.owner){
  					Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
  					.then(function(response){
  						console.log(response);
  						$state.go("MyBlogs");
  						$timeout(function(){
	  						ngToast.create("Post Updated Successfully");
	  					});
  					}, function(error){
  						console.log(error);
  						$timeout(function(){
		  					ngToast.create("Some Error occured! Please try again.");
		  				});
  					});
  				} else {
  					$state.go('login');
  					$timeout(function(){
		  				ngToast.create("You should be logged in before editing post!");
		  			});
  				}
  			} else {
  				$state.go('login');
  				$timeout(function(){
		  			ngToast.create("You should be logged in before editing post!");
		  		});
  			}
  		}, function(err){
  			console.log(err);
  			$timeout(function(){
		  		ngToast.create("Some Error occured! Please try again.");
		  	});
  		});
  	}
});

app.controller('CreateCtrl', function(taOptions, $state, $scope, $timeout, ngToast){
	$scope.newPost = {};
	taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  	];
	  $scope.Create = function(){
	  	Stamplay.User.currentUser()
	  	.then(function(res){
	  		if(res.user){
	  			//proceed with creation of the post
	  			Stamplay.Object("blogs").save($scope.newPost)
	  			.then(function(res){
	  				$timeout(function(){
	  					ngToast.create("Post Created Successfully");
	  				});
	  				$state.go("MyBlogs"); 
	  			}, function(err){
	  				$timeout(function(){
	  					ngToast.create("An error has occured.");
	  				});
	  				console.log(err);
	  			})
	  		} else {
	  			$state.go('login');
	  		}
	  	}, function(err){
	  		$timeout(function(){
	  			ngToast.create("An error has occured. Please try later!");
	  		});
	  		console.log(err);
	  	})
	  }
});
app.controller('HomeCtrl', function($scope, $http){
	$scope.searchQuery = "";
	Stamplay.Object("blogs").get({sort: "-dt_create"})
	.then(function(res){
		console.log(res);
		$scope.latestBlogs = res.data;
		$scope.$apply();
		console.log($scope.latestBlogs);
	}, function(err){
		console.log(err);
	});
});

app.controller('LoginCtrl', function($scope, $state, $timeout, $rootScope, ngToast){
	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(res){
			console.log(res);
			//if user is already logged in
			if(res.user){
				$timeout(function(){
					ngToast.create("Logged In!");
					$rootScope.loggedIn = true;
					//getting full name of the user
					$rootScope.displayName = res.user.firstName+ " " +res.user.lastName;		
					console.log($rootScope.displayName);		
					$state.go("MyBlogs");
				});
			} else {
				//if no user is logged in, then try loggin in
				Stamplay.User.login($scope.user)
				.then(function(res){
					$timeout(function(){
						ngToast.create("Logged In!");
						console.log("logged In" + res);
						$rootScope.loggedIn = true;
						$rootScope.displayName = res.firstName+ " " +res.lastName;
						console.log($rootScope.displayName);
						$state.go("MyBlogs");
					});
				}, function(err){
					$timeout(function() {
						ngToast.create("Some error has occured!");
					});
					console.log(err);
					$rootScope.loggedIn = false;
				});
			}
		}, function(error){
			console.log(error);
		});
	}

});

app.controller('SignupCtrl', function($scope, ngToast, $state){
	$scope.newUser = {};
	$scope.signup = function(){
		$scope.newUser.displayName=$scope.newUser.firstName+" "+$scope.newUser.lastName;
		//checking user inputed values
		if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
			console.log("All fields are valid!");
			//if values are valid then check for password match
			if($scope.newUser.password == $scope.newUser.confirmPassword){
				console.log("All good! Let's sign up!");
				//creating new user in Stamplay
				Stamplay.User.signup($scope.newUser)
				.then(function(response){
					$timeout(function(){
						ngToast.create("Account Created Successfully!");
						$state.go('login');
						ngToast.create("Login with your new Account!");
					});
					console.log(response);
				}, function(error){
					$timeout(function(){
						ngToast.create("Sorry! There were some errors!");
					});
					console.log(error);
				});
			} else {
				ngToast.create("Passwords do not match!");
				console.log("Password do not match!");
			}
		} else {
			ngToast.create("Some fields are invalid!");
			console.log("Some fields are invalid!");
		}
	};
});

app.controller('MyBlogsCtrl', function($scope, $state){
	Stamplay.User.currentUser(function(err, res){
		if(res.user){
			Stamplay.Object("blogs").get({owner: res.user._id, sort: "-dt_create"})
			.then(function(res){
				console.log(res);
				$scope.len = res.data.length;
				console.log($scope.len);
				$scope.userBlogs = res.data;
				$scope.$apply();
				console.log($scope.userBlogs);
			}, function(err){
				console.log(err);
			});
		} else {
			$state.go('login');
		}
	}, function(err){
		console.log(err);
	});
});

app.controller('MainCtrl', function($scope, $rootScope, $timeout, ngToast){
	$scope.logout = function(){
		console.log("logout called");
		Stamplay.User.logout(true, function(){
			console.log("Logged out!");

			$timeout(function(){
				$rootScope.loggedIn = false;
				$timeout(function(){
		  			ngToast.create("Logged Out!");
		  		});
			});
		});
	}
});