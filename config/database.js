var mongoose = require('mongoose');

var uri = process.env.MONGODB_URI;

mongoose.Promise = global.Promise
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));