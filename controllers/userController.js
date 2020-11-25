let mysql = require('../dbcon.js');

let sqlUserReports = "SELECT * FROM report INNER JOIN landmine ON landmine.id = report.mine_id WHERE report.reporter_id = ?;";
let sqlUserLocations = "SELECT * FROM location WHERE location.user_id = ?;";
let sqlUserEmail = "SELECT email_address FROM user_account WHERE user_account.id = ?;";

// Displays the profile page for a single user.
exports.userProfile_GET = function(req, res) {
	// If the user isn't logged in, redirect them to the login page.
	if(!req.session.userId) {
		res.redirect('/login');
		return;
	}

	let userId = req.session.userId;
	mysql.pool.query(sqlUserReports + sqlUserLocations + sqlUserEmail, [userId, userId, userId], function(err, result) {	
		let data = {
			reports : result[0],
			locations : result[1],
			email : result[2][0].email_address
		}
		res.render('userProfile', data);
	});

}
