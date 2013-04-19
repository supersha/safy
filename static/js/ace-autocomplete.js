;(function(){
    var autoCompleteLists = [
        "monitor","complete","error","sendError", "warn", "sendWarn", "run",
        "sms","sendSMS" ,"sendLog", "log", "mail","sendMail", "createAction",
        "hasAladdin","util","jsonp","step","mouseover","mouseup","mousedown","wait",
        "click","clickOnce","type","define","require",
        "driver","find_element_by_id","find_element_by_name","find_element_by_tag_name","find_element_by_class_name",
        "find_element_by_xpath","find_element_by_css_selector","find_elements","execute_script",
        "find_element_by_link_text","find_element_by_partial_link_text",
        "find_elements_by_name","find_elements_by_tag_name","find_elements_by_xpath","find_elements_by_class_name",
        "find_elements_by_css_selector","find_elements_by_link_text","find_elements_by_partial_link_text",
        "get_attribute","each","send_keys","submit","get_text","get_elements","clear","send_keys_to_element",
        "send_keys_to_element",
        "CSS_SELECTOR","XPATH","CLASS_NAME","TAG_NAME","NAME","LINK_TEXT","PARTIAL_LINK_TEXT","ID",
        "should",
        "have","has","haveProperty","hasProperty","property","attr","haveAttr","hasAttr","beTrue","beFalse","beTrues",
        "beFalses","ownProperty","hasOwnProperty","lengthOf","beLengthOf","keys","haveKeys","hasKeys","include",
        "empty","beEmpty","beA","above","beAbove","below","beBelow","equal","beEqual","exist","match","child","haveChild",
        "haveHrefKeys","hasHrefKeys","haveHrefKey","hasHrefKey",
        "haveFormKeys","haveFormKey",
        "hasChild","parent","haveParent","hasParent","next","haveNext","hasNext","prev","havePrev","hasPrev",
        "empty","beEmpty","visible","hide",
        "function","while","case","switch","for","return","true","false","undefined","null",
        "toLowerCase","toUpperCase","parseInt","parseFloat",
        "slice","substring","substr","join","split","splice",
        "attachEvent","detachEvent","preventDefault","apply","call","prototype","arguments",
        "Array","Function","Date","Number","RegExp","Object","String","Error","Boolean","Iterator","Namespace","eval",
        "isFinite","isNaN","encodeURI","encodeURIComponent","decodeURI","decodeURIComponent","JSON",
    ];
    var autoCompleteWordListForDot = {};
    var autoCompleteSelectedClassName = "autocomplete-selected";
    var aceAutoCompleteDialogID = "ace-autocomplete-dialog";
    var autoCompleteItemClassName = "autocomplete-item";
    var allReadyAddIdentifierClassName = "allready-add-identifier";
    var $aceAutoCompleteDialog = null;
    var autoCompleteItemHeight = 0; // 列表中一项的高度
    var isInitDialogHeight = false; // 是否已经初始化Dialog的高度
    var autoCompleteType; // autocomplete的类型，分为普通输入，和点语法出现的autocomplete list。


    //点语法的自定义word列表
    autoCompleteWordListForDot.monitor = ["error","sendError","warn","sendWarn","complete","sms","sendSMS","log","sendLog","mail","sendMail","util","jsonp","step","createAction","define","require","run"];
    autoCompleteWordListForDot.driver = [
        "find_element_by_id","find_element_by_name","find_element_by_tag_name","find_element_by_class_name",
        "find_element_by_xpath","find_element_by_css_selector","find_elements","execute_script",
        "find_element_by_link_text","find_element_by_partial_link_text",
        "find_elements_by_name","find_elements_by_tag_name","find_elements_by_xpath","find_elements_by_class_name",
        "find_elements_by_css_selector","find_elements_by_link_text","find_elements_by_partial_link_text"
    ];
    autoCompleteWordListForDot.By = ["CSS_SELECTOR","XPATH","CLASS_NAME","TAG_NAME","NAME","LINK_TEXT","PARTIAL_LINK_TEXT","ID"];

    //添加内置对象的word列表
    function addAutoCompleteListWords(targets){
        for(var k in targets){

            if(!k){ continue; }
            autoCompleteWordListForDot[k] = targets[k];
            if($.inArray(k,autoCompleteLists) === -1){
                autoCompleteLists.push(k);
            }
            for(var key in targets[k]){
                if($.inArray(key,autoCompleteLists) === -1){
                    autoCompleteLists.push(key);
                    if(!$.isArray(targets[k][key]) && typeof targets[k][key] === "object"){
                        addAutoCompleteListWords({key:targets[k][key]});
                    }
                }
            }
        }
    }

    addAutoCompleteListWords({
        "document" : document,
        "window" : window,
        "navigator" : navigator,
        "jQuery" : $,
        "$(document)":$(document)
    });


    //添加单个word到auto complete list中，添加成功返回true，否则返回false
    function addAutoCompleteListWord(word){
        if($.inArray(word,autoCompleteLists) === -1){
            autoCompleteLists.push(word);
            return true;
        }
        return false;
    }


    //添加ace编辑器代码中的一些identifier类型的words到列表中，记录下用户输入过的内容
    function addAceEditorIdentifierWordLoop(){
        //setInterval(function(){
            $(".ace_identifier:not(." + allReadyAddIdentifierClassName + ")").each(function(index,item){
                addAutoCompleteListWord($(item).text());
                $(item).addClass(allReadyAddIdentifierClassName);
            });
        //},3000);
    }


    function searchAutoCompleteListWords(type,sugString){
        if(!(/[a-zA-Z\_]+$/).test(sugString)){ return; }

        var rtn = [],reg;
        try{
            reg = new RegExp("^" + sugString,"i");
        }catch(e){ return; }

        if(type === "normal"){
            $(autoCompleteLists).each(function(index,item){
                if(reg.test(item)){
                    rtn.push(item.replace(sugString,"<strong>" + sugString + "</strong>"));
                }
            });         
        }else if(type === "dot"){
            if($.isArray(autoCompleteWordListForDot[sugString])){
                $(autoCompleteWordListForDot[sugString]).each(function(index,item){
                     rtn.push(item);
                });
            }else{
                for(var key in autoCompleteWordListForDot[sugString]){
                    if(autoCompleteWordListForDot[sugString].hasOwnProperty(key)){
                        rtn.push(key);
                    }
                }
            }
        }
        return rtn;
    }


    function buildList(list){
        if(!list || !list.length){ return; }

        var html = [];
        $(list).each(function(index,item){
            html.push("<li data-index='" + index + "' class='" + autoCompleteItemClassName + (index === 0 ? " " + autoCompleteSelectedClassName : "") + "'>" + item + "</li>");
        });
        return "<ul>" + html.join("") + "</ul>";
    }


    function initDialogElement(editor){
        $aceAutoCompleteDialog = $("<div id='" + aceAutoCompleteDialogID + "'></div>").appendTo(document.body);
        $aceAutoCompleteDialog.click(function(e){
            var target = e.target;
            var tagName = target.tagName.toLowerCase();

            if(tagName === "strong"){ target = target.parentNode; }

            var text = $(target).text();
            if(autoCompleteType !== "dot"){ editor.removeWordLeft(); }
            editor.insert(text);
            $(this).hide();
        }).mouseover(function(e){
            var target = e.target;
            var tagName = target.tagName.toLowerCase();

            if(tagName === "strong"){ target = target.parentNode; }
            highlightDialogSelectedItem(target);
        }).mousemove(function(e){
            var $this = $(this),
                 tPos = $this.offset(),
                mousePosY = e.pageY - tPos.top,
                scrollTop = 0;
            if(mousePosY >= 10){
                scrollTop = ($aceAutoCompleteDialog.find("ul").height() * mousePosY) / $aceAutoCompleteDialog.height();
            }else if(mousePosY < 10){
                scrollTop = 0;  
            }
            $aceAutoCompleteDialog.scrollTop(scrollTop);
        });
    }


    function initDialogHeight(items){
        if(isInitDialogHeight){ return; }

        var $item = $aceAutoCompleteDialog.find("li:eq(0)");
        var itemHeight = autoCompleteItemHeight || (autoCompleteItemHeight = $item.height() + parseInt($item.css("paddingTop")) + parseInt($item.css("paddingBottom")) + parseInt($item.css("borderTopWidth")) + parseInt($item.css("borderBottomWidth")));

        $aceAutoCompleteDialog.css("maxHeight",items * itemHeight);
        isInitDialogHeight = true;
    }


    function handleDocumentMousedown(){
        $(document).mousedown(function(e){
            var target = e.target;
            if(!$(target).hasClass(autoCompleteItemClassName) && !$(target).parent().hasClass(autoCompleteItemClassName)){
                $aceAutoCompleteDialog.hide();
            }
        });
    }


    function highlightDialogSelectedItem(elem){
        $aceAutoCompleteDialog.find("li").each(function(index,item){
            $(item).removeClass(autoCompleteSelectedClassName);
        });
        $(elem).addClass(autoCompleteSelectedClassName); 
    }


    //这里可能需要根据字体大小设置，相应的调整下left的距离
    function updateDialogElementPosition(editor,action){
        var positionEditor = $(editor.container).position();
        var positionTextarea = $(editor.container).find("textarea").position();
        var height = $(editor.container).find("textarea").height();

        // editor.container获取到的位置有可能是0的情况，这时候找它的父结点的位置
        if(positionEditor.left == 0){
            positionEditor = $(editor.container.parentNode).position();
        }
        
        var extraLeft = (action == "removeText") ? -2 : 5;

        $aceAutoCompleteDialog.css({
            left : positionEditor.left + positionTextarea.left + extraLeft + "px",
            top : positionEditor.top + positionTextarea.top + height + 2 + "px"
        });
    }



    function buildAutoCompleteList(type,editor,value,action,items){
        if(!(/[a-zA-Z\_]/).test(value)){ $aceAutoCompleteDialog.hide();return; }

        var html = buildList(searchAutoCompleteListWords(type,value));

        if(html){
            $aceAutoCompleteDialog.html(html).show().scrollTop(0);
            initDialogHeight(items);
            updateDialogElementPosition(editor,action);
        }else{
            $aceAutoCompleteDialog.hide();
        }   
    }



    function AceAutoComplete(editor,options){
        //屏蔽掉IE的该功能
        if($.browser.msie){ return; }

        this.editor = editor;
        this.options = options || { items : 10 };

        this.init();
    }

    AceAutoComplete.prototype.init = function(){
        var that = this;
        var items = that.options.items || 10;

        //初始化autocomplete dialog DOM元素到document中
        initDialogElement(that.editor);

        //初始化document的mousedown隐藏ace autocomplete dialog的逻辑
        handleDocumentMousedown();


        that.editor.on("paste",function(){
            setTimeout(function(){
                $aceAutoCompleteDialog.hide();
                addAceEditorIdentifierWordLoop();
            },100);
        });


        that.editor.on('change',function (e) {
            var position = that.editor.getCursorPosition();
            var token = that.editor.session.getTokenAt(position.row, position.column);
            var text = e.data.text;
            var action = e.data.action;
            var prevTokenValue;

            //如果输入的事;,这样的字符，则处理页面上已定义的变量到autoComplete word lists中
            if(text === ";" || text === ","){
                addAceEditorIdentifierWordLoop();
            }

            if(!token || !token.value || !that.editor.getValue() || token.type.indexOf("comment") !== -1 || token.type === "string"){ $aceAutoCompleteDialog.hide(); return; }

            var value = token.value;

            autoCompleteType = "normal";

            //处理点语法的逻辑
            if(!(/[a-zA-Z\_]/).test(text)){
                if(action === "insertText"){
                    if(text === "."){
                        prevTokenValue = that.editor.session.getTokenAt(position.row,position.column - 1).value;
                    }else{
                        $aceAutoCompleteDialog.hide(); return;
                    }
                }
            }else{
                if(action === "removeText"){
                    if(value === "."){
                        prevTokenValue = that.editor.session.getTokenAt(position.row,position.column - 1).value;
                    }
                }
            }

            //如果是点语法中获取到了前一个token的内容，则判断该token.value下是否有自有属性和方法
            if(prevTokenValue){
                buildAutoCompleteList("dot",that.editor,prevTokenValue,action,items);
                autoCompleteType = "dot";
                return;
            }
            
            if(value.length === 1 && !(/[a-zA-Z\_]/).test(value)){
                if(action === "insertText"){
                    value = text;
                }else if(action === "removeText"){
                    $aceAutoCompleteDialog.hide();
                    return;
                }
            }

            buildAutoCompleteList("normal",that.editor,value,action,items);

        });

        that.editor.commands.on("exec",function(e){
            if(e.command.bindKey){
                var bindKey = e.command.bindKey.mac || e.command.bindKey.win;
                var method = "navigate";
                var direction;

                //if((/^Delete/).test(bindKey)){ return; }

                if((/^((Left)|(Right))/).test(bindKey)){
                    $aceAutoCompleteDialog.hide();
                    return true;
                }else if((/^((Down)|(Up))/).test(bindKey)){
                    direction = RegExp.$1;
                    method = (direction == "Down") ? "next" : "prev";

                    if($aceAutoCompleteDialog.css("display") === "block"){
                        var $selectedItem = $aceAutoCompleteDialog.find("li." + autoCompleteSelectedClassName);
                        var $elem = $selectedItem[method]();
                        if($elem.size()){
                            highlightDialogSelectedItem($elem);

                            //处理dialog滚动的逻辑
                            var dialogHeight = $aceAutoCompleteDialog.height();
                            var dialogScrollTop = $aceAutoCompleteDialog.scrollTop();
                            var itemHeight = autoCompleteItemHeight || (autoCompleteItemHeight = $elem.height() + parseInt($elem.css("paddingTop")) + parseInt($elem.css("paddingBottom")) + parseInt($elem.css("borderTopWidth")) + parseInt($elem.css("borderBottomWidth")));


                            if(direction === "Down"){
                                if(itemHeight * (parseInt($elem.data("index"),10) + 1) > (dialogHeight + dialogScrollTop)){
                                    $aceAutoCompleteDialog.scrollTop(dialogScrollTop + itemHeight);
                                }
                            }else{
                                if(itemHeight * parseInt($elem.data("index"),10) < (dialogScrollTop)){
                                    $aceAutoCompleteDialog.scrollTop(dialogScrollTop - itemHeight);
                                }                                
                            }
                        }
                        e.preventDefault();
                    }
                }
            }

            //判断是否输入的是回车
            if(e.args == "\n" && e.command.name === "insertstring"){
                var text;
                if($aceAutoCompleteDialog.css("display") === "block"){
                    text = $aceAutoCompleteDialog.find("li." + autoCompleteSelectedClassName).text();
                    if(autoCompleteType !== "dot"){ editor.removeWordLeft(); }
                    editor.insert(text);
                    $aceAutoCompleteDialog.hide();
 
                    e.preventDefault();
                }  
            }
        });
    }

    window.AceAutoComplete = AceAutoComplete;
})();