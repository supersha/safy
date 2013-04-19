var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var pn = parseInt(req.query.pn,10) || 1,
		rn = 100000,
		uid = req.query.uid,
		title = req.query.title;

	if(uid && title){
		var mysql = new Mysql(),
			offsetIndex = (pn - 1) * rn,
			allCases;

		mysql.selectAllKeys("all_cases",null,function(results){
			allCases = results;

			mysql.query("select * from all_cases where uid=" + uid + " and title like '%" + title + "%' order by id DESC limit " + offsetIndex + "," + rn,function(results){
				if(results.length){
					res.send(200,{status : 0,total : allCases.length,data : results});
				}else{
					res.send(200,{status : -1,error : "无结果"});
				}

				mysql.end();
			});
		});
	}else{
		res.send(200,{status : -1,error : "似乎发生了一些错误，请检查"});
	}
}