var iconv = require("iconv-lite");

exports.Util = {
	getPassport : function(req,res){
		var loginUser = req.cookies.uname,passport = {};
		if(loginUser){
			passport['user'] = loginUser;
			passport['isLogin'] = true;
			passport['uid'] = req.cookies.uid;
		}
		return passport;
	},
	checkLogined : function(req,res){
		if(!req.cookies.uname){
			res.redirect(302,"/login");
		}
	},
	randomString : function (length) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	    length = length || 32;

	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    return str;
	},
	getDateTime : function(d){
		var date = d ? (new Date(d)) : (new Date());
		return [date.getFullYear(),date.getMonth() + 1,date.getDate()].join("-") + " " + [date.getHours(),date.getMinutes(),date.getSeconds()].join(":");
	},
	getPageContent : function(charset,buffers){
		var pageContent = "";
		//如果选择的是gbk编码，则进行转码操作
		if((charset && charset == "2") || !this.isUtf8(buffers)){
			pageContent = iconv.decode(buffers,"gbk");
		}else{
			pageContent = buffers.toString();
		}
		return pageContent;
	},
	isUtf8 : function(bytes) {
	    var i = 0;
	    while(i < bytes.length) {
	        if((// ASCII
	            bytes[i] == 0x09 ||
	            bytes[i] == 0x0A ||
	            bytes[i] == 0x0D ||
	            (0x20 <= bytes[i] && bytes[i] <= 0x7E)
	        )) {
	            i += 1;
	            continue;
	        }
	        
	        if((// non-overlong 2-byte
	            (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
	            (0x80 <= bytes[i+1] && bytes[i+1] <= 0xBF)
	        )) {
	            i += 2;
	            continue;
	        }
	        
	        if(
	            (// excluding overlongs
	                bytes[i] == 0xE0 &&
	                (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
	                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
	            ) || (// straight 3-byte
	                ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
	                bytes[i] == 0xEE ||
	                bytes[i] == 0xEF) &&
	                (0x80 <= bytes[i + 1] && bytes[i+1] <= 0xBF) &&
	                (0x80 <= bytes[i+2] && bytes[i+2] <= 0xBF)
	            ) || (// excluding surrogates
	                bytes[i] == 0xED &&
	                (0x80 <= bytes[i+1] && bytes[i+1] <= 0x9F) &&
	                (0x80 <= bytes[i+2] && bytes[i+2] <= 0xBF)
	            )
	        ) {
	            i += 3;
	            continue;
	        }
	        
	        if(
	            (// planes 1-3
	                bytes[i] == 0xF0 &&
	                (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
	                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
	                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
	            ) || (// planes 4-15
	                (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
	                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
	                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
	                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
	            ) || (// plane 16
	                bytes[i] == 0xF4 &&
	                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
	                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
	                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
	            )
	        ) {
	            i += 4;
	            continue;
	        }
	        return false;
	    }
	    return true;
	},
	injectCode : function(pageContent,Case){
		var content = pageContent,
			codeContent = this.mergeCaseCodeString(Case),
			position = Case.position;

		//1:Head前
		//2:Body后
		//3:Body前
		//4：Head后
		if(position == "1"){
			content = content.replace("<head>","<head>" + codeContent);
		}else if(position == "2"){	//Body	
			content += codeContent;
		}else if(position == "4"){
			content = content.replace("</head>",codeContent + "</head>");
		}else if(position == "3"){
			content = content.replace(/(<body[^>]*>)/,"$1" + codeContent);
		}
		return content;
	},
	mergeCaseCodeString : function(Case){
		var code = Case.code,
			before = "<script class='monitor-script'>;(function(window,document,undefined){var monitor = new __Case('" + (Case.title && Case.title.replace(/'/g,"\\'") || "") + "','" + Case.uid + "');var should=function(obj){return new window.__Case.should(obj,monitor);};var driver=__Case._WebDriver;var By=__Case._WebDriver.By;\n",
			after = "\n})(window,window.document,undefined);</script>";

		if((/<\/script>/).test(code)){ return code; }

		if((/monitor\.step/).test(code) && !(/monitor\.createAction/).test(code)){
			if(!(/\.complete\(\)/).test(code)){
				code += "\n;monitor.complete();";
			}
		}

		if(!(/monitor\.run/).test(code)){
			code = "\nmonitor.run(function(){\n" + code + "\n});";
		}
		return before + code + after;
	},
	formatJSON : function(txt,compress/*是否为压缩模式*/){	/* 格式化JSON源码(对象转换为JSON文本) */  
	    var indentChar = '    ';   
	    if(/^\s*$/.test(txt)){   
	        console.log('数据为空,无法格式化! ');
	        return;   
	    }   
	    try{ var data = eval('(' + txt + ')'); }   
	    catch(e){   
	        console.log('数据源语法错误,格式化失败! 错误信息: ' + e.description,'err');   
	        return;   
	    };   

	    var draw = [],
	    	last = false,
	    	This = this,
	    	line = compress ? '' : '\n',
	    	nodeCount = 0,
	    	maxDepth = 0;
	       
	    var notify=function(name,value,isLast,indent/*缩进*/,formObj){   
	        nodeCount++;/*节点计数*/  
	        for (var i = 0,tab = ''; i < indent; i++ ) tab += indentChar;/* 缩进HTML */  
	        tab = compress ? '' : tab;/*压缩模式忽略缩进*/  
	        maxDepth = ++indent;/*缩进递增并记录*/ 

	        if(value && value.constructor == Array){/*处理数组*/  
	            draw.push(tab + (formObj ? ('"' + name + '" : ') : '') + '[' + line);/*缩进'[' 然后换行*/  

	            for (var i = 0; i < value.length; i++)   
	                notify(i,value[i],i == value.length-1,indent,false);   
	            
	            draw.push(tab + ']' + (isLast ? line : (',' + line)));/*缩进']'换行,若非尾元素则添加逗号*/  
	        }else if(value && typeof value == 'object'){/*处理对象*/  
	                draw.push(tab + (formObj ? ('"' + name + '" : ') : '') + '{' + line);/*缩进'{' 然后换行*/  
	                var len = 0, i = 0;   
	                for(var key in value) len++;   
	                for(var key in value) notify(key,value[key],++i == len,indent,true); 

	                draw.push(tab + '}' + (isLast ? line : (',' + line)));/*缩进'}'换行,若非尾元素则添加逗号*/  
	            }else{   
	                if(typeof value == 'string') value = '"' + value + '"';   
	                draw.push(tab + (formObj ? ('"' + name + '" : ') : '') + value + (isLast ? '' : ',') + line);   
	            };   
	    };   
	    var isLast = true, indent = 0;   
	    notify('',data,isLast,indent,false);   
	    return draw.join('');   
	}
}