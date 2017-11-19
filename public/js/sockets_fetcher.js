var total_messages = 5;
var delay_amount = 0;
var fade_speed = 200;
var socket = io();
var URL_ROOT="https://ancient-falls-19080.herokuapp.com";
// var URL_ROOT="http://localhost:8000";

// Connect to Socket.io
socket.connect(URL_ROOT);
// console.log('fetcher is loaded');

socket.on('all_questions',function(json){
	console.log('inside question posts socket');
	var oldest_post = $('.posted').first();
	//get count of posts before appending another
	var count = $('.posted').length;
	console.log('count is '+count);

	//remove oldest post from the DOM
	function removePost(){
		//fade post out
		oldest_post.animate({opacity:0},fade_speed,function(){
			//remove post from DOM
			oldest_post.remove();
		});
	}

	//add new post to the DOM
	function addPost(){
		//constuct HTML to append
		$('.question_all_post_area').prepend($(post_type));//append html
		//fade post in
		$('.posted').last().animate({opacity:1},fade_speed,function(){
			//animation is complete
			console.log('animation is complete');
		});
	}

	//if there are more than 'total messages', start removing from the top
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost();
	}

	var parsed = JSON.parse(json);

	var post_type='<div class="portlet light posted">';
		post_type+='<div class="portlet-title">';
		post_type+='<div class="caption caption-md">';
		post_type+='<i class="fa fa-question"></i><span class="caption-subject  bold uppercase" style="color: #86be25">Question</span>';
		if(parsed.category){
			post_type+='&nbsp;<span class="caption-helper">'+parsed.category+'</span>&nbsp;';
		}
		if(parsed.sub_cat1){
			post_type+='|&nbsp;<span class="caption-helper">'+parsed.sub_cat1+'</span> &nbsp;';
		}

		if(parsed.sub_cat2){
			post_type+='|&nbsp;<span class="caption-helper">'+parsed.sub_cat2+'</span>';	
		}
		
		
		post_type+='</div><div class="actions">';
		post_type+='<div class="btn-group">';
		post_type+='<span class="item-status" data-toggle="dropdown" style="cursor: pointer;">';
		post_type+='<i class="fa fa-ellipsis-v"></i></span>';
		post_type+='<ul class="dropdown-menu pull-right">';
		post_type+='<li><a href="javascript:;"><i class="fa fa-pencil"></i> Edit </a></li>';
		post_type+='<li><a href="javascript:;"><i class="fa fa-trash-o"></i> Delete </a></li>';
		post_type+='<li><a href="javascript:;"><i class="fa fa-ban"></i> Share </a></li>';
		post_type+='<li><a href="javascript:;"> Request Answer </a></li></ul></div></div></div>';
		post_type+='<div class="portlet-body"><div class="scroller"  data-always-visible="1" data-rail-visible1="0" data-handle-color="#D7DCE2">';
		post_type+='<div class="general-item-list"><div class="item"><div class="item-head"><div class="item-details">';
		if(parsed.owner.displayPic){
			post_type+='<img class="item-pic" src="'+URL_ROOT+'/assets/img/'+parsed.owner.displayPic+'">';	
		}
		
		post_type+='<a href="" class="item-name primary-link">'+parsed.owner.displayName+'</a>';
		
		if(parsed.owner.status){
			post_type+='<span>, '+parsed.owner.status+'</span>';	
		}
		post_type+='<span class="item-label">just now</span>';		
		post_type+='</div></div><div class="item-body">';
		if(parsed.pics.length >0){
			post_type+='<div style="margin-bottom: 3%;"><img class="img-responsive" src="'+URL_ROOT+'/uploads/'+parsed.pics[0]+'"></div>';
		}
		
		post_type+='<div style="color: #000;">'+parsed.body+'</div>';
		post_type+='</div></div></div></div></div>';
		post_type+='<div class="task-footer" style="margin: 2%;">';
		post_type+='<a class="btn btn-circle btn-default" href="javascript:;">';
		post_type+='<span><i class="fa fa-heart-o"></i><span>&nbsp;0</span>&nbsp;Likes</span></a>';
		post_type+='<a class="btn btn-circle btn-default" href="javascript:;">';
		post_type+='&nbsp;&nbsp;<span><i class="fa fa-comment-o"></i><span>&nbsp;0</span>&nbsp;comments</span></a>';
		post_type+='<a class="btn btn-circle btn-default" href="javascript:;">';
		post_type+='&nbsp;&nbsp;<span><i class="fa fa-share-alt"></i><span>&nbsp;0</span>&nbsp;Share</span></a>';
		post_type+='</div><div class="task-footer" style="margin: 2%;"><div class="btn-arrow-link ">';
		post_type+='<button type="button" class="btn dark btn-outline sbold uppercase"><i class="icon-pencil"></i>Write your answer</button>';
		post_type+='</div></div><div class="clearfix"></div></div>';

		//delay adding post to allow fading of deleted array
	setTimeout(function(){
		addPost();},delay_amount);

	});



socket.on('answered',function(json){

	console.log('a new answer has been posted');
	var parsed = JSON.parse(json);
	var answer_content="";
	console.log('question_id '+parsed.question_id);
	//find the right question
	$('.posts_answers .posted').each(function(key,value){
		var post_id=$(this).find('#post_id').val();
		console.log('post_id '+post_id);
		if(post_id ===parsed.question_id){
			console.log('found..begining process');
			// answer_content+='<div class="portlet-body answer_area">';
			answer_content+='<div class="" data-always-visible="1" data-rail-visible1="0" data-handle-color="#D7DCE2">';
			answer_content+='<div class="general-item-list">';
			answer_content+='<div class="item"><div class="item-head"><div style="width: 100%;">';
			answer_content+='<div class="posts_partition"><!--1st partition-->';
			answer_content+='<span> <img class="item-pic" src="'+URL_ROOT+'/uploads/'+parsed.responderDisplayPic+'">';
			answer_content+='<a style="color: #000;" href="" class="item-name primary-link">'+parsed.responderDisplayName+'</a>';
			answer_content+='<span>'+parsed.responderStatus+'</span> </span></div>';
			answer_content+='<div class="posts_partition_middle"><!--2nd partition-->';
			answer_content+='<span style=""><img src="'+URL_ROOT+'/uploads/add_person.png"> </span></div>';
			answer_content+='<div class="posts_partition"><!--3rd partition-->';
			answer_content+='<div style="margin-left: 60%;">';
			answer_content+='<div style="color: #ccc;">'+moment(parsed.post_date).fromNow()+'</div>';
			answer_content+='<div style="display: inline-block;margin-right: 20%;">';
			answer_content+='<img src="'+URL_ROOT+'/uploads/group.png"></div>';
			answer_content+='<div class="actions" style="display: inline-block;"><div class="btn-group">';
			answer_content+='<span class="item-status" data-toggle="dropdown" style="cursor: pointer;">';
			answer_content+='<i class="fa fa-ellipsis-v"></i></span>';
			answer_content+='<ul class="dropdown-menu pull-right"><li>';
			answer_content+=' <a href="javascript:;"><i class="fa fa-pencil"></i> Edit </a></li>';
			answer_content+='<li><a href="javascript:;"><i class="fa fa-trash-o"></i> Delete </a></li>';
			answer_content+='<li><a href="javascript:;"><i class="fa fa-ban"></i> Share </a></li>';
			answer_content+='<li><a href="javascript:;"> Request Answer </a></li></ul></div></div></div><!--end float right-->';
			answer_content+='<div class="clearfix"></div></div><div class="clearfix"></div></div></div>';
			answer_content+='<div class="item-body">';
			if(parsed.pics.length >0){
				answer_content+='<div style="margin-bottom: 3%;">';
				answer_content+='<img class="img-responsive" src="'+URL_ROOT+'/uploads/'+parsed.pics[0]+'"></div>';
			}

			answer_content+='<div style="color: #000;" class="post_answer">'+parsed.body+'</div></div>';
			answer_content+='<div style="width: 100%;"><!--main block-->';
			answer_content+='<div class="posts_partition_right"><!--3rd partition-->';
			answer_content+='<a class="btn btn-link " style="color: #000;font-size: 0.8em;">';
			answer_content+='<span>';
			answer_content+='<span class="social_value">'+parsed.views+'</span>&nbsp;&nbsp;Views</span></a>&nbsp;|';
			answer_content+='<a class="btn btn-link post_shares" style="color: #000;font-size: 0.8em;color: orange">About this post</a></div>';
			answer_content+='<div class="clearfix"></div></div><hr></div></div></div>';
			var answer_area=$(this).find('.answer_area');
			console.log('answer_area '+answer_area)
			// $(answer_area).html("");
			$(answer_area).html(answer_content);

			return false;
		}
	})
});