var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var name = req.query.name;

	if(!name){
		res.send(200,{ status : -1, error : "用户名不能为空"});
		return;
	}

	var mysql = new Mysql();

	mysql.hasRecord("all_users",{ user : name },function(results){
		if(results.length){
			res.send(200,{status : 0,data : results});
		}else{
			res.send(200,{status : -1,error : "无结果"});
		}
	}).end();
}