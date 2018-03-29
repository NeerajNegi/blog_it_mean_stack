const mongoose = require('mongoose');

const BlogSchema = mongoose.Schema({ 
	author_id : String,
	content:{
		type: String,
		required: true
	},
	title: String,
	upVoteCount : Number,
	downVoteCount : Number
});

BlogSchema.methods.upVote = function(){
	this.upVoteCount = this.upVoteCount + 1;
}
BlogSchema.methods.downVote = function(){
	this.downVoteCount = this.downVoteCount + 1;
}

const Blog = module.exports = mongoose.model('Blog', BlogSchema);