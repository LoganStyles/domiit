var total_messages = 5;
var delay_amount = 0;
var fade_speed = 200;
var socket = io();

// Connect to Socket.io
// socket.connect("http://localhost:8000");
socket.connect("https://ancient-falls-19080.herokuapp.com");

socket.on('question posts',function(json){
	// $('#the_list').html("coming soon");
	var oldest_post = $('.item').first();
	//get count of posts before appending another
	var count = $('.item').length;

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
		$('.posts').append($(item_head+item_body));//append html
		//fade post in
		$('.item').last().animate({opacity:1},fade_speed,function(){
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
	var post_type='<span class="item-status">'+parsed.category_id+'</span>';
	var poster_img='<img class="item-pic" src="assets/img/avatar.png">';
	var poster_profile='<a href="" class="item-name primary-link">'+parsed.owner.displayName+'</a>';
	var posted_time='<span class="item-label">Just now</span>';
	// var posted_time='<span class="item-label">'+parsed.date_created+'</span>';
	var item_details='<div class="item-details">'+poster_img+poster_profile+posted_time+'</div>';
	item_details+=post_type;
	var item_head='<div class="item-head">'+item_details+'</div>';
	var item_body='<div class="item-body">'+parsed.body+'</div>';

	//delay adding post to allow fading of deleted array
	setTimeout(function(){
		addPost();},delay_amount);
	
});