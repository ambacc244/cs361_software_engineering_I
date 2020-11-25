exports.getHostURL = function(req) {
	return req.protocol + '://' + req.get('host');
}

function getMissingKeys(obj, keys) {
	var missingKeys = [];
	for(i = 0; i < keys.length; i++) {
		if(!obj.hasOwnProperty(keys[i])) {
			missingKeys.push(keys[i]);
		}
	}
	return missingKeys;
}

function sendMissingKeysMessage(res, parameters) {
  	res.type('plain/text');
	res.status(422);
	let errMsg = "Missing parameters: " + parameters.join(", ");
	res.send(errMsg);
}

exports.verifyBodyParameters_POST = function(req, res, parameters, next) {
	req.body = JSON.parse(JSON.stringify(req.body));
	let missingKeys = getMissingKeys(req.body, parameters);
	if(missingKeys.length == 0) {
		next();
	} else {
		sendMissingKeysMessage(res, missingKeys);
	}
}

exports.convertStrToCoordinates = function(lat, lng) {
	if(!lat || !lng) { return undefined; }
	if((typeof(lat) !== 'string') || (typeof(lng) !== 'string')) { return undefined; }
	lat = parseFloat(lat);
	lng = parseFloat(lng);
	if(lat > 90 || lat < -90 || isNaN(lat)) { return undefined; } 
	if(lng > 180 || lng < -180 || isNaN(lng)) { return undefined; }
	return { lat : lat, lng : lng }; 
}

