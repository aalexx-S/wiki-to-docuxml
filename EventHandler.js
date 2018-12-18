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
    }
}});

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
	    }
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
    			$('.'+list[Corpuskey].name+'Table').append("<li class='list-group-item list-group-item-success' id='"+list[Corpuskey].wiki[URLkey].url.split(/[.:/]/).join("")+"' onclick='deleted(event)'>"+
    			list[Corpuskey].wiki[URLkey].url+"</li>");
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
	  	$('.'+name+'Table').append("<li class='list-group-item' id='"+
	  		$("input[name="+name+"wikiurl]").val().split(/[.:/]/).join("")+"' onclick='deleted(event)'>"+$("input[name="+name+"wikiurl]").val()+"</li>");
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
    		$('#content').append("<div id='"+$("input[name=corpusname]").val()+"' class='tabcontent'><div class='form-group'><h1 align='center'>"+
    			$("input[name=corpusname]").val()+"</h1><div><form name='"+$("input[name=corpusname]").val()+"wiki' class='form-inline justify-content-center' onsubmit='return Addwiki(event,\""+$("input[name=corpusname]").val()+"\");'><div class='form-inline'><label for='"+$("input[name=corpusname]").val()+"wikiurl'>URL:</label><input type='url' style='text-align:center;' size='80' class='form-control mr-sm-2' id='"+$("input[name=corpusname]").val()+
    			"wikiurl' name='"+$("input[name=corpusname]").val()+"wikiurl' placeholder='Enter URL' required></div>"+"<button class='button dark' type='submit'>Add</button></form></div></div>"+
				"<ul class='list-group "+$("input[name=corpusname]").val()+"Table'></ul></div>");
    		document.getElementById($("input[name=corpusname]").val()).style.display="none";
    		if(first==true){
    			$("#firstcorpus").toggle();
    			document.getElementById($("input[name=corpusname]").val()+"link").click();
    			first=false;
    		}
		}else{
			alert("The Corpus name is already exist!")
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
	$.blockUI({ message: "<h1 id='progress'>please wait...</h1>" });
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
		data.push({
		'name': tab[i].id,
		'wiki': urls(tab[i].id)
		});
	}
	var value=xmlDoc.check_necessary_url(data);
	for(var i=0;i<value.length;i++){
		Totalprogress+=value[i].wiki.length;
	}
	query(value,0);
}

function urls(corpus){
	var list = $("."+corpus+"Table li");
	var url = [];
	for(var i=0;i<list.length;i++){
		if(list[i].className!="list-group-item completed"){
			url.push(list[i].innerText);
		}
	}
	return url;
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
					var text=JSON.stringify(l[j]);
					var doc=JSON.parse(text);
					if(doc.status){
						xmlDoc.add_document({'name':value[i].name,'document':doc.data});
						$('#'+doc.url.split(/[.:/]/).join("")).toggleClass("list-group-item-success");
					}else if(!$('#'+doc.url.split(/[.:/]/).join("")).hasClass("list-group-item-danger")){
						$('#'+doc.url.split(/[.:/]/).join("")).toggleClass("list-group-item-danger");
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