var Mysql = require("../mysql");

exports.showPage = function(req,res){
	var eid = req.body.eid,
		note = req.body.content;

	var mysql = new Mysql();

	mysql.query("update all_errors set note=" + mysql.escape(note) + " where id=" + mysql.escape(eid),function(){
		mysql.end();
		res.send(200,{ status : 0 });
	});
}