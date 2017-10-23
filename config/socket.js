// var sockio = require('socket.io');

module.exports = function(app){

	//=========
	//Socket config
	//=========

	
	var io = require('socket.io')(app);

	io.on('connection',function(socket){
		console.log('a user connected');
		socket.on('disconnect',function(){
			console.log('user disconnected');
		});
	});


};