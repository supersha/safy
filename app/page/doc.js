var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	res.render("doc.html",{page:"doc",passport : Util.getPassport(req,res)});
}