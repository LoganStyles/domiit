var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');
// var question = require('../models/question');
var auth = require('../config/auth');

var passport = require('passport'); 
// var multer = require('multer');
// var mime = require('mime-lib');
// var storage =multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'../public/uploads')

//     },
//     filename:function(req,file,cb){
//         console.log('filename ext '+file.mimetype);
//         console.log(mime.extension(file.mimetype));
//         cb(null, Date.now() + '.'+mime.extension(file.mimetype)[0]);

//     }
// });



// var uploading = multer({storage:storage}).single('question_photo');

// //Register
router.post('/register',function(req,res,next){

	let newUser=new user();
	// newUser.username=req.body.username;
	newUser.password=req.body.password;
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

    user.findOne({email:req.body.log_email}, function(err, u) {
        if(!u){
            res.json({success: false,msg:"Login failed"});
        }else{
            if(req.body.log_password === u.password){
                //sets a cookie with the user's info
                req.session.user = u;
                delete req.session.user.password;
                res.json({success:true,msg:"Login succesful"});
            }else{
                res.json({success: false,msg:"Invalid email/password"});
            }
        }

    });

});

router.get('/auth/facebook', passport.authenticate('facebook', {scope:"email"}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', 
    { successRedirect: '/dashboard', failureRedirect: '/' }));

router.get('/auth/linkedin', passport.authenticate('linkedin',{ scope: ['r_basicprofile', 'r_emailaddress'] }));
router.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });


router.get('/auth/google',  passport.authenticate('google', { scope:[ 'email','profile' ] }));
router.get( '/auth/google/callback', passport.authenticate( 'google', {
        successRedirect: '/dashboard',
        failureRedirect: '/'
}));


router.get('/logout',function(req,res){
    req.session.destroy(function(err){
        console.log('session destroyed');
    });
    res.redirect('/');
});


// //update password
router.post('/update_password',function(req,res,next){

    //get email & password for this user & update the password if it matches param
    user.findOne({email:req.session.user.email }, function(err, u) {


        if(u && (u.password ==req.body.cur_password)){

            //update the user
            let updateUser=u;
            req.session.user.password=req.body.new_password;
            updateUser.password=req.body.new_password;
            updateUser.date_modified=Date.now;

            user.updateOne({email:req.session.user.email}, { $set: updateUser },function(err,affected,resp){
                if(err){
                    // console.log('err occurred');
                    console.log(err);
                }

                if(resp){
                    // console.log('resp');
                    console.log(resp);
                }
                
                if(affected){
                    console.log(affected);
                    res.json({success:true,msg:"User password update succesful"});
                }else{
                    res.json({success: false,msg:"Password update failed"});
                }

            });
        }else{
            res.json({success: false,msg:"Password change failed"});
        }

    });    

});

router.post('/update_avatar',function(req,res,next){
    uploading(req,res,function(err){
        if(err){
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});


module.exports  = router;