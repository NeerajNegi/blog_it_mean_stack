const express = require('express');
const router = express.Router();
//var passport = require('passport');
//var jwt = require('express-jwt');

/*var auth = jwt({
	secret: 'mysupersecret',
	userProperty: 'payload'
});*/

//importing User Schema
const User = require('../models/user');

//retrieving Users
router.get('/Users', (req, res, next)=>{
	User.find( (err, Users)=>{
		res.json(Users);
	});
});

//login user
router.post('/login', (req, res)=>{
	User.findOne({email : req.body.email}, function(err, user){
		if(user === null){
			console.log(err);
			console.log("No such user found !");
			return res.status(400).send({
				message: "User not found."
			});
		} else {
			if(user.validPassword(req.body.password)){
				console.log("User logged in");
				//var token = user.generateJwt();
				return res.status(201).send({
					message: "User Logged In",
					displayName: user.first_name + " " + user.last_name,
					//token: token,
					id: user.id
				});
			} else {
				console.log("Wrong password");
				return res.status(400).send({
					message: "Wrong Password"
				});
			}
		}
	});
});

//add user
router.post('/signup',(req, res, next)=>{
	User.find({email: req.body.email}, function(err, user){
		if(user.length > 0){
			console.log("user already exist.");
			res.status(400).send({
				message: "User already exist."
			});
		} else {
			let newUser = new User();

			newUser.first_name = req.body.firstName,
			newUser.last_name = req.body.lastName,
			newUser.email = req.body.email

			newUser.setPassword(req.body.password);

			newUser.save( (err, User)=>{
				if(err){
					console.log(err);
					return res.status(400).send({
						message: "Failed to add user."
					});
				} else {
					return res.status(201).send({
						message: "User added succesfully."
					});
				}
			});
		}
	})
});

//deleting Users
router.delete('/User/:id',(req, res, next)=>{
	User.remove({_id: req.params.id}, (err, result)=>{
		if(err){
			res.json(err);
		} else {
			res.json(result);
		}
	});
});

module.exports = router;
