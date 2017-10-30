var credentials = require('./credentials');
var mongoose = require('mongoose');
var user = require('../models/user');

var passport = require('passport'), 
TwitterStrategy = require('passport-twitter').Strategy,
FacebookStrategy = require('passport-facebook').Strategy,
LinkedInStrategy = require('passport-linkedin').Strategy,
// LocalStrategy = require('passport-local').Strategy;
GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


module.exports = function(app, user){

    passport.use(new FacebookStrategy({
        clientID: credentials.facebook.app_id,
        clientSecret: credentials.facebook.app_secret,
        callbackURL: credentials.facebook.callback,
        profileFields:['id','displayName','emails','name','gender']
    }, function(req, refreshToken, profile, done) {
        
        var me = new user({
            email:profile.emails[0].value,
            displayName:profile.displayName,
            firstname:profile.name.familyName,
            lastname:profile.name.givenName,
            gender:profile.gender
        });

        /* save if new */
        user.findOne({email:me.email}, function(err, u) {
            if(!u) {
                console.log('no existing user so save')
                me.save(function(err, me) {
                    if(err) return done(err);
                    done(null, me);
                });
            } else {
                console.log('else user was found ');                
                done(null, u);
            }
        }
        );
    }

    ));

    passport.use(new GoogleStrategy({
        clientID:     credentials.google.clientID,
        clientSecret: credentials.google.clientSecret,
        callbackURL: credentials.google.callback,
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
    
    console.log('passport before google profile')
    console.log(profile);

    var me = new user({
        email:profile.emails[0].value,
        displayName:profile.displayName,
        gender:profile.gender,
        firstname:profile.name.givenName,
        lastname:profile.name.familyName
    });

    /* save if new */
    user.findOne({email:me.email}, function(err, u) {
        if(!u) {
            console.log('google no existing user so save')
            me.save(function(err, me) {
                if(err) return done(err);
                done(null, me);
            });
        } else {
            console.log('else user was found ');                
            done(null, u);
        }
    }
    );
}));

passport.use(new LinkedInStrategy({
    consumerKey: credentials.linkedin.clientID,
    consumerSecret: credentials.linkedin.clientSecret,
    callbackURL: credentials.linkedin.callback
  },
  function(token, tokenSecret, profile, done) {
    
    console.log('passport before linkedin profile')
    console.log(profile);

    // var me = new user({
    //     email:'',
    //     displayName:profile.displayName,
    //     gender:'',
    //     firstname:profile.name.givenName,
    //     lastname:profile.name.familyName
    // });

    // /* save if new */
    // user.findOne({email:me.email}, function(err, u) {
    //     if(!u) {
    //         console.log('linkedin no existing user so save')
    //         me.save(function(err, me) {
    //             if(err) return done(err);
    //             done(null, me);
    //         });
    //     } else {
    //         console.log('else user was found ');                
    //         done(null, u);
    //     }
    // }
    // );


  }
));

passport.serializeUser(function(user, done) {
    console.log('inside serializeUser')
        console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
         console.log('inside deserializeUser')
        user.findById(id, function(err, user) {
            done(err, user);
        });
    });


    app.use(require('cookie-parser')(credentials.cookieSecret));
    app.use(require('express-session')({
        resave:false,
        saveUninitialized:false,
        secret:credentials.cookieSecret
    }));

    app.use(passport.initialize());
    app.use(passport.session());


};



