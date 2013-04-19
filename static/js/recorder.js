;(function(){


function overrideEvent(element,type){
	//如果已经override过了，则不再做处理
	if(element["isOverride" + type]){return;}

	if(element['on' + type]){
		var old = element["on" + type];
		element.addEventListener(type,function(e){
			old.apply(this,[e]);
		},false);
		element['on' + type] = null;
	}
	element['isOverride' + type] = true;
}

function overrideElementEvents(){
	var nodes = document.body.getElementsByTagName("*");
	var item = null;
	for(var i=0,len = nodes.length;i < len;i++){
		item = nodes[i];
		if(item && item.nodeType == 1){
			overrideEvent(item,'mouseover');
			overrideEvent(item,'click');
		}
	}
}


var findClickableElement = function(e,eventType) {
	if (!e.tagName) return null;
	var tagName = e.tagName.toLowerCase();
	var type = e.type;
	if ((elementWithEvents && elementWithEvents[window.getSelector(e) + "-" + eventType]) || e.hasAttribute("onclick") || e.hasAttribute("href") || (e.className.indexOf("OP_LOG_BTN") !== -1) || tagName == "button" ||
		(tagName == "input" && 
		 (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
		return e;
	} else {
		if (e.parentNode != null) {
			return findClickableElement(e.parentNode,eventType);
		} else {
			return null;
		}
	}
}


var findMouseoverableElement = function(e,eventType){
	if (!e.tagName) return null;
	var tagName = e.tagName.toLowerCase();
	var type = e.type;
	if ((elementWithEvents && elementWithEvents[window.getSelector(e) + "-" + eventType]) || e.hasAttribute("onmouseover")) {
		return e;
	} else {
		if (e.parentNode != null) {
			return findMouseoverableElement(e.parentNode,eventType);
		} else {
			return null;
		}
	}
}


var findMousedownableElement = function(e,eventType){
	if (!e.tagName) return null;
	var tagName = e.tagName.toLowerCase();
	var type = e.type;
	if ((elementWithEvents && elementWithEvents[window.getSelector(e) + "-" + eventType]) || e.hasAttribute("onmousedown")) {
		return e;
	} else {
		if (e.parentNode != null) {
			return findMousedownableElement(e.parentNode,eventType);
		} else {
			return null;
		}
	}	
}


var actionsDatabase = [];

var isRecording = true;


function startRecord(){

	document.addEventListener("click",function(e){
		if(!isRecording){return;}
		if(e.button === 0){
			var clickable = findClickableElement(e.target,"click");
			//selectElementRecord();

			if(clickable){
				var target = e.target;
				var tagName = target.tagName.toLowerCase();

				if(tagName === "html" || tagName === "body"){return;}
				actionsDatabase.push("click::" + window.getSelector(e.target) + "::" + (+new Date()));
			}
		}
	},true);



	document.addEventListener("mousedown",function(e){
		if(!isRecording){return;}
		var clickable = findMousedownableElement(e.target,"mousedown");
		//selectElementRecord();

		if(clickable){
			var target = e.target;
			var tagName = target.tagName.toLowerCase();

			if(tagName === "html" || tagName === "body"){return;}
			//actionsDatabase.push("mousedown::" + window.getSelector(e.target) + "::" + (+new Date()));
		}
	},true);


	document.addEventListener("mouseover",function(e){
		if(!isRecording){return;}
		var mouseoverable = findMouseoverableElement(e.target,"mouseover");

		if(mouseoverable){
			var target = e.target;
			var tagName = target.tagName.toLowerCase();

			if(tagName === "html" || tagName === "body"){return;}

			actionsDatabase.push("mouseover::" + window.getSelector(e.target) + "::" + (+new Date()));
		}
	},true);

	document.addEventListener("input",function(e){
		if(!isRecording){return;}
		var tagName = e.target.tagName.toLowerCase();
		var type = e.target.type;
		if (('input' == tagName && ('text' == type || 'password' == type || 'file' == type)) ||
			'textarea' == tagName) {
			actionsDatabase.push("type::" + window.getSelector(e.target) + "::" + e.target.value.replace(/"/g,'\\"') + "::" + (+new Date()));
		}
	},true);


	//获取select控件的取值变化
	$(document).on("change",function(e){
		if(!isRecording){return;}

		var tagName = e.target.tagName.toLowerCase();

		if(tagName == "select"){
			actionsDatabase.push("type::" + window.getSelector(e.target) + "::" + $(e.target).val().replace(/"/g,'\\"') + "::" + (+new Date()));
		}
	});



	$(window).on("load",function(){
		document.addEventListener("DOMNodeInserted", function(){
			overrideElementEvents();
		}, false);

		overrideElementEvents();
	});

}


function createStepCode(){

/*  monitor.step接口的拼接代码
var code = "";
var firstTimestamp = 0;
var curTimeStamp = null;
var tempArr = null;
var diff = 0;
var end = "\n";
for(var i =0,len = actionsDatabase.length; i < len; i++){
	tempArr = actionsDatabase[i].split("::");
	curTimeStamp = parseInt(tempArr[tempArr.length - 1],10);

	if(firstTimestamp){
		diff = curTimeStamp - firstTimestamp
	}else{
		diff = 0;
	}

	if(i == len -1){
		end = ";";
	}

	code += ".step(\"" + tempArr.slice(0,tempArr.length - 1).join("::") + "::" + diff + "\",function(el){})" + end;

	if(!firstTimestamp){
		firstTimestamp = curTimeStamp;
	}
}
return code ? "monitor" + code : "";
*/

	var code = "";
	var lastTimestamp = 0;
	var curTimeStamp = null;
	var tempArr = null;
	var diff = 0;
	var end = "\n";
	for(var i =0,len = actionsDatabase.length; i < len; i++){
		tempArr = actionsDatabase[i].split("::");
		curTimeStamp = parseInt(tempArr[tempArr.length - 1],10);

		if(lastTimestamp){
			diff = curTimeStamp - lastTimestamp;
		}else{
			diff = 0;
		}

		code += (diff > 100 ? ".wait("  + diff + ",function(){})\n" : "") + "." + tempArr[0] + "(\"" + tempArr[1] + "\""+ (tempArr[0] == "type" ? ",\"" + tempArr[2] + "\"" : "") + ",function(el){})" + end;

		lastTimestamp = curTimeStamp;
	}
	var actionName = "action_" + (+new Date());
	return code ? "var " + actionName + " = monitor.createAction();\n" + actionName + code  + ".complete(function(){});": "";
}



function showStepCode(code,callback){
	var __div = document.createElement("div");
	var __mask=document.createElement("div");
	__mask.onclick=function(){
		document.body.removeChild(__mask);
		document.body.removeChild(__div);

		callback && callback();
	};

	__mask.style.cssText="background:#000;opacity:0.7;width:100%;height:100%;position:absolute;left:0;top:0;z-index:10000";

	document.body.appendChild(__mask);

	__div.style.cssText="position:fixed;top:0;left:0;z-index:10001;border:1px solid #eee;padding:4px;background:#fff;width:400px;height:300px;font-size:13px;overflow:hidden;box-shadow: 0px 0px 13px #000;border-radius:4px;";
	__div.style.left=parseInt(window.innerWidth / 2) - 200 + "px";
	__div.style.top=parseInt(window.innerHeight / 2) - 150 + "px";
	__div.innerHTML = "<textarea style='border:0;width:99%;height:99%;font-family:Monaco,Menlo,Consolas,\"Courier New\",monospace'>" + code + "</textarea>";
	document.body.appendChild(__div);

	if(opener && code){
		var value = opener.editor.getValue();
		opener.editor.setValue((value ? value + "\n" : "") + "//=========== 录制的代码 ================\n" + code);
	}
}


var isShowCode = false;

document.addEventListener("keyup",function(e){
	// 27 ESC
	if(e.keyCode === 27){
		//如果focus没有blur，则补充操作
		/*if(wasFocused){
			$(focusedElement).blur();
		}*/
		if(isShowCode){ return; }

		isRecording = false;
		isShowCode = true;

		var code = createStepCode();

		showStepCode(code,function(){
			//开始可以获取DOM元素的CSS Selector
			window.startGetSelector();
		});
	}
},false);


$("<div id='body-mask'></div>").css({
	"position" : "absolute",
	"width" : "100%",
	"height" : "100%",
	"opacity" : 0.3,
	"left" : 0,
	"top" : 0,
	"background-color" : "#000",
	"z-index" : 1000000
}).appendTo(document.body);


$("<div id='body-time'>3</div>").css({
	"width" : "100px",
	"height" : "100px",
	"position" : "fixed",
	"left" : $(window).width() / 2 - 80,
	"top" : $(window).height() / 2 - 150,
	"z-index" : 1000001,
	"background-color" : "#000",
	"opacity" : 0.8,
	"font-size" : "130px",
	"color" : "#fff",
	"padding" : "20px 30px 65px 50px"
}).appendTo(document.body);

var intervalTime = 3;

var interval = setInterval(function(){
	if(intervalTime > 1){
		$("#body-time").html(--intervalTime);
	}else{
		$("#body-mask").remove();
		$("#body-time").remove();
		startRecord();
		clearInterval(interval);
	}
},700);


})();