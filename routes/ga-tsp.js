var express = require('express');
var router = express.Router();
var http = require('http');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var options = {
  host: 'localhost',
  port: '3000',
  path: '/ga-tsp/fire-event/tsp-update'
};

/* GET /ga-tsp */
router.get('/', function(req, res, next) {
  res.render('ga-tsp', { title: 'Genetic Algorithms - Traveling Salesman Problem' });
});

// POST /ga-tsp {nCities: xx, popluation: yy, mutationPct: z, nGenerations: ggg}
router.post('/', function(req, res, next) {
  console.log(req.body.nCities);
  console.log(req.body.population);
  console.log(req.body.mutationPct);
  console.log(req.body.nGenerations);

  for (var i = 0; i < 10; ++i) {
    //http.get(options, i)

  }
  // 1. call ga-tsp app with these args
  // 2. send regular updates back to client
  res.write('200');
  res.end();

  // simulate 3 updates  
  eventEmitter.emit('tsp-update');
  eventEmitter.emit('tsp-update');
});

// GET /ga-tsp/stream
router.get('/stream', function(req, res, next) {
  console.log('inside stream route');
  req.socket.setTimeout(Infinity);
  var messageCount = 0;
  var tspUpdate = function tspUpdate() {
    console.log('event occurred');
    res.write({id: messageCount, event: 'tsp-update', data: 'data stuff'});
  };

  eventEmitter.on('tsp-update', tspUpdate);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
});

module.exports = router;
