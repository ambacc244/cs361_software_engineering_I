let lat = parseFloat(document.getElementById("lat").value);
let lng = parseFloat(document.getElementById("lng").value);

var mymap = L.map('mapid').setView([lat, lng], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFubWl0dSIsImEiOiJjamtzd2w1cm8wMGg3M3BtZzNnbnZ3cWljIn0.pAPjLUhSdIuLPDII2Gu8zg', {
	maxZoom: 18,
	attribution: 
		'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox.streets',
	accessToken:'pk.eyJ1IjoiZGFubWl0dSIsImEiOiJjamtzd2w1cm8wMGg3M3BtZzNnbnZ3cWljIn0.pAPjLUhSdIuLPDII2Gu8zg'
}).addTo(mymap);

var marker = L.marker([lat, lng]).addTo(mymap);

function sendDelete(mine_id, reporter_id){
	console.log(mine_id);
	console.log(reporter_id);
	// Create an HTTP request.
	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/report/delete";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400){
			console.log(http.responseText)
			var response = JSON.parse(http.responseText);
			if(response.success) {
				location.href = getBaseURL() + '/profile';
			} else {
				document.getElementById("reportErrorMessage").textContent = response.errMsg;
			}
		} else {
		document.getElementById("reportErrorMessage").textContent = "Something went wrong.";
		} 
	});

	http.send(JSON.stringify({ 'mine_id' : mine_id, 'reporter_id' : reporter_id }));
	return false; 
}

