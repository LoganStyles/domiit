var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var config = require('./config/database');

//all middlewares
var users = require('./routes/users');
	//port number
//var port = 3000;
//connect to db
// mongoose.connect(config.database);
// //on connection
// mongoose.connection.on('connected',function(){
// 	console.log('Connected to database '+config.database);
// });

// //on connection error
// mongoose.connection.on('error',function(err){
// 	console.log('Database error '+err);
// });


var app = express();

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


//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static Path
//app.use("**/public", express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'public')));

//app.use('/users',users);

app.get('/', function(req, res){
	res.render('index', {});
});

app.get('*', function(req, res){
	res.render('404', {});
});

app.listen(process.env.PORT || 3000,function(){
console.log('Server started on port '+process.env.PORT);
});