// BASE SETUP
// ======================================
// CALL THE PACKAGES --------------------

var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var port = process.env.PORT || 8080;

var User = require('./app/models/user');

mongoose.connect('mongodb://localhost:27017/db_name');

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use((req, res, next)=> {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// log all requests to the console 
app.use(morgan('dev'));

// ROUTES FOR OUR API
// =============================

// get an instance of the express router
var apiRouter = express.Router(); // get an instance of the express Router

// middleware to use for all requests
apiRouter.use((req, res, next)=> {
  	// do logging
  	console.log('Somebody just came to our app!'); 
 	// we'll add more to the middleware in Chapter 10
 	// this is where we will authenticate users
 	next(); // make sure we go to the next routes and don't stop here
 });

// test route to make sure everything is working 
// (accessed at GET http://localhost:8080/api)
apiRouter.get('/', function(req, res) {
 	res.json({ message: 'hooray! welcome to our api!' });	
});

// basic route for the home page
app.get('/', (req, res)=> {
	res.send('Welcome to the home page!');
});

// more routes for our API will happen here
// route middleware and first route are here
// on routes that end in /users
// ----------------------------------------------------
apiRouter.route('/users') 
 	// create a user (accessed at POST http://localhost:8080/api/users)
 	.post((req, res) => {
 		// create a new instance of the User model
 		var user = new User(); 		
 		//set the users information (comes from the request)
 		user.name = req.body.name;  
 		user.username = req.body.username;
 		user.password = req.body.password;
 		// save the user and check for errors
 		user.save((err) =>{
             if (err) {
                 // duplicate entry
                 if (err.code == 11000) 
                     return res.json({ success: false, message: 'A user with that username already exists. '});
                 else 
                     return res.send(err);
             }
 			res.json({ message: 'User created!' });
 		});	
 	})
	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
 		User.find(function(err, users) {
 			if (err) res.send(err);
  			// return the users
 			res.json(users);
 		});
 	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// START THE SERVER
// ===============================

app.listen(port);
console.log('Magic happens on port ' + port);