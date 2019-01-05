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

	// Preprocess init
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
	worker = new Worker("queryWikiAPI.js");

	// Set worker on message
	worker.onmessage = function(event) {
		if (event.data.status) {
			// parse return value
			var re = event.data.data;
			// parse page as DOM object
			var tmp = JSON.parse(re);
			tmp = tmp.query.pages;
			if (Object.keys(tmp).length == 0) {
				console.log("Query success but contains no page. This really shouldn't happen.");
				insert_result({"url": event.data.url, "status": false, "data": "Query success but contains no page content. This really shouldn't happen."});
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
				data.data.doc_content = page.extract.replace(/(?<!\\)\n/g, "<br>"); // Change \n to <br> so that browsers can understand. Avoid '\\n'.
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

function stop_worker() {
	/*
	 * Stop worker, set instance to undefined to enable the next call.
	 * */
	worker.terminate();
	worker = undefined;
}
