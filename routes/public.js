var express = require('express');
var router = express.Router();
var db = require('../lib/db')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/name_title', (req,res) => {
  db.getname_title((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/major', (req,res) => {
  db.getmajor((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/course', (req,res) => {
  db.getcourse((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/role', (req,res) => {
  db.getrole((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})


module.exports = router;
