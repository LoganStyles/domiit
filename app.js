if(process.env.NODE_ENV !== 'production'){
    require('dotenv').load();
}

var http = require('http');
var fetch = require('node-fetch');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var session = require('client-sessions');
var path = require('path');
var request = require('request');
var fs = require('fs');
// var froalaEditor = require('froala-editor');
//var FroalaEditor = require('wysiwyg-editor-node-sdk/lib/froalaEditor.js');

var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var MomentHandler =require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);
var just_hb_helper= require('just-handlebars-helpers');
just_hb_helper.registerHelpers(Handlebars);
var user = require('./models/user');
var members = require('./routes/members');
var cms_routes = require('./routes/cms');
var posts_routes = require('./routes/posts');
var question = require('./models/question');
var article = require('./models/article');
var riddle = require('./models/riddle');
var pab = require('./models/pab');
var trend = require('./models/trend');
var notice = require('./models/notice');
var request_model = require('./models/request');

var trend_cat = require('./models/trend_cats');
var quest_cat = require('./models/question_cats');
var art_cat = require('./models/article_cats');
var riddle_cat = require('./models/riddle_cats');
var pab_cat = require('./models/pab_cats');
var notice_cat = require('./models/notice_cats');

var about = require('./models/about');
var async = require('async');
var multer = require('multer');
var mime = require('mime-lib');
var notifs = require('notifications');

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

var process_posts=require('./config/processor');

var mongoose = require('mongoose');


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
    

//this always updates the session
app.use(function(req,res,next){
    console.log('inside app.use')
    if(req.session && req.session.user){
        user.findOne({email:req.session.user.email},function(err,user){
            if(user){
                console.log('inside app.use: exiting user found')
                req.user = user;
                // delete user.password; not working//delete the password from the session
                req.session.user = user; //refresh the session value
                res.locals.user = user;
            }
            // finishing processing the middleware and run the route
            next();
        });
    }else{
        console.log('inside app.use: no existing req.session')
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

function convertToSentencCase(text_data){
    console.log('text_data '+text_data);
    var n = text_data.split(".");
    var vfinal="";

    for(i=0;i<n.length;i++){
        var spaceput="";
        var space_count=n[i].replace(/^(\s*).*$/,"$1").length;
        n[i]=n[i].replace(/^\s+/,"");
        var newstring =n[i].charAt(n[i]).toUpperCase()+n[i].slice(1);

        for(j=0;j<space_count;j++)
            spaceput=spaceput+" ";
        vfinal=vfinal+spaceput+newstring+".";
    }
    vfinal=vfinal.substring(0,vfinal.length - 1);
    return vfinal;
}

/*removes dupliates from an array*/
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

/*deletes all occurances of an item from an array*/
function remove(array,element){
    return array.filter(e =>e !== element)
}


app.get('/profile/:id',isLoggedIn, function(req, res) {
    console.log('inside profile');
    // console.log(req)   
    //fetch user
    var user_id = req.params.id;
    console.log('user id '+user_id);

    user.findOne({_id:user_id},function(err,u){
        if(u){
            let found_user = u;

            var qualification="",
            designation="",
            dob="",age="",
            displayPic="uploads/avatar.png",
            backgroundPic="";

            if(found_user.qualification[0]){
                qualification=found_user.qualification[found_user.qualification.length -1].title;
            }
            console.log('qualification : '+qualification)

            if(found_user.designation[0]){
                designation=found_user.designation[found_user.designation.length -1].title;
            }
            console.log('designation : '+designation);

            if(found_user.dob){
                dob=moment(found_user.dob).format('MM/DD/YYYY');
                age=moment().diff(new Date(found_user.dob),'years');
            }
            console.log('dob : '+dob);
            console.log('age : '+age);
            if(found_user.displayPic[0]){
                displayPic=found_user.displayPic[found_user.displayPic.length - 1];
            }
            console.log('displayPic : '+displayPic);

            if(found_user.backgroundPic[0]){
                backgroundPic=found_user.backgroundPic[found_user.backgroundPic.length - 1];
            }
            console.log('backgroundPic : '+backgroundPic);


            res.render('profile', {
                url:process.env.URL_ROOT,
                user_info:found_user,
                dob:dob,
                age:age,
                displayPic:displayPic,
                qualification:qualification,
                designation:designation,
                backgroundPic:backgroundPic,
                followers_count:found_user.followers.length,
                followed_count:found_user.followed.length,
                bookmarks_count:found_user.bookmarks.length,
                requests_count:found_user.request_ids.length,
                questions_count:found_user.question_ids.length,
                answers_count:found_user.answer_ids.length,
                articles_count:found_user.article_ids.length,
                reviews_count:found_user.review_ids.length,
                riddles_count:found_user.riddle_ids.length,
                solutions_count:found_user.solution_ids.length,
                postedbooks_count:found_user.postedbook_ids.length,
                groups_count:found_user.group_ids.length
            });

        }else{
            res.redirect('/');
        }

    });
    
    
});

app.get('/fetchCats',isLoggedIn,function(req,res){
    console.log(req.query);
    var section =req.query.section,
    cat;

    switch(section){
        case 'question':
        cat =quest_cat;
        break;

        case 'article':
        cat =art_cat;
        break;

        case 'riddle':
        cat =riddle_cat;
        break;

        case 'Post Books':
        case 'pab':
        cat =pab_cat;
        break;
    }

    cat.find().sort({value:1}).exec(function(err1,res1){
        var res_cat=[];

        if(err1){
            console.log(err1);

            res.json({success:false,
                msg:"Fetched categories failed",
                cats:res_cat
            });
        }else if(res1){
            res_cat=res1;

            res.json({
                success:true,
                msg:"Fetched categories successfully",
                cats:res_cat
            });
        }

    });        
});

/*
fetch sub cat1s for a category
*/
app.get('/fetchSubCats1',isLoggedIn,function(req,res){
    console.log(req.query);
    var section_type =req.query.section,
    category =req.query.item,
    section;

    switch(section_type){
        case 'question':
        section =question;
        break;

        case 'article':
        section =article;
        break;

        case 'riddle':
        section =riddle;
        break;

        case 'request':
        section =request_model;
        break;
    }

    section.find({category:category},{sub_cat1:1}).exec(function(err1,res1){
        var res_subcat=[];

        if(err1){
            console.log(err1);

            res.json({success:false,
                msg:"Fetched sub categories failed",
                cats:res_subcat
            });
        }else if(res1){
            console.log(res1);
            res_subcat=res1;

            res.json({
                success:true,
                msg:"Fetched sub categories successfully",
                cats:res_subcat
            });
        }

    });        
});
/*

fetch sub cat2s for a category
*/
app.get('/fetchSubCats2',isLoggedIn,function(req,res){
    console.log(req.query);
    var section_type =req.query.section,
    cat1 =req.query.item,
    section;

    switch(section_type){
        case 'question':
        section =question;
        break;

        case 'article':
        section =article;
        break;

        case 'riddle':
        section =riddle;
        break;

        case 'request':
        section =request_model;
        break;
    }

    section.find({sub_cat1:cat1},{sub_cat2:1}).exec(function(err1,res1){
        var res_subcat=[];

        if(err1){
            console.log(err1);

            res.json({success:false,
                msg:"Fetched sub categories2 failed",
                cats:res_subcat
            });
        }else if(res1){
            console.log(res1);
            res_subcat=res1;

            res.json({
                success:true,
                msg:"Fetched sub categories2 successfully",
                cats:res_subcat
            });
        }

    });        
});

/*
fetch users
*/
app.get('/fetchUsers',isLoggedIn,function(req,res){
    console.log(req.query);
    var section_type =req.query.section;
    //level:req.query.item

    user.find({_id:{$ne:req.user._id}},{_id:1,displayName:1}).exec(function(err1,res1){
        var res_subcat=[];

        if(err1){
            console.log(err1);

            res.json({success:false,
                msg:"Fetched users failed",
                cats:res_subcat
            });
        }else if(res1){
            console.log(res1);
            res_subcat=res1;

            res.json({
                success:true,
                msg:"Fetched users successfully",
                cats:res_subcat
            });
        }

    });        
});

/*upload inline images from editor*/
app.post('/uploadInlineImages',isLoggedIn,function(req,res){
console.log('inside inline images');
    //store image
    FroalaEditor.Image.upload(req,'/public/uploads/',function(err,data){
        //return data
        if(err){
            return res.send(JSON.stringify(err));
        }
        console.log('inside inline images: sending resp');
        res.send(data);
    });

});

/*
fetch at most 5 rows from each section,
sort them by date_created
*/
app.get('/dashboard',isLoggedIn,function(req,res){
    console.log('inside dashboard');
    //page defaults
    var skip_val=0,
    req_count=0,
    limit_val=5,
    page='dashboard',
    page_title='',
    page_results=[],
    res_item_trend=[];

    //get trending stories for sidebar headlines::nb::this operation takes a while to complete,
    //try nesting or callbacks to prevent
    trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

        if(err_trend){
            //console.log(err_trend);
        }
        if(item_trend){
            //console.log(item_trend);
            res_item_trend=item_trend;
        }

    //get total requests for this user
    var id_string=(req.user._id).toString();
    request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err1,res1){
        req_count =res1.length;

        var curr_user_display_pic='uploads/avatar.png';//set default pic
        if(req.user.displayPic[0]){
            curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

        var bookmark_len=req.user.bookmarks.length;//get saved bookmarks


        //find pending notifications length
        var pending_friend_notifs=0;
        process_posts.getNotifications(req.user,function(rel_notifs){
             pending_friend_notifs=rel_notifs;

    //using async get the last 5 results from each collection
    async.concat([question,article,riddle,pab,trend,notice],function(model,callback){
        var query = model.find({}).sort({"date_created":-1}).skip(skip_val).limit(limit_val);
        query.exec(function (err,docs){
            if(err){
                console.log('err in query');
                console.log(err);
            }else if(docs){
             callback(err,docs); 
         }      

     });
    },
    function(err2,res_items){
        if (err2){
            console.log('err2 ')
        }else if(res_items){
            //results are now merged so sort by date
            page_results=res_items.sort(function(a,b){
                return (a.date_created < b.date_created)? 1:(a.date_created > b.date_created)? -1:0;
            });
            //console.log('sorted page_results')
            //console.log(page_results);
        }

        if(page_results.length >0){
            //update other details needed by the post
            process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('PROCESSED RESPONSE');
                //console.log(processed_response);

                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    data:processed_response,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'dashboard_page',
                    pending_friend_notifs:pending_friend_notifs,
                    req_count:req_count,
                    bookmarks_count:bookmark_len,

                    quest_page_status:false,
                    art_page_status:false,
                    riddle_page_status:false,
                    notice_page_status:false,
                    pab_page_status:false,
                    trend_page_status:false,
                    home_page_status:true
                });

            });           

        }else{
            console.log('PAGE RESULTS INITIALLY EMPTY')
            
            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:page_results,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'dashboard_page',
                pending_friend_notifs:pending_friend_notifs,
                req_count:req_count,
                bookmarks_count:bookmark_len,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:true
            });

        }
        
        
    });

    });//end notifs

    });//end request


    });//end trend


});

app.get('/acceptFriendRequest',isLoggedIn,function(req,res){

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Update your profile first"});
    }else{
        console.log('accepting friend request');
        var source_id = req.query.source_id;
        var notif_id = req.query.notif_id;
        console.log('accept source_id '+source_id);
        console.log('accept source_id type '+ typeof(source_id));
        console.log('accept notif_id '+notif_id);
        var curr_user=req.user;
        console.log('curr_user '+curr_user._id);

        //accept the friendship
        curr_user.acceptRequest(source_id,function(err,friendship){
            if (err){
               console.log(err);
               res.json({success:false,msg:"Friendship processing failed"});
            } 

            if(friendship){console.log('friendship',friendship);
            res.json({success:true,msg:"You accepted a friendship"});
            }
        })
    }
});

app.get('/rejectFriendRequest',isLoggedIn,function(req,res){

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Update your profile first"});
    }else{
        console.log('rejecting friend request');
        var source_id = req.query.source_id;
        console.log('rejected source_id'+source_id);
        var curr_user=req.user;

        //accept the friendship
        curr_user.denyRequest(source_id,function(err,denied){
            if (err){
               console.log(err);
               res.json({success:false,msg:"Friendship rejection processing failed"});
            } 

            if(denied){console.log('friendship',denied)
            res.json({success:true,msg:"You rejected a friendship"});
            }
        })
    }
});

//register notifications for friend request
notifs.on('friends_new',function(notif){
    console.log('new friend notifs')
    console.log(notif.object);
    console.log(notif.info);
    /*update destination's page in real time using socket.io*/
    //fetch socket frm db
});

/*sends a friend request to the owner of the post*/
app.get('/sendFriendRequest',isLoggedIn, function(req, res) {
    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Update your profile first"});
    }else{

        console.log('sending friend request');
        var owner_id = req.query.owner_id;
        console.log('received owner_id'+owner_id);
        var curr_user=req.user;
    // console.log('curr user '+ curr_user);
    //curr user sends request to owner
    curr_user.friendRequest(owner_id,function(err,request){
        if (err) console.log(err);
        console.log('request',request);
        if(request){
            res.json({success:true,msg:"Friend Request Sent"});
            //send notification to requested
        //     var new_friend_notif_obj={
        //         source_id:curr_user._id,
        //         source_name:curr_user.displayName,
        //         source_pic:curr_user.displayPic,
        //         destination_id:owner_id,
        //         status:'Pending',
        //         notif_type:'friends',
        //         message:curr_user.displayName+' sent you a friend request'
        //     }
        //     notifs.post('friends_new',new_friend_notif_obj,{language:'en'});
        //     //update requested's notifications db
        //     user.findOne({_id:owner_id}, function(err1, user_owner) {
        //         if(user_owner){
        //             let updateRequested=user_owner;

        //         updateRequested.notifications.push(new_friend_notif_obj);//append notification items
        //         updateRequested.date_modified=new Date();//update date
        //         console.log(updateRequested);

        //         user.updateOne({_id:owner_id},{$set:updateRequested},function(err2,res2){
        //             if(err2){
        //                 console.log(err2);
        //                 res.json({success:false,msg:"Friend Request Failed"});
        //             }
        //             else if(res2){
        //                 res.json({success:true,msg:"Friend Request Sent"});
        //             }
        //         });

        //     }

        // });
        }
    });

}

});


/*sends a friend request to the owner of the post*/
app.get('/getFriendRequests',isLoggedIn, function(req, res) {
    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Update your profile first"});
    }else{

        console.log('searching for friend request');
        //var curr_user_notifications_len=req.user.notifications.length;
        var notif_res=[];
        var page='friend_request';var page_title='';
        var curr_user=req.user;

        //get pending friends
        curr_user.getPendingFriends(curr_user._id,function(err,pending){
            if(err){
                console.log('err occured geting pending friends');
                console.log(err)
            }
            if(pending){
                console.log(pending);
                var len=pending.length;
                var new_friend_notif_obj;
                var curr_pending;
                for(var i=0;i<len;i++){
                    curr_pending=pending[i];

                    new_friend_notif_obj={
                    source_id:curr_pending._id,
                    source_name:curr_pending.displayName,
                    source_pic:curr_pending.displayPic[0],
                    destination_id:curr_user._id,
                    status:'Pending',
                    notif_type:'friends',
                    message:curr_pending.displayName+' sent you a friend request'
                }
                notif_res.push(new_friend_notif_obj);

                }
                console.log(notif_res);
            }

        });

        // //fetch pending friend notifications
        // for(var i=0;i<curr_user_notifications_len;i++){
        //     console.log('inside notif for loog')
        //     if((req.user.notifications[i].notif_type=='friends') && ( req.user.notifications[i].status=='Pending')){
        //         notif_res.push(req.user.notifications[i]);
        //         console.log('pushed 1 notif '+i)
        //     }
        // }
        // console.log(notif_res);
        // console.log(process.env.URL_ROOT);

        res.render(page,{
            url:process.env.URL_ROOT,
            displayPic:req.user.displayPic,
            user_info:req.user,
            data:notif_res,
            // data_trend:res_item_trend,
            page_title: page_title,
            // pending_friend_notifs:pending_friend_notifs,

            quest_page_status:false,
            art_page_status:false,
            riddle_page_status:false,
            notice_page_status:false,
            pab_page_status:false,
            trend_page_status:false,
            home_page_status:true
        });

        }

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
            // console.log(result)
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
    //get connected socketId & save in db
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

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');

        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let ask_quest =new question();
                ask_quest.post_type="question";
                ask_quest.access=1;//default :public access
                ask_quest.body=convertToSentencCase(req.body.question_title);
                ask_quest.category = req.body.question_category;
                ask_quest.sub_cat1=req.body.question_sub1;
                ask_quest.sub_cat2=req.body.question_sub2;
                ask_quest.description=req.body.question_info;
                ask_quest.owner=owner_details;

            if (req.file && req.file.filename != null) {
                ask_quest.pics.push('uploads/'+req.file.filename);
            }

            ask_quest.save(function(err1, saved_quest) {

                if(err1){console.log(err1);res.json({success: false,msg:"question submission failed"});

            }else{   
                var page_results=[];
                console.log(saved_quest);
                page_results.push(saved_quest);

                process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('JSON PROCESSED RESPONSE');
                 console.log(processed_response);
                var json = JSON.stringify(processed_response[0], null, 2);

                // console.log(json);//update dashboard,all questions & unanswered quests
                console.log('emitting...')
                io.emit('new_questions', json);
                res.json({success:true,msg:"Question submission succesful"});

            });
                    
                }   
            });

        }

    });


/*process an 'write an article' post,save & update UI immediately*/
var article_upload = upload.fields([
    {name: 'article_attachment',maxCount:1 },
    {name: 'article_photo',maxCount:1 }]);
app.post('/ask_article',article_upload,function(req,res,next){
    console.log(req.files)

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');

        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let write_art =new article();
            write_art.post_type="article";
            write_art.access=1;//default :public access
            write_art.body=convertToSentencCase(req.body.article_title);
            write_art.topic=convertToSentencCase(req.body.article_topic);
            write_art.category = req.body.article_category;
            write_art.sub_cat1=req.body.article_sub1;
            write_art.sub_cat2=req.body.article_sub2;
            write_art.description=req.body.article_info;
            write_art.owner=owner_details;

        //store attachment if it exists
        if(req.files && req.files['article_attachment']){
            console.log('filename '+req.files['article_attachment'][0].filename)
            write_art.attachment.push('uploads/'+req.files['article_attachment'][0].filename);
        }

        //store photo if it exists
        if(req.files && req.files['article_photo']){
            console.log('filename '+req.files['article_photo'][0].filename)
            write_art.pics.push('uploads/'+req.files['article_photo'][0].filename);
        }


        write_art.save(function(err1, saved_art) {

            if(err1){console.log(err1);res.json({success: false,msg:"Article submission failed"});

            }else{
                var page_results=[];
                page_results.push(saved_art);

                process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('JSON PROCESSED RESPONSE');
                var json = JSON.stringify(processed_response[0], null, 2);
                console.log('emitting...')
                io.emit('new_articles', json);
                res.json({success:true,msg:"Article submission succesful"});

            });

            }   
        });

    }    

});


/*process a request post,save*/
var request_upload = upload.fields([
    // {name: 'request_attachment',maxCount:1 },
    {name: 'request_photo',maxCount:1 }]);
app.post('/make_request',request_upload,function(req,res,next){
    
    var request_type=req.body.request_type;
    console.log('request_type '+request_type);

    if((req.body.request_choice) && (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("request failed or user has not updated profile")
        res.json({success:false,msg:"Your request failed"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');


        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let write_req =new request_model();
            write_req.post_type="request";
            write_req.access=1;//default :public access

            if(request_type=="question"){
                write_req.body=convertToSentencCase(req.body.request_title);
                write_req.description=req.body.request_info;
            }else if(request_type=="article"){
                write_req.topic=convertToSentencCase(req.body.request_topic);
                write_req.description=convertToSentencCase(req.body.request_info_article);
            }else if(request_type=="riddle"){
                write_req.body=convertToSentencCase(req.body.request_title_riddle);
            }
            
            write_req.category = req.body.request_category;
            write_req.destination_id = req.body.request_users;
            write_req.sub_cat1=req.body.request_sub1;
            write_req.sub_cat2=req.body.request_sub2;
            write_req.destination_id=req.body.request_users;
            write_req.destination_type=req.body.request_choice;
            
            write_req.owner=owner_details;

            //set the appropriate request type
            switch(req.body.request_type){
                case 'question':
                write_req.question_status = true;
                break;

                case 'article':
                write_req.art_status = true;
                break;

                case 'riddle':
                write_req.riddle_status = true;
                break;
            }

        //store attachment if it exists
        // if(req.files && req.files['request_attachment']){
        //     console.log('filename '+req.files['request_attachment'][0].filename)
        //     write_req.attachment.push('uploads/'+req.files['request_attachment'][0].filename);
        // }

        //store photo if it exists
        if(req.files && req.files['request_photo']){
            console.log('filename '+req.files['request_photo'][0].filename)
            write_req.pics.push('uploads/'+req.files['request_photo'][0].filename);
        }


        write_req.save(function(err1, saved_req) {

            if(err1){console.log(err1);res.json({success: false,msg:"Request submission failed"});

            }else{
                res.json({success:true,msg:"Request submission succesful"});
            }   
        });

    }    

});


/*process a new request*/
var request_upload = upload.fields([
    // {name: 'request_attachment',maxCount:1 },
    //{name: 'new_request_photo',maxCount:1 }
    ]);
app.post('/make_new_request',request_upload,function(req,res,next){

    // for (var key in body) {//loop thru obj
    //     console.log(key)
    //         // if (body.hasOwnProperty(key)) {
    //         //     console.log(key + " -> " + body[key]);
    //         // }
    //     }
    
    //console.log('request '+req);
    var request_type=req.body.new_request_type;
    console.log('request_type '+request_type);

    var request_id=req.body.new_request_id;
    console.log('request_id '+request_id);

    if((req.body.new_request_choice) && (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("request failed or user has not updated profile")
        res.json({success:false,msg:"Your request failed"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');


        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};
            var section;

            switch(request_type){
                case 'question':
                section=question;
                break;

                case'article':
                section = article;
                break;

                case'riddle':
                section = riddle;
                break;

                case'pab':
                section = pab;
                break;

            }

            //get question & insert into request
            section.findOne({_id:request_id},function(error,result){
                if(result){
                    let section_data=result;

                    let write_req =new request_model();
                    write_req.post_type="request";
                    write_req.access=1;//default :public access

                    if(request_type=="question"){
                        write_req.body=section_data.body;
                        write_req.description=section_data.description;
                    }else if(request_type=="article"){
                        write_req.topic=(req.body.new_request_topic);
                        write_req.description=(req.body.new_request_info_article);
                    }else if(request_type=="riddle"){
                        write_req.body=(req.body.new_request_title_riddle);
                    }

                    write_req.destination_id=req.body.new_request_users;
                    write_req.destination_type=req.body.new_request_choice;
                    write_req.category = section_data.category;
                    write_req.sub_cat1 = section_data.sub_cat1;
                    write_req.sub_cat2 = section_data.sub_cat2;
                    write_req.pics = section_data.pics;
                    write_req.date_created = new Date();;
                    write_req.sub_cat2 = section_data.sub_cat2;

                    write_req.owner=owner_details;
                    //set the appropriate new_request type
                    switch(request_type){
                        case 'question':
                        write_req.question_status = true;
                        break;

                        case 'article':
                        write_req.art_status = true;
                        break;

                        case 'riddle':
                        write_req.riddle_status = true;
                        break;
                    }

                    write_req.save(function(err1, saved_req) {

                        if(err1){console.log(err1);res.json({success: false,msg:"Request submission failed"});

                    }else{
                        res.json({success:true,msg:"Request submission succesful"});
                    }   
                });

                }else{
                    res.json({success: false,msg:"Item not found for this request"});
                }
            });

        }    

    });

/*process an 'write a notice' post,save & update UI immediately*/
var notice_upload = upload.fields([
    {name: 'notice_photo',maxCount:1 }]);
app.post('/ask_notice',notice_upload,function(req,res,next){
    console.log(req.files)

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');

        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let write_notice =new notice();
            write_notice.post_type="notice board";
            write_notice.access=1;//default :public access
            write_notice.body=convertToSentencCase(req.body.notice_title);
            write_notice.category = req.body.notice_top_heading;
            write_notice.sub_cat1=req.body.notice_main_heading;
            write_notice.sub_cat2=req.body.notice_type;
            write_notice.owner=owner_details;

        //store photo if it exists
        if(req.files && req.files['notice_photo']){
            console.log('filename '+req.files['notice_photo'][0].filename)
            write_notice.pics.push('uploads/'+req.files['notice_photo'][0].filename);
        }


        write_notice.save(function(err1, saved_notice) {

            if(err1){console.log(err1);res.json({success: false,msg:"notice submission failed"});

            }else{
                // var json = JSON.stringify(saved_notice, null, 2);
                // io.emit('new_notices', json);
                // res.json({success:true,msg:"Notice submission succesful"});

                var page_results=[];
                page_results.push(saved_notice);

                process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('JSON PROCESSED RESPONSE');
                var json = JSON.stringify(processed_response[0], null, 2);
                console.log('emitting notices...')
                io.emit('new_notices', json);
                res.json({success:true,msg:"Notice submission succesful"});

            });


            }   
        });

    }    

});


/*process an 'ask a riddle' post,save & update UI immediately*/
app.post('/ask_riddle',upload.single('riddle_photo'),function(req,res,next){
    console.log('req.fil')
    console.log(req.file)

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{
        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');

        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let ask_riddle =new riddle();
            ask_riddle.post_type="riddle";
            ask_riddle.access=1;//default :public access
            ask_riddle.body=convertToSentencCase(req.body.riddle_title);
            ask_riddle.category = req.body.riddle_category;
            ask_riddle.sub_cat1=req.body.riddle_sub1;
            ask_riddle.sub_cat2=req.body.riddle_sub2;
            ask_riddle.owner=owner_details;

            if (req.file && req.file.filename != null) {
                ask_riddle.pics.push('uploads/'+req.file.filename);
            }

            ask_riddle.save(function(err1, saved_ridd) {

                if(err1){console.log(err1);res.json({success: false,msg:"Riddle submission failed"});

            }else{
                var page_results=[];
                page_results.push(saved_ridd);

                process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('JSON PROCESSED RESPONSE');
                var json = JSON.stringify(processed_response[0], null, 2);
                console.log('emitting riddles...')
                io.emit('new_riddles', json);
                res.json({success:true,msg:"Riddle submission succesful"});
            }); 
            }  
        });

        }

    });


/*process an 'post a book' post,save & update UI immediately*/
app.post('/ask_pab',upload.single('pab_photo'),function(req,res,next){

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{

        var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
        var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
        var display_name=(req.user.displayName)?(req.user.displayName):('');
        var res_id=(req.user._id)?((req.user._id).toString()):('');

        var owner_details={id:res_id,
            displayName:display_name,
            displayPic:displayPic,
            status:status};

            let ask_pab =new pab();
            ask_pab.post_type="Post Books";
            ask_pab.access=1;//default :public access
            ask_pab.body=convertToSentencCase(req.body.pab_title);
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
                ask_pab.pics.push('uploads/'+req.file.filename);
            }


            ask_pab.save(function(err1, saved) {

                if(err1){console.log(err1);res.json({success: false,msg:"Book post failed"});

            }else{  

                var page_results=[];
                page_results.push(saved);

                process_posts.processPagePosts(page_results,req.user,function(processed_response){
                console.log('JSON PROCESSED RESPONSE');
                var json = JSON.stringify(processed_response[0], null, 2);
                console.log('emitting pabs...')
                io.emit('new_pabs', json);
                res.json({success:true,msg:"Book post succesful"});
            });

            }   
        });
            
        }



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


/*adds/edits the education items on the profile */
app.post('/update_edu',function(req,res,next){

    var action=req.body.profile_edu_action;

    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;

            //chk for either inserts/edits
            if(req.body.profile_edu_action=="insert"){
                var update_items={
                    title:req.body.profile_edu_title,
                    from_year:req.body.profile_edu_from,
                    to_year:req.body.profile_edu_to
                }

                updateUser.education.push(update_items);//append education items
                updateUser.date_modified=new Date();
                console.log(updateUser);

                user.updateOne({email:req.session.user.email},{$set:updateUser},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your education details update failed"});
                    }else if(res1){                        
                        res.json({success:true,msg:"Your education details update was successfull"});
                    }

                });

            }else if(req.body.profile_edu_action=="edit" && (req.body.profile_edu_id)){
                //modify existing items
                user.updateOne({_id:req.session.user._id,"education._id":req.body.profile_edu_id},
                    {$set:
                        {"education.$.title":req.body.profile_edu_title,
                        "education.$.to_year":req.body.profile_edu_to,
                        "education.$.from_year":req.body.profile_edu_from}},
                        function(err2,res2){
                            if(err2){
                                console.log(err2)
                                res.json({success:false,msg:"Your education details update failed"});
                            }else if(res2){                        
                                res.json({success:true,msg:"Your education details update was successfull"});
                            }
                        });
            }
            
        }else{
           res.json({success:false,msg:"User not found!"}); 
        }

    });
    
});

/*updates the qualifications on the profile */
app.post('/update_qual',function(req,res,next){

    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;

            //chk for either inserts/edits
            if(req.body.profile_qual_action=="insert"){

                var update_items={
                    title:req.body.profile_qual_title,
                    year:req.body.profile_qual_year
                }

                updateUser.qualification.push(update_items);//append education items
                updateUser.date_modified=new Date();
                console.log(updateUser);

                user.updateOne({email:req.session.user.email},{$set:updateUser},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your qualifications update failed"});
                    }else if(res1){                        
                        res.json({success:true,msg:"Your qualifications update was successfull"});
                    }

                });

            }else if(req.body.profile_qual_action=="edit" && (req.body.profile_qual_id)){

                //modify existing items
                user.updateOne({_id:req.session.user._id,"qualification._id":req.body.profile_qual_id},
                    {$set:
                        {"qualification.$.title":req.body.profile_qual_title,
                        "qualification.$.year":req.body.profile_qual_year}},
                        function(err2,res2){
                            if(err2){
                                console.log(err2)
                                res.json({success:false,msg:"Your qualifications details update failed"});
                            }else if(res2){                        
                                res.json({success:true,msg:"Your qualifications details update was successfull"});
                            }
                        });
            }

        }else{
         res.json({success:false,msg:"User not found!"}); 
     }

 });
    
});

/*updates the schools on the profile */
app.post('/update_sch',function(req,res,next){

    user.findOne({email:req.session.user.email }, function(err, u) {
        if(u){
            let updateUser=u;
            //chk for either inserts/edits
            if(req.body.profile_sch_action=="insert"){

                var update_items={
                    title:req.body.profile_sch_title,
                }

                updateUser.schools.push(update_items);//append education items
                updateUser.date_modified=new Date();
                console.log(updateUser);

                user.updateOne({email:req.session.user.email},{$set:updateUser},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your school details update failed"});
                    }else if(res1){                        
                        res.json({success:true,msg:"Your school details update was successfull"});
                    }

                });

            }else if(req.body.profile_sch_action=="edit" && (req.body.profile_sch_id)){

                //modify existing items
                user.updateOne({_id:req.session.user._id,"schools._id":req.body.profile_sch_id},
                    {$set:
                        {"schools.$.title":req.body.profile_sch_title}},
                        function(err2,res2){
                            if(err2){
                                console.log(err2)
                                res.json({success:false,msg:"Your school details update failed"});
                            }else if(res2){                        
                                res.json({success:true,msg:"Your school details update was successfull"});
                            }
                        });
            }

        }else{
           res.json({success:false,msg:"User not found!"}); 
       }

   });
    
});


/*updates bio1*/
var profile_upload = upload.fields([
    {name: 'profile_bio1_displayPic',maxCount:1 },
    {name: 'profile_bio1_backgroundPic',maxCount:1 }]);

app.post('/update_bio1',profile_upload,function(req,res,next){

    console.log(req.body);

    var dob = moment(req.body.profile_bio1_dob,'MM/DD/YYYY');
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
            updateUser.location=req.body.profile_bio1_location;
            updateUser.dob=dob;
            updateUser.displayName=updateUser.firstname+' '+updateUser.lastname;
            updateUser.date_modified=new Date();
            updateUser.designation.push(designation_updates);

            //store img if it exists
            if(req.files && req.files['profile_bio1_displayPic']){
                console.log('filename '+req.files['profile_bio1_displayPic'][0].filename)
                updateUser.displayPic.push('uploads/'+req.files['profile_bio1_displayPic'][0].filename);
            }

            if(req.files && req.files['profile_bio1_backgroundPic']){
                console.log('filename '+req.files['profile_bio1_backgroundPic'][0].filename)
                updateUser.backgroundPic.push('uploads/'+req.files['profile_bio1_backgroundPic'][0].filename);
            }
            console.log(updateUser);
            //$currentDate:{date_modified:true},
            user.updateOne({email:req.session.user.email},{$set:updateUser},function(err1,res1){

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
    console.log(req.body)

    if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
        console.log("user has not updated profile")
        res.json({success:false,msg:"Your post failed, please update your profile first"});
    }else{
        var section_type=req.body.section_response_type;
        console.log('section type '+section_type);
        var section_id=req.body.section_response_id;
        console.log('section_id '+section_id);
        switch(section_type){
            case'question':
            section = question;
            break;

            case'article':
            section = article;
            break;

            case'riddle':
            section = riddle;
            break;

            case'request':
            section = request_model;
            break;
        }

        section.findOne({_id:section_id},function(error,result){//find the question that was responsed
            if(result){
                let updateSection = result;
                updateSection.answers_len=updateSection.answers_len +1;//incr the no. of ans
                updateSection.date_modified=new Date();
                var displayPic=(req.user.displayPic[0])?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');

                updateSection.answers.push({
                    body : (req.body.section_response_details),
                    responderDisplayName:req.user.displayName,
                    responder_id:req.user._id,
                    responderDisplayPic:displayPic,
                    responderStatus:req.user.designation[0].title
                }); 

                //store img if exists
                if (req.file && req.file.filename != null) {
                    updateSection.answers[updateSection.answers.length - 1].pics.push('uploads/'+req.file.filename);
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
                        if(section_type !='request'){//for non-requests
                            io.emit('responded', json);
                        }else{
                            //real time requests responses
                        }
                        res.json({success:true,msg:"Your post has been received successfully"});
                    
                }

            });             
            }else{
                res.json({success:false,msg:"Item not found"});
            }

        });
    }

});


/*process comments*/
app.post('/comment_item',function(req,res,next){
//    console.log(req.body)

if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
    console.log("user has not updated profile")
    res.json({success:false,msg:"Your comment failed, please update your profile first"});
}else{
    var section_type=req.body.comment_section;
        // console.log('section type '+section_type);
        var section_id=req.body.comment_section_id;
        // console.log('section_id '+section_id);
        var comment_response_id=req.body.comment_response_id;
        // console.log('comment_response_id '+comment_response_id);
        var comment_response_id_obj;
        var comment_section_id_obj;

        switch(section_type){
            case'question':
            section = question;
            break;

            case'article':
            section = article;
            break;

            case'riddle':
            section = riddle;
            break;

            case'notice':
            section = notice;
            break;

            case'pab':
            section = pab;
            break;

            case'request':
            section = request_model;
            break;
        }

        
        comment_section_id_obj = mongoose.Types.ObjectId(section_id);//convert id string to obj id

        if(comment_response_id){
            comment_response_id_obj = mongoose.Types.ObjectId(comment_response_id);//convert id string to obj id
            update_query={_id:comment_section_id_obj,'answers._id':comment_response_id_obj};
            
        }else{
            update_query={_id:comment_section_id_obj};
        }

        section.find(update_query,function(error,result){//find the section that was commented on
            if(result){

                // console.log('update ')
                // console.log(result);
                
                var displayPic=(req.user.displayPic[0])?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');

                let updateSection = {
                    body : (req.body.comments),
                    responderDisplayName:req.user.displayName,
                    responder_id:req.user._id,
                    responderDisplayPic:displayPic
                };

                if(comment_response_id){
                    section.update(update_query,{'$push':{
                        'answers.$.comments':updateSection
                    }},function(err3,res3){
                        if(err3){
                        // console.log('failed')
                        console.log(err3)
                        res.json({success:false,msg:"Comment Operation failed"});
                    }else{
                            // console.log('success')
                            // console.log(res3)
                            res.json({success:true,msg:"Comment Operation succesful"});
                        }
                    });
                }else{
                    section.update(update_query,{'$push':{
                        'comments':updateSection
                    }},function(err3,res3){
                        if(err3){
                        // console.log('failed')
                        console.log(err3)
                        res.json({success:false,msg:"Comment Operation failed"});
                    }else{
                            // console.log('success')
                            // console.log(res3)
                            res.json({success:true,msg:"Comment Operation succesful"});
                        }
                    });
                }

            }else{
                res.json({success:false,msg:"Item not found"});
            }

        });
    }

});

/*delete section post*/
app.post('/delete_postitem',function(req,res,next){
    // console.log(req.body)
    //rem:delete files

    var section_type=req.body.section_delete_type;
    var section_id=req.body.section_delete_id;
    var section;
    // console.log('section_type '+section_type)
    // console.log('section_id '+section_id)

    switch(section_type){
        case'question':
        section = question;
        break;

        case'quest_cat':
        section = quest_cat;
        break;

        case'article':
        section = article;
        break;

        case'article_cat':
        section = art_cat;
        break;

        case'riddle':
        section = riddle;
        break;

        case'riddle_cat':
        section = riddle_cat;
        break;

        case'notice_cat':
        section = notice_cat;
        break;

        case'trend_cat':
        section = trend_cat;
        break;

        case'trend':
        section = trend;
        break;

        case'pab':
        section = pab;
        break;

        case'pab_cat':
        section = pab_cat;
        break;

        case'request':
        section = request_model;
        break;
    }

    section.findByIdAndRemove(section_id,function(err1,res1){
        if(err1){
            // console.log(err1)
            res.json({success:false,msg:"Your delete operation failed"});
        }else if(res1){
            // var json = JSON.stringify(most_recent_response, null, 2);
            // console.log(json);
            // io.emit('responded', json);
            res.json({success:true,msg:"Your delete operation was successfull"});
        }

    });
});


/*process  section modifications & edits immediately*/
var section_update_upload = upload.fields([
    {name: 'section_update_attachment',maxCount:1 },
    {name: 'section_update_photo',maxCount:1 }]);
app.post('/update_item',section_update_upload,function(req,res,next){
    // console.log(req.user)
    
    var section_type=req.body.section_update_type;
    var section_id=req.body.section_update_id;
    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;

        case'riddle':
        section = riddle;
        break;
    }

        section.findOne({_id:section_id},function(error,result){//find the question that was responsed
            if(result){
                var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
                var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
                var display_name=(req.user.displayName)?(req.user.displayName):('');
                var res_id=(req.user._id)?((req.user._id).toString()):('');

                var owner_details={id:res_id,
                    displayName:display_name,
                    displayPic:displayPic,
                    status:status};

                let updateSection = result;
                updateSection.date_modified=new Date();
                updateSection.category=req.body.section_update_category;
                updateSection.sub_cat1=req.body.section_update_sub1;
                updateSection.sub_cat2=req.body.section_update_sub2;

                switch(section_type){
                    case 'question':
                    updateSection.body=convertToSentencCase(req.body.section_update_title);
                    updateSection.description=convertToSentencCase(req.body.section_update_info);
                    break;
                    case 'article':
                    updateSection.topic=convertToSentencCase(req.body.section_update_title);
                    updateSection.body=convertToSentencCase(req.body.section_update_info);
                    break;
                    case 'riddle':
                    updateSection.body=convertToSentencCase(req.body.section_update_title);
                    break;
                }
                
                updateSection.owner=owner_details;
                

                //store attachment if it exists
                if(req.files && req.files['section_update_attachment']){
                    console.log('filename '+req.files['section_update_attachment'][0].filename)
                    updateSection.attachment.push('uploads/'+req.files['section_update_attachment'][0].filename);
                }

                //store photo if it exists
                if(req.files && req.files['section_update_photo']){
                    console.log('filename '+req.files['section_update_photo'][0].filename)
                    updateSection.pics.push('uploads/'+req.files['section_update_photo'][0].filename);
                }                          
                
                let most_recent_response={
                    _id:section_id,
                    body : updateSection.body,
                    category:updateSection.category,
                    sub_cat1:updateSection.sub_cat1,
                    sub_cat2:updateSection.sub_cat2,
                    description:updateSection.description,
                    date_modified:updateSection.date_modified
                }


                section.updateOne({_id:section_id},{$set:updateSection},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your update failed"});
                    }else if(res1){
                        var json = JSON.stringify(most_recent_response, null, 2);
                        // console.log(json);
                        // io.emit('responded', json);
                        res.json({success:true,msg:"Your update was successfull"});
                    }

                });             
            }else{
                res.json({success:false,msg:"Item not found"});
            }

        });


    });


/*process  request modifications & edits immediately*/
var request_update_upload = upload.fields([
    // {name: 'request_update_attachment',maxCount:1 },
    {name: 'request_update_photo',maxCount:1 }]);
app.post('/update_request',request_update_upload,function(req,res,next){
    
    var request_type=req.body.request_update_type;
    var section_id=req.body.request_update_id;
    

        request_model.findOne({_id:section_id},function(error,result){//find the request that was responsed
            if(result && (req.body.request_update_choice)){
                var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
                var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
                var display_name=(req.user.displayName)?(req.user.displayName):('');
                var res_id=(req.user._id)?((req.user._id).toString()):('');

                var owner_details={id:res_id,
                    displayName:display_name,
                    displayPic:displayPic,
                    status:status};

                let updateSection = result;
                updateSection.date_modified=new Date();
                updateSection.category=req.body.request_update_category;
                updateSection.sub_cat1=req.body.request_update_sub1;
                updateSection.sub_cat2=req.body.request_update_sub2;
                updateSection.destination_id=req.body.request_update_users;
                updateSection.destination_type=req.body.request_update_choice;

                switch(request_type){
                    case 'question':
                    updateSection.body=convertToSentencCase(req.body.request_update_title);
                    updateSection.description=convertToSentencCase(req.body.request_update_info);
                    break;
                    case 'article':
                    updateSection.topic=convertToSentencCase(req.body.request_update_topic);
                    updateSection.description=convertToSentencCase(req.body.request_update_info_article);
                    break;
                    case 'riddle':
                    updateSection.body=convertToSentencCase(req.body.request_update_title_riddle);
                    break;
                }
                
                updateSection.owner=owner_details;
                

                //store attachment if it exists
                // if(req.files && req.files['section_update_attachment']){
                //     console.log('filename '+req.files['section_update_attachment'][0].filename)
                //     updateSection.attachment.push('uploads/'+req.files['section_update_attachment'][0].filename);
                // }

                //store photo if it exists
                if(req.files && req.files['section_update_photo']){
                    console.log('filename '+req.files['section_update_photo'][0].filename)
                    updateSection.pics.push('uploads/'+req.files['section_update_photo'][0].filename);
                }                          
                
                let most_recent_response={
                    _id:section_id,
                    body : updateSection.body,
                    category:updateSection.category,
                    sub_cat1:updateSection.sub_cat1,
                    sub_cat2:updateSection.sub_cat2,
                    description:updateSection.description,
                    date_modified:updateSection.date_modified
                }


                request_model.updateOne({_id:section_id},{$set:updateSection},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your update failed"});
                    }else if(res1){
                        var json = JSON.stringify(most_recent_response, null, 2);
                        // console.log(json);
                        // io.emit('responded', json);
                        res.json({success:true,msg:"Your update was successfull"});
                    }

                });             
            }else{
                res.json({success:false,msg:"Item not found or error occured"});
            }

        });


    });

/*process  pab section modifications & edits immediately*/
var section_update_upload = upload.fields([    
    {name: 'section_pab_photo',maxCount:1 }]);
app.post('/update_pab_item',section_update_upload,function(req,res,next){
    // console.log(req.user)
    
    var section_type=req.body.section_pab_type;
    var section_id=req.body.section_pab_id;
    section = pab;

        section.findOne({_id:section_id},function(error,result){//find the pab that was responsed
            if(result){
                var displayPic=(req.user.displayPic)?(req.user.displayPic[req.user.displayPic.length -1]):('uploads/avatar.png');
                var status=(req.user.designation[0])?((req.user.designation[req.user.designation.length -1]).title):('');
                var display_name=(req.user.displayName)?(req.user.displayName):('');
                var res_id=(req.user._id)?((req.user._id).toString()):('');

                var owner_details={id:res_id,
                    displayName:display_name,
                    displayPic:displayPic,
                    status:status};

                let updateSection = result;
                updateSection.date_modified=new Date();
                updateSection.category=req.body.section_pab_category;
                updateSection.body=convertToSentencCase(req.body.section_pab_title);
                updateSection.author=req.body.section_pab_author;
                updateSection.amount=req.body.section_pab_amount;
                updateSection.isbn=req.body.section_pab_isbn;
                updateSection.pages=req.body.section_pab_pages;
                updateSection.publishers=req.body.section_pab_publishers;
                updateSection.bookshop=req.body.section_pab_bookshop;
                updateSection.url=req.body.section_pab_url;
                updateSection.synopsis=req.body.section_pab_synopsis;
                updateSection.about_author=req.body.section_pab_about_author;
                
                updateSection.owner=owner_details;

                //store photo if it exists
                if(req.files && req.files['section_pab_photo']){
                    console.log('filename '+req.files['section_pab_photo'][0].filename)
                    updateSection.pics.push('uploads/'+req.files['section_pab_photo'][0].filename);
                }                          
                
                let most_recent_response={
                    _id:section_id,
                    body : updateSection.body,
                    category:updateSection.category,
                    
                    description:updateSection.description,
                    date_modified:updateSection.date_modified
                }


                section.updateOne({_id:section_id},{$set:updateSection},function(err1,res1){

                    if(err1){
                        console.log(err1)
                        res.json({success:false,msg:"Your update failed"});
                    }else if(res1){
                        var json = JSON.stringify(most_recent_response, null, 2);
                        // console.log(json);
                        // io.emit('responded', json);
                        res.json({success:true,msg:"Your update was successfull"});
                    }

                });             
            }else{
                res.json({success:false,msg:"Item not found"});
            }

        });


    });

/*update the followers and followed fields of both users*/
app.post('/followMember',function(req,res,next){
    // console.log('follow member')
    // console.log(req)
    
    var section_type=req.body.section;
    var section_id=req.body.post_id;
    // console.log('section_type '+section_type);
    // console.log('section_id '+section_id);

    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;

        case'riddle':
        section = riddle;
        break;

        case'Post Books':
        section = pab;
        break;
    }

        section.findOne({_id:section_id},function(error,result){//find the section that was responsed to
            if(result){
                var owner_id=result.owner.id;
                // console.log('owner_id '+owner_id);
                var logged_user_id=req.user._id;
                // console.log('logged_user_id '+logged_user_id);
                //add logged_user_id to owner's followers

                user.findOne({_id:owner_id }, function(err, u) {
                    if(u){
                        let updateUser=u;
                        updateUser.date_modified=new Date();
                        updateUser.followers.push(logged_user_id);//save logged_user_id
                        //remove duplicate entries
                        updateUser.followers = updateUser.followers.filter( onlyUnique );
                        
                        console.log(updateUser);
                        user.updateOne({_id:owner_id},{$set:updateUser},function(err1,res1){

                            if(err1){
                                console.log(err1)
                                res.json({success:false,msg:"Followers update failed"});
                            }else if(res1){   

                            //add owner to logged_user_id's followed
                            user.findOne({_id:logged_user_id }, function(err2, u2) {
                                if(u2){
                                    let updateUser=u2;
                                    updateUser.date_modified=new Date();
                                        updateUser.followed.push(owner_id);//save owner_id
                                        //remove duplicate entries
                                        updateUser.followed = updateUser.followed.filter( onlyUnique );

                                        console.log(updateUser);
                                        user.updateOne({_id:logged_user_id},{$set:updateUser},function(err3,res3){

                                            if(err3){
                                                console.log(err3)
                                                res.json({success:false,msg:"Followed update failed"});
                                            }else if(res1){  
                                                res.json({success:true,msg:"Follows update was successfull"});  

                                            }

                                        });
                                    }else{
                                       res.json({success:false,msg:"Curr User not found"}); 
                                    }

                                }); 

                    }

                });
                    }else{
                        res.json({success:false,msg:"Current Owner not found"}); 
                    }

                });


            }else{
                res.json({success:false,msg:"Follower Item not found"});
            }

        });


    });

/*update the followers and followed fields of both users*/
app.post('/unfollowMember',function(req,res,next){
    // console.log('follow member')
    // console.log(req)
    
    var section_type=req.body.section;
    var section_id=req.body.post_id;
    // console.log('section_type '+section_type);
    // console.log('section_id '+section_id);

    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;

        case'riddle':
        section = riddle;
        break;

        case'Post Books':
        section = pab;
        break;
    }

        section.findOne({_id:section_id},function(error,result){//find the section that was responsed to
            if(result){
                var owner_id=result.owner.id;
                // console.log('owner_id '+owner_id);
                var logged_user_id=req.user._id;
                // console.log('logged_user_id '+logged_user_id);
                //add logged_user_id to owner's followers

                user.findOne({_id:owner_id }, function(err, u) {
                    if(u){
                        let updateUser=u;
                        updateUser.date_modified=new Date();
                        updateUser.followers=remove(updateUser.followers,logged_user_id);//remove logged_user_id
                        //remove duplicate entries
                        //updateUser.followers = updateUser.followers.filter( onlyUnique );
                        
                        console.log(updateUser);
                        user.updateOne({_id:owner_id},{$set:updateUser},function(err1,res1){

                            if(err1){
                                console.log(err1)
                                res.json({success:false,msg:"Followers update failed"});
                            }else if(res1){   

                            //add owner to logged_user_id's followed
                            user.findOne({_id:logged_user_id }, function(err2, u2) {
                                if(u2){
                                    let updateUser=u2;
                                    updateUser.date_modified=new Date();
                                        //updateUser.followed.push(owner_id);//save owner_id
                                        updateUser.followed=remove(updateUser.followed,owner_id);//remove owner_id
                                        //remove duplicate entries
                                        //updateUser.followed = updateUser.followed.filter( onlyUnique );

                                        console.log(updateUser);
                                        user.updateOne({_id:logged_user_id},{$set:updateUser},function(err3,res3){

                                            if(err3){
                                                console.log(err3)
                                                res.json({success:false,msg:"Followed update failed"});
                                            }else if(res1){  
                                                res.json({success:true,msg:"Follows update was successfull"});  

                                            }

                                        });
                                    }else{
                                       res.json({success:false,msg:"Curr User not found"}); 
                                    }

                                }); 

                    }

                });
                    }else{
                        res.json({success:false,msg:"Current Owner not found"}); 
                    }

                });


            }else{
                res.json({success:false,msg:"Follower Item not found"});
            }

        });


    });


/*update the logged user's bookmarks*/
app.post('/saveItem',function(req,res,next){
    console.log('bookmark item')
    // console.log(req)
    
    var section_type=req.body.section;
    var section_id=req.body.post_id;
    console.log('section_type '+section_type);
    console.log('section_id '+section_id);

    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;

        case'riddle':
        section = riddle;
        break;

        case'Post Books':
        section = pab;
        break;
    }

    var logged_user_id=req.user._id;
    //console.log('logged_user_id '+logged_user_id);
    //save post details to user's bookmarks

    user.findOne({_id:logged_user_id }, function(err, u) {
        if(u){
            let updateUser=u;
            updateUser.date_modified=new Date();
            let saved_info={
                item_id:section_id,
                body:section_type,
                date:new Date()
            }
            updateUser.bookmarks.push(saved_info);//save post details
            
            //console.log(updateUser);
            user.updateOne({_id:logged_user_id},{$set:updateUser},function(err1,res1){

                if(err1){
                    //console.log(err1)
                    res.json({success:false,msg:"Bookmarks update failed"});
                }else if(res1){
                    res.json({success:true,msg:"Bookmarks update was successfull"});
                }

            });
        }else{
            res.json({success:false,msg:"Current User not found"}); 
        }

    });

});


server.listen(process.env.PORT || 3000,function(){
    console.log('Server started on port '+process.env.PORT);
});