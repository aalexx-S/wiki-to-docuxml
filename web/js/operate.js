$(document).ready(function() {
    window_variable_initial();
    if (window.handler !== null) {
        window.corpus_list = window.handler.get_corpus_list();
        if (window.corpus_list.length !== 0) {
            for (let key in window.corpus_list) {
                if (window.corpus_list.hasOwnProperty(key))
                    create_corpus_item(window.corpus_list[key]);
            }
            $('#corpus-list div:nth-child(1)').click();
        }
    }
});

// Event : back to main page
$("#home").click(function() {
    let content = "目前文獻集有條目尚未更新至 docuXML<br>若是回到主頁面則本工具將不會保留該條目<br>是否要回到主頁面？<br>";
    check_sync(content, "回到主頁面", "留在本工具", function(sync) {
        if (sync)
            window.load_main();
    });
});

// Event : sync with docuXML
$("#synchronize").click(function() {
    $("#synchronize").blur();
    let name = $(window.corpus_target).html();
    let urls = [];
    $.blockUI({
        message: "已取得維基頁面&nbsp;...&nbsp;<span id='numerator'>0</span>&nbsp;/&nbsp;<span id='denominator'></span>",
        css: { width: '300px', height: '50px', padding: '10px 0 0 0' }
    });
    window.table_wiki_list = [];
    $('#wiki-table-body tr').each(function() {
        let st = $(this).attr("status");
        if (st === "0" || st === "1") {
            window.table_wiki_list.push($(this).attr("url"));
            urls.push($(this).attr("url"));
        } else {
            $(this).remove();
        }
    });
    urls = window.handler.check_necessary_url(name, urls);
    if (urls.length !== 0) {
        $("#denominator").html(urls.length.toString());
        get_URL(urls, progress_callback, function(result) {
            $.blockUI({
                message: "正在將維基頁面加入 docuXML ...",
                css: { width: '300px', height: '50px', padding: '10px 0 0 0' }
            });
            update_wiki_table_status(result);
            $.unblockUI();
        });
    } else {
        $.unblockUI();
    }
});

// Event : download docuXML
$("#download").click(function() {
    $("#download").blur();
    let content = "目前文獻集有條目尚未更新至 docuXML<br>本工具不保證下載結果如預期<br>是否要下載 docuXML？<br>";
    check_sync(content, "確認下載", "取消下載", function(sync) {
        if (sync) {
            let serializer = new XMLSerializer();
            let xml = serializer.serializeToString(window.handler.export_xml());
            xml = xml.replace(/\sxmlns=\"(.*?)\"/g, '');
            let blob = new Blob([xml], {type: 'text/plain'});
            let link = document.getElementById("download-link");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
    });

});

// Event : create new corpus
$("#new-corpus").click(function() {
    let text = $("input:text[name=new-corpus-name]");
    let name = $(text).val();
    if (name === "")
        return;
    if (window.corpus_list.includes(name)) {
        alert("文獻集名稱不可重複！");
        return;
    }
    window.handler.create_corpus(name);
    window.corpus_list = window.handler.get_corpus_list();
    create_corpus_item(name);
    $(text).val("");
});

// Function : initial window variable
function window_variable_initial() {
    window.corpus_list = null;
    window.corpus_target = null;
    window.table_wiki_list = null;
}

// Function : create new corpus item in side navigation bar
function create_corpus_item(name) {
    let corpus_item = document.createElement("div");
    $(corpus_item).addClass("corpus-item select-disable");
    $(corpus_item).html(name);
    $(corpus_item).on('click', {target: corpus_item}, click_corpus_item);
    $("#corpus-list").append(corpus_item);
    if (window.corpus_list.length === 1) {
        $(corpus_item).click();
    }
}

// Function : corpus item click function
function click_corpus_item(e) {
    let self = e.data.target;
    if ($(self).html() === $(window.corpus_target).html())
        return;
    let content = "目前文獻集有條目尚未更新至 docuXML<br>若是切換文獻集則本工具將不會保留該條目<br>是否要切換文獻集？<br>";
    check_sync(content, "確定切換", "取消切換", function(sync) {
        if (sync) {
            $(".corpus-item").removeClass("active");
            $(self).addClass("active");
            window.corpus_target = $(self);
            create_corpus_operate($(self).html());
        }
    });
}

// Function : create new operate space for clicked corpus item
function create_corpus_operate(name) {
    let space = $("#operate-space");
    let wiki_list = window.handler.get_wiki_list(name);
    let title = document.createElement("h2");
    let url_input_group = document.createElement("div");
    let table_container = document.createElement("div");
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    let row = document.createElement("tr");
    let tmp;

    // config title
    $(title).html("文獻集：" + name);

    // config url bar
    $(url_input_group).addClass("input-group col-md-8 col-md-offset-2");
    tmp = document.createElement("span");
    $(tmp).addClass("input-group-addon select-disable");
    $(tmp).html("維基百科網址");
    $(url_input_group).append(tmp);
    tmp = document.createElement("input");
    $(tmp).addClass("form-control input-group-text");
    $(tmp).attr("placeholder", "請貼上維基百科網址");
    $(tmp).attr("id", "new-wiki-url");
    $(url_input_group).append(tmp);
    tmp = document.createElement("span");
    $(tmp).addClass("input-group-addon select-disable span-btn");
    $(tmp).attr("id", "new-wiki");
    $(tmp).html("新增");
    $(tmp).on('click', click_new_wiki);
    $(url_input_group).append(tmp);

    // config wiki document table
    $(table_container).addClass("col-md-10 col-md-offset-1");
    $(table).addClass("table table-striped");
    tmp = document.createElement("th");
    $(tmp).css({"text-align": "center", "width": "50px"});
    $(tmp).html("狀態");
    $(row).append(tmp);
    tmp = document.createElement("th");
    $(tmp).css("width", "200px");
    $(tmp).html("來源");
    $(row).append(tmp);
    tmp = document.createElement("th");
    $(tmp).html("條目");
    $(row).append(tmp);
    tmp = document.createElement("th");
    $(tmp).css("width", "125px");
    $(tmp).html("按鈕");
    $(row).append(tmp);
    $(thead).append(row);
    $(table).append(thead);

    // add wiki document row to table
    $(tbody).attr("id", "wiki-table-body");
    window.table_wiki_list = [];
    for (let key in wiki_list) {
        window.table_wiki_list.push(wiki_list[key].url);
        $(tbody).append(create_wiki_table_row(wiki_list[key], 0));
    }
    $(table).append(tbody);
    $(table_container).append(table);

    // clear space and append element
    $(space).html("");
    $(space).append(title);
    $(space).append(url_input_group);
    $(space).append(table_container);
}

// Function : create new row in wiki document table
function create_wiki_table_row(wiki_doc, state) {
    let pattern = new RegExp('https:\\/\\/((.*\\/)+wiki\\/)([^#]+)(#.*)*');
    let src, entry, key;
    let row = document.createElement("tr");
    let cell, tmp, btn;
    let icon = ["ok", "hourglass"];
    let icon_color = ["green", "black"];

    // decode wiki source and entry
    if (wiki_doc.name !== null) {
        src = pattern.exec(wiki_doc.url)[1];
        entry = wiki_doc.name;
    } else {
        src = pattern.exec(wiki_doc.url)[1];
        entry = decodeURIComponent(pattern.exec(wiki_doc.url)[3]);
    }

    // config row
    key = hash(wiki_doc.url);
    $(row).attr("id", key);
    $(row).attr("url", wiki_doc.url);
    $(row).attr("status", state.toString());
    $(row).css("text-decoration-line", "none");

    // status
    cell = document.createElement("td");
    $(cell).css("text-align", "center");
    tmp = document.createElement("span");
    $(tmp).addClass("glyphicon glyphicon-" + icon[state]);
    $(tmp).css("color", icon_color[state]);
    $(cell).append(tmp);
    $(row).append(cell);

    // source
    cell = document.createElement("td");
    $(cell).css("text-align", "left");
    $(cell).html(src);
    $(row).append(cell);

    // entry
    cell = document.createElement("td");
    $(cell).css("text-align", "left");
    $(cell).html(entry);
    $(row).append(cell);

    // button
    cell = document.createElement("td");
    $(cell).addClass("select-disable");
    $(cell).css("text-align", "left");
    $(row).append(cell);

    // delete button
    btn = document.createElement("div");
    $(btn).addClass("table-tool-btn");
    $(btn).attr("key", key);
    $(btn).attr("title", "刪除此條目");
    $(btn).on('click', {target: btn}, click_delete);
    tmp = document.createElement("span");
    $(tmp).addClass("glyphicon glyphicon-trash");
    $(btn).append(tmp);
    $(cell).append(btn);

    // next-level table of content button
    btn = document.createElement("div");
    $(btn).addClass("table-tool-btn");
    $(btn).attr("key", key);
    $(btn).attr("title", "新增次級目錄");
    $(btn).on('click', {target: btn}, click_next_level);
    tmp = document.createElement("span");
    $(tmp).addClass("glyphicon glyphicon-list-alt");
    $(btn).append(tmp);
    $(cell).append(btn);

    // copy link button
    btn = document.createElement("div");
    $(btn).addClass("table-tool-btn");
    $(btn).attr("key", key);
    $(btn).attr("title", "複製此條目連結");
    $(btn).on('click', {target: btn}, click_copy_link);
    tmp = document.createElement("span");
    $(tmp).addClass("glyphicon glyphicon-duplicate");
    $(btn).append(tmp);
    $(cell).append(btn);

    // error message button
    btn = document.createElement("div");
    $(btn).addClass("table-tool-btn");
    $(btn).attr("key", key);
    $(btn).attr("title", "查看錯誤訊息");
    $(btn).css("display", "none");
    $(btn).on('click', {target: btn}, click_error_message);
    tmp = document.createElement("span");
    $(tmp).addClass("glyphicon glyphicon-exclamation-sign");
    $(btn).append(tmp);
    $(cell).append(btn);

    return row;
}

// Function : update wiki document table with query result
function update_wiki_table_status(result) {
    let name = $(window.corpus_target).html();
    for (let idx in result) {
        if (result.hasOwnProperty(idx)) {
            let key = hash(result[idx].url);
            let row = $("#" + key);
            let span = $("#" + key + " td:nth-child(1) span")[0];
            let del_btn = $("#" + key + " td:nth-child(4) div:nth-child(1)")[0];
            let rel_btn = $("#" + key + " td:nth-child(4) div:nth-child(2)")[0];
            let msg_btn = $("#" + key + " td:nth-child(4) div:nth-child(4)")[0];
            if (result[idx].status) {
                $(row).attr("status", "0");
                $(span).removeClass();
                $(span).addClass("glyphicon glyphicon-ok");
                $(span).css("color", "green");
                window.handler.add_document({name: name, document:result[idx].data});
            } else {
                $(row).attr("status", "4");
                $(row).attr("msg", result[idx].data);
                $(del_btn).addClass("disabled");
                $(rel_btn).addClass("disabled");
                $(msg_btn).css("display", "inline-block");
                $(span).removeClass();
                $(span).addClass("glyphicon glyphicon-remove");
                $(span).css("color", "red");
            }
        }
    }
}

// Function : delete button click function
function click_delete(e) {
    let key = $(e.data.target).attr("key");
    let row = $("#" + key);
    let span = $("#" + key + " td:nth-child(1) span")[0];

    // disabled
    if ($(e.data.target).hasClass("disabled"))
        return;

    // delete line
    if ($(row).css("text-decoration-line") === "none")
        $(row).css("text-decoration-line", "line-through");
    else
        $(row).css("text-decoration-line", "none");

    // row status
    switch ($(row).attr("status")) {
        case "0":
            $(row).attr("status", "2");
            break;
        case "1":
            $(row).attr("status", "3");
            break;
        case "2":
            $(row).attr("status", "0");
            break;
        case "3":
            $(row).attr("status", "1");
            break;
        default:
            break;
    }

    // status sign
    if ($(row).attr("status") === "0") {
        $(span).removeClass();
        $(span).addClass("glyphicon glyphicon-ok");
        $(span).css("color", "green");
    } else if ($(row).attr("status") !== "4") {
        $(span).removeClass();
        $(span).addClass("glyphicon glyphicon-hourglass");
        $(span).css("color", "black");
    }
}

// Function : next-level table of content button click function
function click_next_level(e) {
    let key = $(e.data.target).attr("key");
    let url = $("#" + key).attr("url");
}

// Function : copy link button click function
function click_copy_link(e) {
    let key = $(e.data.target).attr("key");
    let url = $("#" + key).attr("url");
    let tmp = document.createElement('textarea');
    $(tmp).val(url);
    $(tmp).attr("readonly", "");
    $(tmp).css({"position": "absolute", "left": "-9999px"});
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    $.blockUI({
        message: "網址已複製到剪貼簿",
        centerY: 0,
        css: { top: '60px', left: '', right: '10px', width: '200px' }
    });
    setTimeout($.unblockUI, 500);
}

// Function : error message button click function
function click_error_message(e) {
    let key = $(e.data.target).attr("key");
    let msg = $("#" + key).attr("msg");
    $.blockUI({ message: msg });
    setTimeout($.unblockUI, 3000);
    $('.blockOverlay').click($.unblockUI);
}

// Function : new wiki click function
function click_new_wiki() {
    let text = $("#new-wiki-url");
    let url = $(text).val();
    let pattern = new RegExp('(https:\\/\\/((.*\\/)+wiki\\/)([^#]+))(#.*)*');
    if (url.length === 0)
        return;
    if (pattern.exec(url) === null) {
        alert("不合法的網址！");
        $(text).val("");
        return;
    } else {
        url = pattern.exec(url)[1];
    }
    if (window.table_wiki_list.includes(url)) {
        alert("重複的網址！");
        $(text).val("");
        return;
    }
    window.table_wiki_list.push(url);
    $("#wiki-table-body").append(create_wiki_table_row({name: null, url: url}, 1));
    $(text).val("");
}

// Function : wiki query progress callback function
function progress_callback(num) {
    $("#numerator").html(num.toString());
}

// Function : check synchronize between wiki document table and docuXML
function check_sync(content, btn_y, btn_n, callback) {
    let sync = true;
    $('#wiki-table-body tr').each(function() {
        let st = $(this).attr("status");
        if (st !== "0" && st !== "4")
            sync = false;
    });
    if (!sync) {
        let dialog = document.createElement("div");
        let tmp;
        $(dialog).html(content);
        tmp = document.createElement("button");
        $(tmp).addClass("btn btn-default btn-xs");
        $(tmp).attr("id", "no");
        $(tmp).css("margin", "10px 20px 0 0");
        $(tmp).html(btn_n);
        $(dialog).append(tmp);
        tmp = document.createElement("button");
        $(tmp).addClass("btn btn-default btn-xs");
        $(tmp).attr("id", "yes");
        $(tmp).css("margin", "10px 0 0 20px");
        $(tmp).html(btn_y);
        $(dialog).append(tmp);
        $.blockUI({
            message: $(dialog),
            css: { width: '300px', height: '120px', padding: '10px 0 0 0' }
        });
        $("#yes").click(function() {$.unblockUI(); callback(true);});
        $("#no").click(function() {$.unblockUI(); callback(false);});
    } else {
        callback(true);
    }
}

//Function : hash function
function hash(s) {
    let h = 1;
    for (let i = 0; i < s.length; i ++)
        h = Math.imul(h + s.charCodeAt(i) | 0, 2654435761);
    return (h ^ h >>> 17) >>> 0;
}