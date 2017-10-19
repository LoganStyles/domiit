var credentials = require('./credentials');
var mongoose = require('mongoose');
var user = require('../models/user');

var passport = require('passport'), 
TwitterStrategy = require('passport-twitter').Strategy,
FacebookStrategy = require('passport-facebook').Strategy;
// LocalStrategy = require('passport-local').Strategy;


module.exports = function(app, user){

    passport.use(new FacebookStrategy({
        clientID: credentials.facebook.app_id,
        clientSecret: credentials.facebook.app_secret,
        callbackURL: credentials.facebook.callback,
        profileFields:['id','displayName','emails','name','gender']
    }, function(accessToken, refreshToken, profile, done) {
        // console.log('passport before fb profile')
        // console.log(profile);
        var me = new user({
            email:profile.emails[0].value,
            name:profile.displayName
        });

        /* save if new */
        user.findOne({email:me.email}, function(err, u) {
            if(!u) {
                console.log('no existing user so save')
                me.save(function(err, me) {
                    if(err) return (err);

                    req.user = u;
                    delete req.user.password; //delete the password from the session
                    req.session.user = u; //refresh the session value
                    res.locals.user = u;

                    res.redirect('/dashboard');
                });
            } else {
                console.log('else user was found ');
                console.log(u);

                req.user = u;
                delete req.user.password; //delete the password from the session
                req.session.user = u; //refresh the session value
                res.locals.user = u;
                res.redirect('/dashboard');
            }
        }
        );
    }

));


    app.use(require('cookie-parser')(credentials.cookieSecret));
    app.use(require('express-session')({
        resave:false,
        saveUninitialized:false,
        secret:credentials.cookieSecret
    }));

    app.use(passport.initialize());
    app.use(passport.session());


};



