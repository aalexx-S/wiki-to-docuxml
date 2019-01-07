$(document).ready(function() {
	$("input:button[name=upload-btn]").attr('disabled', true);
});
$(document).on('change', 'input:file[name=docuxml]', function(e) {
    $("#upload-box").addClass("xml-file-selected");
    $("input:button[name=upload-btn]").attr('disabled', false);
});
$("input:button[name=upload-btn]").click(function() {
    let file = $("input:file[name=docuxml]")[0].files[0];
    let reader = new FileReader();
    if (file) {
        window.filename = file.name;
        reader.readAsText(file);
        reader.onload = function(e) {
            window.handler = new XMLHandler(e.target.result);
            window.load_operate();
        };
    } else {
        window.alert("未選擇上傳檔案");
    }
});
$("input:button[name=create-btn]").click(function() {
    window.filename = "docuXML.xml";
    window.handler = new XMLHandler(null);
    window.load_operate();
});