exports.run = function(socket, data) {
    console.log('running ga-tsp app with data: ' + data);
    var City = require('./City.js');
    var Tour = require('./Tour.js');
    var crossoverMutation = require('./ga.js');
    var euclideanDistance = require('euclidean-distance');
    var argv = require('minimist')(process.argv.slice(2));

    // configurable params
    var X_MAX = 400;
    var Y_MAX = 200;
    var nCities = data.graph.length > 0 ? data.graph.length : 40;
    var populationSize = data.population > 0 ? data.population : 100;
    var mutationPct = data.mutationPct ? data.mutationPct : 10;
    var maxGenerations = data.nGenerations > 0 ? data.nGenerations : 1000;
    var mutationOperation = 1;    // 0 for random city swap and 1 for RSM
    var tournamentSize = 4;
    var outputNthGenSolution = 100;  // output the path and the fitness of the best solution every N generations

    // returns randomly-sorted array
    var fisherYatesShuffle = function (array) {
        var counter = array.length, temp, index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    };

    // return total distance traveled (higher number == lower fitness)
    var calculateDistance = function(tour) {
        var sum = 0.0;

        // aggregate the euclidean distance between all the cities in the tour
        for (var a = 0, b = 1; b < tour.path.length; ++a, ++b) {
            var cityA = cities[tour.path[a]];
            var cityB = cities[tour.path[b]];
            sum += euclideanDistance([cityA.x, cityA.y], [cityB.x, cityB.y]);
        }

        var cityA = cities[tour.path[tour.path.length - 1]];
        var cityB = cities[tour.path[0]];
        sum += euclideanDistance([cityA.x, cityA.y], [cityB.x, cityB.y]);

        return sum;
    };

    // update distance traveled for all given tours
    var updateFitness = function(tours) {
        for (var i = 0; i < tours.length; ++i) {
            tours[i].fitness = calculateDistance(tours[i]);
        }
    };

    // comparison function used during ranking
    var compareTours = function(f1, f2) {
        if (f1.fitness < f2.fitness) {
            return -1;
        }
        if (f2.fitness < f1.fitness) {
            return 1;
        }
        return 0;
    };

    // rank tours by fitness (where i is fitter than j when i < j)
    var rankTours = function(tours) {
        return tours.sort(compareTours);
    };

    // returns fittest tour from a tourney
    var tournamentSelection = function(tours) {
        var tourIndices = [];

        // select tours to enter tourney
        for (var i = 0; i < tournamentSize; ++i) {
            tourIndices[i] = Math.floor(Math.random() * tours.length);        
        }

        // return fittest tour in tourney
        var fittestTourIndex = tourIndices[0];
        for (var i = 1; i < tourIndices.length; ++i) {
            if (tours[tourIndices[i]].fitness < tours[fittestTourIndex].fitness)
                fittestTourIndex = tourIndices[i];
        }

        return tours[fittestTourIndex];
    };

    // use given graph of city coords [{x, y}, {x2, y2}, ... {xn, yn}]
    var graph = data.graph;

    // create cities
    var cities = [];
    var cityNames = [];
    for (var i = 0; i < graph.length; ++i) {
        cities[i] = new City(i, graph[i].x, graph[i].y);
        cityNames[i] = i;
    }

    // init population
    var tours = [];
    for (var i = 0; i < populationSize; ++i) {
        tours[i] = new Tour([0].concat(fisherYatesShuffle(cityNames.slice(1))));
        tours[i].fitness = calculateDistance(tours[i]);
    }

    var currentGeneration = 1;
    var rankedTours = rankTours(tours);

    console.log('Initial solution has fitness ' + rankedTours[0].fitness + ' and path ' + rankedTours[0].path);

    while (currentGeneration <= maxGenerations) {
        // create nextGen array and move over fittest two tours unaltered (elitism)
        var nextGen = [];
        nextGen[0] = rankedTours[0];
        nextGen[1] = rankedTours[1];

        // reproduce
        for (var i = 2, j = 3; j < rankedTours.length; i += 2, j += 2) {

            // select parents for crossover
            var p1 = tournamentSelection(rankedTours);
            var p2 = tournamentSelection(rankedTours);     

            // crossover
            var offspring = crossoverMutation.pmx(p1.path, p2.path);
            nextGen[i] = new Tour(offspring[0]);
            nextGen[j] = new Tour(offspring[1]);

            // mutate child 1 if above mutate threshold
            if (Math.floor(Math.random() * 100) < mutationPct) {
                if (mutationOperation == 0) {
                    nextGen[i] = new Tour(crossoverMutation.citySwapMutation(nextGen[i].path));
                } else {
                    nextGen[i] = new Tour(crossoverMutation.rsm(nextGen[i].path));
                }
            }

            // mutate child 2 if above mutate threshold
            if (Math.floor(Math.random() * 100) < mutationPct) {
                if (mutationOperation == 0) {
                    nextGen[j] = new Tour(crossoverMutation.citySwapMutation(nextGen[j].path));
                } else {
                    nextGen[j] = new Tour(crossoverMutation.rsm(nextGen[j].path));
                }
            }
        }

        // update fitness calculation for all tours
        updateFitness(nextGen);

        // re-rank
        rankedTours = rankTours(nextGen);

        // increment generations counter
        ++currentGeneration;

        // output
        if (currentGeneration % outputNthGenSolution == 0) {
            console.log('Generation ' + currentGeneration + "'s best solution has fitness " + rankedTours[0].fitness);
            socket.emit('tsp-update', {'fitness': rankedTours[0].fitness, 'path': rankedTours[0].path});
        }
    }

    console.log('Sim run on ' + nCities + ' cities');
    console.log('Final solution has fitness ' + rankedTours[0].fitness + ' and path  ' + rankedTours[0].path);
    socket.emit('tsp-done', {'fitness': rankedTours[0].fitness, 'path': rankedTours[0].path});
};