var Mysql = require("../mysql");



exports.showPage = function(req,res){

	var uid = req.body.uid,
		url = req.body.url,
		title = req.body.title,
		position = req.body.position,
		code = req.body.code,
		type = req.body.type,
		charset = req.body.charset,
		sw = req.body.sw || 0,
		device = req.body.device,
		cid = req.body.cid;

	if(cid){
		var mysql = new Mysql();
		console.log(url);
		mysql.update("all_cases",{
			uid : uid,
			url : url,
			title : title,
			position : position,
			code : code,
			charset : charset,
			device : device,
			"switch" : sw,
			type : type
		},{ id : cid },function(result){
			mysql.end();
			res.send(200,{status : 0});
		});
	}else{
		res.send(200,{status : -1,error : "缺少字段，请查看"});
	}
}