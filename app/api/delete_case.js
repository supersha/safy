var Mysql = require("../mysql");

exports.showPage = function(req,res){
	var cid = req.query.cid;

	if(cid){
		var mysql = new Mysql();

		mysql.query("delete from all_cases where id=" + cid,function(){
			mysql.end();
			res.send(200,{status :0});
		});
	}else{
		res.send(200,{status : -1,error : "单侧ID不能为空"});
	}
}