var app = angular.module('chaneyfonseca', []);
var X_MAX = 290;
var Y_MAX = 140;
var TWO_PI = 2 * Math.PI;

app.controller('contactController', ['$scope', '$http', function($scope, $http) {
  $scope.statusMsg = '';

  $scope.submitForm = function() {
    $scope.statusMsg = '';

    $http.post('/contact', {name: $scope.name, email: $scope.email, message: $scope.message})
      .success(function() {
        $('#status-msg').removeClass('bad-status');
        $('#status-msg').addClass('good-status');
        $scope.statusMsg = 'Message received!';
      })
      .error(function() {
        $('#status-msg').removeClass('good-status');
        $('#status-msg').addClass('bad-status');
        $scope.statusMsg = 'Error sending message';
      });
    };
}]);

app.controller('gatspController', ['$scope', '$http', function($scope, $http) {
  $scope.statusMsg = '';

  $scope.runSim = function() {
    $('#result-text').html('<strong>Cogitating...</strong>');
    initialFitness = 0.0;
    finalFitness = 0.0;
    var socket = io.connect('http://localhost:3000');

    socket.on('tsp-update', $scope.drawBestTour);
    socket.on('tsp-done', $scope.drawFinalResult);
    socket.on('tsp-initial', $scope.drawInitialResult);

    // create graph
    $scope.graph = [];
    for (var i = 0; i < $scope.nCities; ++i) {
        var x = Math.floor(Math.random() * X_MAX) + 5;
        var y = Math.floor(Math.random() * Y_MAX) + 5;
        $scope.graph[i] = {'x': x, 'y': y};
    }

    socket.emit('run-ga-tsp',  {'graph': $scope.graph, 'population': $scope.population, 'mutationPct': $scope.mutationPct, 'nGenerations': $scope.nGenerations});
  };

  $scope.drawBestTour = function(data) {
    var fitness = data.fitness;
    var path = data.path;
    var canvas = document.getElementById('tsp-graph');
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    var g = $scope.graph;

    // re-draw cities on canvas
    for (var i = 0; i < path.length; ++i) {
      c.beginPath();
      c.arc(g[path[i]].x, g[path[i]].y, 4, 0, TWO_PI);
      c.fillStyle = 'blue';
      c.fill();
    }

    // draw best tour
    for (var i = 0, j = i + 1; j < path.length; ++i, ++j) {
      c.moveTo(g[path[i]].x, g[path[i]].y);
      c.lineTo(g[path[j]].x, g[path[j]].y);
      c.stroke();
    }

    // draw from last city to initial city
    c.moveTo(g[path[path.length - 1]].x, g[path[path.length - 1]].y);
    c.lineTo(g[path[0]].x, g[path[0]].y);
    c.stroke();
  };

  $scope.drawFinalResult = function(data) {
    $scope.drawBestTour(data);
    finalFitness = data.fitness;

    $('#result-text').html('<strong>Final Result (fitness: ' + Math.round(data.fitness) + '):</strong>');
    console.log('finished!');

  };

  $scope.drawInitialResult = function(data) {
    $scope.drawBestTour(data);

    var fitness = data.fitness;
    var path = data.path;
    var canvas = document.getElementById('tsp-graph-g1');
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    var g = $scope.graph;

    // re-draw cities on canvas
    for (var i = 0; i < path.length; ++i) {
      c.beginPath();
      c.arc(g[path[i]].x, g[path[i]].y, 4, 0, TWO_PI);
      c.fillStyle = 'blue';
      c.fill();
    }

    // draw best tour
    for (var i = 0, j = i + 1; j < path.length; ++i, ++j) {
      c.moveTo(g[path[i]].x, g[path[i]].y);
      c.lineTo(g[path[j]].x, g[path[j]].y);
      c.stroke();
    }

    // draw from last city to initial city
    c.moveTo(g[path[path.length - 1]].x, g[path[path.length - 1]].y);
    c.lineTo(g[path[0]].x, g[path[0]].y);
    c.stroke();

    initialFitness = data.fitness;

    $('#initial-text').html('<strong>Best Tour Gen 1 (fitness: ' + Math.round(data.fitness) + '):</strong>');
  };
}]);