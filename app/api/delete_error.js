var Mysql = require("../mysql");

exports.showPage = function(req,res){
	var eid = req.query.eid;

	if(eid){
		var mysql = new Mysql();

		mysql.query("delete from all_errors where id=" + eid,function(){
			mysql.end();
			res.send(200,{status :0});
		});
	}else{
		res.send(200,{status : -1,error : "Error ID不能为空"});
	}
}