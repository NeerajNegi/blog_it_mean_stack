//application name and dependencies
var app = angular.module('myApp', ["ui.router", "ngToast", "textAngular"]);

app.run(function($rootScope, $state, $transitions) {

    //set global parameters
    $rootScope.loggedIn = false;
    $rootScope.displayName = '';
    $rootScope.userId = '';

    $transitions.onStart({}, function(transition) {
        if (transition.$to().self.authenticate == true) {
            if ($rootScope.loggedIn == false) {
                $state.go('login');
            }
        }
    });
});


app.config(function($stateProvider, $locationProvider, $urlRouterProvider, ngToastProvider) {

    ngToastProvider.configure({
        animation: 'slide',
        horizontalPosition: 'right',
        verticalPosition: 'top',
        maxNumber: 1,
        dismissBUtton: true
    });

    //setting location prefix for url
    $locationProvider.hashPrefix('');
    //defining states
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: "template/home.html",
            controller: "HomeCtrl"
        })
        .state('login', {
            url: '/login',
            templateUrl: "template/login.html",
            controller: "LoginCtrl"
        })
        .state('MyBlogs', {
            url: '/myBlogs',
            templateUrl: 'template/myBlogs.html',
            controller: 'MyBlogsCtrl',
            authenticate: true
        })
        .state('Create', {
            url: '/create',
            templateUrl: 'template/create.html',
            controller: 'CreateCtrl',
            authenticate: true
        })
        .state('Edit', {
            url: '/edit/:id',
            templateUrl: 'template/edit.html',
            controller: 'EditCtrl',
            authenticate: true
        })
        .state('View', {
            url: '/view/:id',
            templateUrl: 'template/view.html',
            controller: 'ViewCtrl'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: "template/signup.html",
            controller: "SignupCtrl"
        });
    $urlRouterProvider.otherwise("/home");
});

app.filter('htmlToPlainText', function() {
    return function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
});
app.controller('ViewCtrl', function(taOptions, $state, $scope, $stateParams, $timeout, ngToast, $http, $rootScope) {
    $scope.blog = {};
    var id = $stateParams.id;
    var url = "/api/blogs/Blog/" + $stateParams.id;
    $http.get(url)
        .then(function(success) {
            $scope.blog = success.data.blog;
            //console.log("Blog retrieved successfully");
            //console.log($scope.blog);
            $timeout(function() {
                ngToast.create("Blog retrieved successfully.");
            });
        }, function(err) {
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'Some Error has occured'
                });
            });
            //console.log("Some error has occured.");
        });

    $scope.upVote = function(){
        if($rootScope.loggedIn === true){
            if($scope.blog.author_id === $rootScope.userId){
                $timeout(function() {
                    ngToast.create({
                        className: 'warning',
                        content: `Really, would you upvote your own blog? `
                    });
                });
            } else {
                var url = "/api/blogs/upvote/" + id;
                $http.get(url)
                    .then(function(success){
                        $scope.blog = success.data.blog;
                        //console.log("upvote success");
                    }, function(err){
                        $timeout(function() {
                            ngToast.create({
                                className: 'warning',
                                content: 'Some Error has occured'
                            });
                        });
                       //console.log("Some error has occured.");
                    });
            }
        } else {
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'You need to be logged in to Up vote.'
                });
            });
        }
    }

    $scope.downVote = function(){
        if($rootScope.loggedIn === true){
            if($scope.blog.author_id === $rootScope.userId){
                $timeout(function() {
                    ngToast.create({
                        className: 'warning',
                        content: `Don't be hard on yourself, It's your own blog? `
                    });
                });
            } else {
                var url = "/api/blogs/downvote/" + id;
                $http.get(url)
                    .then(function(success){
                        $scope.blog = success.data.blog;
                        //console.log("downvote success");
                    }, function(err){
                        $timeout(function() {
                            ngToast.create({
                                className: 'warning',
                                content: 'Some Error has occured'
                            });
                        });
                        //console.log("Some error has occured.");
                    });
            }
        } else {
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'You need to be logged in to Down vote.'
                });
            });
        }
    }

});

app.controller('EditCtrl', function(taOptions, $state, $scope, $stateParams, $timeout, ngToast, $http) {
    $scope.Post = {};
    taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['html', 'insertLink', 'wordcount', 'charcount']
    ];

    var url = "/api/blogs/Blog/" + $stateParams.id;
    $http.get(url)
        .then(function(success) {
            $scope.Post = success.data.blog;
            //console.log("Blog retrieved successfully");
            //console.log($scope.Post);
            $timeout(function() {
                ngToast.create("Blog retrieved successfully.");
            });
        }, function(err) {
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'Some Error has occured'
                });
            });
            //console.log("Some error has occured.");
        });

    $scope.update = function(){
        //console.log("update called");
        var url = "/api/blogs/update/" + $stateParams.id;
        $http.post(url, $scope.Post)
        .then(function(success){
            $state.go('MyBlogs');
            $timeout(function() {
                ngToast.create("Blog updated successfully.");
            });
        }, function(err){
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'Some Error has occured'
                });
            });
        })
    }
});

app.controller('CreateCtrl', function(taOptions, $state, $scope, $timeout, ngToast, $http, $rootScope) {
    $scope.newPost = {};
    taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['html', 'insertLink', 'wordcount', 'charcount']
    ];

    $scope.create = function() {

       //console.log("Publish Button Pressed");

        if ($scope.newPost.title && $scope.newPost.content) {
            $scope.newPost.author_id = $rootScope.userId;
            $scope.newPost.upVoteCount = 0;
            $scope.newPost.downVoteCount = 0;
            var url = "/api/blogs/Blog";
            $http.post(url, $scope.newPost)
                .then(function(success) {
                    //console.log("Blog Added successfully");
                    //console.log(success);
                    $state.go('MyBlogs');
                    $timeout(function() {
                        ngToast.create('Blog Added!');
                    });
                }, function(err) {
                    //console.log("Error adding Blog");
                    //console.log(err);
                    $timeout(function() {
                        ngToast.create({
                            className: 'warning',
                            content: 'Some Error has occured'
                        });
                    });
                });

        } else {
            $timeout(function() {
                ngToast.create({
                    className: 'warning',
                    content: 'Enter All the fields.'
                });
            });
        }
    }
});
app.controller('HomeCtrl', function($scope, $http, $rootScope, $state) {
    $scope.Blogs = [];
    $scope.logout = function() {
        $rootScope.loggedIn = false;
    }
    var url = "/api/blogs/Blogs";
    $http.get(url)
        .then(function(success) {
            $scope.Blogs = success.data.blogs;
            //console.log(success);
        }, function(err) {
            //console.log("err");
        });

    $state.go('home');
});

app.controller('LoginCtrl', function($rootScope, $scope, $state, $timeout, $rootScope, ngToast, $http) {

    $scope.user = {};

    $scope.login = function() {

        if ($scope.user.email && $scope.user.password) {
            //console.log("All fields are valid");

            var url = "api/user/login";
            $http.post(url, $scope.user)
                .then(function(success) {
                    //console.log("User logged in");
                    $rootScope.displayName = success.data.displayName;
                    $rootScope.userId = success.data.id;
                    //console.log(success);
                    $state.go('home');
                    $timeout(function() {
                        ngToast.create('User Logged In!');
                        $rootScope.loggedIn = true;
                        //console.log($rootScope.loggedIn);
                    });
                }, function(err) {
                    //console.log("User not found or some error has occured.");
                    //console.log(err);
                    $timeout(function() {
                        ngToast.create({
                            className: 'warning',
                            content: 'Some Error has occured'
                        });
                    });
                });
        }
    }
});

app.controller('SignupCtrl', function($scope, ngToast, $state, $http, $timeout) {

    $scope.newUser = {};

    $scope.signup = function() {

        $scope.newUser.displayName = $scope.newUser.firstName + " " + $scope.newUser.lastName;

        //checking user inputed values
        if ($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword) {
            //console.log("All fields are valid!");
            //console.log($scope.newUser);

            //if values are valid then check for password match
            if ($scope.newUser.password == $scope.newUser.confirmPassword) {
                //console.log("All good! Let's sign up!");
                //creating new user

                var url = "api/user/signup";
                $http.post(url, $scope.newUser)
                    .then(function(success) {
                        //console.log(success);
                        //console.log("User added succesfully");
                        $state.go('home');
                        $timeout(function() {
                            ngToast.create("User added successfully.");
                        });
                    }, function(error) {
                        //console.log(error);
                        $timeout(function() {
                            ngToast.create(error.data.message);
                        });
                    });
            } else {
                ngToast.create({
                    className: 'warning',
                    content: 'Passwords do not match.'
                });
                //console.log("Password do not match!");
            }
        } else {
            ngToast.create({
                className: 'warning',
                content: 'Some Fields are invalid.'
            });
            //console.log("Some fields are invalid!");
        }
    };
});

app.controller('MyBlogsCtrl', function($scope, $state, $rootScope, $http) {
    $scope.userBlogs = {};
    var url = "/api/blogs/ownblogs/" + $rootScope.userId;
    $http.get(url)
        .then(function(success){
            $scope.userBlogs = success.data.blogs;
        }, function(err){
            ngToast.create({
                className: 'warning',
                content: 'Error retrieving blogs.'
            });
        });
});

app.controller('MainCtrl', function($scope, $rootScope, $timeout, ngToast) {
    $scope.logout = function() {
        //console.log("logout called");
        $rootScope.loggedIn = false;
        ngToast.create({
            content: 'User Logged Out.'
        });
    }
});