var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');

//Register
router.post('/register',function(req,res,next){
//res.send('REGISTER');
	let newUser = new user({
		username: req.body.username,
		email:req.body.email,
		password:req.body.password
	});
	var msg="";

	user.findOne({email:newUser.email}, function(err, u) {
            if(!u) {//user does not previously exist
                console.log('reg !u findOne in save')
                newUser.save(function(err, newUser) {
                    if(err){
                    	console.log(err);
                    	msg="registration failed";
                    } else{
                    	msg="registration successfull";
                    	console.log(msg);
                    }
                });
            } else {//user previously exists
            	msg="User already exists";
                console.log(msg);
            }
        });
	res.render('index',{msg:msg});
});

//Profile
router.get('/profile',function(req,res,next){
	res.send('PROFILE');
});


module.exports  = router;