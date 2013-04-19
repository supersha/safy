var http = require("http"),
	Util = require("../util").Util,
	url = require("url"),
	BufferHelper = require("bufferhelper"),
	setting = require("../setting");


exports.showPage = function(req,res){
	var pageUrl = req.query.url,
		pageContent = "";

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

			var pageContent = Util.getPageContent(null,buffers);

			if(!pageContent){ res.send(200,{ status : -1,error : "网页内容为空"}); return;}

			if(!(/<base/).test(pageContent)){
				pageContent = pageContent.replace("</head>","<base href='" + urlData.protocol + "//" + urlData.hostname + "'></head>");
			}

			var afterHTML = '<style>#selector-tip{z-index:100000;padding:4px 8px;border:1px solid #ccc;color:#fff;background:#000;position:absolute;display:none;font-size:13px;opacity:0.8;}#selector-tip-content{margin-right:6px;}</style><div id="selector-tip" data-notip="true"><span id="selector-tip-content"></span><input type="button" value="验证" id="selector-tip-btn"><input type="button" value="验证文本" id="text-valid-btn"><input type="button" value="验证存在" id="selector-exist-btn"><input type="button" value="验证显示" id="selector-display-btn"></div><script src="http://' + setting.site.domain + '/js/jquery-1.8.2.min.js"></script><script>$(document).click(function(e){e = window.event || e;var target = e.srcElement || e.target;if(target.tagName.toLowerCase()=="a"){try{e.preventDefault();}catch(e){}}});</script><script src="http://' + setting.site.domain + '/js/get_selector.js"></script><script src="http://' + setting.site.domain + '/js/selector_tip.js" charset="utf-8"></script><script>window.startGetSelector();</script>';

			res.send(200,pageContent + afterHTML);
		});

		response.on("error",function(e){
			res.send(200,e.message);
		});
	});
	request.end();
}