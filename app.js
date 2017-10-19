var express = require('express');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var user = require('./models/user');
var members = require('./routes/members');

 var url_root="https://ancient-falls-19080.herokuapp.com";
// var url_root="http://localhost:"+process.env.PORT;



var app = express();
var auth = require('./config/auth')(app,user);

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (request, response, next) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept,X-My-App-Token');
  response.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, PUT');
  next();
});

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

app.use(session({
    cookieName:'session',
    secret:'f249877c543a7a3021bc60a2&&%%4#)(!&!b45b162e()736',
    duration: 30 *60*1000,
    activeDuration: 5*60*1000,
    httpOnly:true,
    secure:true,
    ephemeral:true
}));

app.use(function(req,res,next){
    if(req.session && req.session.user){
        user.findOne({email:req.session.user.email},function(err,user){
            if(user){
                req.user = user;
                delete req.user.password; //delete the password from the session
                req.session.user = user; //refresh the session value
                res.locals.user = user;
            }
            // finishing processing the middleware and run the route
            next();
        })
    }else{
        next();
    }
});

function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}

app.get('/profile', function(req, res) {
    // console.log(req.user);
    res.render('profile', {
        url:url_root
    });
});


app.get('/dashboard',isLoggedIn, function(req, res) {
    res.render('dashboard', {
        url:url_root
    });
});


app.get('/', function(req, res) {    
    res.render('index', {
        // loggedIn:req.loggedIn,
        url:url_root
    });
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('error');
});

app.use('/members',members);


app.get('*', function(req, res){
	res.render('404', {});
});

app.listen(process.env.PORT || 3000,function(){
    console.log('Server started on port '+process.env.PORT);
});