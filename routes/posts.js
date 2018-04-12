var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');
var group = require('../models/group');
var question = require('../models/question');
var article = require('../models/article');
var riddle = require('../models/riddle');
var pab = require('../models/pab');
var notice = require('../models/notice');
var trend = require('../models/trend');
var suggestion = require('../models/group_posts');

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
    var item_id_obj;

    //loop thru bookmarks & process them
    for(var i=0;i<saved_bookmarks_len;++i){
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

            case'Post Books':
            section = pab;
            break;

            case'notice board':
            section = notice;
            break;

            case'trending':
            section = trend;
            break;

        }
        item_id_obj = mongoose.Types.ObjectId(curr_bm.item_id);//convert id string to obj id
        section.findOne({_id:item_id_obj}).exec(function(err,item){
            if (err)
                console.log(err)
            if(item){
                console.log('result item found')
                console.log(item)
                res_items.push(item);
            console.log('i: '+i);
            console.log('saved_bookmarks_len: '+saved_bookmarks_len);

            //loop has ended
            if(i===saved_bookmarks_len){
                process_posts.processPagePosts(res_items,user,function(processed_response){
                    console.log('final result response');
                    // console.log(processed_response);
                    final_response(processed_response);                    
                });
            }
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

            //var pending_friend_notifs=process_posts.getNotifications(req.user);
            //find pending notifications length
        var pending_friend_notifs=0;
        process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;


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
                home_page_status:true,
                usergroup_status:false
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
            home_page_status:true,
            usergroup_status:false
        });
    }

    });//end notifs

});//end request

});//end trend

});//end


/*
fetchs all existing groups
*/
router.get('/getGroups',isLoggedIn,function(req,res){

    var group_count=0,
    req_count=0,
    pending_friend_notifs=0,
    page='groups_all',
    page_title='Groups',
    res_item_trend=[],
    res_item_group=[];

    //get trending stories for sidebar headlines::nb::this operation takes a while to complete,
    //try nesting or callbacks to prevent..done
    trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

        if(err_trend){
            //console.log(err_trend);
        }
        if(item_trend){
            console.log(item_trend);
            res_item_trend=item_trend;
        }

    var bookmark_len=req.user.bookmarks.length;//get saved bookmarks

    //find pending notifications length
    var pending_friend_notifs=0;
    process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

        var id_string=(req.user._id).toString();
        //get total requests for this user
        request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err3,res3){
            req_count =res3.length;


            if(err3){
                    //console.log('err occured geting requests');
                    //console.log(err3)
                }

    //get total groups available to this user
    
    group.find().exec(function(err1,res1){
        if(err1){
            console.log('err occured geting groups');
            console.log(err1)
        }
        group_count =res1.length;

        if(res1 && group_count > 0){
                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    group_count:group_count,
                    data:res1,
                    req_count:req_count,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'groups_all',
                    pending_friend_notifs:pending_friend_notifs,
                    bookmarks_count:bookmark_len,
                    //member_status:included_response,

                    quest_page_status:false,
                    art_page_status:false,
                    riddle_page_status:false,
                    notice_page_status:false,
                    pab_page_status:false,
                    trend_page_status:false,
                    home_page_status:false,
                    usergroup_status:true
                }); 

        }else{

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                group_count:group_count,
                data:res_item_group,
                req_count:req_count,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'groups_all',
                pending_friend_notifs:pending_friend_notifs,
                bookmarks_count:bookmark_len,
                //member_status:false,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:false,
                usergroup_status:true
            });

        }


    });//end all groups 

    });//end requests

    });//end notifs


    });//end trend

});

/*
fetchs all members of a group
*/
router.get('/getMembers/:id',isLoggedIn,function(req,res){

    var group_id = req.params.id;
    console.log('group_id'+group_id);

    var req_count=0,
    pending_friend_notifs=0,
    page='members_all',
    page_title='Members',
    res_item_trend=[],
    res_item_member=[];

    //get trending stories for sidebar headlines::nb::this operation takes a while to complete,
    //try nesting or callbacks to prevent..done
    trend.find().sort({date_created:1}).exec(function(err_trend,item_trend){

        if(err_trend){
            //console.log(err_trend);
        }
        if(item_trend){
            console.log(item_trend);
            res_item_trend=item_trend;
        }

    var bookmark_len=req.user.bookmarks.length;//get saved bookmarks

    //find pending notifications length
    var pending_friend_notifs=0;
    process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

        var id_string=(req.user._id).toString();
        //get total requests for this user
        request_model.find({$or:[{destination_id:id_string},{"owner.id":id_string}]}).exec(function(err3,res3){
            req_count =res3.length;


            if(err3){
                    //console.log('err occured geting requests');
                    //console.log(err3)
                }

    //get all members for this group
    var id_obj = mongoose.Types.ObjectId(group_id);//convert id string to obj id
    
    group.findOne({_id:id_obj},function(err1,grp_data){
        if(err1){
            console.log('err occured geting groups');
            console.log(err1)
        }

        if(grp_data){
            //get group members
            process_posts.getMemberAdminDetails(grp_data,function(group_members){

            //chk if user is a super admin
            process_posts.isIncluded(grp_data.superadmin_ids,req.user._id,function(isSuperAdmin){

                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    data:grp_data,
                    req_count:req_count,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'members_all',
                    pending_friend_notifs:pending_friend_notifs,
                    bookmarks_count:bookmark_len,
                    group_members:group_members,
                    isSuperAdmin:isSuperAdmin,

                    quest_page_status:false,
                    art_page_status:false,
                    riddle_page_status:false,
                    notice_page_status:false,
                    pab_page_status:false,
                    trend_page_status:false,
                    home_page_status:false,
                    usergroup_status:true
                });

                });//end isSuperAdmin

            }); //end group_members

        }else{

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:res_item_member,
                req_count:req_count,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'members_all',
                pending_friend_notifs:pending_friend_notifs,
                bookmarks_count:bookmark_len,
                group_members:[],
                isSuperAdmin:false,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:false,
                usergroup_status:true
            });

        }


    });//end all members 

    });//end requests

    });//end notifs


    });//end trend

});



router.get('/showGroup/:id',isLoggedIn, function(req, res) {
    console.log('inside group profile');
    console.log(req.params)   
    var page='group_profile';
    var empty_page=[];
    var group_id = req.params.id;
    console.log('group_id '+group_id);
    var displayPic="uploads/avatar.png",
        backgroundPic="";

    group.findOne({_id:group_id},function(err,u){
        if(u){
            let found_group = u;
            
            if(found_group.displayPic[0]){
                displayPic=found_group.displayPic[found_group.displayPic.length - 1];
            }

            if(found_group.backgroundPic[0]){
                backgroundPic=found_group.backgroundPic[found_group.backgroundPic.length - 1];
            }

            //get group admins
            process_posts.getItemDetails(found_group.admin_ids,function(group_admins){

                //chk if user is a member
            process_posts.isIncluded(found_group.member_ids,req.user._id,function(member_response){

                //chk if user is an admin
            process_posts.isIncluded(found_group.admin_ids,req.user._id,function(included_response){

            res.render(page, {
                url:process.env.URL_ROOT,
                user_info:req.user,
                group_info:found_group,
                member_count:found_group.member_ids.length,
                displayPic:displayPic,
                backgroundPic:backgroundPic,
                isMember:member_response,
                isAdmin:included_response,
                group_admins:group_admins,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:false,
                usergroup_status:true            
            });

            });//end isIncluded isAdmin

        });//end isIncluded isMember

            });//get group admins

        }else{
            res.render(page, {
                url:process.env.URL_ROOT,
                user_info:req.user,
                group_info:empty_page, 
                member_count:0,               
                displayPic:displayPic,
                backgroundPic:backgroundPic,
                isMember:false,
                isAdmin:false,
                group_admins:[],

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:false,
                usergroup_status:true
                
            });
        }

    });
    
    
});



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
        var pending_friend_notifs=0;
        process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;

    var curr_user_display_pic='uploads/avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
        }//end display

    //get total requests made by this user
    var id_string=(req.user._id).toString();
    request_model.find({"owner.id":id_string}).exec(function(err1,res1){
        if(err1){
                    //console.log('err occured geting requests');
                    //console.log(err1);
                }
        req_owner_count =res1.length;

        //get total requests to this user
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
                home_page_status:true,
                usergroup_status:false
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
                home_page_status:true,
                usergroup_status:false
            });

        }


    });//end all requests


     });//end destination request

    });//end request

    });//end notifs


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

    //find pending notifications length
        var pending_friend_notifs=0;
        process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;


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
                    home_page_status:true,
                    usergroup_status:false
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
                home_page_status:true,
                usergroup_status:false
            });

        }


    });//end all requests


    });//end request

    });//end notifs


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

    //find pending notifications length
    var pending_friend_notifs=0;
    process_posts.getNotifications(req.user,function(rel_notifs){
    pending_friend_notifs=rel_notifs;

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
                    home_page_status:true,
                    usergroup_status:false
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
                home_page_status:true,
                usergroup_status:false
            });

        }


    });//end all requests


    });//end request

    });//end notifs


    });//end trend

});


/*
fetchs request details made by a user
*/
router.get('/getComments/:section/:section_id/:response_id',isLoggedIn,function(req,res){
    var section_type=req.params.section;
        console.log('section type '+section_type);
        var section_id=req.params.section_id;
        console.log('section_id '+section_id);
        var comment_response_id=req.params.response_id;
        console.log('comment_response_id '+comment_response_id);
        var comment_response_id_obj;
        var comment_section_id_obj;

    var req_owner_count=0,
    req_destination_count=0,
    req_count=0,
    pending_friend_notifs=0,
    page='all_comments',
    page_title='Comments',
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

    //find pending notifications length
        var pending_friend_notifs=0;
        process_posts.getNotifications(req.user,function(rel_notifs){
        pending_friend_notifs=rel_notifs;


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

            //get all comments for selected answer
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

            case'notice board':
            section = notice;
            break;

            case'trend':
            section = trend;
            break;

            case'pab':
            section = pab;
            break;

            case'Post Books':
            section = pab;
            break;

            case'request':
            section = request_model;
            break;
        }

        comment_section_id_obj = mongoose.Types.ObjectId(section_id);//convert id string to obj id

        if(comment_response_id !=0){
            comment_response_id_obj = mongoose.Types.ObjectId(comment_response_id);//convert id string to obj id
            update_query={_id:comment_section_id_obj,'answers._id':comment_response_id_obj};
            
        }else{
            update_query={_id:comment_section_id_obj};
        }


        section.find(update_query).sort({date_created:-1}).exec(function(err3,res3){

                if(err3){
                    console.log('err occured geting requests');
                    console.log(err3)
                }else if(res3){
                    console.log('res3 found');
                    console.log(res3)
            //update other details needed by the post
            process_posts.processPagePosts(res3,req.user,function(processed_response){
                console.log('MY REQUESTS LISTS .......................PROCESSED RESPONSE');
                //console.log(processed_response);

                res.render(page,{
                    url:process.env.URL_ROOT,
                    displayPic:curr_user_display_pic,
                    user_info:req.user,
                    data:processed_response,
                    comments_count:processed_response[0].comments.length,
                   // req_owner_count:req_owner_count,
                    //page_response:item_response,
                    req_count:req_count,
                    data_trend:res_item_trend,
                    page_title: page_title,
                    class_type:'all_comments',
                    pending_friend_notifs:pending_friend_notifs,
                    bookmarks_count:bookmark_len,

                    quest_page_status:false,
                    art_page_status:false,
                    riddle_page_status:false,
                    notice_page_status:false,
                    pab_page_status:false,
                    trend_page_status:false,
                    home_page_status:true,
                    usergroup_status:false
                });      

            });     

        }else{

            res.render(page,{
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:[],
                comments_count:0,
                req_owner_count:req_owner_count,
                req_destination_count:req_destination_count,
                req_count:req_count,
                //page_response:item_response,
                data_trend:res_item_trend,
                page_title: page_title,
                class_type:'all_comments',
                pending_friend_notifs:pending_friend_notifs,
                bookmarks_count:bookmark_len,

                quest_page_status:false,
                art_page_status:false,
                riddle_page_status:false,
                notice_page_status:false,
                pab_page_status:false,
                trend_page_status:false,
                home_page_status:true,
                usergroup_status:false
            });

        }


    });//end all requests


    });//end request

    });//end notifs


    });//end trend

});

/*get posted group posts,*/
router.get('/showGroupPosts/:id', isLoggedIn,function(req, res) {
    var group_id = req.params.id;
    var selection;
    if(group_id =="all"){
        selection={};        
    }else{
        var id_obj = mongoose.Types.ObjectId(group_id);//convert id string to obj id
        selection={"group_data.id":id_obj};
    }
    
    //set status defaults
    let question_status=false,
    home_status=false,
    riddle_status=false,
    pab_status=false,
    article_status=false,
    notice_status=false,
    trend_status=false,
    post_owner=false;
    usergroup_status=true;

    
    var page_title='All Suggestions';
    var page="group";
    var page_type=item='suggestion';

    var section = suggestion,
    item_response='';

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

            console.log('items '+items);

            //chk if current viewer is a member
            process_posts.isIncluded(req.user.group_ids,req.user._id,function(is_member){

            process_posts.processPagePosts(items,req.user,function(processed_response){

                console.log('processed_response '+processed_response)

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
                    pending_friend_notifs:pending_friend_notifs,
                    isMember:is_member,
                    
                    quest_status:question_status,
                    art_status:article_status,
                    riddle_status:riddle_status,
                    notice_status:notice_status,
                    pab_status:pab_status,
                    trend_status:trend_status,
                    home_status:home_status,
                    usergroup_status:usergroup_status
                });

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
                pending_friend_notifs:pending_friend_notifs,
                quest_status:question_status,
                art_status:article_status,
                riddle_status:riddle_status,
                notice_status:notice_status,
                pab_status:pab_status,
                trend_status:trend_status,
                home_status:home_status,
                usergroup_status:usergroup_status
            });

        }
        
    }

    });//end section

});//end ntififications
    

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
        usergroup_status=false;

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
            
            switch(item){
                case 'question':
                page_title='Answers';
                break;

                case 'article':
                page_title='Reviews';
                break;
                case 'riddle':
                page_title='Solutions';
                break;
                case 'pab':
                page_title='Post Books';
                break;
                case 'notice':
                page_title='Notices';
                break;
                case 'trend':
                page_title='Trending';
                break;
            }
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

        console.log('items '+items)

        process_posts.processPagePosts(items,req.user,function(processed_response){

            console.log('processed_response '+processed_response)

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
                home_status:home_status,
                usergroup_status:usergroup_status
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
            home_status:home_status,
            usergroup_status:usergroup_status
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

        case'riddle':
        section = riddle;
        break;

        case'notice_board':
        section = notice;
        break;
    }

    switch(action){
        case'likes': 
        action_msg="like";       
        update_query = {_id:id,likes:user_id};
        update_param={likes:user_id};
        break;
        case'attending':  
        action_msg="attending";      
        update_query = {_id:id,attending:user_id};
        update_param={attending:user_id};
        break;
        case'not_attending':  
        action_msg="not_attending";      
        update_query = {_id:id,not_attending:user_id};
        update_param={not_attending:user_id};
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
        case 'attending':
        case 'not_attending':
        
        
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