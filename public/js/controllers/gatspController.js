var app = angular.module('chaneyfonseca', []);
var X_MAX = 290;
var Y_MAX = 140;
var TWO_PI = 2 * Math.PI;

app.controller('gatspController', ['$scope', '$http', function($scope, $http) {
  $scope.runSim = function() {
    var socket = io.connect('http://localhost:3000');

    console.log('emitting run-ga-tsp event on socket');

    socket.on('tsp-update', $scope.drawBestTour);
    socket.on('tsp-done', $scope.drawFinalResults);

    // create graph
    graph = [];
    for (var i = 0; i < $scope.nCities; ++i) {
        var x = Math.floor(Math.random() * X_MAX) + 5;
        var y = Math.floor(Math.random() * Y_MAX) + 5;
        graph[i] = {'x': x, 'y': y};
    }

    socket.emit('run-ga-tsp',  {'graph': graph, 'population': $scope.population, 'mutationPct': $scope.mutationPct, 'nGenerations': $scope.nGenerations});

    //alert('nCities: ' + $scope.nCities + ' population: ' + $scope.population + ' mutationPct: ' + $scope.mutationPct + ' nGenerations: ' + $scope.nGenerations);
/*    $http.post('/ga-tsp', {nCities: $scope.nCities, population: $scope.population, mutationPct: $scope.mutationPct, nGenerations: $scope.nGenerations})
      .success(function() {

      }).error(function() {

      })
*/
  };

  $scope.transformYAxis = function() {
    var can = document.getElementById('tsp-graph');
    var ctx = can.getContext('2d');
  };

  $scope.drawBestTour = function(data) {
    console.log('redrawing canvas');
    var fitness = data.fitness;
    var path = data.path;
    var canvas = document.getElementById('tsp-graph');
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    var g = graph;

    // re-draw cities on canvas
    for (var i = 0; i < path.length; ++i) {
      //c.moveTo(g[path[i]].x, g[path[i]].y);
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

  $scope.drawFinalResults = function(data) {
    $scope.drawBestTour(data);
    console.log('finished!');
  }
}]);