// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('LoginOAuth', [
  'ionic'
])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeError', stateChangeError);

  function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
    console.log('$stateChangeError', error);
    event.preventDefault();
    if (error == 'Unauthenticated') {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });

      $state.go('login');
    }
  }
})

.config(function($stateProvider, $urlRouterProvider) {
  var authResolve = function(AuthServices) {
    return AuthServices.AuthState();
  };

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'vm',
    })

  .state('main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl',
    controllerAs: 'vm',
    resolve: {
      authResolve: authResolve
    }
  });

  $urlRouterProvider.otherwise('/login');
})


// AUTHENTICATION SERVICES
.factory('AuthServices',
  function($q) {
    console.log('AuthServices loaded');

    var AuthData = {};

    return {
      AuthState: AuthState,
      loginGoogle: loginGoogle,
      unAuth: unAuth
    };

    function AuthState() {
      var qAuthState = $q.defer();

      firebase.auth().onAuthStateChanged(
        function(user) {
          if (user) {
            AuthData = user;
            qAuthState.resolve('Authenticated');
            console.log('AuthState Authenticated');
          } else {
            qAuthState.reject('Unauthenticated');
            AuthData = {};
            console.log('AuthState Unauthenticated');
          }
        }
      );
      return qAuthState.promise;
    }


    function loginGoogle() {
      console.log('Login with Google');
      var qSignIn = $q.defer();
      var providerAuth = new firebase.auth.GoogleAuthProvider();
      providerAuth.addScope('email');

      firebase.auth().signInWithPopup(providerAuth).then(
        function(result) {
          console.log('Authenticated user');
          Authdata = result;
          qSignIn.resolve();
        },
        function(error) {
          console.error('Login Failure', providerAuth, error);
          qSignIn.reject();
        }
      );
      return qSignIn.promise;
    }

    function unAuth() {
      var qUnAuth = $q.defer();
      AuthData = {};

      firebase.auth().signOut().then(
        function() {
          console.log('Logged Out');
        },
        function(error) {
          console.error('Log Out Failure', error);
        }
      );
    }
  }

)


// LOGIN CONTROLLER
.controller('LoginCtrl',
  function($q,
    $state, AuthServices) {
    console.log('LoginCtrl loaded.');

    // Expose ViewModel
    var vm = this;

    // Login Google
    vm.loginGoogle = function() {
      console.log('Login Button Clicked');

      AuthServices.loginGoogle().then(
        function(data) {
          console.log('Success');
          $state.go('main');
        },
        function(error) {
          console.error('Login Failed.');
        }
      );
    };

  }
)


// MAIN CONTROLLER
.controller('MainCtrl',
  function($state, AuthServices) {
    console.log('MainCtrl loaded');

    // Expose ViewModel
    var vm = this;

    vm.logOut = function() {
      console.log('LogOut Attempt');
      AuthServices.unAuth();
      $state.go('login');
    };
  }
)

;
