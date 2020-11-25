let utility = require("../utility.js");

exports.getHeaderData = function(req) {
	let url = utility.getHostURL(req);
	let isLoggedIn = req.session.userId ? true : false;

	return [
		{ title : "Report", link : url + "/report/create" },
		{ title : "Search", link : url + "/search" },
		{ title : "Profile", link : url + "/profile" },
		{ title : "Map", link : url + "/map" }
	];
}
