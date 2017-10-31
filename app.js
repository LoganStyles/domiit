if(process.env.NODE_ENV !== 'production'){
    require('dotenv').load();
}

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var user = require('./models/user');
var members = require('./routes/members');
var cms_routes = require('./routes/cms');
var question = require('./models/question');

var quest_cat = require('./models/question_cats');

// var inbound = require('inbound');

 // var url_root="https://ancient-falls-19080.herokuapp.com";
 // var url_root="http://localhost:"+process.env.PORT;

// process.env.URL_ROOT="http://localhost:"+process.env.PORT;
 // console.log(process.env);



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


//inbound middleware
// app.use(function(req,res,next){
//     // var referrer = req.header('referrer');
//     // console.log(referrer);
//     // var href = req.url;
//     // console.log(href);
//     // next();

//     var url = "http://www.newyorker.com/online/blogs/johncassidy/2012/08/mbid=gnep&google_editors_picks=true";
//     var referrer = "http://twitter.com/ryah";

//     inbound.referrer.parse(url, referrer, function (err, description) {
//         console.log(description);
//         req.referrer = description;
//         next(err);
//     });

// })

// app.get('/social',function(req,res,next){
//     return res.send(req.referrer);
// });


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
		},
        counter:function(index){
            return index +1;
        },
        ifEquals: function(arg1,arg2,options) {
            if(arguments.length <3)
                throw new Error("Handlebars Helper equal needs 2 parameters")
            if(arg1!=arg2){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
            // return (arg1==arg2)? options.fn(this):options.inverse(this);
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
    console.log('inside profile');
    console.log(req.user);
    if(req.user){
        res.render('profile', {
            url:process.env.URL_ROOT,
            user_info:req.user,
            friends_count:req.user.friend_ids.length,
            requests_count:req.user.request_ids.length,
            groups_count:req.user.group_ids.length
        });
    }else{
        res.redirect('/');
    }
    
});


app.get('/dashboard',isLoggedIn, function(req, res) {
    console.log('inside dashboard');
    //get all items

    quest_cat.find().sort({value:1}).exec(function(err,cat_item){
        var res_cat=[];

        if(err)console.log(err);
        if(cat_item){
            console.log(cat_item);
            res_cat=cat_item;
        }

        res.render('dashboard', {
            title:'Dashboard',
            url:process.env.URL_ROOT,
            user_info:req.user,
            data:res_cat
        }); 
        

    });
    
});

app.get('/admin',isLoggedIn, function(req, res) {
    console.log('inside cms');
    // console.log(req.user);
    if(req.user){
       res.render('cms_dashboard', {
        title:'CMS',
        url:process.env.URL_ROOT,
        user_info:req.user
    }); 
   }else{
    res.redirect('/');
}

});



app.get('/question',isLoggedIn, function(req, res) {
    console.log('inside question');
    // console.log(req.user);
    if(req.user){
       res.render('question', {
        url:process.env.URL_ROOT,
        user_info:req.user
    }); 
   }else{
    res.redirect('/');
}

});


app.get('/', function(req, res) {    
    res.render('index', {
        title:'Home',
        url:process.env.URL_ROOT
    });
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('error');
});

app.use('/members',members);
app.use('/cms',cms_routes);


app.get('*', function(req, res){
	res.render('404', {});
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.on('connection',function(socket){
    console.log('a user connected');
    socket.on('disconnect',function(){
        console.log('user disconnected');
    });
});

app.post('/post_questions',function(req,res,next){

    var owner_details={id:req.user._id,displayName:req.user.displayName,displayPic:req.user.displayPic};

    let quest =new question();
    quest.body=req.body.quest_description;
    quest.category_id=req.body.quest_category;
    quest.sub_cat1=req.body.sub_cat1;
    quest.sub_cat2=req.body.sub_cat2;
    quest.owner=owner_details;
    // quest.date_created= Date();

    console.log(typeof quest);
    quest.save(function(err, quest) {

        if(err){console.log(err);res.json({success: false,msg:"question submission failed"});
        
    }else{
        res.json({success:true,msg:"Question submission succesful"});
        var json = JSON.stringify(quest, null, 2);
        console.log(json);
        io.emit('question posts', json);
    }   
});
});




server.listen(process.env.PORT || 3000,function(){
    console.log('Server started on port '+process.env.PORT);
});