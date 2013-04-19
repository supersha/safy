var Util = require("../util").Util,
	Mysql = require("../mysql");

exports.showPage = function(req,res){
	Util.checkLogined(req,res);

	//如果处于编辑模式
	var caseData = {},
		cid = req.query.cid,
		data = {
			page : "create",
			urlData : req.query,
			passport : Util.getPassport(req,res)
		};

	if(cid){
		var mysql = new Mysql();

		mysql.selectAllKeys("all_cases",{ id : cid },function(result){
			caseData = result[0];
			data['isEdit'] = true;
			data['caseData'] = caseData;

			res.render("create.html",data);
		}).end();
	}else{
		data['isEdit'] = false;
		res.render("create.html",data);
	}
}