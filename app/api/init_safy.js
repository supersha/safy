var fs = require("fs"),
	mysql = require("mysql"),
	async = require("async"),
	Util = require("../util").Util;

exports.showPage = function(req,res){
	var host = req.query.host,
		user = req.query.user,
		password = req.query.password,
		database = req.query.database,
		site = req.query.site,
		port = req.query.port;

	var filepath = "./lib/setting.js";

	var data = {
		mysql : {
			host : host,
			user : user,
			password : password,
			database : database
		},
		site : {
			domain : site + ":" + port,
			port : port
		}
	};

	async.series([
		function(callback){
			if(fs.existsSync(filepath)){ res.send(200,{ status : -1,error : "Safy已经初始化" });return;}
			callback(null);
		},
		function(callback){
			// 检查Mysql的配置是否正确
			var connection = mysql.createConnection({
			 	host     : host,
			  	user     : user,
			  	password : password
			});
			connection.connect(function(err){
				if(err){ 
					res.send(200,{ status : -1, error : "数据库链接失败，请检查配置" });
					return;
				}
				callback(null);
			});
		},
		function(callback){
			fs.writeFile(filepath,"module.exports = " + Util.formatJSON(JSON.stringify(data)),function(err){
				if(err){ throw err;}

				// 初始化数据库
				require("../init_mysql").initDataBase(function(){
					res.send(200,{ status : 0 });
					callback(null);
				});
			});
		}
	],function(err,results){});
};