var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'jane@domain.com',
    pass: 'jackNjill'
  }
});

/* GET /contact */
router.get('/', function(req, res, next) {
  res.render('contact', { title: 'Contact Chaney'});
});

router.post('/', function(req, res, next) {
  res.status(200).end();

  transporter.sendMail({
    from: req.body.email,
    to: 'jane@domain.com',
    subject: 'Hello, from ' + req.body.name + ' <' + req.body.email + '>',
    text: req.body.message
  });
});

module.exports = router;