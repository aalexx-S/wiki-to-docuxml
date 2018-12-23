var result;
var xmlhttp;
var allText;
var xmlDoc;
var corpusname;
var progress=0;
var Totalprogress=0;
var filename;
var first=true;
// Reference: https://www.quora.com/How-can-I-get-Absolute-path-of-a-file-using-javascript
window.addEventListener("load", function() {
  document.getElementById("fileupload").onchange = function(event) {
    var reader = new FileReader();
    reader.readAsDataURL(event.srcElement.files[0]);
    $("#upload").prop('disabled',false);
    reader.onload = function () {
      var fileContent = reader.result;
	  result=fileContent;
    };
};});

function readTextFile(file,load){
	if(file!=null){
		xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("GET", file, true);
	    xmlhttp.send(null);
	    xmlhttp.onreadystatechange = function ()
	    {
	        if(xmlhttp.readyState === 4)
	        {
	            if(xmlhttp.status === 200 || xmlhttp.status == 0)
	            {
	                load(xmlhttp.responseText);
	            }
	        }
	    };
	    filename = $("#fileupload")[0].value.split('\\').pop();
	}else{
		xmlDoc=new XMLHandler();
	}
}
function loadPage(event){
	// standard behavior
	event.preventDefault();

    // for IE (untested)
    if(document.getElementById("fileupload").value == ""){
    	filename = "docuXML.xml";
    	$("#firstcorpus").toggle();
    }
    readTextFile(result,loadDoc);
    event.returnValue = false;
    $(".Layer").toggle();
    function loadDoc(text){
    	allText = text;
    	xmlDoc=new XMLHandler(allText);
    	list = xmlDoc.corpus_list;
    	for(let Corpuskey in list){
    		$('#corpus').append("<a style='flex-grow: 1' class='link' href='#' id='"+list[Corpuskey].name+"link' onclick='openCity(event,\""+
    			list[Corpuskey].name+"\")'>"+list[Corpuskey].name+"</a>");
    		$('#content').append("<div id='"+list[Corpuskey].name+"' class='tabcontent'><div class='form-group'><h1 align='center'>"+
    			list[Corpuskey].name+"</h1><div><form name='"+list[Corpuskey].name+"wiki' class='form-inline justify-content-center' onsubmit='return Addwiki(event,\""+list[Corpuskey].name+"\");'><div class='form-inline'><label for='"+list[Corpuskey].name+"wikiurl'>URL:</label><input type='url' style='text-align:center;' size='80' class='form-control mr-sm-2' id='"+list[Corpuskey].name+
    			"wikiurl' name='"+list[Corpuskey].name+"wikiurl' placeholder='Enter URL' required></div>"+"<button class='button dark' type='submit'>Add</button></form></div></div>"+
				"<ul class='list-group "+list[Corpuskey].name+"Table'></ul></div>");
    		document.getElementById(list[Corpuskey].name).style.display="none";
    		for(let URLkey in list[Corpuskey].wiki){
    			$('.'+list[Corpuskey].name+'Table').append("<li class='list-group-item list-group-item-success " +list[Corpuskey].wiki[URLkey].url.split(/[.:/]/).join("")+"' onclick='deleted(event)'>"+
    			'<b>' + list[Corpuskey].wiki[URLkey].name + '</b><br/>' + list[Corpuskey].wiki[URLkey].url+"</li>");
    		}
    	}
    	first = false;
    	// Get the element with defaultOpen and click on it
		document.getElementById(list[0].name+"link").click();
    }
}

function createPage(event){
	event.preventDefault();
	filename = "docuXML.xml";
    $("#firstcorpus").toggle();
    event.returnValue = false;
    $(".Layer").toggle();
    xmlDoc=new XMLHandler();
}

function openCity(event, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    if(!$("#"+cityName+"link").hasClass("completed")){
    	document.getElementById(cityName).style.display = "block";
    }else{
    	document.getElementById(cityName).style.display = "none";
    }
    event.currentTarget.className += " active";
}

function Addwiki(event,name){
	event.preventDefault();
	//do stuff
	if($("input[name="+name+"wikiurl]").val()!=""){
	  	$('.'+name+'Table').append("<li class='list-group-item "+
	  		$("input[name="+name+"wikiurl]").val().split(/[.:/%]/).join("")+"' onclick='deleted(event)'>"+$("input[name="+name+"wikiurl]").val()+"</li>");
	    $('#'+name+'wikiurl').val("");
  	}
  	return false;
}

function Addcorpus(event){
	event.preventDefault();
	if($("input[name=corpusname]").val()!=""){
		var repeated = false;
		var tablinks = document.getElementsByClassName("link");
		for(var i = 0; i < tablinks.length; i++){
			if(($("input[name=corpusname]").val()) == $(".link")[i].innerText){
				repeated =  true;
				break;
			}
		}
		if(!repeated){
			$('#corpus').append("<a style='flex-grow: 1' class='link' href='#' id='"+$("input[name=corpusname]").val()+"link' onclick='openCity(event,\""+
    			$("input[name=corpusname]").val()+"\")'>"+$("input[name=corpusname]").val()+"</a>");
    		$('#content').append("<div id='"+$("input[name=corpusname]").val()+"' class='tabcontent'><div class='form-group'><h1 align='center'>文獻集: " +
    			$("input[name=corpusname]").val()+"</h1><div><form name='"+$("input[name=corpusname]").val()+"wiki' class='form-inline justify-content-center' onsubmit='return Addwiki(event,\""+$("input[name=corpusname]").val()+"\");'><div class='form-inline'><label for='"+$("input[name=corpusname]").val()+"wikiurl'>維基百科網址:</label><input type='url' style='text-align:center;' size='80' class='form-control mr-sm-2' id='"+$("input[name=corpusname]").val()+
    			"wikiurl' name='"+$("input[name=corpusname]").val()+"wikiurl' placeholder='輸入維基百科網址' required></div>"+"<button class='button dark' type='submit'>新增</button></form></div></div>"+
				"<ul class='list-group "+$("input[name=corpusname]").val()+"Table'></ul></div>");
    		document.getElementById($("input[name=corpusname]").val()).style.display="none";
    		if(first==true){
    			$("#firstcorpus").toggle();
    			document.getElementById($("input[name=corpusname]").val()+"link").click();
    			first=false;
    		}
		}else{
			alert("The Corpus name is already exist!");
		}
		$('#corpusname').val("");
	}
	return false;
}

function deleted(event){
	event.preventDefault();
	$(event.target).toggleClass("completed");
}

function update(event){
	$.blockUI({ message: "<h1 id='progress'>更新中...</h1>" });
	event.preventDefault();
	var data = [];
	var tab = $("div.tabcontent");
	$(".list-group-item.completed").remove();
	for(var i=0;i<tab.length;i++){
		var found = false;
		for(var j = 0; j < xmlDoc.corpus_list.length; j++) {
		    if (xmlDoc.corpus_list[j].name == tab[i].id) {
		        found = true;
		        break;
		    }
		}
		if(!found){
			xmlDoc.create_corpus(tab[i].id);
		}
		// mark duplicated url
		mark_duplicate(tab[i].id);
		// update
		data.push({
		'name': tab[i].id,
		'wiki': urls(tab[i].id)
		});
	}
	var value=xmlDoc.check_necessary_url(data);
	for(i=0;i<value.length;i++){
		Totalprogress+=value[i].wiki.length;

		// re-color those not returned as success
		// they can be marked as duplicated before
		recolor(value[i].name, value[i].wiki);
	}

	query(value,0);
}

function urls(corpus){
	var list = $("."+corpus+"Table li");
	var url = [];
	for(var i=0;i<list.length;i++){
		if(! $(list[i]).hasClass("completed")){
			url.push(get_url(list[i].innerText));
		}
	}
	return url;
}

function recolor(corpus, ness_list){ // color the entry NOT in ness_list and not marked as completed to success
	var list = $("."+corpus+"Table li");
	var all_corpus_list_because_reason = xmlDoc.corpus_list;
	function get_title_this_is_so_bad(corpus, url) {
		for (var k=0; k<all_corpus_list_because_reason.length; ++k) {
			if (all_corpus_list_because_reason[k].name == corpus) {
				for (var h=0; h<all_corpus_list_because_reason[k].wiki.length; ++h) {
					if (all_corpus_list_because_reason[k].wiki[h].url == url)
						return all_corpus_list_because_reason[k].wiki[h].name;
				}
			}
		}
	}
	for(var i=0;i<list.length;i++){
		var cur_url = get_url(list[i].innerText);
		if(!$(list[i]).is(".completed, .list-group-item-danger") && !ness_list.includes(cur_url)){
			$(list[i]).addClass("list-group-item-success");
			$(list[i]).html('<b>' + get_title_this_is_so_bad(corpus, cur_url) + '</b><br/>' + cur_url);
		}
	}
}

function get_url(target) {
	var token = target.split('\n');
	for (var j = token.length - 1; j >= 0; j--) // start from the last line, the first match must be url
		if (token[j].toLowerCase().startsWith('http'))
			return token[j];
}

function mark_duplicate(corpus){ // mark duplicated url, also unmark when it is the first one
	var list = $("."+corpus+"Table li");
	var url = [];
	for(var i=0;i<list.length;i++){
		var cur_url = get_url(list[i].innerText);
		if(! $(list[i]).hasClass("completed")) {
			if (url.includes(cur_url)) {
				$(list[i]).addClass('completed');
				$(list[i]).html(cur_url + '<br/>重複');
			} else {
				url.push(cur_url);
				$(list[i]).html(cur_url);
			}
		}
	}
}

function query(value,i){
	if(i<value.length){
		var wikilist = [];
		for(let urlkey in value[i].wiki){
			wikilist.push(value[i].wiki[urlkey]);
		}
		if(wikilist!=''){
			get_URL(wikilist, progress_update, function(l) {
				for(var j = 0; j < l.length; j++) {
					var doc = l[j];
					if(doc.status){
						xmlDoc.add_document({'name':value[i].name,'document':doc.data});
						$('.'+doc.url.split(/[.:/%]/).join("") ).not('.list-group-item-danger, .completed').addClass("list-group-item-success"); // set background to green
						$('.'+doc.url.split(/[.:/%]/).join("")).not('.list-group-item-danger, .completed').html('<b>' + doc.data.filename  + '</b><br/>' + doc.url); // set title
					}else {
						$('.'+doc.url.split(/[.:/%]/).join("")).not('.list-group-item-success, .completed').addClass("list-group-item-danger");
						$('.'+doc.url.split(/[.:/%]/).join("")).not('.list-group-item-success, .completed').html(doc.url + '<br/><b>錯誤: </b>' + doc.data); // set warning/error
					}
				}
				query(value,++i);
			});
		}else{query(value,++i);}
	}else{
		progress=0;
		Totalprogress=0;
		$.unblockUI();
	}
}

function progress_update(i) {
	progress+=1;
	var p = Math.floor((progress/Totalprogress)*100);
	document.getElementById("progress").innerText=p.toString()+"%";
}

function download(event){
	event.preventDefault();
	var a=xmlDoc.export_xml();
	var textToSave=(new XMLSerializer()).serializeToString(a);
	textToSave = textToSave.replace(/xmlns=\"(.*?)\"/g, ''); // remove xmlns since docuxml does not accept that
	var file=makeTextFile(textToSave);
    var link = document.getElementById('downloadlink');
    link.href = file;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(file);
}

var textFile=null;

function makeTextFile(text){
	var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
}
