var Mysql = require("../mysql");

exports.showPage = function(req,res){
	var eid = req.query.eid;

	var mysql = new Mysql();

	mysql.selectAllKeys("all_errors",{id : eid },function(results){
		if(results.length){
			res.send(200,{ status : 0, data : results[0] });
		}else{
			res.send(200,{status : -1,error : "不存在该错误记录"})
		}
	}).end();
}