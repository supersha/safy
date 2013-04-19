var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var token = req.query.token;

	if(!token){
		res.send(200,{ status : -1, error : "Token不能为空"});
		return;
	}

	var mysql = new Mysql();

	mysql.selectAllKeys("all_cases",{ token : token,"switch" : 0 },function(results){
		if(results.length){
			res.send(200,{status : 0,data : results});
		}else{
			res.send(200,{status : -1,error : "无结果"});
		}
	}).end();
}