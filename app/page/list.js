var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	res.render("list.html",{page:"list",passport : Util.getPassport(req,res)});
}