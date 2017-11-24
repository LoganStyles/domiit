if(process.env.NODE_ENV !== 'production'){
    require('dotenv').load();
}

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
// var fs = require('fs-extra');
// var util = require('util');
var session = require('client-sessions');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var MomentHandler =require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);
var user = require('./models/user');
var members = require('./routes/members');
var cms_routes = require('./routes/cms');
var posts_routes = require('./routes/posts');
var question = require('./models/question');
var article = require('./models/article');

var quest_cat = require('./models/question_cats');
var quest_sub1 = require('./models/question_sub1');
var quest_sub2 = require('./models/question_sub2');

var art_cat = require('./models/article_cats');
var art_sub1 = require('./models/article_sub1');
var art_sub2 = require('./models/article_sub2');

var multer = require('multer');
var mime = require('mime-lib');

var Storage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads')//set the destination

    },
    filename:function(req,file,cb){
        console.log('filename ext '+file.mimetype);
        console.log(mime.extension(file.mimetype));
        cb(null, Date.now() + '.'+mime.extension(file.mimetype)[mime.extension(file.mimetype).length-1]);

    }
});




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
        },
        lastIndex:function(array){
            return array.length - 1;//get last index of an array
        }
        // ,
        // ifArrayLen:function(item,amount,options){
        //     if(item.length > amount){
        //         item.slice(0,amount)
        //     }else{
        //         return item;
        //     }

        // }
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


/*fetch question,articles cats & sub cats*/
app.get('/dashboard',isLoggedIn, function(req, res) {
    console.log('inside dashboard');   
    let question_status=false,
    article_status=false,
    home_status=true;

    //get all items
    quest_cat.find().sort({value:1}).exec(function(err_quest,cat_quest){
        var res_quest_cat=[],
        res_quest_sub1=[],
        res_quest_sub2=[],
        res_article_cat=[],
        res_article_sub1=[],
        res_article_sub2=[];


        if(err_quest)console.log(err_quest);
        if(cat_quest){
            // console.log(cat_item);
            res_quest_cat=cat_quest;
        }
        var first_cat=(res_quest_cat.length >0)?(res_quest_cat[0].value):(0);


        quest_sub1.find({'category':first_cat}).sort({value:1}).exec(function(err1_quest,sub1_quest){

            if(err1_quest)console.log(err1_quest);
            if(sub1_quest){
                res_quest_sub1=sub1_quest;
            }
            var first_sub1=(res_quest_sub1.length >0)?(res_quest_sub1[0].value):(0);

            quest_sub2.find({'sub1':first_sub1}).sort({value:1}).exec(function(err2_quest,sub2_quest){

                if(err2_quest)console.log(err2_quest);
                if(sub2_quest){
                    res_quest_sub2=sub2_quest; 
                }

                art_cat.find().sort({value:1}).exec(function(err_art,cat_art){

                    if(err_art)console.log(err_art);
                    if(cat_art){
                        res_article_cat=cat_art;
                    }
                    var first_cat=(res_article_cat.length >0)?(res_article_cat[0].value):(0);

                    art_sub1.find({'category':first_cat}).sort({value:1}).exec(function(err1_art,sub1_art){

                        if(err1_art)console.log(err1_art);
                        if(sub1_art){
                            res_article_sub1=sub1_art;
                        }
                        var first_sub1=(res_article_sub1.length >0)?(res_article_sub1[0].value):(0);

                        art_sub2.find({'sub1':first_sub1}).sort({value:1}).exec(function(err2_art,sub2_art){

                            if(err2_art)console.log(err2_art);
                            if(sub2_art){
                                res_article_sub2=sub2_art; 
                            }

                            res.render('dashboard', {
                                title:'Dashboard',
                                url:process.env.URL_ROOT,
                                user_info:req.user,

                                data_quest:res_quest_cat,
                                sub1_data_quest:res_quest_sub1,
                                sub2_data_quest:res_quest_sub2,

                                data_art:res_article_cat,
                                sub1_data_art:res_article_sub1,
                                sub2_data_art:res_article_sub2,

                                quest_status:question_status,
                                art_status:article_status,
                                home_status:home_status
                            });  

                        });

                    });

                }); //end article
            });
            

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
app.use('/posts',posts_routes);


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


/*posts*/
var upload = multer({storage:Storage});
/*process an 'ask a question' post,save & update UI immediately*/
app.post('/ask_question',upload.single('question_photo'),function(req,res,next){
    // console.log(req.body)

    var owner_details={id:req.user._id,displayName:req.user.displayName,displayPic:req.user.displayPic,
        status:req.user.current_appointment};

        let ask_quest =new question();
        ask_quest.body=req.body.question_title;
        ask_quest.category = req.body.question_category;
        ask_quest.sub_cat1=req.body.question_sub1;
        ask_quest.sub_cat2=req.body.question_sub2;
        ask_quest.description=req.body.question_info;
        ask_quest.owner=owner_details;

        if (req.file && req.file.filename != null) {
            ask_quest.pics.push(req.file.filename);
        }


        ask_quest.save(function(err1, ask_quest) {

            if(err1){console.log(err1);res.json({success: false,msg:"question submission failed"});

        }else{   
        // console.log(ask_quest);         
            var json = JSON.stringify(ask_quest, null, 2);
            // console.log(json);
            io.emit('all_questions', json);
            io.emit('unanswered_questions', json);
            res.json({success:true,msg:"Question submission succesful"});
        }   
    });

    });


/*process answers immediately*/
app.post('/answer_question',upload.single('section_answer_photo'),function(req,res,next){
    // console.log(req.user)

    
    var section_type=req.body.section_answer_type;
    var section_id=req.body.section_answer_id;
    switch(section_type){
        case'question':
        section = question;
        break;
    }

        section.findOne({_id:section_id},function(error,result){//find the question that was answered
            if(result){
                let updateSection = result;
                // console.log('updateSection')
                // console.log(updateSection)
                updateSection.answers_len=updateSection.answers_len +1;//incr the no. of ans
                updateSection.answers.push({
                    body : req.body.section_answer_details,
                    responderDisplayName:req.user.displayName,
                    responder_id:req.user._id,
                    responderDisplayPic:req.user.displayPic,
                    responderStatus:req.user.current_appointment
                }); 

                //store img if exists    

                if (req.file && req.file.filename != null) {
                    updateSection.answers[updateSection.answers.length - 1].pics.push(req.file.filename);
                }

                /*update all received info here*/
                let temp=updateSection.answers[updateSection.answers.length - 1];

                let most_recent_answer={
                    _id:temp._id,
                    body : temp.body,
                    responderDisplayName:temp.responderDisplayName,
                    responder_id:temp.responder_id,
                    responderDisplayPic:temp.responderDisplayPic,
                    responderStatus:temp.responderStatus,
                    comments:temp.comments,
                    upvotes:temp.upvotes,
                    downvotes:temp.downvotes,
                    views:temp.views,
                    post_date:temp.post_date,
                    date_created:temp.date_created,
                    date_modified:temp.date_modified,
                    question_id:section_id,
                    pics:temp.pics

                }

                // console.log(most_recent_answer);

                section.updateOne({_id:section_id},{$set:updateSection},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your post failed"});
                    }
                    if(res1){
                        // console.log(most_recent_answer);
                        var json = JSON.stringify(most_recent_answer, null, 2);
                        // console.log(json);
                        io.emit('answered', json);
                        res.json({success:true,msg:"Your post has been received successfully"});
                    }

                });             
            }else{
                res.json({success:false,msg:"Item not found"});
            }

        });


    });

server.listen(process.env.PORT || 3000,function(){
    console.log('Server started on port '+process.env.PORT);
});