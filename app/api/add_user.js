var Mysql = require("../mysql"),
	Util = require("../util").Util;



exports.showPage = function(req,res){
	var user = req.query.user,
		password = req.query.password,
		edit = req.query.edit,
		email = req.query.email;

	var mysql = new Mysql();

	if(edit){
		mysql.update("all_users",{user : user,password : password,email : email},{user : user},function(result){
			res.send(200,{status : 0});
		});
	}else{ // add a user
		mysql.hasRecord("all_users",{user : user},function(exist){
			if(exist){
				res.send(200,{status : -1 ,error : "该用户名已存在，请重新输入"});
				return;
			}
		});

		mysql.insert("all_users",{user : user, password : password,email : email,adddate : Util.getDateTime()},function(result){
			res.send(200,{status : 0,user : user,uid : result.insertId});
		}).end();
	}
}