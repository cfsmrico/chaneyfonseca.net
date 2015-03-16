var express = require('express');
var router = express.Router();

/* GET /family */
router.get('/', function(req, res, next) {
  res.render('family', { title: "Chaney's Family"});
});

module.exports = router;
