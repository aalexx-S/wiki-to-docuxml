/*
 * Handle wiki requests and API.
 *
 * It seems like if we request one page/request at a time, and don't request several pages/requests in parallel, then we should definitely be fine.
 * */

importScripts('urlUtil.js');

// wait for urls
// workers can only accept string.
onmessage = function(event) {
	// revert url array from string
	var urls = event.data.split(",safe:http:sep,");
	// loop through each url, query each page
	urls.forEach(query);
};

// forEach url, call postMessage to send result back
function query(url, index) {
	// http get
	var re;
	try {
		re = api_call(url); // call mediawiki api to get full content
	} catch (err) {
		console.log(err);
		postMessage({"url": url, "status": false, "data": "Cannot sent http request. Please check url or internet connection."});
		return;
	}
	// return value
	if (re.status == 200)
		postMessage({"url": url, "status": true, "data": re.responseText});
	else {
		postMessage({"url": url, "status": false, "data": re.statusText});
	}
}

// get page content
function api_call(url) {
	/*
	 * See media wiki for more information.
	 * */
	var HTTPS = "https://";
	var wiki = get_wiki_url(url);
	var API = "/w/api.php?";
	var parameter = "action=query&format=json&prop=extracts%7Cinfo%7Ccategories&origin=*&titles=";
	var title = get_title_from_url(url);
	return http_get(HTTPS + wiki + API + parameter + title);
}

