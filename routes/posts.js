var express = require('express');
var router = express.Router();
// var ne = require('node-each');
var config = require('../config/database');
var user = require('../models/user');
var question = require('../models/question');
var article = require('../models/article');
var riddle = require('../models/riddle');
var pab = require('../models/pab');
var notice = require('../models/notice');
var trend = require('../models/trend');

var request_model = require('../models/request');

var process_posts=require('../config/processor');

var mongoose = require('mongoose');


/*chk loggedin*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}


function stipInputCase(param){
    var categ=param.replace("all_","");
    console.log('CATEG '+categ)
    return categ;
}

/*fetchs a user's bookmarks & returns data if found*/
function searchBookmarks(user,final_response){
    var curr_bm,section;
    var res_items=[];//set empty result array
    var saved_bookmarks_len=user.bookmarks.length;
    var saved_bookmarks=user.bookmarks;

    //loop thru bookmarks & process them
    for(var i=0;i<saved_bookmarks_len;i++){
        curr_bm=saved_bookmarks[i];
        console.log(curr_bm.body)

        switch(curr_bm.body){
            case'question':
            section = question;
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

            case'notice':
            section = notice;
            break;

            case'trending':
            section = trend;
            break;

        }
        section.findOne({_id:curr_bm.item_id}).exec(function(err,item){
            console.log('result item found')
            // console.log(item)
            res_items.push(item);

            //loop has ended
            if(i==saved_bookmarks_len){
                process_posts.processPagePosts(res_items,user,function(processed_response){
                    console.log('final result response');
                    // console.log(processed_response);
                    final_response(processed_response);                    
                });
            }
        });  
    }
}

/*get all bookmarked posts*/
router.get('/get_bookmarked',isLoggedIn,function(req,res){

    // if( (req.user.displayPic).length ===0 || req.user.displayName =="User" || req.user.displayName ==""){
    //     console.log("user has not updated profile")
    //     res.json({success:false,msg:"Please update your profile first"});
    // }else{

    //set avatar
    var curr_user_display_pic='uploads/avatar.png';
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
    }

    var res_item_trend=[];
    var page='bookmarks',page_title='Bookmarks';
    var req_count=0;

        //get trending stories for sidebar headlines
        trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

            if(err_trend){
                //console.log(err_trend);
            }
            if(item_trend){
                res_item_trend=item_trend;
            }

            //get total requests for this user
            var id_string=(req.user._id).toString();
            request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err1,res1){
            req_count =res1.length;

            var pending_friend_notifs=process_posts.getNotifications(req.user);


                console.log('get bookmarked');
    var saved_bookmarks=req.user.bookmarks;//get saved bookmarks
    var bookmark_len=saved_bookmarks.length;

    if(bookmark_len>0){

        //get saved bookmarks & display result
        searchBookmarks(req.user,function(processed_response){

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:processed_response,
                data_trend:res_item_trend,
                page_title: page_title,
                pending_friend_notifs:pending_friend_notifs,
                req_count:req_count,
                bookmarks_count:bookmark_len,
                class_type:'bookmark_page',

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
        res.render(page,{
            url:process.env.URL_ROOT,
            displayPic:curr_user_display_pic,
            user_info:req.user,
            data:[],
            data_trend:res_item_trend,
            page_title: page_title,
            pending_friend_notifs:pending_friend_notifs,
            req_count:req_count,
            bookmarks_count:bookmark_len,
            class_type:'bookmark_page',

            quest_page_status:false,
            art_page_status:false,
            riddle_page_status:false,
            notice_page_status:false,
            pab_page_status:false,
            trend_page_status:false,
            home_page_status:true
        });
    }

});//end request


});//end trend

    //}//end if block


});//end



/*
fetchs requests made by a user and requests made to a user
*/
router.get('/getRequests',isLoggedIn,function(req,res){
    var req_owner_count=0,
    req_destination_count=0,
    req_count=0,
    pending_friend_notifs=0,
    page='my_requests',
    page_title='My Requests',
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

    var bookmark_len=req.user.bookmarks.length;//get saved bookmarks


    //find pending notifications length
    var pending_friend_notifs=process_posts.getNotifications(req.user);
    //console.log('pending_friend_notifs '+pending_friend_notifs)

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

    //get total requests made by this user
    var id_string=(req.user._id).toString();
    request_model.find({"owner.id":id_string}).exec(function(err1,res1){
        if(err1){
                    //console.log('err occured geting requests');
                    //console.log(err1)
                }
        req_owner_count =res1.length;

        //get total requests for this user
        request_model.find({destination_id:id_string}).exec(function(err2,res2){
            if(err2){
                    //console.log('err occured geting requests');
                    //console.log(err2)
                }

            req_destination_count =res2.length;

            //get total requests for this user
            request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err3,res3){
                req_count =res3.length;


                if(err3){
                    //console.log('err occured geting requests');
                    //console.log(err3)
                }


                if(res3){
            //update other details needed by the post
            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                req_owner_count:req_owner_count,
                req_destination_count:req_destination_count,
                req_count:req_count,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'my_requests',
                pending_friend_notifs:pending_friend_notifs,
                bookmarks_count:bookmark_len,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:true
            });          

        }else{

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                req_owner_count:req_owner_count,
                req_destination_count:req_destination_count,
                req_count:req_count,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'my_requests',
                pending_friend_notifs:pending_friend_notifs,
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


    });//end all requests


        });//end destination request

    });//end request


    });//end trend

});


/*
fetchs request details made by a user
*/
router.get('/getOwnerRequestLists',isLoggedIn,function(req,res){
    var req_owner_count=0,
    req_destination_count=0,
    req_count=0,
    pending_friend_notifs=0,
    page='my_requests_lists',
    page_title='My Requests',
    res_item_trend=[];

    //get list of trending stories for sidebar headlines::nb::this operation takes a while to complete,
    //try nesting or callbacks to prevent
    trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

        if(err_trend){
            //console.log(err_trend);
        }
        if(item_trend){
            //console.log(item_trend);
            res_item_trend=item_trend;
        }

    var bookmark_len=req.user.bookmarks.length;//get saved bookmarks for sidebar


    //find pending notifications length for header
    var pending_friend_notifs=process_posts.getNotifications(req.user);
    //console.log('pending_friend_notifs '+pending_friend_notifs)

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

    //get total requests for this user
    var id_string=(req.user._id).toString();
    request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err1,res1){
        if(err1){
                    //console.log('err occured geting requests');
                    //console.log(err1)
                }
        req_count =res1.length;

            //get total requests made by this user
            request_model.find({"owner.id":id_string}).sort({date_created:-1}).exec(function(err3,res3){
                req_owner_count =res3.length;

                if(err3){
                    //console.log('err occured geting requests');
                    //console.log(err3)
                }


                if(req_owner_count >0){
            //update other details needed by the post
            process_posts.processPagePosts(res3,req.user,function(processed_response){
                //console.log('MY REQUESTS LISTS .......................PROCESSED RESPONSE');
                //console.log(processed_response);

                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    data:processed_response,
                    req_owner_count:req_owner_count,
                    //page_response:item_response,
                    req_count:req_count,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'my_requests_lists',
                    pending_friend_notifs:pending_friend_notifs,
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

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:[],
                req_owner_count:req_owner_count,
                req_destination_count:req_destination_count,
                req_count:req_count,
                //page_response:item_response,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'my_requests_lists',
                pending_friend_notifs:pending_friend_notifs,
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


    });//end all requests


    });//end request


    });//end trend

});


/*
fetchs request details made to a user
*/
router.get('/getDestinationRequestLists',isLoggedIn,function(req,res){
    var req_owner_count=0,
    req_destination_count=0,
    req_count=0,
    pending_friend_notifs=0,
    page='my_requests_lists',
    page_title='My Requests',
    res_item_trend=[];

    //get list of trending stories for sidebar headlines::nb::this operation takes a while to complete,
    //try nesting or callbacks to prevent
    trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

        if(err_trend){
            //console.log(err_trend);
        }
        if(item_trend){
            //console.log(item_trend);
            res_item_trend=item_trend;
        }

    var bookmark_len=req.user.bookmarks.length;//get saved bookmarks for sidebar


    //find pending notifications length for header
    var pending_friend_notifs=process_posts.getNotifications(req.user);
    //console.log('pending_friend_notifs '+pending_friend_notifs)

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

    //get total requests for this user
    var id_string=(req.user._id).toString();
    request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err1,res1){
        if(err1){
                    //console.log('err occured geting requests');
                    //console.log(err1)
                }
        req_count =res1.length;

            //get total requests made by this user
            request_model.find({destination_id:id_string}).sort({date_created:-1}).exec(function(err3,res3){
                req_destination_count =res3.length;

                if(err3){
                    //console.log('err occured geting requests');
                    //console.log(err3)
                }


                if(req_destination_count >0){
            //update other details needed by the post
            process_posts.processPagePosts(res3,req.user,function(processed_response){
                //console.log('MY REQUESTS LISTS .......................PROCESSED RESPONSE');
                //console.log(processed_response);

                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    data:processed_response,
                    req_owner_count:req_destination_count,
                    //page_response:item_response,
                    req_count:req_count,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'my_requests_lists',
                    pending_friend_notifs:pending_friend_notifs,
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

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:[],
                req_owner_count:req_owner_count,
                req_destination_count:req_destination_count,
                req_count:req_count,
                //page_response:item_response,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'my_requests_lists',
                pending_friend_notifs:pending_friend_notifs,
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


    });//end all requests


    });//end request


    });//end trend

});





/*get all posted questions,*/
router.get('/section/:item/:type/:id', isLoggedIn,function(req, res) {
    console.log('inside all sections');

    var item = req.params.item;
    var type = req.params.type;
    var id = req.params.id;
    //set status defaults
    let question_status=false,
        home_status=false,
        riddle_status=false,
        pab_status=false,
        article_status=false,
        notice_status=false,
        trend_status=false,
        post_owner=false;

    let page_icon=item+'s_icon.png';//post icon

    var selection,section;
    var page='section';
    page_type=item;

    //chk the type of post
    switch(type){
        case 'All':
        selection={};
        page_title=type+' '+item+'s';
        break;

        case 'Unanswered':
        case 'Unreviewed':
        case 'Unresolved':
        selection={answers:{$size:0}};
        page_title=type+' '+item+'s';
        break;

        //get only answered questions/articles/riddles
        case 'Answered':
        case 'Reviewed':
        case 'Solved':
        selection={"answers_len":{"$gt":0}};
        page='section_response';
        page_title=type+' '+item+'s';
        break;

        //get only answers for a question/article etc
        case 'all_responses':
        if(id){
            selection={_id:id};
            page='section_all_response';
            page_title='Others';
        }        
        break;

        //get single pages for trends etc
        case 'single':
        if(id){
            selection={_id:id};
            page='single';
            page_title='';
        }        
        break;

        default://process 'all_..' e.g get rows excluding a particular id
        var stripped=stipInputCase(type);
        selection={'category':stripped,'_id':{'$nin':[id]}};
        page='section';
        page_title='Others';
        break;
    }

    switch(item){
        case'question':
        section = question;
        question_status=true; 
        item_response='answer';             
        break;

        case'article':
        section = article;
        article_status=true;
        item_response='review';
        break;

        case'riddle':
        section = riddle;
        riddle_status=true;
        item_response='solution';
        break;

        case'pab':
        section = pab;
        pab_status=true;
        item_response='';
        page_type='Post Books';
        break;

        case'notice':
        section = notice;
        notice_status=true;
        item_response='';
        page='notice';
        break;

        case'trend':
        section = trend;
        trend_status=true;
        item_response='';
        page_type='Trending';
        break;
    }

//find pending notifications length
var pending_friend_notifs=0;
process_posts.getNotifications(req.user,function(rel_notifs){
pending_friend_notifs=rel_notifs;

//get required data
section.find(selection).sort({post_date:-1}).exec(function(err,items){

    var res_items=[];
    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
    }

    if(err){console.log(err);}
    else if(items){
    //items were found
    /*for each item update owner details such as displayPic & displayName
    since these may have changed*/
    if(items.length >0){

        process_posts.processPagePosts(items,req.user,function(processed_response){

            res.render(page, {
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:processed_response,
                data_item:item,
                page_title: page_title,
                page_type:page_type,
                class_type:item,
                page_response:item_response,
                page_icon:page_icon,
                pending_friend_notifs:pending_friend_notifs,
                quest_status:question_status,
                art_status:article_status,
                riddle_status:riddle_status,
                notice_status:notice_status,
                pab_status:pab_status,
                trend_status:trend_status,
                home_status:home_status
            });

        });

    }else{
        res.render(page, {
            url:process.env.URL_ROOT,
            displayPic:curr_user_display_pic,
            user_info:req.user,
            data:res_items,
            data_item:item,
            page_title: page_title,
            page_type:page_type,
            class_type:item,
            page_response:item_response,
            page_icon:page_icon,
            pending_friend_notifs:pending_friend_notifs,
            quest_status:question_status,
            art_status:article_status,
            riddle_status:riddle_status,
            notice_status:notice_status,
            pab_status:pab_status,
            trend_status:trend_status,
            home_status:home_status
        });

    }
    
}

});//end section

 });//end notifs

});


router.post('/update_meta/:type/:id/:action/:subitem_id',function(req,res,next){
    var section_type=req.params.type;
    var id=req.params.id;
    var action=req.params.action;
    var subitem_id=req.params.subitem_id;
    var user_id=req.user._id;
    var update_param='';
    var update_query={_id:id};
    var action_msg="";
    var subitem_id_obj;

    console.log('section_type '+section_type)
    console.log('id '+id)
    console.log('action '+action)
    console.log('subitem_id '+subitem_id)
    
    console.log('user_id '+user_id)

    switch(section_type){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;
    }

    switch(action){
        case'likes':        
        update_query = {_id:id,likes:user_id};
        update_param={likes:user_id};
        break;
        case'shares':
        update_param = {shares:1};
        break;
        case'upvotes':
        subitem_id_obj = mongoose.Types.ObjectId(subitem_id);//convert id string to obj id
        if(subitem_id){
            update_query={_id:id,'answers._id':subitem_id_obj,'answers.upvotes':user_id};
            update_query2={_id:id,'answers._id':subitem_id_obj};
            update_param = {'answers.$.upvotes':user_id};
        }
        
        break;

        case'downvotes':
        subitem_id_obj = mongoose.Types.ObjectId(subitem_id);//convert id string to obj id
        if(subitem_id){
            update_query={_id:id,'answers._id':subitem_id_obj,'answers.downvotes':user_id};
            update_query2={_id:id,'answers._id':subitem_id_obj};
            update_param = {'answers.$.downvotes':user_id};
        }
        
        break;
    }

    switch(action){
        case 'likes':
        action_msg="like";
        
        section.find(update_query,function(err1,res1){
            if(err1){
                //console.log('likes err1')
                console.log(err1)
            }else if(res1){
                //console.log('likes response2')
                console.log(res1);
                //if data is found, remove user id else insert user id
                if(res1.length >0){
                    section.update({_id:id},{$pull:update_param},function(err2,res2){
                        if(err2){
                            console.log(err2)
                            res.json({success:false,msg:"Operation update failed"});
                        }else{
                            console.log(res2)
                            res.json({success:true,msg:"Operation update succesful",action:"un"+action_msg});
                        }

                    });
                }else{
                    section.update({_id:id},{$push:update_param},function(err3,res3){
                        if(err3){
                            console.log(err3)
                            res.json({success:false,msg:"Operation update failed"});
                        }else{
                            console.log(res3)
                            res.json({success:true,msg:"Operation update succesful",action:action_msg});
                        }

                    });
                }
            }


        });

        break;
        case 'upvotes':
        case 'downvotes':
        action_msg="votes";
        
        section.find(update_query,function(err1,res1){
            if(err1){
                console.log('likes err1')
                console.log(err1)
            }else if(res1){
                console.log('upvotes res1')
                console.log(res1);
                //if data is found:user existed
                if(res1.length >0){

                    section.update(update_query2,{$pull:update_param},function(err2,res2){
                        if(err2){
                            console.log(err2)
                            res.json({success:false,msg:"Operation update failed"});
                        }else{
                            console.log(res2)
                            res.json({success:true,msg:"Operation update succesful",action:"un"+action_msg});
                        }

                    });

                }else{
                    //add new user
                    section.update(update_query2,{$push:update_param},function(err3,res3){

                        if(err3){
                            console.log(err3)
                            res.json({success:false,msg:"Operation update failed"});
                        }else{
                            console.log(res3)
                            res.json({success:true,msg:"Operation update succesful",action:action_msg});
                        }

                    });

                }
                
            }


        });
        break;
        default:
        section.update(update_query,{$inc:update_param},function(error,response){

            if(error){
            // console.log(error)
            res.json({success:false,msg:"Update failed"});
        }else{
            // console.log(response)
            res.json({success:true,msg:"Update succesful"});
        }


    });
        break;
    }


});

module.exports =router;