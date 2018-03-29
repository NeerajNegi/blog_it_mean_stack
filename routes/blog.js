const express = require('express');
const router = express.Router();

//importing Blog Schema
const Blog = require('../models/blog');

//retrieving Blogs
router.get('/Blogs', (req, res, next)=>{
	Blog.find( (err, Blogs)=>{
		if(err){
			res.status(400).send({
				message: "Some error has occured."
			});
		} else {
			res.status(200).send({
				message: "Get Blogs success.",
				blogs: Blogs
			});
		}
	});
});

//retrieving own Blogs
router.get('/ownblogs/:author_id', (req, res, next)=>{
	console.log("own blogs called");
	Blog.find({author_id: req.params.author_id}, function(err, blogs){
		console.log("find called");
		if(err){
			console.log("Error occured");
			console.log(err);
			res.status(400).send({
				message: "Error Occured"
			});
		} else {
			console.log("Inside else");
			if(!blogs.length){
				console.log("Empty array");
				res.status(400).send({
					message: "No blogs"
				});
			} else {
				console.log("Blogs get");
				res.status(200).send({
					message:"Blogs retrieved",
					blogs: blogs
				});
			}
		}
	});
});

//add Blog
router.post('/Blog',(req, res, next)=>{
	let newBlog = new Blog({ 
		author_id : req.body.author_id,
		content: req.body.content,
		title: req.body.title,
		upVoteCount : req.body.upVoteCount,
		downVoteCount : req.body.downVoteCount,
	});
	newBlog.save( (err, Blog)=>{
		if(err){
			console.log(err);
			res.status(400).send({
				msg: 'Failed to add Blog'
			});
		} else {
			console.log("Blog added");
			res.status(200).send({
				msg: 'Blog Added'
			});
		}
	});
});

//upvote
router.get('/upvote/:id',(req, res, next)=>{
	console.log("up vote request acquired");
	Blog.findOne({_id: req.params.id}, function(err, blog){
		if(blog == null){
			console.log(err);
			res.status(400).send({
				message: "Some error has occured."
			});
		} else {
			blog.upVote();
			console.log(blog.upVoteCount);
			blog.save((err, blog)=>{
				if(err){
					console.log(err);
					res.status(400).send({
						message: "Some error has occured."
					})
				} else {
					res.status(200).send({
						message: "Up vote success",
						blog: blog
					});
				}
			})
		}
	});
});

//downvote
router.get('/downvote/:id',(req, res, next)=>{
	console.log("down vote request acquired");
	Blog.findOne({_id: req.params.id}, function(err, blog){
		if(blog == null){
			console.log(err);
			res.status(400).send({
				message: "Some error has occured."
			});
		} else {
			blog.downVote();
			console.log(blog.downVoteCount);
			blog.save((err, blog)=>{
				if(err){
					console.log(err);
					res.status(400).send({
						message: "Some error has occured."
					})
				} else {
					res.status(200).send({
						message: "Down vote success",
						blog: blog
					});
				}
			})
		}
	});
});

//get single blog
router.get('/Blog/:id',(req, res)=>{
	console.log(req.params.id);
	Blog.findOne({_id: req.params.id}, function(err, blog){
		if(blog == null){
			console.log(err);
			res.status(400).send({
				message: "Some error has occured."
			});
		} else {
			res.status(200).send({
				message: "Blog retrieved",
				blog: blog
			});
		}
	});
});

//deleting Blogs
router.delete('/Blog/:id',(req, res, next)=>{
	Blog.remove({_id: req.params.id}, (err, result)=>{
		if(err){
			res.json(err);
		} else {
			res.json(result);
		}
	});
});
module.exports = router;