var http = require("http"),
	Util = require("../util").Util,
	url = require("url"),
	async = require("async"),
	BufferHelper = require("bufferhelper"),
	setting = require("../setting");

exports.showPage = function(req,res){
	var pageUrl = req.query.url,
		device = req.query.device || "1",
		allGlobalCases,
		pageContent = "",
		room = req.query.room || "",
		noReport =req.query.noreport || "",
		resultID = Util.randomString(16);

	if(!pageUrl){ res.send("URL不能为空"); return; }


	async.series([function(callback){  // 获取到全部的通用测试单侧内容
		http.get("http://" + setting.site.domain + "/api/get_global_cases.json?device=" + device,function(response){
			var caseContent = "";
			response.on("data",function(data){
				caseContent += data.toString();
			});
			response.on("end",function(){
				var temp = JSON.parse(caseContent);
				allGlobalCases = temp.data || [];
				callback(null);
			});
		});		
	},function(callback){  // 请求当前测试的网页内容
		var info = url.parse(pageUrl),
			path = info.pathname + (info.search || ''),
			options = {
				host : info.hostname,
				port : info.port || 80,
				path : path,
				method : 'GET'
			}

		var request = http.request(options,function(response){
			var bufferHelper = new BufferHelper();

			response.on("data",function(chunk){
				bufferHelper.concat(chunk);
			});

			response.on("end",function(){
				var buffers = bufferHelper.toBuffer();
				
				pageContent = Util.getPageContent(null,buffers);

				if(!pageContent){ res.send(200,{ status : -1,error : "网页内容为空"}); return;}

				if(!(/<base/).test(pageContent)){
					pageContent = pageContent.replace("</head>","<base href='" + info.protocol + "//" + info.hostname + "'></head>");
				}
				callback(null);
			});
		});
		request.end();

	},function(callback){  // 插入当前单侧代码和通用测试到页面内容中
		// 把通用测试插入到页面中
		allGlobalCases.forEach(function(item,index){
			pageContent = Util.injectCode(pageContent,item);
		});

		//插入一些基础库的代码
		pageContent = Util.injectCode(pageContent,{
			position : 1,
			code : "<script charset='utf-8' src='http://" + setting.site.domain + "/js/jquery-1.8.2.min.js'></script><script charset='utf-8' src='http://" + setting.site.domain + "/js/monitor.js?v=3.0.3'></script><script src='http://" + setting.site.domain + "/socket.io/socket.io.js'></script><script>var __Socket=io.connect('http://" + setting.site.domain + "');</script><script>if(document.addEventListener){document.addEventListener('click',function(e){var target = e.target;if(target.tagName.toLowerCase()==='a'){try{e.preventDefault();}catch(e){}}},false);}</script>" + "<script class='monitor-script'>var __CaseData={resultID:'" + resultID + "',device:'" + device + "',noreport:'" + noReport + "',room:'" + room + "',host:'" + setting.site.domain + "',caseID:-1,user:{uid:'" + (req.cookies.uid || "-1") + "'},title:'URL测试',url:'" + pageUrl + "'};__Socket.emit('ErrorLogEvent',{messageType:'title',title:'URL测试',url:'" + pageUrl + "',userAgent:window.navigator.userAgent,room:window.__CaseData.room,resultID:window.__CaseData.resultID});</script>"
		});
		
		res.send(200,pageContent);

	}],function(err,results){});
};