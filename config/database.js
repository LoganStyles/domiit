var mongoose = require('mongoose');

var uri = process.env.MONGODB_URI;
// var uri =mongodb://domiit:domiit@ds013475.mlab.com:13475/heroku_sdf7bh9m;

mongoose.Promise = global.Promise
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));