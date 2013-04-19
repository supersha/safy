var Mysql = require("../mysql");


exports.showPage = function(req,res){
	var eid = req.query.eid,
		status = req.query.status;

	var mysql = new Mysql();
	mysql.update("all_errors",{status : status},{id : eid},function(){
		res.send(200,{ status : 0 });
	}).end();
}