// Returns the distance in meters between two points.
// Source: https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
function distance(lat1, lon1, lat2, lon2) {
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

// Returns true / false if the given position is within a given radius from a center position.
function isWithinRadius(centerLat, centerLon, radius, lat, lon) {
	let dist = distance(centerLat, centerLon, lat, lon);
	return (dist <= radius);
}

// Returns true / false if a given position is within a given bounds.
function posIsInBounds(posLat, posLng, northBndLat, westBndLng, southBndLat, eastBndLng) {
  if(posLat > northBndLat || posLat < southBndLat) { return false } 
  if(posLng > eastBndLng || posLng < westBndLng) { return false }  
  return true;
}

exports.distance = distance;
exports.isWithinRadius = isWithinRadius;
exports.posIsInBounds = posIsInBounds;
