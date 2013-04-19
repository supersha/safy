var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var cid = req.query.cid;

	if(!cid){
		res.send(200,{ status : -1, error : "Cid不能为空"});
		return;
	}

	var mysql = new Mysql();

	mysql.selectAllKeys("all_cases",{ id : cid },function(results){
		if(results.length){
			res.send(200,{status : 0,data : results});
		}else{
			res.send(200,{status : -1,error : "无结果"});
		}
	}).end();
}