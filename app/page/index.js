var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);
	
	res.render("index.html",{page:"index",passport : Util.getPassport(req,res)});
}