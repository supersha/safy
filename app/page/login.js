var fs = require("fs");

exports.showPage = function(req,res){

	// 检测Safy是否已经初始化
	fs.exists("./lib/setting.js",function(exists){
		if(exists){
			res.render("login.html",{page:"login"});
		}else{
			res.redirect(302,"/initsafy");
		}
	});
}