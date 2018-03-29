//importing modules
var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');
//var passport = require('passport');

var app = express();

//mongodb links
var MONGODB_URI = "mongodb://neerajnegi:yeschidori@ds153778.mlab.com:53778/blog_it";
var MONGODB_LOCAL_URI = "mongodb://localhost:27017/blog_it";

//importing routes
const user = require('./routes/user');
const blog = require('./routes/blog');

//connect to MongoDB
mongoose.connect(MONGODB_URI);
// on successful connection
mongoose.connection.on('connected',()=>{
	console.log('Connected to MongoDB @ 27017');
});
//on connection error
mongoose.connection.on('error',(err)=>{
	if(err){
		console.log('Error in DB connection: ' + err);
	}
});

//port no;
const port = process.env.PORT || 3000;

//adding middleware
app.use(cors());
app.use(bodyparser.json());

//passport
//require('./config/passport');
//app.use(passport.initialize());


//static files
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/api/user', user);
app.use('/api/blogs', blog);

app.listen(port,()=>{
	console.log("Server running at port: " + port);
});