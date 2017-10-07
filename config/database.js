var mongoose = require('mongoose');
// module.exports = {
// 	database: "mongodb://localhost:27017/doomiit",
// 	secret:'yoursecret'
// }

var uri = process.env.MONGODB_URI;
// var uri = 'mongodb://127.0.0.1:27017/doomiit';
// var uri = 'mongodb://user:pass@host:port/doomiit';
//console.log('db : '+uri);

mongoose.Promise = global.Promise
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));