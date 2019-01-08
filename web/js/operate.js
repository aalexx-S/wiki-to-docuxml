// Function : initial window variable
function window_variable_initial() {
    window.corpus_list = null;
    window.corpus_target = null;
    window.table_wiki_list = null;
}

//Function : hash function
function hash(s) {
    let h = 1;
    for (let i = 0; i < s.length; i ++)
        h = Math.imul(h + s.charCodeAt(i) | 0, 2654435761);
    return (h ^ h >>> 17) >>> 0;
}

// Function : create and config DOM element
function elementFactory(data) {
    if (!data.hasOwnProperty("type"))
        return null;
    let el = document.createElement(data.type);
    if (data.hasOwnProperty("class"))
        $(el).addClass(data.class);
    if (data.hasOwnProperty("html"))
        $(el).html(data.html);
    if (data.hasOwnProperty("css"))
        $(el).css(data.css);
    if (data.hasOwnProperty("attr")) {
        for (let key in data.attr) {
            if (!data.attr.hasOwnProperty(key))
                continue;
            $(el).attr(key, data.attr[key]);
        }
    }
    if (data.hasOwnProperty("on")) {
        for (let key in data.on) {
            if (!data.on.hasOwnProperty(key))
                continue;
            $(el).on(key, { target: el }, data.on[key]);
        }
    }
    return el;
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
        let dialog = elementFactory({ type: "div", html: content });
        // no button
        $(dialog).append(elementFactory({
            type: "button",
            attr: { id: "sync-dialog-no-btn" },
            class: "btn btn-default btn-xs",
            css: { margin: "10px 20px 0 0" },
            html: btn_n,
            on: { click: function() { $.unblockUI(); callback(false); } }
        }));
        // yes button
        $(dialog).append(elementFactory({
            type: "button",
            attr: { id: "sync-dialog-yes-btn" },
            class: "btn btn-default btn-xs",
            css: { margin: "10px 0 0 20px" },
            html: btn_y,
            on: { click: function() { $.unblockUI(); callback(true); } }
        }));
        $.blockUI({
            message: $(dialog),
            css: { width: '300px', height: '120px', top: 'calc(50% - 60px)', left: 'calc(50% - 150px)', padding: '10px 0 0 0' }
        });
    } else {
        callback(true);
    }
}

// Function : delete button click function
function click_delete_btn(e) {
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
    $(row).attr("status", ((parseInt($(row).attr("status")) + 2) % 4).toString());

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

// Function : related entry item click function
function click_related_entry_item(e) {
    let self = e.data.target;
    let key = $(self).attr("title");
    let url = $(self).attr("url");
    let parent;
    if ($(self).parent().attr("id") === "related-entry-src-list")
        parent = $("#related-entry-dst-list");
    else
        parent = $("#related-entry-src-list");
    $(self).remove();
    $(parent).append(elementFactory({
        type: "div",
        attr: { url: url, title: key },
        class: "related-entry-item select-disable",
        html: key,
        on: { click: click_related_entry_item }
    }));
}

// Function add related entry to wiki document table
function add_related_entry() {
    $('#related-entry-dst-list div').each(function() {
        let key = $(this).html();
        let url = $(this).attr("url");
        if (!window.table_wiki_list.includes(url)) {
            window.table_wiki_list.push(url);
            $("#wiki-table-body").append(create_wiki_table_row({ name: key, url: url }, 1));
        }
    });
    $.unblockUI();
}

// Function : create block ui dialog for related entry
function create_related_entry_dialog(data) {
    let dialog = elementFactory({ type: "div" });
    let lst_wrap = elementFactory({ type: "div", css: { margin: "5px 0 5px 0" } });
    let src_lst = elementFactory({ type: "div", attr: { id: "related-entry-src-list" }, class: "dialog-list" });
    let dst_lst = elementFactory({ type: "div", attr: { id: "related-entry-dst-list" }, class: "dialog-list" });
    let arrow_wrap = elementFactory({ type: "div", attr: { id: "arrow-container" } });
    let arrow_r = elementFactory({ type: "div", attr: { id: "arrow-wrap-r" }, class: "select-disable" });
    let arrow_l = elementFactory({ type: "div", attr: { id: "arrow-wrap-l" }, class: "select-disable" });
    let btn_wrap = elementFactory({ type: "div", css: { margin: "5px 0 5px 0" } });

    // query result show
    $(dialog).append(elementFactory({
        type: "div",
        css: { margin: "5px 0 5px 0" },
        html: "找到 " + Object.keys(data).length + " 個相關條目"
    }));

    // append wrapper for two list and arrow
    $(lst_wrap).append(src_lst);
    $(lst_wrap).append(arrow_wrap);
    $(lst_wrap).append(dst_lst);
    $(dialog).append(lst_wrap);
    // add query result to src list
    for (let key in data) {
        if(!data.hasOwnProperty(key))
            continue;
        $(src_lst).append(elementFactory({
            type: "div",
            attr: { url: data[key], title: decodeURIComponent(key) },
            class: "related-entry-item select-disable",
            html: decodeURIComponent(key),
            on: { click: click_related_entry_item }
        }));
    }
    // arrow right
    $(arrow_r).append(elementFactory({ type: "div", attr: { id: "arrow-tail-r" } }));
    $(arrow_r).append(elementFactory({ type: "div", attr: { id: "arrow-body-r" }, html: "加入" }));
    $(arrow_r).append(elementFactory({ type: "div", attr: { id: "arrow-head-r" } }));
    $(arrow_wrap).append(arrow_r);
    // arrow left
    $(arrow_l).append(elementFactory({ type: "div", attr: { id: "arrow-head-l" } }));
    $(arrow_l).append(elementFactory({ type: "div", attr: { id: "arrow-body-l" }, html: "刪去" }));
    $(arrow_l).append(elementFactory({ type: "div", attr: { id: "arrow-tail-l" } }));
    $(arrow_wrap).append(arrow_l);

    // query result add and cancel button
    $(btn_wrap).append(elementFactory({
        type: "button",
        attr: { id: "related-entry-dialog-cancel" },
        class: "btn btn-default btn-xs",
        css: { margin: "0 20px 0 0" },
        html: "取消",
        on: { click: $.unblockUI }
    }));
    $(btn_wrap).append(elementFactory({
        type: "button",
        attr: { id: "related-entry-dialog-add" },
        class: "btn btn-default btn-xs",
        css: { margin: "0 0 0 20px" },
        html: "加入",
        on: { click: add_related_entry }
    }));
    $(dialog).append(btn_wrap);

    $.blockUI({
        message: $(dialog),
        css: { width: "450px", height: "330px", top: 'calc(50% - 165px)', left: 'calc(50% - 225px)', cursor: 'auto' }
    });
}

// Function : related entry button click function
function click_related_entry_btn(e) {
    let key = $(e.data.target).attr("key");
    let url = $("#" + key).attr("url");

    // disabled
    if ($(e.data.target).hasClass("disabled"))
        return;

    $.blockUI({ message: "正在取得相關條目..." });
    window.get_all_links(url, function(result) {
        if (result.status) {
            create_related_entry_dialog(result.data);
        } else {
            $.blockUI({message: "找不到相關條目<br>原因：" + result.data});
            setTimeout($.unblockUI, 3000);
        }
    });
}

// Function : copy link button click function
function click_copy_link_btn(e) {
    let key = $(e.data.target).attr("key");
    let url = $("#" + key).attr("url");
    let tmp = elementFactory({
        type: "textarea",
        attr: { readonly: "" },
        css: { position: "absolute", left: "-9999px"}
    });
    $(tmp).val(url);
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
function click_error_message_btn(e) {
    let key = $(e.data.target).attr("key");
    let msg = $("#" + key).attr("msg");
    $.blockUI({ message: msg });
    setTimeout($.unblockUI, 3000);
    $('.blockOverlay').click($.unblockUI);
}

// Function : create new row in wiki document table
function create_wiki_table_row(wiki_doc, state) {
    let pattern = new RegExp('https:\\/\\/((.*\\/)+wiki\\/)([^#]+)(#.*)*');
    let key = hash(wiki_doc.url);
    let src = pattern.exec(wiki_doc.url)[1];
    let entry = (wiki_doc.name !== null) ? wiki_doc.name : decodeURIComponent(pattern.exec(wiki_doc.url)[3]);
    let cell, btn;
    let icon_type = ["ok", "hourglass"];
    let icon_color = ["green", "black"];

    // config row
    let row = elementFactory({
        type: "tr",
        attr: { id: key, url: wiki_doc.url, status: state.toString() },
        css: { 'text-decoration-line': "none" }
    });

    // status
    cell = elementFactory({ type: "td", css: { 'text-align': "center" } });
    $(cell).append(elementFactory({
        type: "span",
        class: "glyphicon glyphicon-" + icon_type[state],
        css: { color: icon_color[state] }
    }));
    $(row).append(cell);

    // source
    $(row).append(elementFactory({ type: "td", css: { 'text-align': "left" }, html: src }));

    // entry
    $(row).append(elementFactory({ type: "td", css: { 'text-align': "left" }, html: entry }));

    // button
    cell = elementFactory({ type: "td", class: "select-disable", css: { 'text-align': "left" } });
    $(row).append(cell);
    // delete button
    btn = elementFactory({
        type: "div",
        attr: { key: key, title: "刪除此條目" },
        class: "table-tool-btn",
        on: { click: click_delete_btn }
    });
    $(btn).append(elementFactory({ type: "span", class: "glyphicon glyphicon-trash" }));
    $(cell).append(btn);
    // related entry button
    btn = elementFactory({
        type: "div",
        attr: { key: key, title: "增加相關條目" },
        class: "table-tool-btn",
        on: { click: click_related_entry_btn }
    });
    $(btn).append(elementFactory({ type: "span", class: "glyphicon glyphicon-list-alt" }));
    $(cell).append(btn);
    // copy link button
    btn = elementFactory({
        type: "div",
        attr: { key: key, title: "複製此條目連結" },
        class: "table-tool-btn",
        on: { click: click_copy_link_btn }
    });
    $(btn).append(elementFactory({ type: "span", class: "glyphicon glyphicon-duplicate" }));
    $(cell).append(btn);
    // error message button
    btn = elementFactory({
        type: "div",
        attr: { key: key, title: "查看錯誤訊息" },
        class: "table-tool-btn",
        css: { display: "none" },
        on: { click: click_error_message_btn }
    });
    $(btn).append(elementFactory({ type: "span", class: "glyphicon glyphicon-exclamation-sign" }));
    $(cell).append(btn);

    return row;
}

// Function : new wiki click function
function click_new_wiki() {
    let text = $("#new-wiki-url");
    let url = $(text).val();
    let pattern = new RegExp('(https:\\/\\/((.*\\/)+wiki\\/)([^#]+))(#.*)*');
    if (url.length === 0)
        return;
    if (pattern.exec(url) === null) {
        window.alert("不合法的網址！");
        $(text).val("");
        return;
    } else {
        url = pattern.exec(url)[1];
    }
    if (window.table_wiki_list.includes(url)) {
        window.alert("重複的網址！");
        $(text).val("");
        return;
    }
    window.table_wiki_list.push(url);
    $("#wiki-table-body").append(create_wiki_table_row({ name: null, url: url }, 1));
    $(text).val("");
}

// Function : create new operate space for clicked corpus item
function create_corpus_operate(name) {
    // config url bar
    let url_input_group = elementFactory({ type: "div", class: "input-group col-md-8 col-md-offset-2" });
    $(url_input_group).append(elementFactory({
        type: "span",
        class: "input-group-addon select-disable",
        html: "維基百科網址"
    }));
    $(url_input_group).append(elementFactory({
        type: "input",
        attr: { id: "new-wiki-url", placeholder: "請貼上維基百科網址" },
        class: "form-control input-group-text"
    }));
    $(url_input_group).append(elementFactory({
        type: "span",
        attr: { id: "new-wiki" },
        class: "input-group-addon select-disable span-btn",
        html: "新增",
        on: { click: click_new_wiki }
    }));

    // config wiki document table
    let table_container = elementFactory({ type: "div", class: "col-md-10 col-md-offset-1" });
    let table = elementFactory({ type: "table", class: "table table-striped" });
    let thead = elementFactory({ type: "thead" });
    let tbody = elementFactory({ type: "tbody", attr: { id: "wiki-table-body" } });
    let row = elementFactory({ type: "tr" });
    $(table_container).append(table);
    $(table).append(thead);
    $(table).append(tbody);
    $(thead).append(row);
    $(row).append(elementFactory({
        type: "th",
        css: { width: "50px", 'text-align': "center" },
        html: "狀態"
    }));
    $(row).append(elementFactory({
        type: "th",
        css: { width: "200px" },
        html: "來源"
    }));
    $(row).append(elementFactory({
        type: "th",
        html: "條目"
    }));
    $(row).append(elementFactory({
        type: "th",
        css: { width: "125px" },
        html: "按鈕"
    }));

    // add row to wiki document table body
    let wiki_list = window.handler.get_wiki_list(name);
    window.table_wiki_list = [];
    for (let key in wiki_list) {
        if (!wiki_list.hasOwnProperty(key))
            continue;
        window.table_wiki_list.push(wiki_list[key].url);
        $(tbody).append(create_wiki_table_row(wiki_list[key], 0));
    }

    // clear space and append element
    let space = $("#operate-space");
    $(space).html("");
    $(space).append(elementFactory({ type: "h2", html: "文獻集：" + name }));
    $(space).append(url_input_group);
    $(space).append(table_container);
}

// Function : update wiki document table with query result
function update_wiki_table_row(key, result) {
    let row = $("#" + key);
    let span = $("#" + key + " td:nth-child(1) span")[0];
    let del_btn = $("#" + key + " td:nth-child(4) div:nth-child(1)")[0];
    let rel_btn = $("#" + key + " td:nth-child(4) div:nth-child(2)")[0];
    let msg_btn = $("#" + key + " td:nth-child(4) div:nth-child(4)")[0];
    if (result.status) {
        $(row).attr("status", "0");
        $(span).removeClass();
        $(span).addClass("glyphicon glyphicon-ok");
        $(span).css("color", "green");
    } else {
        $(row).attr("status", "4");
        $(row).attr("msg", result.data);
        $(del_btn).addClass("disabled");
        $(rel_btn).addClass("disabled");
        $(msg_btn).css("display", "inline-block");
        $(span).removeClass();
        $(span).addClass("glyphicon glyphicon-remove");
        $(span).css("color", "red");
    }
}

// Function : wiki query progress callback function
function progress_callback(num) {
    $("#numerator").html(num.toString());
}

// Function : wiki query result callback function
function wiki_result_callback(result) {
    $.blockUI({
        message: "正在將維基頁面加入 docuXML ..."
    });
    for (let idx in result) {
        if (!result.hasOwnProperty(idx))
            continue;
        if (result[idx].status)
            window.handler.add_document({ name: $(window.corpus_target).html(), document: result[idx].data });
        update_wiki_table_row(hash(result[idx].url), result[idx]);
    }
    $.unblockUI();
}

// Event : sync with docuXML
$("#synchronize").click(function() {
    $("#synchronize").blur();
    let name = $(window.corpus_target).html();
    let urls = [];
    $.blockUI({
        message: "已取得維基頁面&nbsp;...&nbsp;<span id='numerator'>0</span>&nbsp;/&nbsp;<span id='denominator'></span>"
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
        window.get_URL(urls, progress_callback, wiki_result_callback);
    } else {
        $.unblockUI();
    }
});

// Event : back to main page
$("#home").click(function() {
    let content = "目前文獻集有條目尚未更新至 docuXML<br>若是回到主頁面則本工具將不會保留該條目<br>是否要回到主頁面？<br>";
    check_sync(content, "回到主頁面", "留在本工具", function(sync) {
        if (sync) {
            window.handler = null;
            window.load_main();
        }
    });
});

// Event : download docuXML
$("#download").click(function() {
    $("#download").blur();
    let content = "目前文獻集有條目尚未更新至 docuXML<br>本工具不保證下載結果如預期<br>是否要下載 docuXML？<br>";
    check_sync(content, "確認下載", "取消下載", function(sync) {
        if (sync) {
            let serializer = new XMLSerializer();
            let xml = serializer.serializeToString(window.handler.export_xml());
            xml = xml.replace(/\sxmlns="(.*?)"/g, '');
            let blob = new Blob([xml], {type: 'text/plain'});
            let link = document.getElementById("download-link");
            link.href = URL.createObjectURL(blob);
            link.download = window.filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    });
});

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

// Function : create new corpus item in side navigation bar
function create_corpus_item(name) {
    let corpus_item = elementFactory({
        type: "div",
        class: "corpus-item select-disable",
        html: name
    });
    $(corpus_item).on('click', { target: corpus_item }, click_corpus_item);
    $("#corpus-list").append(corpus_item);
    if (window.corpus_list.length === 1) {
        $(corpus_item).click();
    }
}

// Event : create new corpus
$("#new-corpus").click(function() {
    let text = $("input:text[name=new-corpus-name]");
    let name = $(text).val();
    if (name === "")
        return;
    if (window.corpus_list.includes(name)) {
        window.alert("文獻集名稱不可重複！");
        $(text).val("");
        return;
    }
    window.handler.create_corpus(name);
    window.corpus_list = window.handler.get_corpus_list();
    create_corpus_item(name);
    $(text).val("");
});

$(document).ready(function() {
    window_variable_initial();
    if (window.handler !== null) {
        window.corpus_list = window.handler.get_corpus_list();
        if (window.corpus_list.length !== 0) {
            for (let key in window.corpus_list) {
                if (!window.corpus_list.hasOwnProperty(key))
                    continue;
                create_corpus_item(window.corpus_list[key]);
            }
            $('#corpus-list div:nth-child(1)').click();
        }
    }
});
