var fs = require("fs");

exports.showPage = function(req,res){

	// 检测Safy是否已经初始化
	fs.exists("./lib/setting.js",function(exists){
		if(exists){
			res.redirect(302,"/login");
		}else{
			res.render("initsafy.html");
		}
	});
}