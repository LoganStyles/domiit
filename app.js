var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var credentials = require('./config/credentials');
var user = require('./models/user');
var members = require('./routes/members');
// var router = express.Router();
var config = require('./config/database');

// var url_root="http://localhost:"+process.env.PORT;
    var url_root="https://ancient-falls-19080.herokuapp.com";
    // var url_root="https://ancient-falls-19080.herokuapp.com/"+process.env.PORT;


var passport = require('passport'), 
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


passport.use(new FacebookStrategy({
    clientID: credentials.facebook.app_id,
    clientSecret: credentials.facebook.app_secret,
    callbackURL: credentials.facebook.callback,
    profileFields:['id','displayName','emails','name','gender','username']
    }, function(accessToken, refreshToken, profile, done) {
        //console.log('passport before profile')
        console.log(profile);
        var me = new user({
            email:profile.emails[0].value,
            username:profile.username,
            name:profile.displayName
        });

        /* save if new */
        user.findOne({email:me.email}, function(err, u) {
            if(!u) {
                console.log('!u findOne in save')
                me.save(function(err, me) {
                    if(err) return done(err);
                    done(null,me);
                });
            } else {
                console.log('else of findOne in save')
                console.log(u);
                done(null, u);
            }
        });
  }
));

passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, user) {
        done(err, user);
    });
});


var app = express();
//all middlewares
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave:false,
    saveUninitialized:false,
    secret:credentials.cookieSecret
}));

app.use(passport.initialize());
app.use(passport.session());



//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static Path
app.use(express.static(path.join(__dirname,'public')));

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', exphbs({
	//defaultLayout: 'main.html' //Default templating page
	partialsDir: __dirname + '/views/partials/',
	helpers: {
		json: function(obj) {
			return JSON.stringify(obj);
		}
	}
}));
app.set('view engine', 'html');

var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};

function isLoggedIn(req, res, next) {
    req.loggedIn = !!req.user;
    next();
}

app.get('/', function(req, res) {
    
    res.render('index', {
        // loggedIn:req.loggedIn,
        url:url_root
    });
});

app.get('/dashboard', function(req, res) {
    res.render('dashboard', {
        // loggedIn:req.loggedIn,
        url:url_root
    });
});

app.get('/profile', function(req, res) {
    res.render('profile', {
        url:url_root
    });
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope:"email"}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', 
{ successRedirect: '/dashboard', failureRedirect: '/login' }));

app.get('/login', isLoggedIn, function(req, res) {
    if(req.loggedIn) res.redirect('/');
    console.log(req.loggedIn);
    res.render('index', {
        title:'Login/Registration'
    });
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('error');
});

app.use('/members',members);

//Register
app.post('/register',function(req,res,next){
console.log('register');
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

app.get('*', function(req, res){
	res.render('404', {});
});

app.listen(process.env.PORT || 3000,function(){
console.log('Server started on port '+process.env.PORT);
});