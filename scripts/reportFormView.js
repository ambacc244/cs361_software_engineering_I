function createReport() {
	let inputs = document.getElementById("reportSortaForm").elements;

	let note = document.getElementById("note").value;
	let lat = document.getElementById("lat").value;
	let lng = document.getElementById("lng").value;
	let disarmed = document.getElementById("disarmed").value;
	let verified = document.getElementById("verified").value;

	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/report/create";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400) {
			var response = JSON.parse(http.responseText);
			if(response.success) {
				window.location.href = getBaseURL() + "/profile";
			} else {
				alert(response.errMsg);
			}
		}
		else {
			alert("Something went wrong.");
		}
	});

	http.send(JSON.stringify({ 
		'note' : note,
		'lat' : lat,
		'lng' : lng,
		'disarmed' : disarmed,
		'verified' : verified
	}));
}
