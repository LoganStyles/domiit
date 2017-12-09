if(process.env.NODE_ENV !== 'production'){
    require('dotenv').load();
}

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
// var fs = require('fs-extra');
var moment = require('moment');
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
var riddle = require('./models/riddle');
var pab = require('./models/pab');

var quest_cat = require('./models/question_cats');
// var quest_sub1 = require('./models/question_sub1');
// var quest_sub2 = require('./models/question_sub2');

var art_cat = require('./models/article_cats');
// var art_sub1 = require('./models/article_sub1');
// var art_sub2 = require('./models/article_sub2');

var riddle_cat = require('./models/riddle_cats');
var pab_cat = require('./models/pab_cats');

var about = require('./models/about');

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
        },
        myforloop:function(n,block){
            var content='';
            var date = new Date();
            var current_year=date.getFullYear();

            for(var i=n;i<=current_year; i++)
            {
                content+=block.fn(i);
            }
            // console.log(content);
            return content;
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
    console.log(process.env);
    console.log('inside profile');
    console.log(req.user); 
   
    
    if(req.user){
        var qualification="",
        designation="",
        dob="",
        displayPic="avatar.png",
        backgroundPic="";

        if(req.user.qualification[0]){
            qualification=req.user.qualification[req.user.qualification.length -1].title;
        }
        console.log('qualification : '+qualification)

        if(req.user.designation[0]){
            designation=req.user.designation[req.user.designation.length -1].title;
        }
        console.log('designation : '+designation);

        if(req.user.dob){
            dob=moment().diff(new Date(req.user.dob),'years');
        }
        console.log('dob : '+dob);
        if(req.user.displayPic[0]){
            displayPic=req.user.displayPic[req.user.displayPic.length - 1];
        }
        console.log('displayPic : '+displayPic);

        if(req.user.backgroundPic[0]){
            backgroundPic=req.user.backgroundPic[req.user.backgroundPic.length - 1];
        }
        console.log('backgroundPic : '+backgroundPic);


        res.render('profile', {
            url:process.env.URL_ROOT,
            user_info:req.user,
            dob:dob,
            displayPic:displayPic,
            qualification:qualification,
            designation:designation,
            backgroundPic:backgroundPic,
            friends_count:req.user.friend_ids.length,
            requests_count:req.user.request_ids.length,
            questions_count:req.user.question_ids.length,
            answers_count:req.user.answer_ids.length,
            articles_count:req.user.article_ids.length,
            reviews_count:req.user.review_ids.length,
            riddles_count:req.user.riddle_ids.length,
            solutions_count:req.user.solution_ids.length,
            postedbooks_count:req.user.postedbook_ids.length,
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
    riddle_status=false,
    pab_status=false,
    home_status=true;

    var displayPic='avatar.png';
    if(req.user.displayPic[0]){
        displayPic=req.user.displayPic[req.user.displayPic.length - 1];
    }


    //get all items
    quest_cat.find().sort({value:1}).exec(function(err_quest,cat_quest){
        var res_quest_cat=[],
        res_article_cat=[],
        res_pab_cat=[],
        res_riddle_cat=[];

        if(err_quest){console.log(err_quest);}
        else if(cat_quest){
            res_quest_cat=cat_quest;
        }

        art_cat.find().sort({value:1}).exec(function(err_art,cat_art){

            if(err_art)console.log(err_art);
            if(cat_art){
                res_article_cat=cat_art;
            }

            riddle_cat.find().sort({value:1}).exec(function(err_rid,cat_rid){

                if(err_rid)console.log(err_rid);
                if(cat_rid){
                    res_riddle_cat=cat_rid;
                }


                pab_cat.find().sort({value:1}).exec(function(err_pab,cat_pab){

                    if(err_pab)console.log(err_rid);
                    if(cat_pab){
                        res_pab_cat=cat_pab;
                    }

                    res.render('dashboard', {
                        title:'Dashboard',
                        url:process.env.URL_ROOT,
                        user_info:req.user,
                        displayPic:displayPic,

                        data_quest:res_quest_cat,
                        data_art:res_article_cat,
                        data_riddle:res_riddle_cat,
                        data_pab:res_pab_cat,

                        quest_status:question_status,
                        art_status:article_status,
                        riddle_status:riddle_status,
                        home_status:home_status
                    });

                });

            });             

        });

    });


});

app.get('/admin',isLoggedIn, function(req, res) {
    console.log('inside cms');
    if(req.user){
     res.render('cms_dashboard', {
        title:'CMS',
        url:process.env.URL_ROOT,
        user_info:req.user,
        about_home_status:true,
        about_status:true,
    }); 
 }else{
    res.redirect('/');
}

});


app.get('/', function(req, res) {
    about.findOne({id:1},function(error,result){
        var res_data=[];
        if(error){
            console.log(error)
        }else if(result){
            console.log(result)
            res_data=result;
        }

        res.render('index', {
            title:'Home',
            url:process.env.URL_ROOT,
            data:res_data
        });

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
    console.log('req.fil')
    console.log(req.file);

    var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('avatar.png');

    var owner_details={id:req.user._id,
        displayName:req.user.displayName,
        displayPic:displayPic,
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


/*process an 'write an article' post,save & update UI immediately*/
var article_upload = upload.fields([
    {name: 'article_attachment',maxCount:1 },
    {name: 'article_photo',maxCount:1 }]);
app.post('/ask_article',article_upload,function(req,res,next){
    console.log(req.files)

    var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('avatar.png');

    var owner_details={id:req.user._id,
        displayName:req.user.displayName,
        displayPic:displayPic,
        status:req.user.current_appointment};

        let write_art =new article();
        write_art.body=req.body.article_title;
        write_art.category = req.body.article_category;
        write_art.sub_cat1=req.body.article_sub1;
        write_art.sub_cat2=req.body.article_sub2;
        write_art.description=req.body.article_info;
        write_art.owner=owner_details;

        // if (req.file && req.file.filename != null) {
        //     write_art.pics.push(req.file.filename);
        // }

        //store attachment if it exists
        if(req.files && req.files['article_attachment']){
            console.log('filename '+req.files['article_attachment'][0].filename)
            write_art.attachment.push(req.files['article_attachment'][0].filename);
        }

        //store photo if it exists
        if(req.files && req.files['article_photo']){
            console.log('filename '+req.files['article_photo'][0].filename)
            write_art.pics.push(req.files['article_photo'][0].filename);
        }


        write_art.save(function(err1, ask_quest) {

            if(err1){console.log(err1);res.json({success: false,msg:"Article submission failed"});

        }else{   
        // console.log(ask_quest);         
            var json = JSON.stringify(write_art, null, 2);
            // console.log(json);
            // io.emit('all_questions', json);
            // io.emit('unanswered_questions', json);
            res.json({success:true,msg:"Article submission succesful"});
        }   
    });

    });



/*process an 'ask a riddle' post,save & update UI immediately*/
app.post('/ask_riddle',upload.single('riddle_photo'),function(req,res,next){
    console.log('req.fil')
    console.log(req.file)

    var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('avatar.png');

    var owner_details={id:req.user._id,
        displayName:req.user.displayName,
        displayPic:displayPic,
        status:req.user.current_appointment};

        let ask_riddle =new riddle();
        ask_riddle.body=req.body.riddle_title;
        ask_riddle.category = req.body.riddle_category;
        ask_riddle.sub_cat1=req.body.riddle_sub1;
        ask_riddle.sub_cat2=req.body.riddle_sub2;
        ask_riddle.owner=owner_details;

        if (req.file && req.file.filename != null) {
            ask_riddle.pics.push(req.file.filename);
        }


        ask_riddle.save(function(err1, saved_ridd) {

            if(err1){console.log(err1);res.json({success: false,msg:"Riddle submission failed"});

        }else{   
        // console.log(ask_quest);         
            var json = JSON.stringify(saved_ridd, null, 2);
            // console.log(json);
            // io.emit('all_questions', json);
            // io.emit('unanswered_questions', json);
            res.json({success:true,msg:"Riddle submission successful"});
        }   
    });

    });


/*process an 'post a book' post,save & update UI immediately*/
app.post('/ask_pab',upload.single('pab_photo'),function(req,res,next){
    console.log('req.fil')
    console.log(req.file)

    var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('avatar.png');

    var owner_details={id:req.user._id,
        displayName:req.user.displayName,
        displayPic:displayPic,
        status:req.user.current_appointment};

        let ask_pab =new pab();
        ask_pab.body=req.body.pab_title;
        ask_pab.category = req.body.pab_category;
        ask_pab.author=req.body.pab_author;
        ask_pab.amount=req.body.pab_amount;
        ask_pab.isbn=req.body.pab_isbn;
        ask_pab.pages=req.body.pab_pages;
        ask_pab.publishers=req.body.pab_publishers;
        ask_pab.bookshop=req.body.pab_bookshop;
        ask_pab.url=req.body.pab_url;
        ask_pab.synopsis=req.body.pab_synopsis;
        ask_pab.about_author=req.body.pab_about_author;
        ask_pab.owner=owner_details;

        if (req.file && req.file.filename != null) {
            ask_pab.pics.push(req.file.filename);
        }


        ask_pab.save(function(err1, saved) {

            if(err1){console.log(err1);res.json({success: false,msg:"Book post failed"});

        }else{   
        // console.log(ask_quest);         
            var json = JSON.stringify(saved, null, 2);
            // console.log(json);
            // io.emit('all_questions', json);
            // io.emit('unanswered_questions', json);
            res.json({success:true,msg:"Book post successful"});
        }   
    });

    });


/*updates the description on the profile */
app.post('/update_desc',function(req,res,next){
    var update_desc={description:req.body.profile_desc_description};

    user.findOneAndUpdate(
        {email:req.session.user.email},
        {$currentDate:{date_modified:true},$set:update_desc},function(err1,res1){

        if(err1){
            console.log(err1)
            res.json({success:false,msg:"Your profile update failed"});
        }
        if(res1){                        
            res.json({success:true,msg:"Your profile update was successfull"});
        }

    });
    
});


/*updates the education on the profile */
app.post('/update_edu',function(req,res,next){

    var update_items={
        title:req.body.profile_edu_title,
        // body:'',
        from_year:req.body.profile_edu_from,
        to_year:req.body.profile_edu_to
    }


    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;
            updateUser.education.push(update_items);//append education items

            console.log(updateUser);

            user.updateOne({email:req.session.user.email},
                {$currentDate:{date_modified:true},$set:updateUser},function(err1,res1){

                if(err1){
                    console.log(err1)
                    res.json({success:false,msg:"Your profile update failed"});
                }else if(res1){                        
                    res.json({success:true,msg:"Your profile update was successfull"});
                }

            });

        }

    });
    
});

/*updates the qualifications on the profile */
app.post('/update_qual',function(req,res,next){
    // console.log('about qual');
    // console.log(req.body.profile_qual_title)
    // console.log(req.body.profile_qual_year)

    var update_items={
        title:req.body.profile_qual_title,
        // body:'',
        year:req.body.profile_qual_year
    }


    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;
            updateUser.qualification.push(update_items);//append education items

            console.log(updateUser);

            user.updateOne({email:req.session.user.email},
                {$currentDate:{date_modified:true},$set:updateUser},function(err1,res1){

                if(err1){
                    console.log(err1)
                    res.json({success:false,msg:"Your profile update failed"});
                }else if(res1){                        
                    res.json({success:true,msg:"Your profile update was successfull"});
                }

            });

        }

    });
    
});

/*updates the schools on the profile */
app.post('/update_sch',function(req,res,next){

    var update_items={
        title:req.body.profile_sch_title,
        // body:'',
    }


    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;
            updateUser.schools.push(update_items);//append education items

            console.log(updateUser);

            user.updateOne({email:req.session.user.email},
                {$currentDate:{date_modified:true},$set:updateUser},function(err1,res1){

                if(err1){
                    console.log(err1)
                    res.json({success:false,msg:"Your profile update failed"});
                }else if(res1){                        
                    res.json({success:true,msg:"Your profile update was successfull"});
                }

            });

        }

    });
    
});


/*updates bio1*/
var profile_upload = upload.fields([
    {name: 'profile_bio1_displayPic',maxCount:1 },
    {name: 'profile_bio1_backgroundPic',maxCount:1 }]);

app.post('/update_bio1',profile_upload,function(req,res,next){

    console.log(req.body);

    var dob = moment(req.body.profile_bio1_dob,'MM-DD-YYYY');
    console.log(dob);

    designation_updates={
        title:req.body.profile_bio1_designation,
        body:''
    }

    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;
            updateUser.firstname=req.body.profile_bio1_firstname;
            updateUser.lastname=req.body.profile_bio1_lastname;
            updateUser.dob=dob;
            updateUser.displayName=updateUser.firstname+' '+updateUser.lastname;
            updateUser.designation.push(designation_updates);

            //store img if it exists
            if(req.files && req.files['profile_bio1_displayPic']){
                console.log('filename '+req.files['profile_bio1_displayPic'][0].filename)
                updateUser.displayPic.push(req.files['profile_bio1_displayPic'][0].filename);
            }

            if(req.files && req.files['profile_bio1_backgroundPic']){
                console.log('filename '+req.files['profile_bio1_backgroundPic'][0].filename)
                updateUser.backgroundPic.push(req.files['profile_bio1_backgroundPic'][0].filename);
            }
            console.log(updateUser);

            user.updateOne({email:req.session.user.email},
                {$currentDate:{date_modified:true},$set:updateUser},function(err1,res1){

                if(err1){
                    console.log(err1)
                    res.json({success:false,msg:"Your profile update failed"});
                }else if(res1){                        
                    res.json({success:true,msg:"Your profile update was successfull"});
                }

                });
        }

    });

});


/*process responses immediately*/
app.post('/response_item',upload.single('section_response_photo'),function(req,res,next){
    // console.log(req.user)

    
    var section_type=req.body.section_response_type;
    var section_id=req.body.section_response_id;
    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;
    }

        section.findOne({_id:section_id},function(error,result){//find the question that was responsed
            if(result){
                let updateSection = result;
                updateSection.answers_len=updateSection.answers_len +1;//incr the no. of ans
                updateSection.date_modified=new Date();
                updateSection.answers.push({
                    body : req.body.section_response_details,
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

                let most_recent_response={
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
                    item_id:section_id,
                    pics:temp.pics

                }


                section.updateOne({_id:section_id},{$set:updateSection},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your post failed"});
                    }else if(res1){
                        var json = JSON.stringify(most_recent_response, null, 2);
                        // console.log(json);
                        io.emit('responded', json);
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