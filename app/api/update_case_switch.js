var Mysql = require("../mysql");



exports.showPage = function(req,res){
	var cid = req.query.cid,
		sw = req.query.sw;

	var mysql = new Mysql();
	mysql.update("all_cases",{ "switch" : sw },{ id : cid },function(result){
		res.send(200,{status : 0});
	}).end();
}