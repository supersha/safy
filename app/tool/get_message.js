var setting = require("../setting");

exports.showPage = function(req,res){
	var room = req.query.room;

	var html = '<!doctype html><html><head><meta charset="utf-8"><title>SocketIO Message Center</title><style>body{font-size:12px;margin:0;padding:0 10px 10px;}.item{margin-left:15px;margin-bottom:6px;}.title{margin-top:15px;margin-bottom:8px;font-size:13px;line-height:18px;}.subtitle{font-size:12px;margin:10px 0 6px 15px;}.ua{font-size:12px;}.info{color:#666;}.error,.sms,.mail{color:#b94a48;}.warn{color:#c09853;}.log{color:#3a87ad;}</style></head><body><div id="results"></div><script src="/js/jquery-1.8.2.min.js"></script><script src="/socket.io/socket.io.js"></script><script>var host="http://' + setting.site.domain + '";var room="' + room + '";</script><script src="/js/message.js"></script></body></html>';

	res.send(200,html);
}