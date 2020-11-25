function mailReport() {
	let subject = "Cambodian Landmine Report";
	let index = window.location.toString().indexOf('/q?');
	let queryStr = encodeURIComponent(window.location.toString().substring(index));
	let baseStr = window.location.toString().substring(0, index);
	let body = "Here is a report for Cambodian Landmines: " + baseStr + queryStr;
	window.location = 'mailto:?subject=' + subject + '&body=' + body; 
}
