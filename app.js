var express = require('express');
// var everyauth = require('everyauth');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var credentials = require('./config/credentials');

var passport = require('passport'), 
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


passport.use(new FacebookStrategy({
    clientID: credentials.facebook.app_id,
    clientSecret: credentials.facebook.app_secret,
    callbackURL: credentials.facebook.callback,
    profileFields:['id','displayName','emails','name','gender']
    }, function(accessToken, refreshToken, profile, done) {
        console.log('passport before profile')
        console.log(profile);
        console.log('passport after profile')
        var me = new user({
            email:profile.emails[0].value,
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

// passport.serializeUser(function(user, done) {
//     console.log(user);
//     done(null, user._id);
// });

// passport.deserializeUser(function(id, done) {
//     user.findById(id, function(err, user) {
//         done(err, user);
//     });
// });


var app = express();
//all middlewares
var users = require('./routes/users');

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(express.bodyParser())
// 	.use(express.cookieParser('mega joints'))
// 	.use(express.session())
// 	.use(everyauth.middleware(app));

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

app.use('/users',users);

app.get('/', function(req, res){
	res.render('index', {});
});

app.get('*', function(req, res){
	res.render('404', {});
});

app.listen(process.env.PORT || 3000,function(){
console.log('Server started on port '+process.env.PORT);
});