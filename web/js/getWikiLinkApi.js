/*
 * Handle wiki requests and API.
 *
 * It seems like if we request one page/request at a time, and don't request several pages/requests in parallel, then we should definitely be fine.
 * */

importScripts('urlUtil.js');

// wait for url
onmessage = function(event) {
	var tmp = event.data.split(',continue:query:string,');
	query(tmp[0], tmp[1]);
};

// forEach url, call postMessage to send result back
function query(url, con_str) {
	// http get
	var re;
	try {
		re = api_call(url, con_str); // call mediawiki api to get full content
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
function api_call(url, con_str) {
	/*
	 * See media wiki for more information.
	 * */
	var HTTPS = "https://";
	var wiki = get_wiki_url(url);
	var API = "/w/api.php?";
	var parameter = "action=query&generator=links&prop=info&inprop=url&format=json&gpllimit=max&origin=*&titles=";
	var title = get_title_from_url(url);
	return http_get(HTTPS + wiki + API + parameter + title + con_str);
}

