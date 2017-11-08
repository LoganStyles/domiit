var express = require('express');
var router = express.Router();
var config = require('../config/database');
// var user = require('../models/user');
var question = require('../models/question');
// var multer = require('multer');

// var mime = require('mime-lib');

// var Storage =multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'../public/uploads')//set the destination

//     },
//     filename:function(req,file,cb){
//         console.log('filename ext '+file.mimetype);
//         console.log(mime.extension(file.mimetype));
//         cb(null, Date.now() + '.'+mime.extension(file.mimetype)[mime.extension(file.mimetype).length-1]);

//     }
// });


/*chk loggedin*/
function isLoggedIn(req, res, next) {
    if(!req.user){
        res.redirect('/');
    }else{
        next();
    }
}


/*get all posted questions*/
router.get('/question_all', isLoggedIn,function(req, res) {
    console.log('inside all questions');

    question.find().sort({post_date:-1}).exec(function(err,items){

        var res_items=[];

        if(err)console.log(err);
        if(items){//items were found
            res_items=items;
            console.log(res_items)
        }

        res.render('questions', {
            url:process.env.URL_ROOT,
            user_info:req.user,
            data:res_items       
        });

    });
    
});

// var upload = multer({storage:Storage});


// /*process an 'ask a question' post,save & update UI immediately*/
// router.post('/ask_question',upload.single('question_photo'),function(req,res,next){
//     // console.log(req.body)

//     var owner_details={id:req.user._id,displayName:req.user.displayName,displayPic:req.user.displayPic,
//         status:req.user.current_appointment};

//         // console.log(owner_details)

//         let ask_quest =new question();
//         ask_quest.body=req.body.question_title;
//         ask_quest.category = req.body.question_category;
//         ask_quest.sub_cat1=req.body.question_sub1;
//         ask_quest.sub_cat2=req.body.question_sub2;
//         ask_quest.description=req.body.question_info;
//         ask_quest.owner=owner_details;

//         if (req.file.filename != null) {
//             ask_quest.pics.push(req.file.filename);
//         }
//         console.log(ask_quest)


//         ask_quest.save(function(err1, ask_quest) {

//             if(err1){console.log(err1);res.json({success: false,msg:"question submission failed"});

//         }else{
//             res.json({success:true,msg:"Question submission succesful"});
//             var json = JSON.stringify(ask_quest, null, 2);
//             console.log(json);
//             io.emit('all_questions', json);
//             io.emit('unanswered_questions', json);
//         }   
//     });

// });

module.exports =router;