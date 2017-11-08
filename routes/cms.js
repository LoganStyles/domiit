var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');

var quest_cat = require('../models/question_cats');
var quest_sub1 = require('../models/question_sub1');
var quest_sub2 = require('../models/question_sub2');

var article_cat = require('../models/article_cats');
var article_sub1 = require('../models/article_sub1');
var article_sub2 = require('../models/article_sub2');

var riddle_cat = require('../models/riddle_cats');
var riddle_sub1 = require('../models/riddle_sub1');
var riddle_sub2 = require('../models/riddle_sub2');


/*check if user is logged in*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}


/*show category
get all cats for an item & sort in asc ,
prepare modal */
router.get('/main/:item',isLoggedIn, function(req, res) {
    console.log('inside cms main category');
    var item = req.params.item;
    var modal_id="#"+item+"_cat_modal";

    let cat;
    quest_status=false;
    quest_cat_status=false;
    article_status=false;
    article_cat_status=false;
    riddle_status=false;
    riddle_cat_status=false;

    switch(item){
        case'question':
        cat = quest_cat;
        quest_status=true;
        quest_cat_status=true;
        break;

        case'article':
        cat = article_cat;
        article_status=true;
        article_cat_status=true;
        break;

        case'riddle':
        cat = riddle_cat;
        riddle_status=true;
        riddle_cat_status=true;
        break;

    }
    
     //get all items
     cat.find().sort({value:1}).exec(function(err,cat_item){

        var res_cat=[];

        if(err)console.log(err);
        if(cat_item.length > 0){
            res_cat=cat_item;
            console.log(res_cat);            
        }

        res.render('cms_category', {
            title:item+' Category',
            url:process.env.URL_ROOT,
            user_info:req.user,
            item:item,
            modal_id:modal_id,
            data:res_cat,
            quest_status:quest_status,
            quest_cat_status:quest_cat_status,
            article_status:article_status,
            article_cat_status:article_cat_status,
            riddle_status:riddle_status,
            riddle_cat_status:riddle_cat_status
        }); 

    });
     
 });

/*show sub1 category
get all applicable sub1s for an item & sort in asc ,
get all cats
prepare modal */
router.get('/sub1/:item',isLoggedIn, function(req, res) {
    console.log('inside cms sub1 category');
    var item = req.params.item;
    var modal_id="#"+item+"_sub1_modal";
    
     //get all items
     let cat,sub1;
     let quest_status=false,
     quest_sub1_status=false,
     article_status=false,
     article_sub1_status=false,
     riddle_status=false,
     riddle_sub1_status=false;

     switch(item){
        case'question':
        cat = quest_cat;
        sub1 = quest_sub1;
        quest_status=quest_sub1_status=true;
        break;

        case'article':
        cat = article_cat;
        sub1 = article_sub1;
        article_status=article_sub1_status=true;
        break;

        case'riddle':
        cat = riddle_cat;
        sub1 = riddle_sub1;
        riddle_status=riddle_sub1_status=true;
        break;

    }

    cat.find().sort({value:1}).exec(function(err,cat_item){

        var res_cat=[],
        res_sub1=[];

        if(err)console.log(err);
        if(cat_item.length > 0){
            res_cat=cat_item;
            // console.log(cat_item);
            sub1.find().sort({value:1}).exec(function(err1,sub1_item){

                if(err1)console.log(err1);
                if(sub1_item.length > 0){
                    console.log(sub1_item);
                    res_sub1=sub1_item;  



                     res.render('cms_sub1_category', {
                        title:item+' Sub Category',
                        url:process.env.URL_ROOT,
                        user_info:req.user,
                        item:item,
                        modal_id:modal_id,
                        cat:res_cat,
                        data:res_sub1,
                        quest_status:quest_status,
                        quest_sub1_status:quest_sub1_status,
                        article_status:article_status,
                        article_sub1_status:article_sub1_status,
                        riddle_status:riddle_status,
                        riddle_sub1_status:riddle_sub1_status

        });                   
                }

            });
            
        }

       

    });

});


/*show sub2 category
get all applicable sub2s for an item & sort in asc ,
get all cats
get all sub1s
prepare modal */
router.get('/sub2/:item',isLoggedIn, function(req, res) {
    console.log('inside cms sub2 category');
    var item = req.params.item;
    var modal_id="#"+item+"_sub2_modal";
    
     //get all items
     let cat,sub1,sub2;
     let quest_status=false,
     quest_sub2_status=false,
     article_status=false,
     article_sub2_status=false,
     riddle_status=false,
     riddle_sub2_status=false;

     switch(item){
        case'question':
        cat = quest_cat;
        sub1 = quest_sub1;
        sub2 = quest_sub2;
        quest_sub2_status=quest_status=true;
        break;

        case'article':
        cat = article_cat;
        sub1 = article_sub1;
        sub2 = article_sub2;
        article_status=article_sub2_status=true;
        break;

        case'riddle':
        cat = riddle_cat;
        sub1 = riddle_sub1;
        sub2 = riddle_sub2;
        riddle_status=riddle_sub2_status=true;
        break;

    }

    cat.find().sort({value:1}).exec(function(err,cat_item){

        var res_cat=[];
        var res_sub1=[];
        var res_sub2=[];

        if(err)console.log(err);
        if(cat_item){//items were found
            res_cat=cat_item;
            var first_cat=(res_cat.length >0)?(res_cat[0].value):(0);

            console.log(cat_item);
            console.log(first_cat);

            sub1.find({'category':first_cat}).sort({value:1}).exec(function(err1,sub1_item){

                if(err1)console.log(err1);
                if(sub1_item){
                    res_sub1=sub1_item;
                    var first_sub1=(res_sub1.length >0)?(res_sub1[0].value):(0);

                    sub2.find().sort({value:1}).exec(function(err2,sub2_item){

                        if(err2)console.log(err2);
                        if(sub2_item){
                            res_sub2=sub2_item; 
                        }
                        res.render('cms_sub2_category', {
                            title:item+' Sub Category-2',
                            url:process.env.URL_ROOT,
                            user_info:req.user,
                            item:item,
                            modal_id:modal_id,
                            cat:res_cat,
                            sub1_data:res_sub1,
                            sub2_data:res_sub2,
                            quest_status:quest_status,
                            quest_sub2_status:quest_sub2_status,
                            article_status:article_status,
                            article_sub2_status:article_sub2_status,
                            riddle_status:riddle_status,
                            riddle_sub2_status:riddle_sub2_status
                        }); 

                    }); 
                }

            });
            
        }

    });

});


/*show selected_cat category
get all applicable sub1s for a cat & sort in asc ,
prepare modal */
router.get('/selected_cat/:type/:item',isLoggedIn, function(req, res) {
    console.log('inside cms selected category');
    var category = req.params.item;
    var type = req.params.type;
    console.log(' category '+category);
    console.log('type '+type);
    
     //get all items
     let cat,sub1,sub2;
     

     switch(type){
        case'question':
        sub1 = quest_sub1;
        sub2 = quest_sub2;
        break;

        case'article':
        sub1 = article_sub1;
        sub2 = article_sub2;
        break;

        case'riddle':
        sub1 = riddle_sub1;
        sub2 = riddle_sub2;
        break;

    }

    sub1.find({'category':category}).sort({value:1}).exec(function(err1,sub1_item){
        let res_sub1,res_sub2=[];

        if(err1)console.log(err1);
        if(sub1_item){
            console.log(sub1_item);
            res_sub1=sub1_item;  
            var first_sub1=(res_sub1.length >0)?(res_sub1[0].value):(0);     

            sub2.find({'sub1':first_sub1}).sort({value:1}).exec(function(err2,sub2_item){

                if(err2)console.log(err2);
                if(sub2_item){
                    res_sub2=sub2_item; 
                            // console.log('sub2 item: ');
                            // console.log(res_sub2);
                        }
                        res.send({
                            sub1_data:res_sub1,
                            sub2_data:res_sub2
                        });  
                    });       

        }

    });

});


/*show selected_sub2 item
get all applicable sub2s for a sub1 & sort in asc ,
prepare modal */
router.get('/selected_sub1/:type/:item',isLoggedIn, function(req, res) {
    console.log('inside cms selected sub1');
    var sub1 = req.params.item;
    var type = req.params.type;
    
     //get all items
     let sub2,res_sub2;
     

     switch(type){
        case'question':
        sub2 = quest_sub2;
        break;

        case'article':
        sub2 = article_sub2;
        break;

        case'riddle':
        sub2 = riddle_sub2;
        break;
    }

    sub2.find({'sub1':sub1}).sort({value:1}).exec(function(err2,sub2_item){

        if(err2)console.log(err2);
        if(sub2_item){
            res_sub2=sub2_item; 
                }
                res.send({
                    sub2_data:res_sub2
                });  
            }); 

});


/*save category
get all submitted cat info for an item,
save a cat */
router.post('/post_cat/:type',function(req,res,next){

    var type = req.params.type;
    let cat;

    switch(type){
        case 'question':
        cat = new quest_cat();
        cat.title = (req.body.question_cat_title).trim();
        cat.value = (req.body.question_cat_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        cat.description=req.body.question_cat_description;
        break;

        case 'article':
        cat = new article_cat();
        cat.title = (req.body.article_cat_title).trim();
        cat.value = (req.body.article_cat_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        cat.description=req.body.article_cat_description;
        break;

        case 'riddle':
        cat = new riddle_cat();
        cat.title = (req.body.riddle_cat_title).trim();
        cat.value = (req.body.riddle_cat_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        cat.description=req.body.riddle_cat_description;
        break;

    }   

    cat.save(function(err,quest){
        if(err){console.log(err);res.json({success:false,msg:type+" category update failed"});
    }else{
        res.json({success:true,msg:type+" category submission succesful"});
        var json = JSON.stringify(cat,null,2);
        // console.log(json);

    }
})
});


/*create sub categories
get posted data for sub cat,
save sub cat
*/
router.post('/post_sub1/:type',function(req,res,next){

    var type = req.params.type;
    let sub1;

    switch(type){
        case 'question':
        sub1 = new quest_sub1();
        sub1.title = (req.body.question_sub1_title).trim();
        sub1.value = (req.body.question_sub1_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub1.category = req.body.question_sub1_category;
        sub1.description=req.body.question_sub1_description;
        break;

        case 'article':
        sub1 = new article_sub1();
        sub1.title = (req.body.article_sub1_title).trim();
        sub1.value = (req.body.article_sub1_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub1.category = req.body.article_sub1_category;
        sub1.description=req.body.article_sub1_description;
        break;

        case 'riddle':
        sub1 = new riddle_sub1();
        sub1.title = (req.body.riddle_sub1_title).trim();
        sub1.value = (req.body.riddle_sub1_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub1.category = req.body.riddle_sub1_category;
        sub1.description=req.body.riddle_sub1_description;
        break;

    }   

    sub1.save(function(err,quest){
        if(err){console.log(err);res.json({success:false,msg:type+" sub1 category update failed"});
    }else{
        res.json({success:true,msg:type+" sub1 category update succesful"});
        var json = JSON.stringify(sub1,null,2);
        // console.log(json);

    }
})
});


/*create sub2 categories
get posted data for sub2 cat,
save sub2 cat
*/
router.post('/post_sub2/:type',function(req,res,next){

    var type = req.params.type;
    let sub2;

    switch(type){
        case 'question':
        sub2 = new quest_sub2();
        sub2.title = (req.body.question_sub2_title).trim();
        sub2.value = (req.body.question_sub2_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub2.category = req.body.question_sub2_category;
        sub2.sub1 = req.body.question_sub2_sub1;
        sub2.description=req.body.question_sub2_description;
        break;

        case 'article':
        sub2 = new article_sub2();
        sub2.title = (req.body.article_sub2_title).trim();
        sub2.value = (req.body.article_sub2_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub2.category = req.body.article_sub2_category;
        sub2.sub1 = req.body.article_sub2_sub1;
        sub2.description=req.body.article_sub2_description;
        break;

        case 'riddle':
        sub2 = new riddle_sub2();
        sub2.title = (req.body.riddle_sub2_title).trim();
        sub2.value = (req.body.riddle_sub2_title).trim().replace(/[^A-Za-z0-9]/g, "_");
        sub2.category = req.body.riddle_sub2_category;
        sub2.sub1 = req.body.riddle_sub2_sub1;
        sub2.description=req.body.riddle_sub2_description;
        break;

    }   

    sub2.save(function(err,quest){
        if(err){console.log(err);res.json({success:false,msg:type+" sub category update failed"});
    }else{
        res.json({success:true,msg:type+" sub category update succesful"});
        var json = JSON.stringify(sub2,null,2);
        // console.log(json);

    }
})
});

module.exports  = router;