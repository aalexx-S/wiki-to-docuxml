var worker;

function get_URL(urls, progress_update_callback, result_callback) {
	/*
	 * Get all the wiki page from the url in the array.
	 *
	 * Parameter:
	 * 	urls: array
	 * 		Array of url need to get from wikipedia.
	 *
	 * 	progress_update_callback: function
	 * 		Accept an integer.
	 * 		The number of queries finished.
	 *
	 *  result_callback: function
	 *  	Accept an array.
	 * 		Each entry contains a query url. The order reserves the given url order.
	 *		entry.url: the queried_url url.
	 * 		entry.status: [true, false]
	 * 		entry.data: dictionary if status is true, or error message string if status is false.
	 * 			- Contains the following keys:
	 * 				- filename: document's filename.
	 * 				- wiki_metadata: dictioonary of metadata
	 * 					- url: the query url
	 * 					- page_id: the wiki page id
	 * 				- document: string of document contnet.
	 * 				- compilation: url
	 * 		entry.url: null if error occurs before querying.
	 *
	 * Return value: dictionary
	 * 	This function returns only if error occurs before querying.
	 *	The dictionary contains the following keys:
	 *		- status: false
	 *		- data: error string
	 * */

	// Check if Worker supported by browser. IE < version 9.0 do not support this.
	if (typeof(Worker) === "undefined") {
		return {"status": "error", "data": "Web Worker not supported by browser."};
	}

	// Preprocess
	function unique(value, index, self) {return self.indexOf(value) === index;}
	urls = urls.filter(unique);
	var queried_url = 0;
	var total_length = urls.length;
	var result_data = new Array(total_length);
	function insert_result(data) {result_data[urls.indexOf(data.url)] = data;}

	// Create Worker if not exist.
	if (typeof(worker) != "undefined") {
		return {"url":null, "status": false, "data": "worker busy, try later"};
	}
	worker = new Worker("js/getWikiPageApi.js");

	// Set worker on message
	worker.onmessage = function(event) {
		if (event.data.status) {
			// parse return value
			var re = event.data.data;
			// parse page as DOM object
			var tmp = JSON.parse(re);
			tmp = tmp.query.pages;
			if (Object.keys(tmp).length == 0) {
				console.log("Query success but contains no page.");
				insert_result({"url": event.data.url, "status": false, "data": "Query success but no page content."});
			}
			for (var page_id in tmp) {
				if (page_id == -1) {
					insert_result({"url": event.data.url, "status": false, "data": "Wiki page with such title does not exists."});
					break;
				}
				var page = tmp[page_id];
				var data = {"url": event.data.url, "status": true, "data": {"wiki_metadata": {}}};
				data.data.filename = page.title;
				data.data.wiki_metadata.url = event.data.url;
				data.data.wiki_metadata.page_id = page.pageid;
				data.data.doc_content = page.extract.replace(/(?!\\)\n/g, "<br>"); // Change \n to <br> so that browsers can understand. Avoid '\\n'.
				data.data.compilation = event.data.url;
				insert_result(data);
			}
		} else {
			insert_result({"url": event.data.url, "status": false, "data": event.data.data});
		}
		progress_update_callback(++queried_url);
		if (queried_url == total_length) { // all finished
			stop_worker();
			result_callback(result_data);
		}
	};

	// Pass url to worker and start work
	worker.postMessage(urls.join(",safe:http:sep,"));
}

function get_all_links(url, result_callback, result_data, con_str) {
	/*
	 * Get all links in a given page.
	 *
	 * Parameter:
	 *  url: string
	 *  	A single url string.
	 *
	 *  result_callback: function
	 *  	The result callback function.
	 *  	Accept a dictionary. The dictionary contains the following keys:
	 *  		- status: boolean
	 *  		- url: the given url
	 *  		- data: Error string if status if false. Otherwise a dictionary:
	 *  			- key: page title, '_' replaced with ' '.
	 *  			- value: url
 	 *
	 *	result_data: dictionary (leave it as 'undefined' if not processing 'continue')
	 *		The format is the same as return data. New data will be added into it.
	 *		If url does not match, result_data will be discaeded.
	 *
	 *  con_str: string (leave it as 'undefined' if not processing 'continue')
	 *		If is not empty, the string will be add to api call parameter.
	 *
	 * Return value: dictionary
	 *  This function returns only if error occurs before querying.
	 *  The dictionary contains the following keys:
	 *  	- status: false
	 *  	- data: error string
	 * */

	// Check if Worker supported by browser. IE < version 9.0 do not support this.
	if (typeof(Worker) === "undefined") {
		return {"status": "error", "data": "Web Worker not supported by browser."};
	}

	// Create Worker if not exist.
	if (typeof(worker) != "undefined") {
		return {"url":null, "status": false, "data": "worker busy, try later"};
	}
	worker = new Worker("js/getWikiLinkApi.js");

	// set worker on message
	worker.onmessage = function(event) {
		function continue_check(v) {
			if ('continue' in v)
				return '&gplcontinue=' + v.continue.gplcontinue;
			else
				return '';
		}
		// set states
		if ((result_data && result_data.url != url) || !result_data)
			result_data = {"url": event.data.url, "status": true, "data": {}};
		con_str = '';
		if (event.data.status) {
			// parse return value
			var re = event.data.data;
			// parse the links and put into dictionary
			var tmp_all = JSON.parse(re);
			if (! ('query' in tmp_all && 'pages' in tmp_all.query)) { // handle title error
				tmp_all.query = {'pages': []};
			}
			var tmp = tmp_all.query.pages;
			if (Object.keys(tmp).length == 0) {
				console.log("No relative link found.");
				result_data.status = false;
				result_data.data = "Title incorrect or page not exist.";
			}
			for (var page_id in tmp) { // place all the links into return data
				if (page_id == -1)
					continue;
				var link = tmp[page_id];
				var furl = link.fullurl;
				var title = get_title_from_url(furl);
				title = title.replace(/_/g, ' '); // replace underscore in url to actual space
				result_data.data[title] = furl;
			}
			// check continue
			con_str = continue_check(tmp_all);
		} else {
			result_data.status = false;
			result_data.data = event.data.data;
		}
		stop_worker();
		if (con_str == '' || result_data.status == false) // query finished, do callback
			result_callback(result_data);
		else // need continue, recursive call
			get_all_links(url, result_callback, result_data, con_str);

	};

	con_str = con_str || '';
	// Pass url to worker and start work
	worker.postMessage(url + ",continue:query:string," + con_str);
}

function stop_worker() {
	/*
	 * Stop worker, set instance to undefined to enable the next call.
	 * */
	worker.terminate();
	worker = undefined;
}