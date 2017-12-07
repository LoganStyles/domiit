var express = require('express');
var router = express.Router();
var ne = require('node-each');
var config = require('../config/database');
var user = require('../models/user');
var question = require('../models/question');
var article = require('../models/article');



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
    console.log('item :'+item);
    console.log('type :'+type);
    console.log('id :'+id);

    let question_status=true,
    home_status=false;

    var selection,section;
    var page='section';
    switch(type){
        case 'All':
        selection={};
        page_title='All '+item+'s';
        break;

        case 'Unanswered':
        selection={answers:{$size:0}};
        page_title='Unanswered '+item+'s';
        break;

        //get only answered questions/articles
        case 'Answered':
        selection={"answers_len":{"$gt":0}};
        page='posts_answers';
        page_title='Answered '+item+'s';
        break;

        //get only answers for a question/article
        case 'all_answers':
        if(id){
            selection={_id:id};
            page='posts_all_answers';
            page_title='All '+item+'s';
        }        
        break;

    }

    switch(item){
        case'question':
        section = question;
        break;

        case'article':
        section = article;
        break;
    }

//get required questions
section.find(selection).sort({post_date:-1}).exec(function(err,items){

    var res_items=[];

    if(err){console.log(err);}
    else if(items){
    //items were found
    /*for each item update owner details such as displayPic & displayName
    since these may have changed*/
    ne.each(items,function(el,i){
        if(items.length > 0){
            var updated_obj={};
            var promise = getLatestOwnerDetails(el.owner);
            promise.then(function(response){
                var displayPic=(response.displayPic)?(response.displayPic[response.displayPic.length -1]):('avatar.png')
                updated_obj={
                    id:(response._id).toString(),
                    displayName:response.displayName,
                    displayPic:displayPic
                };
                el.owner=updated_obj;
            });
        }        

    }).then(function(res2){

        res_items=items;

        console.log(res_items);
        var displayPic='avatar.png';
        if(req.user.displayPic[0]){
            displayPic=req.user.displayPic[req.user.displayPic.length - 1];
        }

        res.render(page, {
            url:process.env.URL_ROOT,
            displayPic:displayPic,
            user_info:req.user,
            data:res_items,
            page_title: page_title,
            page_type:item,
            quest_status:question_status,
            home_status:home_status
        });
    })



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