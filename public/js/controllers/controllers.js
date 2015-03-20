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

var runSim = function($scope, withWebWorker) {
    $('#result-text').html('<strong>Cogitating...</strong>');
    initialFitness = 0.0;
    finalFitness = 0.0;

    // create graph
    $scope.graph = [];
    for (var i = 0; i < $scope.nCities; ++i) {
        var x = Math.floor(Math.random() * X_MAX) + 5;
        var y = Math.floor(Math.random() * Y_MAX) + 5;
        $scope.graph[i] = {'x': x, 'y': y};
    }  

    var data = {'graph': $scope.graph, 'population': $scope.population, 'mutationPct': $scope.mutationPct, 'nGenerations': $scope.nGenerations};

    if (!window.Worker) {
      withWebWorker = false;
    }

    if (withWebWorker === false) {
      var socket = io.connect('http://localhost:3000');
      socket.on('tsp-update', $scope.drawBestTour);
      socket.on('tsp-done', $scope.drawFinalResult);
      socket.on('tsp-initial', $scope.drawInitialResult);      
      socket.emit('run-ga-tsp',  data);      
    } else {
      var myWorker = new Worker('js/gatsp-webworker.js');
      myWorker.onmessage = function(e) {
        switch (e.data.name) {
          case 'tsp-initial':
            console.log('Initial solution has fitness ' + e.data.fitness + ' and path ' + e.data.path);
            $scope.drawInitialResult(e.data);
            break;
          case 'tsp-update':
            console.log('Current generation has fitness ' + e.data.fitness);
            $scope.drawBestTour(e.data);            
            break;
          case 'tsp-done':          
            console.log('Final solution has fitness ' + e.data.fitness + ' and path ' + e.data.path);
            $scope.drawFinalResult(e.data);
            break;
          default: 
            console.log('Current generation has fitness ' + e.data.fitness);
            $scope.drawBestTour(e.data);
            break;            
        }
      };
      myWorker.postMessage(data);   // post data to the Web Worker      
    }
};

var drawBestTour = function($scope, data, canvasId) {
    var fitness = data.fitness;
    var path = data.path;
    var canvas = document.getElementById(canvasId);
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

var drawFinalResult = function($scope, data) {
    drawBestTour($scope, data, 'tsp-graph');
    finalFitness = data.fitness;

    $('#result-text').html('<strong>Final Result (distance: ' + Math.round(data.fitness) + '):</strong>');
    console.log('finished!');

};

var drawInitialResult = function($scope, data) {
    drawBestTour($scope, data, 'tsp-graph');
    drawBestTour($scope, data, 'tsp-graph-g1');
    initialFitness = data.fitness;
    $('#initial-text').html('<strong>Best Tour Gen 1 (distance: ' + Math.round(data.fitness) + '):</strong>');
};

app.controller('gatspController', ['$scope', '$http', function($scope, $http) {
  $scope.statusMsg = '';
  $scope.runSim = function() {
    runSim($scope, false);
  };
  $scope.drawBestTour = function(data) {
    drawBestTour($scope, data, 'tsp-graph');
  };
  $scope.drawFinalResult = function(data) {
    drawFinalResult($scope, data);
  };
  $scope.drawInitialResult = function(data) {
    drawInitialResult($scope, data);
  };
}]);

app.controller('gatsp-WW-Controller', ['$scope', '$http', function($scope, $http) {
  $scope.statusMsg = '';
  $scope.runSim = function() {
    runSim($scope, true);
  };
  $scope.drawBestTour = function(data) {
    drawBestTour($scope, data, 'tsp-graph');
  };
  $scope.drawFinalResult = function(data) {
    drawFinalResult($scope, data);
  };
  $scope.drawInitialResult = function(data) {
    drawInitialResult($scope, data);
  };
}]);