var express = require('express');
var router = express.Router();
var config = require('../config/database');
var user = require('../models/user');

var quest_cat = require('../models/question_cats');
var article_cat = require('../models/article_cats');
var riddle_cat = require('../models/riddle_cats');
var pab_cat = require('../models/pab_cats');
var notice_cat = require('../models/notice_cats');
var trend_cat = require('../models/trend_cats');
var trend_story = require('../models/trend');

var about = require('../models/about');

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

/*check if user is logged in*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}

function convertToSentencCase(text_data){
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

/*show about
get a specific about item,
and display */
router.get('/about/:item',isLoggedIn, function(req, res) {
    console.log('inside cms about');
    var item = req.params.item;
    var page='cms_about_item';

    let quest_status=false,
    quest_cat_status=false,
    article_status=false,
    article_cat_status=false,
    riddle_status=false,
    riddle_cat_status=false,
    about_status=false,
    about_overview_status=false,
    about_who_status=false,
    about_how_status=false;
    about_home_status=false;


    switch(item){
        case'overview':
        about_status=true;
        about_overview_status=true;
        page='cms_about_overview';
        page_title='overview';
        break;

        case'who':
        about_status=true;
        about_who_status=true;
        page='cms_about_who';
        page_title='who we are';
        break;

        case'how':
        about_status=true;
        about_how_status=true;
        page_title='How it works';
        break;
    }
    
     //get all items
     about.find({id:1}).exec(function(err,result){
        var res_data,res_data_item=[];

        if(err){
            console.log('err occurred');
            console.log(err);
        }else if(result){
            console.log('result occurred');
            console.log(result);
            res_data=(result[0])?(result[0]):([]);
            console.log(res_data);

            switch(item){
                case 'how':
                res_data_item=((res_data.length > 0) && (res_data['how']))?(res_data['how']):([]);
            }
        }

        res.render(page, {
            title:page_title,
            url:process.env.URL_ROOT,
            user_info:req.user,
            item:item,
            data:res_data,
            dataitem:res_data_item,
            quest_status:quest_status,
            quest_cat_status:quest_cat_status,
            article_status:article_status,
            article_cat_status:article_cat_status,
            riddle_status:riddle_status,
            riddle_cat_status:riddle_cat_status,
            about_status:about_status,
            about_overview_status:about_overview_status,
            about_who_status:about_who_status,
            about_how_status:about_how_status,
            about_home_status:about_home_status
        });

    });

 });


/*show stories:get story categories & story items
item:trend,news,fashion,featured etc */
router.get('/main/:item',isLoggedIn,function(req,res){

var story,cat;
    quest_status=false;
    quest_cat_status=false;
    article_status=false;
    article_cat_status=false;
    riddle_status=false;
    riddle_cat_status=false;
    pab_status=false;
    pab_cat_status=false;
    notice_status=false;
    notice_cat_status=false;
    trend_status=false;
    trend_cat_status=false;
    trend_story_status=false;
    about_overview_status=false;

    console.log('inside main');
    var item = req.params.item;
    console.log('item '+item)

    switch(item){
        case 'trend':
        cat = trend_cat; //get the cat obj
        story=trend_story; //get the story obj
        trend_story_status=true; //set the status
        trend_status=true;
        trend_cat_status=false;
        page_title="trending stories";
        break;

        case'quest_cat':
        cat = quest_cat;
        quest_status=true;
        quest_cat_status=true;
        page_title="Question categories";
        break;

        case'article_cat':
        cat = article_cat;
        article_status=true;
        article_cat_status=true;
        page_title="Article categories";
        break;

        case'riddle_cat':
        cat = riddle_cat;
        riddle_status=true;
        riddle_cat_status=true;
        page_title="Riddle categories";
        break;

        case'pab_cat':
        cat = pab_cat;
        pab_status=true;
        pab_cat_status=true;
        page_title="Post A book categories";
        break;

        case'notice_cat':
        cat = notice_cat;
        notice_status=true;
        notice_cat_status=true;
        page_title="Notice Board categories";
        break;

        case'trend_cat':
        cat = trend_cat;
        trend_status=true;
        trend_cat_status=true;
        trend_story_status=false;
        page_title="trending categories";
        break;
    }

    //get all categories
    cat.find().sort({value:1}).exec(function(err,cat_item){

        var res_cat=[],
        res_story=[];

        if(err)console.log(err);
        if(cat_item.length > 0){
            res_cat=cat_item;
            console.log(res_cat);            
        }

        if(story){

            //get all stories
            story.find().sort({value:1}).exec(function(err_story,story_item){

                var res_story=[];

                if(err_story)console.log(err_story);
                if(story_item.length > 0){
                    res_story=story_item;
                    console.log(res_story);            
                }

                res.render('cms_page', {
                    // title:item+'ing Stories',
                    url:process.env.URL_ROOT,
                    user_info:req.user,
                    item:item,
                    page_title:page_title,
                    data_story:res_story,
                    data_cat:res_cat,
                    
                    quest_status:quest_status,
                    quest_cat_status:quest_cat_status,
                    article_status:article_status,
                    article_cat_status:article_cat_status,
                    pab_status:pab_status,
                    pab_cat_status:pab_cat_status,
                    riddle_status:riddle_status,
                    riddle_cat_status:riddle_cat_status,
                    notice_status:notice_status,
                    notice_cat_status:notice_cat_status,
                    trend_status:trend_status,
                    trend_cat_status:trend_cat_status,
                    trend_story_status:trend_story_status
                }); 

            });

        }else{

            res.render('cms_page', {
                    // title:item+'ing Stories',
                    url:process.env.URL_ROOT,
                    user_info:req.user,
                    item:item,
                    page_title:page_title,
                    data_story:res_story,
                    data_cat:res_cat,
                    
                    quest_status:quest_status,
                    quest_cat_status:quest_cat_status,
                    article_status:article_status,
                    article_cat_status:article_cat_status,
                    pab_status:pab_status,
                    pab_cat_status:pab_cat_status,
                    riddle_status:riddle_status,
                    riddle_cat_status:riddle_cat_status,
                    notice_status:notice_status,
                    notice_cat_status:notice_cat_status,
                    trend_status:trend_status,
                    trend_cat_status:trend_cat_status,
                    trend_story_status:trend_story_status
                });
        }

        

    });    

});


/*save an about item
get all submitted about info for an item,
save a about */
router.post('/post_about/:type',function(req,res,next){


    var type = req.params.type;
    var update_items;

    switch(type){
        case 'overview':
        update_items={
            title:type,
            body:req.body.overview_about_description
        };
        update_param={overview:update_items};
        break;

        case 'who':
        update_items={
            title:type,
            body:req.body.who_about_description
        };
        update_param={who_we_are:update_items};
        break;
    }

    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    about.findOneAndUpdate({id:1},update_param,options,function(err2,res2){

        if(err2){
            // console.log('err2')
            res.json({success:false,msg:"About item update failed"});
        }else if(res2){  
            res.json({success:true,msg:"About item update was successfull"});
        }

    });
    
});


/*save an about subitem
get all submitted about info for an item,
save a about */
router.post('/post_about_subitem/:type',function(req,res,next){


    var type = req.params.type;
    var update_items;

    switch(type){
        case 'how':
        update_items={
            title:req.body.item_about_title,
            body:req.body.item_about_description
        };

        about.findOne({id:1}, function(err, ab) {
            if(ab){//if this item exists update and return
                let updateAbout=ab;
                updateAbout.how.push(update_items);//append how items
                console.log(updateAbout);

                about.updateOne({id:1},{$set:updateAbout},function(err1,res1){

                    if(err1){
                        console.log('err1')
                        res.json({success:false,msg:"About item update failed"});
                    }else if(res1){  
                        console.log('res1')                      
                        res.json({success:true,msg:"About item update was successfull"});
                    }

                });

                do_update=false;//don't update again

            }else{
                update_param={how:[update_items]};
                options = { upsert: true, new: true, setDefaultsOnInsert: true };

                about.findOneAndUpdate({id:1},update_param,options,function(err2,res2){

                    if(err2){
                        console.log('err2')
                        res.json({success:false,msg:"About2 item update failed"});
                    }else if(res2){  
                        console.log('res2')                      
                        res.json({success:true,msg:"About2 item update was successfull"});
                    }

                });
            }

        });
        break;
    }
    
});


/*save category or story
 */
 var upload = multer({storage:Storage});
 router.post('/post_page/:type',upload.single('page_photo'),function(req,res,next){

    console.log('req.fil')
    console.log(req.file);

    var type = req.params.type;//story or cat
    let obj,
    mode =req.body.page_mode, //new,edit
    page_id=req.body.page_id, //
    page_type=req.body.page_type; //trend,news,question etc

    console.log('page_id '+page_id);
    console.log('mode '+mode);
    console.log('page_type '+page_type);

    if(mode=="insert"){

        if(type=="cat"){

            switch(page_type){
                case 'quest_cat':
                obj = new quest_cat();
                break;

                case 'article_cat':
                obj = new article_cat();
                break;

                case 'riddle_cat':
                obj = new riddle_cat();
                break;

                case 'pab_cat':
                obj = new pab_cat();
                break;

                case 'trend_cat':
                obj = new trend_cat();        
                break;

                case 'notice_cat':
                obj = new notice_cat();        
                break;
            }   
            obj.title = (req.body.page_title).trim();
            obj.value = (req.body.page_title).trim().replace(/[^A-Za-z0-9]/g, "_");
            obj.description=req.body.page_description;

        }else if(type=="story"){

            switch(page_type){            
                case 'trend':
                obj = new trend_story();        
                break;
            }   
            obj.body = convertToSentencCase((req.body.page_title).trim());
            obj.post_type="trend";
            obj.description=convertToSentencCase((req.body.page_description).trim());
            obj.excerpt = (obj.description).substr(0,100);
            obj.category=req.body.page_category;

            if (req.file && req.file.filename != null) {
                obj.pics.push(req.file.filename);
            }
        }

        

        obj.save(function(err,quest){
            if(err){console.log(err);res.json({success:false,msg:" update failed"});
        }else{
            res.json({success:true,msg:" submission successful"});
            var json = JSON.stringify(obj,null,2);
        }
    });

    }else if(mode=="edit"){

        var update_items={};

        if(type=="cat"){

            switch(page_type){
                case'quest_cat':
                obj = quest_cat;
                break;

                case'article_cat':
                obj = article_cat;
                break;

                case'riddle_cat':
                obj = riddle_cat;
                break;

                case'pab_cat':
                obj = pab_cat;
                break;

                case'trend_cat':
                obj = trend_cat;                
                break;

                case'notice_cat':
                obj = notice_cat;                
                break;
            }
            
            update_items.title=req.body.page_title.trim();
            update_items.value=req.body.page_title.trim().replace(/[^A-Za-z0-9]/g, "_");
            update_items.description=req.body.page_description;

            //update a obj
            obj.findOneAndUpdate({_id:page_id},{$set:update_items},function(err1,res1){

                if(err1){
                    console.log(err1)
                    res.json({success:false,msg:" update failed"});
                }else if(res1){
                    res.json({success:true,msg:" update was successfull"});
                }

            });


        }else if(type=="story"){
            switch(page_type){            
                case 'trend':
                obj = trend_story;        
                break;
            }

            obj.findOne({_id:page_id},function(err,story){
                if(story){
                    let update_items=story;

                    update_items.body=convertToSentencCase(req.body.page_title.trim());
                    update_items.category=req.body.page_category;            
                    update_items.description=convertToSentencCase(req.body.page_description);
                    update_items.excerpt = (update_items.description).substr(0,100);

                    if (req.file && req.file.filename != null) {
                        update_items.pics.push(req.file.filename);
                    }

                    obj.updateOne({_id:page_id},{$set:update_items},function(err1,res1){

                        if(err1){
                            console.log(err1)
                            res.json({success:false,msg:" update failed"});
                        }else if(res1){
                            res.json({success:true,msg:" update was successfull"});
                        }

                    });
                }
            });
            
        }
        
    }
    
});


module.exports  = router;