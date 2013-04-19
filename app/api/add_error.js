var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){

	var uid = req.query.uid,
		url = req.query.url,
		title = req.query.title,
		content = req.query.content,
		type = req.query.type,
		useragent = req.query.useragent,
		device = req.query.device;

	try{
		var mysql = new Mysql();

		mysql.insert("all_errors",{
			uid : uid,
			url : url,
			title : title,
			content : content,
			useragent : useragent,
			device : device,
			type : type,
			token : Util.randomString(32),
			adddate : Util.getDateTime()
		},function(result){
			mysql.end();
			res.send(200,{status : 0});
		});
		
	}catch(e){
		res.send(200,{status : -1,error : e.message});
	}
}