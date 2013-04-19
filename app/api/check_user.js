var Mysql = require("../mysql");

exports.showPage = function(req,res){
	var user = req.query.user,
		password = req.query.password;

	var mysql = new Mysql();

	mysql.hasRecord("all_users",{user : user,password : password},function(results){
		mysql.end();
		res.send(200,{status : results ? 0 : -1, error : results ? "" : "该用户名不存在",data : results[0]});
	});
}