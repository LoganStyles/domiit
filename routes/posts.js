var express = require('express');
var router = express.Router();
var ne = require('node-each');
var config = require('../config/database');
var user = require('../models/user');
var question = require('../models/question');
var article = require('../models/article');
var riddle = require('../models/riddle');
var pab = require('../models/pab');


/*chk loggedin*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}

/*get owner details*/
function getLatestOwnerDetails(arr){
    var promise=user.findOne({_id:arr.id},{displayName:1,displayPic:1}).exec();
    return promise;
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
        // page='posts_'+type.toLowerCase();
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
    var processed_items=0;
    if(items.length >0){

        items.forEach((cur_item,index,array)=>{
            var updated_obj={};
            var promise = getLatestOwnerDetails(cur_item.owner);//fetch data for this person
            promise.then(function(response){
                var displayPic=(response.displayPic)?(response.displayPic[response.displayPic.length -1]):('avatar.png');
                updated_obj={
                    id:(response._id).toString(),
                    displayName:response.displayName,
                    displayPic:displayPic
                };
                // update owner info
                cur_item.owner=updated_obj;
                // chk if current viewer is the owner
                var req_user_id=(req.user._id).toString();
                var response_id=(response._id).toString();

                if(req_user_id ===response_id){
                    console.log('user is the owner')
                    cur_item.post_owner=true;
                }else{
                    console.log('user is NOT the owner')
                }                

                processed_items++;
                // console.log('process inside:'+processed_items);
                if(processed_items==array.length){//iteration has ended
                    res_items=items;
                    console.log(res_items);

                    res.render(page, {
                        url:process.env.URL_ROOT,
                        displayPic:curr_user_display_pic,
                        user_info:req.user,
                        data:res_items,
                        page_title: page_title,
                        page_type:page_type,
                        page_response:item_response,
                        page_icon:page_icon,
                        quest_status:question_status,
                        art_status:article_status,
                        riddle_status:riddle_status,
                        pab_status:pab_status,
                        home_status:home_status
                    });

                }
            });

        });

    }else{
        res.render(page, {
            url:process.env.URL_ROOT,
            displayPic:curr_user_display_pic,
            user_info:req.user,
            data:res_items,
            page_title: page_title,
            page_type:page_type,
            page_response:item_response,
            page_icon:page_icon,
            quest_status:question_status,
            art_status:article_status,
            riddle_status:riddle_status,
            pab_status:pab_status,
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