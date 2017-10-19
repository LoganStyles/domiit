var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');
var auth = require('../config/auth');

var passport = require('passport'); 

// var url_root="http://localhost:"+process.env.PORT;
var url_root="https://ancient-falls-19080.herokuapp.com";


// //Register
router.post('/register',function(req,res,next){

	let newUser=new user();
	newUser.username=req.body.username;
	newUser.password=req.body.password;
	newUser.displayPic="";
	newUser.phone="";
    newUser.gender="";
	newUser.displayName="";
	newUser.email=req.body.email;
	newUser.current_appointment.push(req.body.work_place);
	newUser.email=req.body.email;
	newUser.education.push(req.body.education);
	newUser.location=req.body.location;
	newUser.description=req.body.about;
	
	

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

    // console.log(req.body);

	user.findOne({email:req.body.log_email}, function(err, u) {
        if(!u){
            res.json({success: false,msg:"Login failed"});
        }else{
            if(req.body.log_password === u.password){
                //sets a cookie with the user's info
                req.session.user = u;
                res.json({success:true,msg:"Login succesful"});
            }else{
                res.json({success: false,msg:"Invalid email/password"});
            }
        }

	});
	
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope:"email"}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', 
    { successRedirect: '/dashboard', failureRedirect: '/login' }));


router.get('/logout',function(req,res){
    req.session.destroy(function(err){
        console.log('session destroyed');
    });
    res.redirect('/');
});

// //update profile
router.post('/update_profile',function(req,res,next){

	let updateUser=new user();
	updateUser.displayName=req.body.displayName;
	updateUser.phone=req.body.phone;
	updateUser.current_appointment.push(req.body.work_place);
	updateUser.email=req.body.email;
	updateUser.designation=req.body.designation;
	updateUser.education.push(req.body.education);
	updateUser.location=req.body.location;
	updateUser.about=req.body.about;
	
	

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


module.exports  = router;