let mysql = require('../dbcon.js');
let util = require('../utility.js');

let sqlFindUser = "SELECT * FROM user_account WHERE user_account.email_address = ?;";
let sqlInsertUser = "INSERT INTO user_account (email_address, account_password) VALUES (?, ?);";

// Renders the login page. If the user is already logged in, redirects to the profile page.
exports.login_GET = function(req, res) {
	if(req.session.userId) {
		res.redirect('/profile');
		return;
	}
	let payload = {
		registerURL : util.getHostURL(req) + "/register"
	}
	res.render('login', payload);
}

// Clears the session and renders the logout page. If the user wasn't logged in, redirects to the login page.
exports.logout_GET = function(req, res) {
	if(req.session.userId) {
		req.session.userId = undefined;
	}
	res.redirect('/login');
}

// Authenticates the user meaning the session cookie is given the userId. 
exports.authenticateUser_POST = function(req, res) {
	// Checks for expected parameters.
	if(!req.body.email || !req.body.password) {
  		res.type('plain/text');
  		res.status(500);
  		res.send('Missing parameters for authentication.');
		return;
	}

	mysql.pool.query(sqlFindUser, [req.body.email], function(err, result){ 
			if(result.length > 0) {
				if(req.body.password === result[0].account_password) {
					req.session.userId = result[0].id;
					res.json({ success : true });
				} else {
					res.json({
						success : false,
						errMsg : "Invalid password."
					});
				}
			} else {
				res.json({
					success : false,
					errMsg : "Invalid email."
				});
			}
	});
}

// Renders the new account page. If the user is already logged in, redirects to the profile page.
exports.newAccount_GET = function(req, res) {
	if(req.session.userId) {
		res.redirect('/profile');
		return;
	}
	res.render('newAccount');
}

// Creates a new user account.
exports.newAccount_POST = function(req, res) {
	// Checks for expected parameters.
	if(!req.body.password || !req.body.email) {
  		res.type('plain/text');
  		res.status(500);
  		res.send('Missing parameters for registration.');
		return;
	}

	mysql.pool.query(sqlInsertUser, [req.body.email, req.body.password], function(err, result) {
		if(err) {
			if(err.code === 'ER_DUP_ENTRY') {
				res.json({
					success : false,
					errMsg : "Email already used."
				});
			} else {
				console.log(err);
  				res.type('plain/text');
  				res.status(500);
  				res.send('Something broke.');
			}
		} else {
			res.json({ success : true });
			req.session.userId = result.insertId;
			req.session.save();
			return;
		}
	});
}
