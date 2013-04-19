var http = require("http"),
	Util = require("../util").Util,
	url = require("url"),
	async = require("async"),
	BufferHelper = require("bufferhelper"),
	setting = require("../setting");

exports.showPage = function(req,res){
	var token = req.query.token,
		cid = req.query.cid,
		currentCase,
		allGlobalCases,
		pageContent,
		room = req.query.room || "",
		noReport =req.query.noreport || "",
		resultID = Util.randomString(16);

	if(!token && !cid){ res.send("Token或者单侧ID不能为空"); return; }


	async.series([function(callback){  // 获取到当前的单侧内容
		var url = "http://" + setting.site.domain;
		url += token ? "/api/get_case_by_token.json?token=" + token : "/api/get_case_by_id.json?cid=" + cid;
		console.log(url);
		http.get(url ,function(response){
			var caseContent = "";
			response.on("data",function(data){
				caseContent += data.toString();
			});
			response.on("end",function(){
				//if(!caseContent){ res.send(200,"不存在该单侧的内容"); return; }
				var temp = caseContent && JSON.parse(caseContent) || {};
				currentCase = temp.data[0] || {};
				callback(null);
			});
		});
	},function(callback){  // 获取到全部的通用测试单侧内容
		http.get("http://" + setting.site.domain + "/api/get_global_cases.json?device=" + currentCase.device,function(response){
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
		var pageUrl = currentCase.url;

		if(!pageUrl){ res.send("单侧URL为空"); return;}

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
				
				pageContent = Util.getPageContent(currentCase.charset,buffers);

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

		// 插入当前测试代码
		pageContent = Util.injectCode(pageContent,currentCase);

		//插入一些基础库的代码
		pageContent = Util.injectCode(pageContent,{
			position : 1,
			code : "<script charset='utf-8' src='http://" + setting.site.domain + "/js/jquery-1.8.2.min.js'></script><script charset='utf-8' src='http://" + setting.site.domain + "/js/monitor.js?v=3.0.3'></script><script src='http://" + setting.site.domain + "/socket.io/socket.io.js'></script><script>var __Socket=io.connect('http://" + setting.site.domain + "');</script><script>if(document.addEventListener){document.addEventListener('click',function(e){var target = e.target;if(target.tagName.toLowerCase()==='a'){try{e.preventDefault();}catch(e){}}},false);}</script>" + "<script class='monitor-script'>var __CaseData={resultID:'" + resultID + "',device:'" + currentCase.device + "',noreport:'" + noReport + "',room:'" + room + "',host:'" + setting.site.domain + "',caseID:-1,user:{uid:'" + currentCase.uid + "'},title:'" + currentCase.title + "',url:'" + currentCase.url + "'};__Socket.emit('ErrorLogEvent',{messageType:'title',title:'" + currentCase.title + "',url:'" + currentCase.url + "',userAgent:window.navigator.userAgent,room:window.__CaseData.room,resultID:window.__CaseData.resultID});</script>"
		});
		
		res.send(200,pageContent);

	}],function(err,results){});
};