var setting = require("./setting"),
	mysql = require("mysql");


module.exports = {
	initDataBase : function(callback){
		var connection = mysql.createConnection({
		 	host     : setting.mysql.host,
		  	user     : setting.mysql.user,
		  	password : setting.mysql.password
		});

		connection.connect(function(err){
			if(err){ throw err;}
		});

		// 创建数据库
		connection.query('CREATE DATABASE IF NOT EXISTS ' + setting.mysql.database + ' default charset utf8 COLLATE utf8_general_ci',function(){

			connection.end();

			// 为什么需要重新建立一次连接，而不直接用changeUser来实现呢，是因为changeUser在windows下会报错，存在兼容性问题
			var conn = mysql.createConnection({
			 	host     : setting.mysql.host,
			  	user     : setting.mysql.user,
			  	password : setting.mysql.password,
			  	database : setting.mysql.database
			});

			// 创建单侧table
			conn.query('CREATE TABLE IF NOT EXISTS `all_cases` (`id` int(11) NOT NULL AUTO_INCREMENT,`title` varchar(500) NOT NULL,`url` varchar(500) NOT NULL,`charset` int(11) NOT NULL,`type` int(11) DEFAULT NULL,`uid` int(11) DEFAULT NULL,`code` mediumtext,`position` int(11) DEFAULT NULL,`device` int(11) NOT NULL DEFAULT \'1\',`adddate` varchar(100) NOT NULL,`switch` int(11) NOT NULL DEFAULT \'0\',`token` varchar(100) DEFAULT NULL,PRIMARY KEY (`id`),UNIQUE KEY `case_id` (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0');

			// 创建用户table
			conn.query('CREATE TABLE IF NOT EXISTS `all_users` (`id` int(11) NOT NULL AUTO_INCREMENT,`user` varchar(100) NOT NULL,`password` varchar(5000) NOT NULL,`email` varchar(100) NOT NULL,`adddate` datetime NOT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0');

			// 创建错误table
			conn.query('CREATE TABLE IF NOT EXISTS `all_errors` (`id` int(11) NOT NULL AUTO_INCREMENT,`uid` int(11) NOT NULL,`content` mediumtext NOT NULL,`type` varchar(100) NOT NULL,`url` varchar(500) DEFAULT \'\',`title` varchar(500) DEFAULT NULL,`useragent` varchar(500) DEFAULT NULL,`token` varchar(100) DEFAULT \'\',`status` int(11) NOT NULL DEFAULT \'0\',`note` text,`adddate` varchar(100) NOT NULL,PRIMARY KEY (`id`),UNIQUE KEY `error_id` (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0');

			setTimeout(function(){
				conn.end();
				callback && callback();
			},1500);
		});
	}
}