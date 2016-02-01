/**
 * Auth Controller
 * @param Auth - Auth factory dependency
 */
window.safeLauncher.controller('AuthController', [ '$scope', '$state', 'AuthFactory',
  function($scope, $state, Auth) {
    var REGISTER_TAB_INIT_POS = 1;
    var REGISTER_TAB_COUNT = 3;
    var USER_PASSWORD_MIN_LENGTH = 6;
    var USER_PIN_MIN_LENGTH = 4;

    // Reset registration form
    var resetRegistration = function() {
      $scope.user = {};
      $scope.registerTab.currentPos = REGISTER_TAB_INIT_POS;
    };

    // Reset login form
    var resetLogin = function() {
      $scope.user = {};
    };

    // check value is alpha numeric
    var isAlphaNumeric = function(val) {
      return (new RegExp(/^[a-z0-9]+$/i)).test(val);
    };

    // User registration
    var register = function(payload) {
      Auth.register(payload, function(err, data) {
        resetRegistration();
        if (err) {
          alert(err);
          return;
        }
        alert(data);
      });
    };

    // User login
    var login = function() {
      if (!$scope.user.hasOwnProperty('pin') || !$scope.user.hasOwnProperty('keyword') ||
        !$scope.user.hasOwnProperty('password')) {
        alert('All fields are required');
        return;
      }
      if (isNaN($scope.user.pin) || $scope.user.pin.length < USER_PIN_MIN_LENGTH) {
        alert('Invalid PIN');
        return;
      }
      if (!isAlphaNumeric($scope.user.keyword) || !isAlphaNumeric($scope.user.password) ||
        $scope.user.keyword.length < USER_PASSWORD_MIN_LENGTH ||
        $scope.user.password.length < USER_PASSWORD_MIN_LENGTH) {
        alert('Invalid Keyword or Password');
        return;
      }
      Auth.login($scope.user, function(err, data) {
        resetLogin();
        if (err) {
          alert(err);
          return;
        }
        alert(data);
        $state.go('user');
      });
    };

    // Registration tabbing
    $scope.registerTab = {
      currentPos: REGISTER_TAB_INIT_POS,
      count: REGISTER_TAB_COUNT,
      changePosition: function(pos) {
        var self = this;

        // validate
        var validate = function(key) {
          var check = false;
          if (!$scope.user.hasOwnProperty(key) || !$scope.user[key].hasOwnProperty('value') ||
          !$scope.user[key].hasOwnProperty('confirm')) {
            alert('All field required');
            return check;
          }

          if (!$scope.user[key].value || !$scope.user[key].confirm) {
            alert('Field should not be left empty');
            return check;
          }

          if (key === 'pin') {
            if (isNaN($scope.user[key].value)) {
              alert('PIN must contain only numeric');
              return check;
            }

            if ($scope.user[key].value.length < USER_PIN_MIN_LENGTH) {
              alert('PIN should contain atleast ' + USER_PIN_MIN_LENGTH + ' characters');
              return check;
            }
          }

          if (key === 'keyword' || key === 'password') {
            if (!isAlphaNumeric($scope.user[key].value)) {
              alert('Keyword/Password must not contain special characters');
              return check;
            }

            if ($scope.user[key].value.length < USER_PASSWORD_MIN_LENGTH) {
              alert('Keyword/Password should contain atleast ' + USER_PASSWORD_MIN_LENGTH + ' characters');
              return check;
            }
          }

          if ($scope.user[key].value !== $scope.user[key].confirm) {
            alert('Values must be same');
            return check;
          }
          return !check;
        };

        switch (pos) {
          case 1:
            self.currentPos = pos;
            break;
          case 2:
            if (!validate('pin')) {
              return;
            }
            self.currentPos = pos;
            break;
          case 3:
            if (!validate('pin') || !validate('keyword')) {
              return;
            }
            self.currentPos = pos;
            break;
          case self.count + 1:
            if (!validate('password')) {
              self.currentPos = self.count;
              return;
            }
            register($scope.user);
            break;
        }
      }
    };

    $scope.user = {};
    $scope.login = login;
  }
]);