var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	res.render("help.html",{page:"help",passport : Util.getPassport(req,res)});
}