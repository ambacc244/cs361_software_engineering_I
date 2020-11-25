function sendLoginMessage() {
	// Grab the content out of the fields.
	let email = document.getElementsByName('email')[0].value;
	let password = document.getElementsByName('password')[0].value;

	if(email == "") {
		alert("Email field is empty.");
		return;
	} else if (password == "") {
		alert("Password field is empty.");
		return;
	}

	// Create an HTTP request.
	var http = new XMLHttpRequest();
	var url = getBaseURL() + "/authenticate";
	http.open('POST', url, true);
	http.setRequestHeader('Content-type', 'application/json');

	http.addEventListener('load', function() {
		if(http.status >= 200 && http.status < 400){
			var response = JSON.parse(http.responseText);
			if(response.success) {
				window.location.href = getBaseURL() + "/profile";
			} else {
				alert(response.errMsg);
			}
		} else {
			alert("Something went wrong.");
		}
	});

	http.send(JSON.stringify({ 'email' : email, 'password' : password }));
	return false;
}
