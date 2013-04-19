var http = require("http"),
	Mysql = require("../mysql"),
	Util = require("../util").Util,
	url = require("url"),
	util = require("util"),
	async = require("async"),
	BufferHelper = require("bufferhelper"),
	setting = require("../setting");


exports.showPage = function(req,res){
	var pageUrl = req.body.url,
		position = req.body.position,
		code = req.body.code,
		charset = req.body.charset,
		type = req.body.type,
		title = req.body.title,
		device = req.body.device,
		allGlobalCases;

	if(!pageUrl){ res.send(200,{status : -1,error : "URL不能为空"}); return; }

	var info = url.parse(pageUrl), 
		path = info.pathname + (info.search || ''), 
		options = { 
			host: info.hostname, 
            port: info.port || 80, 
            path: path, 
            method: 'GET' 
        };

    var request = http.request(options,function(response){
		var bufferHelper = new BufferHelper();

		response.on("data",function(buffer){
			bufferHelper.concat(buffer);
		});

		response.on("end",function(){
			var urlData = url.parse(pageUrl),
				buffers = bufferHelper.toBuffer();

			var pageContent = Util.getPageContent(charset,buffers);

			if(!pageContent){ res.send(200,{ status : -1,error : "网页内容为空"}); return;}

			if(!(/<base/).test(pageContent)){
				pageContent = pageContent.replace("</head>","<base href='" + urlData.protocol + "//" + urlData.hostname + "'></head>");
			}

			async.series([
				function(callback){  // 插入全部通测的单侧代码
					http.get("http://" + setting.site.domain + "/api/get_global_cases.json?device=" + device,function(response){
						var caseContent = "";
						response.on("data",function(data){
							caseContent += data.toString();
						});
						response.on("end",function(){
							var temp = JSON.parse(caseContent);
							allGlobalCases = temp.data || [];

							allGlobalCases.forEach(function(item,index){
								pageContent = Util.injectCode(pageContent,item);
							});
							callback(null);
						});
					});
				},
				function(callback){
					// 插入当前单侧代码，如果是通测，则不进行代码插入
					if(type != "2"){
						pageContent = Util.injectCode(pageContent,{
							url : pageUrl,
							title : title || "Preview",
							code : code,
							type : type,
							position : position,
							charset : charset
						});
					}

					// 插入覆盖motinor.js中的方法
					pageContent = Util.injectCode(pageContent,{
						position : 1,
						code : "<script class='monitor-script'>window.__Case.prototype.error=window.__Case.prototype.sendError=function(err){alert('error:' + err);};window.__Case.prototype.sms=window.__Case.prototype.sendSMS=function(msg){alert('sms:' + msg);};window.__Case.prototype.mail=window.__Case.prototype.sendMail=function(body){alert('mail:' + body);};window.__Case.prototype.log=window.__Case.prototype.sendLog=function(log){alert('log:' + log);};window.__Case.prototype.warning=window.__Case.prototype.warn=window.__Case.prototype.sendWarn=function(log){alert('warning:' + log);};</script><script>window.onerror=function(){alert('页面有js错误，请检查');};</script>"
					});

					// 插入一些基础库的代码
					pageContent = Util.injectCode(pageContent,{
						position : 1,
						code : "<script charset='utf-8' src='http://" + setting.site.domain + "/js/jquery-1.8.2.min.js'></script><script charset='utf-8' src='http://" + setting.site.domain + "/js/monitor.js?v=3.0.3'></script><script>if(document.addEventListener){document.addEventListener('click',function(e){var target = e.target;if(target.tagName.toLowerCase()==='a'){try{e.preventDefault();}catch(e){}}},false);}</script>" + "<script class='monitor-script'>var __CaseData={host:'" + setting.site.domain + "',caseID:-1,user:{name:'" + req.cookies.uname + "'},title:'" + title + "',url:'" + pageUrl + "'};</script>"
					});
					callback(null,2);
				},
				function(callback){
					res.send(200,pageContent);
					callback(null,3);
				}
			]);
		});

		response.on("error",function(e){
			console.log("Got error: " + e.message);
			res.send(e.message);
		});
	});
	request.end();
}