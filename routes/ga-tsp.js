var express = require('express');
var router = express.Router();
var http = require('http');

/* GET /ga-tsp */
router.get('/', function(req, res, next) {
  res.render('ga-tsp', { title: 'Genetic Algorithms - Traveling Salesman Problem' });
});

module.exports = router;