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

var process_posts=require('../config/processor');


/*chk loggedin*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}

/*get owner details*/
// function getLatestOwnerDetails(arr){
//     var promise=user.findOne({_id:arr.id},{
//         displayName:1,
//         displayPic:1,
//         designation:1,
//         trend_followed:1
//     }).exec();
//     return promise;
// }

// /*get trend story details*/
// function getStoryDetails(arr){
//     var promise=trend.findOne({_id:arr._id},{category:1,excerpt:1,pics:1}).exec();
//     return promise;
// }

function stipInputCase(param){
    var categ=param.replace("all_","");
    console.log('CATEG '+categ)
    return categ;
}


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
        break;

        case'trend':
        section = trend;
        trend_status=true;
        item_response='';
        page_type='Trending';
        break;
    }

//get required data
section.find(selection).sort({post_date:-1}).exec(function(err,items){

    var res_items=[];
    var curr_user_display_pic='avatar.png';//set default pic
    if(req.user.displayPic[0]){
        curr_user_display_pic=req.user.displayPic[req.user.displayPic.length - 1];
    }

    if(err){console.log(err);}
    else if(items){
    //items were found
    /*for each item update owner details such as displayPic & displayName
    since these may have changed*/
    if(items.length >0){

        process_posts(items,req.user._id,function(processed_response){

            res.render(page, {
                url:process.env.URL_ROOT,
                displayPic:curr_user_display_pic,
                user_info:req.user,
                data:processed_response,
                data_item:item,
                page_title: page_title,
                page_type:page_type,
                page_response:item_response,
                page_icon:page_icon,
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
            page_response:item_response,
            page_icon:page_icon,
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

});

});


router.post('/update_meta/:type/:id/:action/:subitem_id',function(req,res,next){
    var section_type=req.params.type;
    var id=req.params.id;
    var action=req.params.action;
    var subitem_id=req.params.subitem_id;
    var update_param='';
    var update_query={_id:id};

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
        update_param = {likes:1};
        break;
        case'shares':
        update_param = {shares:1};
        break;
        case'upvotes':
        if(subitem_id){
            update_query={_id:id,'answers._id':subitem_id};
            update_param = {'answers.$.upvotes':1};
        }
        
        break;

        case'downvotes':
        if(subitem_id){
            update_query={_id:id,'answers._id':subitem_id};
            update_param = {'answers.$.downvotes':1};
        }
        
        break;
    }

    section.update(update_query,{$inc:update_param},function(error,response){

        if(error){
            // console.log(error)
            res.json({success:false,msg:"Update failed"});
        }else{
            // console.log(response)
            res.json({success:true,msg:"Update succesful"});
        }


    });

});

module.exports =router;