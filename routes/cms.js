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

    switch(item){
        case'question':
        cat = quest_cat;
        break;

        case'article':
        cat = article_cat;
        break;

        case'riddle':
        cat = riddle_cat;
        break;

    }
    
     //get all items
     cat.find().sort({value:1}).exec(function(err,cat_item){

        if(err)console.log(err);
        if(cat_item){
            console.log(cat_item);
            res.render('cms_category', {
                title:item+' Category',
                url:process.env.URL_ROOT,
                user_info:req.user,
                item:item,
                modal_id:modal_id,
                data:cat_item
            }); 
        }

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

     switch(item){
        case'question':
        cat = quest_cat;
        sub1 = quest_sub1;
        break;

        case'article':
        cat = article_cat;
        sub1 = article_sub1;
        break;

        case'riddle':
        cat = riddle_cat;
        sub1 = riddle_sub1;
        break;

    }

    cat.find().sort({value:1}).exec(function(err,cat_item){

        if(err)console.log(err);
        if(cat_item){
            // console.log(cat_item);
            sub1.find().sort({value:1}).exec(function(err1,sub1_item){

                if(err1)console.log(err1);
                if(sub1_item){
                    console.log(sub1_item);
                    res.render('cms_sub1_category', {
                        title:item+' Sub Category',
                        url:process.env.URL_ROOT,
                        user_info:req.user,
                        item:item,
                        modal_id:modal_id,
                        cat:cat_item,
                        data:sub1_item
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

     switch(item){
        case'question':
        cat = quest_cat;
        sub1 = quest_sub1;
        sub2 = quest_sub2;
        break;

        case'article':
        cat = article_cat;
        sub1 = article_sub1;
        sub2 = article_sub2;
        break;

        case'riddle':
        cat = riddle_cat;
        sub1 = riddle_sub1;
        sub2 = riddle_sub2;
        break;

    }

    cat.find().sort({value:1}).exec(function(err,cat_item){

        if(err)console.log(err);
        if(cat_item){
            console.log(cat_item);
            var first_cat=cat_item[0].value;
            console.log(first_cat);

            sub1.find({'category':first_cat}).sort({value:1}).exec(function(err1,sub1_item){

                if(err1)console.log(err1);
                if(sub1_item){
                    // console.log(sub1_item);

                    sub2.find().sort({value:1}).exec(function(err2,sub2_item){

                        if(err2)console.log(err2);
                        if(sub2_item){
                            // console.log(sub2_item);
                            res.render('cms_sub2_category', {
                                title:item+' Sub Category-2',
                                url:process.env.URL_ROOT,
                                user_info:req.user,
                                item:item,
                                modal_id:modal_id,
                                cat:cat_item,
                                sub1_data:sub1_item,
                                sub2_data:sub2_item
                            }); 
                        }

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
        let result=[];

        if(err1)console.log(err1);
        if(sub1_item){
            console.log(sub1_item);
            result=sub1_item;              

        }
        res.send(result);

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