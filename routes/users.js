var express = require('express');
var router = express.Router();
var config = require('../config/database');

//Profile
router.get('/profile',function(req,res,next){
	res.send('PROFILE');
});


module.exports  = router;