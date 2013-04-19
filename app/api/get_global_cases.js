var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var device = req.query.device || 1;
	var mysql = new Mysql();

	mysql.selectAllKeys("all_cases",{ type : 2 ,"switch" : 0, device : device },function(results){
		if(results.length){
			res.send(200,{status : 0,data : results});
		}else{
			res.send(200,{status : -1,error : "无结果"});
		}
	}).end();
}