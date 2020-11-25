var mymap = L.map('mapid').setView([12.5657, 104.9910], 7);
var popup = L.popup();
let currentClickSpot = undefined;
let isLoggedIn = (document.getElementById("isLoggedIn").value == "true") ? true : false;
let locationsTable;

let saveLocButton = document.createElement("button");
saveLocButton.innerText = "Save";
saveLocButton.onclick = function() {
	let title = prompt("Title:");
	if(title) {
		this.createNewFavoriteAndUpdateMap(title);
	}
}.bind(this);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFubWl0dSIsImEiOiJjamtzd2w1cm8wMGg3M3BtZzNnbnZ3cWljIn0.pAPjLUhSdIuLPDII2Gu8zg', {
	maxZoom: 18,
	attribution: 
		'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox.streets',
	accessToken:'pk.eyJ1IjoiZGFubWl0dSIsImEiOiJjamtzd2w1cm8wMGg3M3BtZzNnbnZ3cWljIn0.pAPjLUhSdIuLPDII2Gu8zg'
}).addTo(mymap);

function getLandmineInfo() {
	// Create an HTTP request.
	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/map";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400){
			let response = JSON.parse(http.responseText);
			let landmines = response.landmines;
			let reports = response.reports;
			for(var i = 0; i < landmines.length; i++) {
				let marker = L.marker([landmines[i].lat, landmines[i].lng]).addTo(mymap);
				let reportsForMine = reports.filter(report => report.mine_id === landmines[i].id);
				let container = document.createElement('div');
				let title = document.createElement('strong');
				title.innerText = "Reports: ";
				container.appendChild(title);
				for(var link = 0; link < reportsForMine.length; link++) {
					let url = getReportURL(reportsForMine[link].mine_id, reportsForMine[link].reporter_id);
					let linkElement = document.createElement("a");
					linkElement.href = url;
					linkElement.innerText = link + 1 + " ";
					container.appendChild(linkElement);
				};
				marker.bindPopup(container);			
			}
		} else {
			alert("Something went wrong.");
		}
	});

	http.send();
	return false;
}

function getFavIcon(lat, lng) {
	let size = 32;
	return L.icon({
		iconUrl : "/static/star.png",
		iconSize : [size, size], 
		iconAncor : [lat, lng]
	});
}

function setFavMarker(lat, lng) {
	lat = parseFloat(lat);
	lng = parseFloat(lng);
	let icon = getFavIcon(lat, lng);
	L.marker([lat,lng], {icon: icon}).addTo(mymap);
}

function onMapClick(e) {
	if(!isLoggedIn) { return; }

    popup
        .setLatLng(e.latlng)
        .setContent(saveLocButton)
        .openOn(mymap);
	currentClickSpot = e.latlng;
}

function insertLocationsRow(title, lat, lng) {
	let row = document.createElement('tr');
	let titleCol = document.createElement('td');
	titleCol.innerText = title;
	let buttonCol = document.createElement('td');
	let button = document.createElement('button');
	button.innerText = "view";

	button.onclick = function() {
		this.setFavMarker(lat, lng);
		this.viewOnMap(lat, lng);
	}.bind(this);
	buttonCol.appendChild(button);
	
	row.appendChild(titleCol);
	row.appendChild(buttonCol);
	locationsTable.appendChild(row);
}

function viewOnMap(lat, lng) {
	mymap.panTo(new L.LatLng(lat, lng));
}

function createNewFavoriteAndUpdateMap(title) {
	if(!currentClickSpot) { return; }
	mymap.closePopup();
	sendFavRequest(title, currentClickSpot.lat, currentClickSpot.lng, function(success) {
		if(success) {
			setFavMarker(currentClickSpot.lat, currentClickSpot.lng);
			insertLocationsRow(title, currentClickSpot.lat, currentClickSpot.lng);
		} else {
			alert("Something went wrong.");
		}
	});
}

function sendFavRequest(title, lat, lng, next) {
	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/map/location/create";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400) {
			next(true);
		}
		else {
			next(false);
		}
	});

	http.send(JSON.stringify({ 
		'title' : title,
		'lat' : lat,
		'lng' : lng
	}));
}

function getInitialLocations(next) {
	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/map/locations";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400) {
			let locations = JSON.parse(http.responseText);
			for(i = 0; i < locations.length; i++) {
				insertLocationsRow(
					locations[i].title,
					locations[i].lat,
					locations[i].lng
				);
				setFavMarker(locations[i].lat, locations[i].lng);
			}
			next();
		}
	});
	http.send();
}

window.onload = function(){
	if(isLoggedIn) {
		locationsTable = document.getElementById("locationsMapTable");
		getInitialLocations(function() {
			mymap.on('click', onMapClick);
		}.bind(this));
	} else {
		mymap.on('click', onMapClick);
	}
	getLandmineInfo();
}
