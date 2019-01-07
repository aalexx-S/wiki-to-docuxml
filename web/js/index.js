window.handler = null;
window.filename = "docuXML.xml";
window.load_main = function() {
    $("#container").load("main.html");
};
window.load_operate = function() {
    $("#container").load("operate.html");
};

$(document).ready(function() {
	window.load_main();
});