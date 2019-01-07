class XMLHandler {
	constructor(src) {
		let parser = new DOMParser();
		if (src == null) {
			this.xml_root = parser.parseFromString('<ThdlPrototypeExport></ThdlPrototypeExport>', "text/xml");
		} else {
			this.xml_root = parser.parseFromString(src, "text/xml");
		}
		this.struct = [].slice.call(this.xml_root.getElementsByTagName('corpus')).filter(function(x) {
			if (x.hasAttribute('name'))
				return x;
		}).reduce(function(acc, cur) {
			let key = cur.getAttribute('name');
			if (acc[key] === undefined)
				acc[key] = {'corpus': cur, 'wiki': [], 'common': []};
			return acc;
		}, {});
		[].slice.call(this.xml_root.getElementsByTagName('document')).reduce(function(acc, cur) {
			let key = cur.getElementsByTagName('corpus')[0].innerHTML;
			if (acc[key] !== undefined) {
				if (cur.getElementsByTagName('wiki_metadata').length === 1)
					acc[key].wiki.push(cur);
				else
					acc[key].common.push(cur);
			}
			return acc;
		}, this.struct);
	}
	get_corpus_list() {
		/*
			return value = [corpus_name, corpus_name, corpus_name, ...]
		 */
		let tmp = [];
		for (let key in this.struct) {
			if (this.struct.hasOwnProperty(key))
                tmp.push(key);
		}
		return tmp;
	}
	get_wiki_list(key) {
		/*
			return value = [{'name': wiki_name, 'url': wiki_url}, {'name': wiki_name, 'url': wiki_url}, ...]
		 */
		let tmp = [];
		if (this.struct.hasOwnProperty(key)) {
		    this.struct[key].wiki.reduce(function(acc, cur) {
			    acc.push({
				    'name': cur.getAttribute('filename'),
				    'url': cur.getElementsByTagName('wiki_metadata')[0].getElementsByTagName('url')[0].textContent
			    });
			    return acc;
		    }, tmp);
        }
        return tmp;
    }
	check_necessary_url(key, urls) {
		/*
			require key  = corpus_name
			        urls = [wiki_url, wiki_url, ...]

			return value = [wiki_url, wiki_url, ...]
		*/
		let tmp = [];
		if (this.struct.hasOwnProperty(key)) {
		    let src = this.struct[key].wiki.reduce(function(acc, cur) {
				acc.push(cur.getElementsByTagName('wiki_metadata')[0].getElementsByTagName('url')[0].textContent);
				return acc;
			}, []);
		    let inter = urls.filter(function(val) {
				return src.includes(val);
			});
			this.struct[key].wiki = this.struct[key].wiki.filter(function(val) {
				return inter.includes(val.getElementsByTagName('wiki_metadata')[0].getElementsByTagName('url')[0].textContent);
			});
			tmp = urls.filter(function(val) {return (!inter.includes(val));});
        }
        return tmp;
	}
	create_corpus(name) {
		if (!(name in this.struct)) {
            let corpus = document.createElement('corpus');
            corpus.setAttribute('name', name);
            this.struct[name] = {'corpus': corpus, 'wiki': [], 'common': []};
        }
	}
	add_document(data) {
		/*
			require data = {'name': corpus_name, 'document': JSON}

			return value = Boolean
		*/
		let new_doc = document.createElement('document');
		new_doc.setAttribute('filename', data.document.filename);
		let corpus = document.createElement('corpus');
		corpus.setAttribute('number', this._nextNum(data.name));
		corpus.innerHTML = data.name;
		new_doc.appendChild(corpus);
		for (let key in data.document) {
			if (key === 'filename')
				continue;
			new_doc.appendChild(this._createElement(key, data.document[key]));
		}
		this.struct[data.name].wiki.push(new_doc);
		return true;
	}
	export_xml() {
		/*
			return value = DOM Element
		*/
		let xml = document.createElementNS('http://www.w3.org/1999/xhtml/', 'ThdlPrototypeExport');
		let docs = document.createElement('documents');
        function _appendChild(child) {
            docs.appendChild(child);
        }
		for (let key in this.struct) {
			if (this.struct.hasOwnProperty(key)) {
                xml.appendChild(this.struct[key].corpus);
                this.struct[key].wiki.forEach(_appendChild);
                this.struct[key].common.forEach(_appendChild);
            }
		}
		xml.appendChild(docs);
		return xml;
	}
	_createElement(key, value) {
		let e = document.createElement(key);
		if (typeof(value) === 'object') {
			for (let _key in value)
				e.appendChild(this._createElement(_key, value[_key]));
		} else {
			e.innerHTML = value;
		}
		return e;
	}
	_nextNum(key) {
		return (this.struct[key].wiki.reduce(function(acc, cur) {
			let num = cur.getElementsByTagName('corpus')[0].getAttribute('number');
			if (num === null)
				return acc;
			else if (parseInt(num) <= acc)
				return acc;
			else
				return parseInt(num);
		}, this.struct[key].common.reduce(function(acc, cur) {
			let num = cur.getElementsByTagName('corpus')[0].getAttribute('number');
			if (num === null)
				return acc;
			else if (parseInt(num) <= acc)
				return acc;
			else
				return parseInt(num);
		}, -1)) + 1);
	}
}
