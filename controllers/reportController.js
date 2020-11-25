let mysql = require('../dbcon.js');
let geoMath = require('./geographyMath.js');

// SQL Queries
let sqlMineAtLocation = "SELECT * FROM landmine WHERE lat = ? AND lng = ?;";
let sqlCreateLandmine = "INSERT INTO landmine (verified, disarmed, lat, lng) VALUES (?, ?, ?, ?);";
let sqlCreateReport = "INSERT INTO report (reported, note, mine_id, reporter_id) VALUES (NOW(), ?, ?, ?);";
let sqlGetReport = "SELECT * FROM report INNER JOIN landmine ON report.mine_id = landmine.id WHERE report.reporter_id = ? AND report.mine_id = ?;";
let sqlDeleteReport = "DELETE FROM report WHERE report.reporter_id = ? AND report.mine_id = ?;";
let sqlGetReportsWithMineId = "SELECT * FROM report WHERE report.mine_id = ?;";
let sqlDeleteLandmine = "DELETE FROM landmine WHERE landmine.id = ?;";

// Search for Reports - Query Components
let sqlBaseSearch = "SELECT * FROM report INNER JOIN landmine ON report.mine_id = landmine.id";
let sqlWhereVerified = "landmine.verified = ?";
let sqlWhereDisarmed = "landmine.disarmed = ?";
let sqlWhereDateRange = "report.reported BETWEEN ? AND ?";

exports.create_GET = function(req, res) {
	res.render('reportForm');
}

// Creates a report.
exports.create_POST = function(req, res) {
	if(!req.body.verified || !req.body.disarmed || !req.body.lat || !req.body.lng) {
  		res.type('plain/text');
  		res.status(500);
  		res.send('Missing parameters for a new report.');
		return;
	}
	if(!req.body.note) {
		req.body.note = " ";
	}

	let verified = parseInt(req.body.verified);
	let disarmed = parseInt(req.body.disarmed);
	let lat = parseFloat(req.body.lat);
	let lng = parseFloat(req.body.lng);

	let userId = req.session.userId;
	// Check whether there's already a mine at this location.
	mysql.pool.query(sqlMineAtLocation, [lat, lng], function (err, result) {
		// Someone has already filed a report for this exact location -> don't create a new mine.
		if(result.length === 1) {
			let landmineId = result[0].id;
			// Create the reporpt using the existing landmine.
			mysql.pool.query(sqlCreateReport, [req.body.reported, req.body.note, landmineId, userId], function(err) {
				if(err) {
					var errMsg;
					if(err.code = "ER_DUP_ENTRY") {
						errMsg = "This account has already reported this landmine.";
					}
					res.json({
						success : false,
						errMsg : errMsg
					});
					return;
				}
				res.json({
					success : true
				});
				return;
			});
		} else { // There is no landmine matching this location. So create it.
			mysql.pool.query(sqlCreateLandmine, [verified, disarmed, lat, lng], function(err, result) {
				let newMineId = result.insertId;
				// Create the report using the new landmine.
				mysql.pool.query(sqlCreateReport, [req.body.note, newMineId, userId], function(err, result) {
					res.json({
						success : true
					});
					return;
				});
			});
		}
	}); 
}

// Renders the page for a single report.
exports.viewReport_GET = function(req, res) {
	if(!req.query.reporter_id || !req.query.mine_id) {
  		res.type('plain/text');
  		res.status(500);
  		res.send('Missing parameters for a new report.');
		return;
	}

	// Find the report.
	mysql.pool.query(sqlGetReport, [req.query.reporter_id, req.query.mine_id], function(err, result) {
		if(err || (result.length === 0)) {
			res.status(400);
			res.redirect('404');
			return;
		}
		let isOwner = (req.session.userId === undefined || req.session.userId == null);
		let reportData = result[0];
		let data = {
			data : reportData,
			isOwner : isOwner 
		};
		res.render('report', data);
	});
}

exports.search_GET = function(req, res) {
	res.render('searchForm');
}


// Takes a bunch of query parameters to perform a search then renders the searchResults page.
exports.query_GET = function(req, res) {
	var whereQueryComponents = [];
	var searchArguments = [];

	if(req.query.verified && req.query.verified != '-1') {
		searchArguments.push(parseInt(req.query.verified));
		whereQueryComponents.push(sqlWhereVerified);
	}
	if(req.query.disarmed && req.query.disarmed != '-1') {
		searchArguments.push(parseInt(req.query.disarmed));
		whereQueryComponents.push(sqlWhereDisarmed);
	}
	
	let dateStrings = getMysqlDateStrings(req);
	if(dateStrings) {
		searchArguments.push(dateStrings.startDate);
		searchArguments.push(dateStrings.endDate);
		whereQueryComponents.push(sqlWhereDateRange);
		console.log(dateStrings.startDate);
		console.log(dateStrings.endDate);
	}

	// Add the WHERE conditions, if there are any, to the search query.
	var searchQuery = sqlBaseSearch;
	if(searchArguments.length > 0) {
		searchQuery += " WHERE " + whereQueryComponents.join(' AND ');
	}
	
	mysql.pool.query(searchQuery, searchArguments, function(err, result) {
		if(err) {
			console.log(err);
  			res.type('plain/text');
  			res.status(500);
  			res.send('Something went wrong.');
			return;
		}
	
		// Filter the data given a center and a radius.
		if(req.query.radius && req.query.centerLat && req.query.centerLng) {
			console.log("Filtering to radius.");
			let center = { lat : parseFloat(req.query.centerLat), lng : parseFloat(req.query.centerLng) };
			let radius = req.query.radius;
			result = result.filter(row => geoMath.isWithinRadius(center.lat, center.lng, radius, parseFloat(row.lat), parseFloat(row.lng)));
		}

		res.render('searchResults', { reports : result } );
	});
}

// Deletes a report and the landmine if it has no reports left.
exports.delete_POST = function(req, res) {
	if(!req.body.reporter_id || !req.body.mine_id) {
  		res.type('plain/text');
  		res.status(500);
  		res.send('Missing parameters to delete a report.');
		return;
	}

	let reporterId = parseInt(req.body.reporter_id);
	let mineId = parseInt(req.body.mine_id);

	if(req.body.reporter_id != req.session.userId) {
  		res.type('plain/text');
		res.status(500);
		res.send('You can not delete a report you did not create.');
		return;
	}

	// Delete Report
	mysql.pool.query(sqlDeleteReport, [reporterId, mineId], function(err, result){
		if(err) {
			console.log(err);
			res.json({ success : false });
			return;
		}
		// Check that the landmine has any reports.
		mysql.pool.query(sqlGetReportsWithMineId, [mineId], function(err, result){
			if(err) {
				console.log(err);
			}
			// Landmine's 1 report was deleted
			if(result.length === 0) {
				// Delete the landmine
				mysql.pool.query(sqlDeleteLandmine, [mineId], function(err, result){ 
					if(err) { 
						res.json({ success : false }); 
					} else {
						res.json({ success : true });
					}
				});	
			} else {
				res.json({ success : true });
			}
		});		
	});
}

// I hate dates.
function getMysqlDateStrings(req) {
	let arg = req.query;

	function dateIsValid(y, m, d) {
		y = parseInt(y);
		m = parseInt(m);
		d = parseInt(d);

		if(!y || y < 0) { return false }
		if(!m || m < 1 || m > 12) { return false }
		if(!d || d < 0 || d > 31) { return false }
		return true;
	}	

	// Check that the fields exist and the numbers are in the proper range.
	if(!dateIsValid(arg.sY, arg.sM, arg.sD)) {
		return undefined;
	} else if(!dateIsValid(arg.eY, arg.eM, arg.eD)) {
		return undefined;
	}

	// Use js Date object to check that endDate is after startDate.
	let startDate = new Date(arg.sY, arg.sM, arg.sD);
	let endDate = new Date(arg.eY, arg.eM, arg.eD);	
	if(startDate > endDate) { return undefined; }

	function datetimeForMysql(year, month, day, hours, minutes, seconds ) {
		return [year, month, day].join(":") + " " + [hours, minutes, seconds].join(":");
	}

	return {
		startDate : datetimeForMysql(arg.sY, arg.sM, arg.sD, 0, 0, 0),
		endDate : datetimeForMysql(arg.eY, arg.eM, arg.eD, 0, 0, 0)
	}
}
