var Util = require("../util").Util;

exports.showPage = function(req,res){
	//Util.checkLogined(req,res);

	res.render("forget.html",{page:"forget"});
}