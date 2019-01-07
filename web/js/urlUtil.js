// make http requests
function http_get(url) {
	/*
	 * Reference: https://stackoverflow.com/questions/247483/http-get-request-in-javascript
	 * */
	console.log("get:" + url);
	var xmlHttp;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false); // synchronous, this code doesn"t run on UI thread.
	xmlHttp.send(null);
	return xmlHttp;
}

// get title from url, assume all the string after 'wiki/' is title
function get_title_from_url(url) {
	var tmp = url.match(/wiki\/(.*)/);
	if (tmp.length > 1)
		return tmp[1];
	else
		throw "Cannot find title after 'wiki/' token!";
}

// get wiki url. to support en or zh or other wiki sites.
function get_wiki_url(url) {
	var tmp = url.split("/");
	return tmp[2];
}
