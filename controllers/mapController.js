let util = require('../utility.js');
let mysql = require('../dbcon.js');
let sqlGetAllReports = "SELECT * FROM landmine INNER JOIN report ON landmine.id = report.mine_id;";
let sqlGetAllLandmines = "SELECT * FROM landmine;";
let sqlInsertNewLocation = "INSERT INTO location (title, lat, lng, user_id) VALUES (?, ?, ?, ?);";
let sqlGetFavoriteLocations = "SELECT * FROM location WHERE location.user_id = ?;";

exports.map_GET = function(req, res) {
	res.render('mapSearch');
}

exports.map_POST = function(req, res) {
	mysql.pool.query(sqlGetAllLandmines + sqlGetAllReports, function(err, result){
		res.json({
			landmines : result[0],
			reports : result[1]
		});
	});
}

exports.locations_POST = function(req, res) {
	mysql.pool.query(sqlGetFavoriteLocations, [req.session.userId], function(err, result){
		if(err) {
			res.sendStatus(400);
			console.log(err);
			return;
		}
		res.status(200);
		res.json(result);
	});
}

exports.saveLocation_POST = function(req, res) {
	util.verifyBodyParameters_POST(req, res, ['lng', 'lat', 'title'], function() {
		let coordinates = util.convertStrToCoordinates(req.body.lat, req.body.lng);
		if(!coordinates) {
  			res.type('plain/text');
			res.status(422);
			let errMsg = "Coordinates are invalid.";
			res.send(errMsg);
			return;
		}
		mysql.pool.query(sqlInsertNewLocation, [req.body.title, coordinates.lat, coordinates.lng, req.session.userId], function(err, result) {
			if(err) { 
				if(err.code === 'ER_DUP_ENTRY') {
					res.status(400).json({ error : "Duplicate entry." });
					return;
				}
				res.sendStatus(400);
			}
			res.sendStatus(200);
		});
	});
}

