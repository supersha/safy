var Util = require("../util").Util,
	Mysql = require("../mysql");

exports.showPage = function(req,res){
	var passport = Util.getPassport(req,res),
		user = req.query.user;

	var pageData = {
		page : "reg",
		isEdit : !!user,
		urlData : req.query,
		passport : passport,
		userData : {}
	};

	if(user){
		var mysql = new Mysql();
		mysql.selectAllKeys("all_users",{user : user},function(results){
			pageData['userData'] = results[0];
			res.render("register.html",pageData);
		});
	}else{
		res.render("register.html",pageData);
	}
}