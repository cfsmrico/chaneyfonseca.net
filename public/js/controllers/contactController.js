var app = angular.module('chaneyfonseca', []);

app.controller('ContactController', ['$scope', '$http', function($scope, $http) {
  $scope.statusMsg = '';

  $scope.submitForm = function() {
    $scope.statusMsg = '';
    $http.post('/contact', {name: $scope.name, email: $scope.email, message: $scope.message})
      .success(function() {
        $('#status-msg').removeClass('bad-status');
        $('#status-msg').addClass('good-status');
        $scope.statusMsg = 'Message received!';
      }).error(function() {
        $('#status-msg').removeClass('good-status');
        $('#status-msg').addClass('bad-status');
        $scope.statusMsg = 'Error sending message';
      })
    };
}]);