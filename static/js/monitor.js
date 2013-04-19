;(function(win){

$(window).load(function(){
	$.getScript && $.getScript("http://" + __CaseData.host + "/js/wgxpath.install.js",function(){
			wgxpath.install();
	});
});



var extend = function(source,des){
	if(!source){return des;}
	for(var key in source){
		if(source.hasOwnProperty(key)){
			des[key] = source[key];
		}
	}
	return des;
}




var Util = {};

Util.event = {}

Util.event.add = function(element,type,handle){
	if(element.addEventListener){
		element.addEventListener(type,handle,false);
	}else{
		element.attachEvent("on" + type,handle);
	}
}

Util.event.fire = function(elem,type){
	if(!elem){return;}
	var eventType = "Events";

	if(document.createEvent){
		if(type.indexOf("mouse") !== -1){
			eventType = "MouseEvents";
		}
		var obj = document.createEvent(eventType);
		obj.initEvent(type,true,false);
		return !elem.dispatchEvent(obj);
	}else{
		var evt = document.createEventObject();
		return elem.fireEvent("on" + type,evt);
	}
}


Util.tool = {};

Util.tool.getDateTime = function(d){
	var date = d ? (new Date(d)) : (new Date());
	return [date.getFullYear(),date.getMonth() + 1,date.getDate()].join("-") + " " + [date.getHours(),date.getMinutes(),date.getSeconds()].join(":");
}

Util.tool.randomString = function (length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    length = length || 32;

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

/*
Util.tool.stopLinkDefaultBehavior = function(){
	Util.event.add(document,"click",function(e){
		e = window.event || e;
		var target = e.srcElement || e.target;
		if(target.tagName.toLowerCase()=="a"){
			try{
				e.preventDefault();
			}catch(e){}
		}
	});
}

//立即执行，屏蔽掉a标签点击后的默认行为
Util.tool.stopLinkDefaultBehavior();
*/



//判断是否存在指定tpl的阿拉丁
Util.hasAladdin = function(tplOrSrcID){
	var rtn = 0;
	if((/^\d+$/).test(tplOrSrcID)){
		rtn = $("table[srcid=" + tplOrSrcID + "]").size();
	}else{
		rtn = $("table[tpl=" + tplOrSrcID + "]").size();
	}
	if(rtn == 0){
		//type,content,user,title
		sendMessage("log","该URL下的阿拉丁模板:" + tplOrSrcID + "不存在","shafeng","阿拉丁不存在");
	}
}


;(function(){
	

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
var uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}


Util.browser = browser;


})();



win.__Case = function(title,uid){
	this.title = title;
	this.uid = uid;
	++win.__Case.instanceCount;
	this.actions = 0;

	this.caseToken = Util.tool.randomString(16);

	this.errorCount = 0;

	window.__CaseData.noreport && __Socket && __Socket.emit("ErrorLogEvent",{
		messageType : "subtitle",
		title : this.title,
		room : window.__CaseData.room,
		token : this.caseToken,
		resultID : window.__CaseData.resultID
	});
}

win.__Case.prototype.util = Util;


win.__Case.prototype.run = function(callback){
	callback && callback(this);
	return this;
}

//win.__Case.prototype.next = win.__Case.prototype.run;

win.__Case.instanceCount = 0;

//轮循检测Case是否都执行完了，执行完了，那么在url里面添加hash
win.__Case.checkCaseStatus = function(){
	//timeout设置超时则直接显示completed状态，并且清掉interval，30s后执行
	var timeout = setTimeout(function(){
		clearInterval(interval);
		window.document.location.hash = "#case_run_completed";
		win.__Case.instanceCount = 0;
	}, 6 * 5000);
	var interval = setInterval(function(){
		if(win.__Case.instanceCount === 0){
			clearInterval(interval);
			clearTimeout(timeout);
			window.document.location.hash = "#case_run_completed";
		}
	}, 1000);
}
//立即执行
win.__Case.checkCaseStatus();


win.__Case.prototype.complete = function(){
	window.__CaseData.noreport && __Socket && __Socket.emit("ErrorLogEvent",{
		room : window.__CaseData.room,
		messageType : "complete",
		title : this.title,
		token : this.caseToken,
		errorCount : this.errorCount,
		resultID : window.__CaseData.resultID
	});

	win.__Case.instanceCount--;
}


__Case.prototype.createAction = function(option){
	return new __Case.__Action(this,option);
}


__Case.__Action = function(monitor,option){
	this.currentElement = option && option['target'] || null;
	this.currentTime = 1000; //1s开始算
	this.monitor = monitor;
}


__Case.__Action.prototype.type = function(element,value,handle){
	var that = this;
	if(arguments.length == 2){
		if(typeof arguments[1] == "function"){
			var value = arguments[0];
			var handle = arguments[1];
			var element = this.currentElement;
		}
	}else if(arguments.length == 1){
		var value = arguments[0];
		var element = this.currentElement;
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;

	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null,value); return; }

		try{
			$(element)[0].focus();
			setTimeout(function(){
				$(element).val(value.replace(/\\"/g,'"')).trigger("change");
				Util.event.fire($(element)[0],"change");
			},0);
			handle && handle.call(that,$(element).get(0),value);
		}catch(e){};
	},this.currentTime);

	return this;
}


__Case.__Action.prototype.wait = function(time,handle){
	var that = this;
	this.currentTime += time;
	setTimeout(function(){
		handle && handle.call(that,that.currentElement);	
	},this.currentTime);
	return this;
}


__Case.__Action.prototype.click = function(element,handle){
	var that = this;
	if(!arguments.length){
		var element = this.currentElement;
	}else if(arguments.length == 1){
		if(typeof arguments[0] == "function"){
			var handle = arguments[0];
			var element = this.currentElement;
		}else{
			var element = arguments[0];
		}
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;

	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null); return; }
		try{
			Util.event.fire($(element)[0],"click");
			$(element)[0].click();
			$(element).trigger("click");
			setTimeout(function(){
				Util.event.fire($(element)[0],"click");
				handle && handle.call(that,$(element).get(0));
			},300);
		}catch(e){}
	},this.currentTime);

	return this;
}


__Case.__Action.prototype.clickOnce = function(element,handle){
	var that = this;
	if(!arguments.length){
		var element = this.currentElement;
	}else if(arguments.length == 1){
		if(typeof arguments[0] == "function"){
			var handle = arguments[0];
			var element = this.currentElement;
		}else{
			var element = arguments[0];
		}
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;

	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null); return; }
		try{
			Util.event.fire($(element)[0],"click");
			handle && handle.call(that,$(element).get(0));
		}catch(e){}
	},this.currentTime);

	return this;
}





__Case.__Action.prototype.mousedown = function(element,handle){
	var that = this;
	if(!arguments.length){
		var element = this.currentElement;
	}else if(arguments.length == 1){
		if(typeof arguments[0] == "function"){
			var handle = arguments[0];
			var element = this.currentElement;
		}else{
			var element = arguments[0];
		}
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;
	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null); return; }
		try{
			Util.event.fire($(element)[0],"mousedown");
			$(element).trigger("mousedown");
			handle && handle.call(that,$(element).get(0));
		}catch(e){}
	},this.currentTime);

	return this;
}


__Case.__Action.prototype.mouseup = function(element,handle){
	var that = this;
	if(!arguments.length){
		var element = this.currentElement;
	}else if(arguments.length == 1){
		if(typeof arguments[0] == "function"){
			var handle = arguments[0];
			var element = this.currentElement;
		}else{
			var element = arguments[0];
		}
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;
	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null); return; }
		try{
			Util.event.fire($(element)[0],"mouseup");
			$(element).trigger("mouseup");
			handle && handle.call(that,$(element).get(0));
		}catch(e){}
	},this.currentTime);

	return this;
}


__Case.__Action.prototype.mouseover = function(element,handle){
	var that = this;
	if(!arguments.length){
		var element = this.currentElement;
	}else if(arguments.length == 1){
		if(typeof arguments[0] == "function"){
			var handle = arguments[0];
			var element = this.currentElement;
		}else{
			var element = arguments[0];
		}
	}

	if(!element){ return; }


	this.currentElement = element;

	this.currentTime += 100;
	setTimeout(function(){
		if(!$(element).size()){ handle && handle.call(that,null); return; }
		try{
			Util.event.fire($(element)[0],"mouseover");
			$(element).trigger("mouseover");
			handle && handle.call(that,$(element).get(0));
		}catch(e){}
	},this.currentTime);

	return this;
}

__Case.__Action.prototype.end = function(handle){
	var that = this;
	setTimeout(function(){
		try{ handle && handle.call(that,that.currentElement); }catch(e){};
		that.monitor.complete();
	},that.currentTime + 500);
}

__Case.__Action.prototype.complete = __Case.__Action.prototype.end;



win.__Case.prototype.step = function(action,handler){
	var that = this;
	var actions = action.split("::");
	var type,selector,value,timestamp,$target;

	that.actions++;

	type = actions[0];
	selector = actions[1];
	$target = $(selector);

	if(type === "click"){
		timestamp = parseInt(actions[2],10);
		setTimeout(function(){
			that.actions--;
			if($(selector).size()){
				try{
					Util.event.fire($(selector)[0],"click");
					//$(selector).click();
					$target[0].click();
					$(selector).trigger("click");
					setTimeout(function(){
						Util.event.fire($(selector)[0],"click");
						handler && handler($target[0]);
					},300);
				}catch(e){};
			}else{
				handler && handler(null);
			}

			if(!that.actions){
				that.complete();
			}
		},timestamp);
	}else if(type === "mousedown"){
		timestamp = parseInt(actions[2],10);
		setTimeout(function(){
			that.actions--;
			if($(selector).size()){
				try{
					//$target.mousedown();
					$(selector).trigger("mousedown");
					Util.event.fire($(selector)[0],"mousedown");
					handler && handler($target[0]);
				}catch(e){};
			}else{
				handler && handler(null);
			}

			if(!that.actions){
				that.complete();
			}
		},timestamp);
	}else if(type === "mouseover"){
		timestamp = parseInt(actions[2],10);
		setTimeout(function(){
			that.actions--;
			if($(selector).size()){
				try{
					Util.event.fire($(selector)[0],"mouseover");
					//$target.mouseover();
					//$(selector).trigger("mouseover");
					handler && handler($target[0]);
				}catch(e){};
			}else{
				handler && handler(null);
			}
			if(!that.actions){
				that.complete();
			}
		},timestamp);
	}else if(type === "type"){
		value = actions[2];
		timestamp = parseInt(actions[3],10);
		setTimeout(function(){
			that.actions--;
			if($(selector).size()){
				try{
					$(selector)[0].focus();
					setTimeout(function(){
						$(selector).val(value.replace(/\\"/g,'"')).trigger("change");
						Util.event.fire($(selector)[0],"change");
					},0);
					handler && handler($target[0],value);
				}catch(e){};
			}else{
				handler && handler(null);
			}
			if(!that.actions){
				that.complete();
			}
		},timestamp);
	}else if(type === "wait"){
		timestamp = parseInt(actions[1],10);
		setTimeout(function(){
			that.actions--;
			handler && handler();
			if(!that.actions){
				that.complete();
			}
		},timestamp);
	}
	return that;
}


var sendMessage = function(type,content,Case){
	var img = window["__Monitor_ERROR_IMG" + (+new Date())] = new Image();	
	var useragent = navigator.userAgent;

	window.__CaseData.noreport && __Socket && __Socket.emit("ErrorLogEvent",{
		messageType : "item",
		type : type,
		room : window.__CaseData.room,
		content : content,
		time : Util.tool.getDateTime(),
		resultID : window.__CaseData.resultID
	});
	
	(!window.__CaseData.noreport) && (img.src = "http://" + window.__CaseData.host + "/api/add_error.json?type=" + type + "&content=" + encodeURIComponent(content) + "&t=" + (+new Date()) + (window.__CaseData.url ? "&url=" + encodeURIComponent(window.__CaseData.url) : "") + "&title=" + encodeURIComponent(Case.title || window.__CaseData.title) + "&useragent=" + encodeURIComponent(useragent) + "&uid=" + encodeURIComponent(Case.uid || window.__CaseData.user.uid) + "&device=" + window.__CaseData.device);
}

win.__Case.prototype.sendError = function(err_content){
	//updateCaseStatus("error");
	sendMessage("error",err_content,this);
	this.errorCount++;
	return this;
}

win.__Case.prototype.error = win.__Case.prototype.sendError;

win.__Case.prototype.sendLog = function(err_content){
	//updateCaseStatus("log");
	sendMessage("log",err_content,this);
	this.errorCount++;
	return this;
}

win.__Case.prototype.log = win.__Case.prototype.sendLog;


win.__Case.prototype.sendWarn = function(err_content){
	//updateCaseStatus("warning");
	sendMessage("warn",err_content,this);
	this.errorCount++;
	return this;
}

win.__Case.prototype.warn = win.__Case.prototype.sendWarn;
win.__Case.prototype.warning = win.__Case.prototype.sendWarn;
win.__Case.prototype.sendWarning = win.__Case.prototype.sendWarn;

win.__Case.prototype.sendSMS = function(msg){
	//updateCaseStatus("sms");
	msg = "[" + window.__CaseData.title + "]" + msg;
	var img = window["__Monitor_ERROR_IMG" + (+new Date())] = new Image();
	img.src = "http://" + window.__CaseData.host + "/send.php?type=sms&user=" + encodeURIComponent(this.user) + "&msg=" + encodeURIComponent(msg) + "&t=" + (+new Date());
	sendMessage("sms",msg,this);
	this.errorCount++;
	return this;
}

win.__Case.prototype.sms = win.__Case.prototype.sendSMS;

win.__Case.prototype.sendMail = function(body){
	//updateCaseStatus("mail");
	var subject = "Monitor:[" + this.title + "]";
	var img = window["__Monitor_ERROR_IMG" + (+new Date())] = new Image();
	img.src = "http://" + window.__CaseData.host + "/send.php?type=mail&user=" + encodeURIComponent(this.user) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body) + "&t=" + (+new Date());
	sendMessage("mail",body,this);
	this.errorCount++;
	return this;
}

win.__Case.prototype.mail = win.__Case.prototype.sendMail;


//测试jsonp请求，并验证数据，处理页面逻辑等
win.__Case.prototype.jsonp = function(name,handler){
	var old = null;
	eval("old=" + name);

	var callback = function(data){
		old(data);
		handler(data);
	}

	eval(name + " = callback");
}



/* define、require接口，供Case通用代码机制，跨Case调用通用自定义方法 */
win.__Case.Modules = {};

/*
 * monitor.define("module",function(){var mod = {};  return mod;});
 */
win.__Case.prototype.define = function(name,handle){
	if(__Case.Modules[name]){ alert(name + "已经被使用，请使用其他的Module Name");return; }

	__Case.Modules[name] = handle && handle() || {};
}

/*
 * monitor.require("module",function(module){})
 * monitor.require(["module1","module2"],function(module1,module2){})
 */
win.__Case.prototype.require = function(name,handle){
	var length = arguments.length;

	if(length === 1 && typeof arguments[0] === "function"){
		arguments[0]();
	}else if(length === 2){
		if(typeof arguments[0] === "string"){
			$(window).load(function(){
				handle && handle(__Case.Modules[name]);
			});
		}else{
			$(window).load(function(){
				var args = [];
				for(var i = 0,len = name.length; i < len; i++){
					args.push(__Case.Modules[name[i]]);
				}
				handle && handle.apply(this,args);
			});
		}
	}
}


})(window);


;(function(win){


var Util = {
	ownProperty : function(obj,key){
		return !!obj.hasOwnProperty(key);
	},
	type : function(obj,string){
		if(string === "dom"){
			return obj && obj.nodeName && obj.nodeType;
		}else{
			var type = typeof obj;
			if(type === "object"){
				return Object.prototype.toString.call(obj).replace("[object ","").replace("]","").toLowerCase() === string;
			}else{
				return type === string;
			}
		}
	}
};


var _should = function(val,monitor){

	this.correct = -1;
	this.negate = false;

	this.monitor = monitor
	
	//zepto or jquery
	if(val && ((val.wrapAll && val.wrapInner && val.wrap && val.unwrap) || (val.each && val.addClass && val.css))){
		this.value = [];
		var that = this;
		val.each(function(index,item){
			that.value.push(item);
		});
	}else if(Util.type(val,"object") || Util.type(val,"string") || Util.type(val,"number") || Util.type(val,"dom") || !val){
		this.value = [val];
	}else{
		//NodeList,Array...
		this.value = val;
	}
}

_should.prototype = {
	be: function(){
		return this;
	},
	have: function(){
		return this;
	},
	has: function(){
		return this;
	},
	not: function(){
		this.negate = true;
		return this;
	},
	and: function(){
		return this;
	},
	to : function(){
		return this;
	},
	assert : function(bool){
		var flag = bool;
		this.correct = -1;
		if(this.negate){flag = !bool;}

		if(flag){
			this.correct = 1;
		}else{
			this.correct = 2;
		}

		this.negate = false;
	},
	success : function(success){
		(this.correct == 1) && success && success(this);
		return this;
	},
	fail : function(fail){
		(this.correct === 2) && fail && fail(this);
		return this;
	},
	error : function(content){
		(this.correct === 2) && this.monitor.error(content);
	},
	warn : function(content){
		(this.correct === 2) && this.monitor.warn(content);
	},
	log : function(content){
		(this.correct === 2) && this.monitor.log(content);
	},
	sms : function(content){
		(this.correct === 2) && this.monitor.sms(content);
	},
	mail : function(content){
		(this.correct === 2) && this.monitor.mail(content);
	},
	property : function(prop){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!this.value[i][prop]){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	beTrue:function(){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!this.value[i]){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;		
	},
	beFalse:function(){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(this.value[i]){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	attr : function(at){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!this.value[i].getAttribute(at)){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	ownProperty : function(prop){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!Util.ownProperty(this.value[i],prop)){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	lengthOf : function(num){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!(this.value.length === num)){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	keys : function(arr){
		var bool = true;
		for(var i =0,len = arr.length;i<len;i++){
			for(var j=0;j<this.value.length;j++){
				if(this.value[j].indexOf(arr[i]) === -1){
					bool = false;
					break;
				}
			}
			if(!bool){break;}
		}
		this.assert(bool);
		return this;
	},
	include : function(str){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(Util.type(this.value[i],"object")){
				if(!this.value[str]){
					flag = false;
					break;
				}
			}else{
				if(this.value[i].indexOf(str) === -1){
					flag = false;
					break;
				}
			}
		}
		this.assert(flag);
		return this;
	},
	empty : function(){
		var isEmpty = true;
		for(var i=0;i<this.value.length;i++){
			if(Util.type(this.value[i],"object")){
				for(var key in this.value[i]){
					if(Util.ownProperty(this.value[i],key)){
						isEmpty = false;
						break;
					}
				}
			}else if(Util.type(this.value[i],"array")){
				isEmpty = this.value[i].length === 0;
			}else if(Util.type(this.value[i],"dom")){
				isEmpty = this.value[i].innerHTML === "";
			}else{
				isEmpty = this.value[i] === "";
			}
			if(!isEmpty){break;}
		}
		this.assert(isEmpty);
		return this;
	},
    a : function(string){
    	var flag = true;
    	for(var i=0;i<this.value.length;i++){
    		if(!Util.type(this.value[i],string)){
    			flag = false;
    			break;
    		}
    	}
    	this.assert(flag);
    	return this;
	},
	above : function(num){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(this.value[i] < num){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	below : function(num){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(this.value[i] >= num){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	equal : function(obj){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(this.value[i] !== obj){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	exist : function(){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!this.value[i]){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	match : function(reg){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if(!reg.test(this.value[i])){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;
	},
	child : function(elem){
		this.assert(elem && this.value[0] && elem.parentNode == this.value[0]);
		return this;
	},
	parent : function(elem){
		this.assert(elem && this.value[0] && this.value[0].parentNode == elem);
		return this;
	},
	next : function(elem){
		this.assert(elem && this.value[0] && this.value[0].nextSibling == elem);
		return this;
	},
	prev : function(elem){
		this.assert(elem && this.value[0] && this[0].value.previousSibling == elem);
		return this;
	},
	visible : function(){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if($(this.value[i]).css("display") == "none"){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;		
	},
	hide : function(){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			if($(this.value[i]).css("display") != "none"){
				flag = false;
				break;
			}
		}
		this.assert(flag);
		return this;		
	},
	haveHrefKeys : function(keys){
		var flag = true;
		for(var i=0;i<this.value.length;i++){
			for(var key in keys){
				if(keys.hasOwnProperty(key)){
					var reg = new RegExp(key + "=([^&]+)");

					if(!reg.test($(this.value[i]).attr("href"))){
						flag = false;
						break;
					}

					if(keys[key] && (keys[key] != decodeURIComponent(RegExp.$1))){
						flag = false;
						break;
					}
				}
			}

			if(!flag){ break; }
		}
		this.assert(flag);
		return this;		
	},
	haveHrefKey : function(key,value){
		var flag = true;
		var reg = new RegExp(key + "=([^&]+)");
		for(var i=0;i<this.value.length;i++){
			if(!reg.test($(this.value[i]).attr("href"))){
				flag = false;
				break;
			}

			if(value && (decodeURIComponent(RegExp.$1) != value)){
				flag = false;
				break;
			}
		}

		this.assert(flag);
		return this;		
	},
	haveFormKeys : function(keys){
		var flag = true,$elem;
		for(var i=0;i<this.value.length;i++){
			for(var key in keys){
				if(keys.hasOwnProperty(key)){
					$elem = $(this.value[i]).find("[name=" + key + "]");
					if($elem.size()){
						if($elem.val() != keys[key]){
							flag = false;
							break;
						}
					}else{
						flag = false;
						break;
					}
				}
			}

			if(!flag){ break; }
		}

		this.assert(flag);
		return this;
	},
	haveFormKey : function(key,value){
		var flag = true,$elem;
		for(var i=0;i<this.value.length;i++){
			$elem = $(this.value[i]).find("[name=" + key + "]");
			if($elem.size()){
				if($elem.val() != value){
					flag = false;
					break;
				}
			}else{
				flag = false;
				break;
			}
		}

		this.assert(flag);
		return this;			
	}
}

_should.prototype.hasOwnProperty = _should.prototype.ownProperty;
_should.prototype.beLengthOf = _should.prototype.lengthOf;
_should.prototype.haveKeys = _should.prototype.keys;
_should.prototype.hasKeys = _should.prototype.keys;
_should.prototype.beEmpty = _should.prototype.empty;	
_should.prototype.haveAttr = _should.prototype.attr;
_should.prototype.hasAttr = _should.prototype.attr;
_should.prototype.haveProperty = _should.prototype.property;
_should.prototype.hasProperty = _should.prototype.property;
_should.prototype.beA = _should.prototype.a;
_should.prototype.beAbove = _should.prototype.above;
_should.prototype.beBelow = _should.prototype.below;
_should.prototype.beEqual = _should.prototype.equal;
_should.prototype.beMatch = _should.prototype.match;
_should.prototype.haveChild = _should.prototype.child;
_should.prototype.hasChild = _should.prototype.child;
_should.prototype.haveParent = _should.prototype.parent;
_should.prototype.hasParent = _should.prototype.parent;
_should.prototype.haveNext = _should.prototype.next;
_should.prototype.hasNext = _should.prototype.next;
_should.prototype.havePrev = _should.prototype.prev;
_should.prototype.hasPrev = _should.prototype.prev;

_should.prototype.beTrues = _should.prototype.beTrue;
_should.prototype.beFalses = _should.prototype.beFalse;

_should.prototype.beVisible = _should.prototype.visible;
_should.prototype.beHide = _should.prototype.hide;

_should.prototype.hasHrefKeys = _should.prototype.haveHrefKeys;
_should.prototype.hasHrefKey = _should.prototype.haveHrefKey;

_should.prototype.hasFormKeys = _should.prototype.haveFormKeys;
_should.prototype.hasFormKey = _should.prototype.haveFormKey;

win.__Case.should = _should;








// #####################  Selenium Python Case API  #####################

win.__Case._WebElement = function(elem){
	this.elements = elem || null;
}

win.__Case._WebElement.prototype = {
	find_element_by_name : function(name,flag){
		var elem = this.elements || "html";
		var count = flag ? null : 0;
		this.elements = $(elem).find("[name=" + name + "]").get(count);
		return this;
	},
	find_elements_by_name : function(name){
		this.find_element_by_name(name,true);
		return this;
	},
	find_element_by_id : function(id){
		var elem = this.elements || "html";
		this.elements = $(elem).find("#" + id).get(0);
		return this;		
	},
	find_element_by_tag_name : function(tagName,flag){
		var elem = this.elements || "html";
		var count = flag ? null : 0;
		this.elements = $(elem).find(tagName).get(count);
		return this;			
	},
	find_elements_by_tag_name : function(tagName){
		this.find_element_by_tag_name(tagName,true);
		return this;
	},
	find_element_by_class_name : function(classname,flag){
		var elem = this.elements || "html";
		var count = flag ? null : 0;
		this.elements = $(elem).find(classname).get(count);
		return this;		
	},
	find_elements_by_class_name : function(classname){
		this.find_element_by_class_name(classname,true);
		return this;
	},
	find_element_by_link_text : function(text,flag){
		var elem = this.elements || "html";
		var target = [];
		var bool = false;
		$(elem).find("a").each(function(index,item){
			if(flag){
				if($.trim($(item).text()) === text){
					target.push(item);
				}				
			}else{
				if(bool){ return; }
				if($.trim($(item).text()) === text){
					target.push(item);
					bool = true;
				}
			}
		});
		this.elements = target;
		return this;
	},
	find_elements_by_link_text : function(text){
		this.find_elements_by_link_text(text,true);
		return this;
	},
	find_element_by_partial_link_text : function(text,flag){
		var elem = this.elements || "html";
		var target = [];
		var bool = false;
		$(elem).find("a").each(function(index,item){
			if(flag){
				if($.trim($(item).text()).indexOf(text) !== -1){
					target.push(item);
				}				
			}else{
				if(bool){ return; }
				if($.trim($(item).text()).indexOf(text) !== -1){
					target.push(item);
					bool = true;
				}
			}
		});
		this.elements = target;
		return this;
	},
	find_elements_by_partial_link_text : function(text){
		this.find_element_by_partial_link_text(text,true);
		return this;
	},
	find_element_by_css_selector : function(selector,flag){
		var elem = this.elements || "html";
		var count = flag ? null : 0;
		this.elements = $(elem).find(selector).get(count);
		return this;			
	},
	find_elements_by_css_selector : function(selector){
		this.find_element_by_css_selector(selector,true);
		return this;
	},
	find_element_by_xpath : function(xpath,flag){
		var results = document.evaluate("//button",document,null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		var  i = 0,res = null,bool = false,target = [];
		while((res = results.snapshotItem(i)) != null){
			i++;
			if(flag){
				target.push(res);
			}else{
				if(bool){ return; }
				target.push(res);
				bool = true;
			}
		}
		return;
	},
	find_elements_by_xpath : function(xpath){
		this.find_element_by_xpath(xpath,true);
		return this;
	},
	find_element : function(type,value,flag){
		switch(type){
			case 1 :
				this.find_element_by_id(value);
				break;
			case 2 :
				this.find_element_by_class_name(value,flag);
				break;
			case 3 :
				this.find_element_by_name(value,flag);
				break;
			case 4 :
				this.find_element_by_tag_name(value,flag);
				break;
			case 5 :
				this.find_element_by_link_text(value,flag);
				break;
			case 6 :
				this.find_element_by_partial_link_text(value,flag);
				break;
			case 7 :
				this.find_element_by_css_selector(value,flag);
				break;
			case 8 :
				this.find_element_by_xpath(value,flag);
				break;
		}
		return this;
	},
	find_elements : function(type,value){
		this.find_element(type,value,true);
		return this;
	},
	each : function(fn){
		var that = this;
		$(this.elements).each(function(index,item){
			fn.call(that,index,item);
		})
		return this;
	},
	get_attribute : function(attr){
		return $(this.elements).attr(attr);
	},
	send_keys : function(value){
		$(this.elements).val(value);
		return this;
	},
	send_keys_to_element : function(elem,value){
		$(elem).val(value);
		return this;
	},
	clear : function(){
		$(this.elements).val("");
		return this;
	},
	get_elements : function(){
		return $(this.elements).get();
	},
	get_text : function(){
		return $(this.elements).text();
	},
	click : function(){
		$(this.elements).each(function(index,item){
			Util.event.fire(item,"click");
			item.click();
			$(item).trigger("click");
		});
		return this;
	},
	submit : function(){
		$(this.elements).each(function(index,item){
			item.submit();
		});
		return this;		
	}
}



win.__Case._WebDriver = {};

win.__Case._WebDriver.By = {
	"ID" : 1,
	"CLASS_NAME" : 2,
	"NAME" : 3,
	"TAG_NAME" : 4,
	"LINK_TEXT" : 5,
	"PARTIAL_LINK_TEXT" : 6,
	"CSS_SELECTOR" : 7,
	"XPATH" : 8
}

win.__Case._WebDriver.execute_script = function(code){
	var func = new Function(code),args = [];
	if(arguments.length !== 1){
		for(var i = 1;i < arguments.length;i++){
			args.push(arguments[i]);
		}
	}
	return func.apply(this,args);
}


for(var key in win.__Case._WebElement.prototype){
	win.__Case._WebDriver[key] = (function(k){ 
		return function(){
			var webelement = new win.__Case._WebElement();
			webelement[k].apply(webelement,arguments);
			return webelement;
		}
	})(key);
}

})(window);
