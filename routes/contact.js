var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var validator = require('validator');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'xyz@gmail.com',
    pass: 'xyz'
  }
});

/* GET /contact */
router.get('/', function(req, res, next) {
  res.render('contact', { title: 'Contact Chaney'});
});

router.post('/', function(req, res, next) {
  res.status(200).end();

  transporter.sendMail({
    from: validator.escape(req.body.email),
    to: 'xyz@gmail.com',
    subject: 'Hello, from ' + validator.escape(req.body.name) + ' <' + validator.escape(req.body.email) + '>',
    text: validator.escape(req.body.message)
  });
});

module.exports = router;