// These are functions available to all web pages.

function getBaseURL() {
	return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
}

function getReportURL(mine_id, reporter_id) {
	return getBaseURL() + '/report?mine_id=' + mine_id + "&reporter_id=" + reporter_id;
}

function redirectToReport(mine_id, reporter_id) {
	let url = getReportURL(mine_id, reporter_id);
	window.location.assign(getReportURL(mine_id, reporter_id));
}

function logout() {
	let url = getBaseURL() + "/logout";
	location.href = url;
}

function mailCurrentLink(subject, msg) {
	let index = window.location.toString().indexOf('/q?');
	let queryStr = encodeURIComponent(window.location.toString().substring(index));
	let baseStr = window.location.toString().substring(0, index);
	let body = msg + baseStr + queryStr;
	window.location = 'mailto:?subject=' + subject + '&body=' + body; 
}
