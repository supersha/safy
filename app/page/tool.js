var Util = require("../util").Util;


exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	var pageData = {},
		token = req.query.token,
		room = req.query.room;

	pageData.room = room || Util.randomString(32);

	if(token){
		pageData.token = token;
	}

	res.render("tool.html",{page:"tool",passport : Util.getPassport(req,res),pageData : pageData});
}