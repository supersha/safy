var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	res.render("result.html",{page:"result",passport : Util.getPassport(req,res)});
}