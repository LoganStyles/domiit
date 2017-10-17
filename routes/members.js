var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');

// //Register
router.post('/register',function(req,res,next){

	let newUser=new user();
	newUser.username=req.body.username;
	newUser.password=req.body.password;
	newUser.displayPic="";
	newUser.phone="";
	newUser.displayName="";
	newUser.email=req.body.email;
	
	

	user.findOne({email:req.body.email}, function(err, u) {
		var msg;
            if(!u) {//user does not previously exist
            	console.log('reg !u findOne in save')
            	newUser.save(function(err, newUser) {
            		if(err){res.json({success: false,msg:"registration failed"});
            	}else{
            		res.json({success:true,msg:"User registered"});
            	}
            });
            } else {//user previously exists
            	msg="User already exists";
            	res.json({success:false,msg:msg});
            }
        });
	
});

//Login
router.post('/login',function(req,res,next){
	console.log('inside login')

	user.findOne({email:req.body.log_email}, function(err, u) {
		var msg;
		if(u){
			//success
			res.json({success:true,msg:"Login succesful"});
		}else{
			res.json({success: false,msg:"Login failed"});
		}

	});
	
});

//Profile
router.get('/profile',function(req,res){
	res.send('PROFILE');
});


module.exports  = router;