let express = require('express');
let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let session = require('express-session');
let mysql = require('./dbcon.js');
let util = require('./utility.js');

let app = express();

app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/scripts'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({ 
	secret:'SuperSecretPassword',
	resave: true,
    saveUninitialized: true
}));

app.engine( 'hbs', exphbs({ 
	extname: 'hbs', 
	defaultLayout: 'main', 
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
}));

app.set('view engine', '.hbs');

// CONTROLLERS
let authenticationController = require("./controllers/authenticationController.js");
let userController = require("./controllers/userController.js");
let reportController = require("./controllers/reportController.js");
let mapController = require("./controllers/mapController.js");

// Set the port or quit if it doesn't work.
if (process.argv.length >= 3) {
	let port = process.argv[2];
	app.set('port', port);
} else {
	console.log("Error: Expected an argument for the port number");
	process.exit(1);
}

app.use(function(req, res, next) {
	let headerController = require('./controllers/headerController.js');
	res.locals.headerData = headerController.getHeaderData(req);
	res.locals.isLoggedIn = req.session.userId ? true : false;
	next();
});

// ROUTES
// ROUTES - User Authentication
app.get('/login', authenticationController.login_GET);
app.get('/logout', authenticationController.logout_GET);
app.post('/authenticate', authenticationController.authenticateUser_POST);
app.get('/register', isNotAuth, authenticationController.newAccount_GET); 
app.post('/register', authenticationController.newAccount_POST);

app.get('/profile', userController.userProfile_GET);

// ROUTES - Reports
app.get('/search', reportController.search_GET);
app.get('/q', reportController.query_GET);
app.get('/report', reportController.viewReport_GET);
app.get('/report/create', isAuth, reportController.create_GET);
app.post('/report/create', isAuth_POST, reportController.create_POST);
app.post('/report/delete', isAuth_POST, reportController.delete_POST);

app.get('/map', mapController.map_GET);
app.post('/map', mapController.map_POST);
app.post('/map/location/create', isAuth_POST, mapController.saveLocation_POST);
app.post('/map/locations', isAuth_POST, mapController.locations_POST);

app.get([' ', '/'], function(req, res) {
	res.redirect('profile');
});

app.use(function(req, res){
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
	console.log("Express started on port " + app.get('port') + ".")
});

function isAuth(req, res, next) {
	if(!req.session.userId) {
		res.redirect('/login');
	} else {
		next();
	}
}

function isAuth_POST(req, res, next) {
	if(!req.session.userId) {
  		res.type('plain/text');
		res.status('401');
		res.send('You must be logged in to use this route.');
	} else {
		next();
	}
}

function isNotAuth(req, res, next) {
	if(req.session.userId) {
		res.redirect('/profile');
	} else {
		next();
	}
}
