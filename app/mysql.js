var mysql = require('mysql'),
	setting = require('./setting');


var escapeData = function(data){
	for(var key in data){
		if(data.hasOwnProperty(key)){
			data[key] = mysql.escape(data[key]).replace(/\?/g,"??");
		}
	}
	return data;
}


var Mysql = function(options){
	this.options = options || {};
	this.connection = null;

	this.connect();
};


Mysql.prototype = {
	connect : function(){
		var connection = mysql.createConnection({
		 	host     : setting.mysql.host,
		  	user     : setting.mysql.user,
		  	password : setting.mysql.password,
		  	database : setting.mysql.database
		});

		connection.connect(function(err){
			if(err){ throw err;}
		});

		this.connection = connection;

		connection.on('error', function(err) {
		  	console.log(err.code);
		});

		return this;
	},
	end : function(){
		this.connection.end();
		return this;
	},
	query : function(sql,handler){
		this.connection.query(sql,function(err,results){
			if(err) throw err;
			handler && handler(results);
		});
		return this;
	},
	select : function(table,keys,condition,handler){  //condition:[option]
		if(arguments.length === 3){
			handler = arguments[2];
			condition = {};
		}

		condition = escapeData(condition || {});
		var sql ='select ' + (keys == '*' ? '*' : keys.join(',')) + ' from ' + table,temp = [];
		for(var key in condition){
			if(condition.hasOwnProperty(key)){
				temp.push(key + '=' + condition[key]);
			}
		}
		sql += temp.length ? ' where ' + temp.join(' and ') : '';

		this.connection.query(sql,function(err,rows){
			if (err) throw err;
			handler && handler(rows);
		});
		return this;		
	},
	selectAllKeys : function(table,condition,handler){  //condition:[option]
		if(arguments.length === 2){
			handler = arguments[1];
			condition = {};
		}

		condition = escapeData(condition || {});
		var sql ="select * from " + table,temp = [];
		for(var key in condition){
			if(condition.hasOwnProperty(key)){
				temp.push(key + "=" + condition[key]);
			}
		}
		sql += temp.length ? " where " + temp.join(' and ') : "";

		this.connection.query(sql,function(err,rows){
			if (err) throw err;
			handler && handler(rows);
		});
		return this;
	},
	hasRecord : function(table,condition,handler){
		this.selectAllKeys(table,condition,function(rows){
			handler(rows.length ? rows : false);
		});
		return this;
	},
	insert : function(table,data,handler){
		this.connection.query('INSERT INTO ' + table + ' SET ?', data || {} , function(err, result) {
		  if (err) throw err;
		  handler && handler(result);
		});

		return this;
	},
	update : function(table,data,condition,handler){
		data = escapeData(data || {});
		condition = escapeData(condition || {});

		var sql = 'update ' + table + ' set ',temp = [];
		for(var key in data){
			if(data.hasOwnProperty(key)){
				temp.push(key + "=" + data[key]);
			}
		}
		sql += temp.join(",");
		temp = [];
		for(var key in condition){
			if(condition.hasOwnProperty(key)){
				temp.push(key + "=" + condition[key]);
			}
		}

		sql += temp.length ? ' where ' + temp.join(' and ') : '';

		this.connection.query(sql,{},function(err,result){
			if (err) throw err;
		  	handler && handler(result);			
		});

		return this;
	},
	delete : function(table,condition,handler){
		condition = escapeData(condition || {});
		var sql ='delete from ' + table,temp = [];
		for(var key in condition){
			if(condition.hasOwnProperty(key)){
				temp.push(key + "=" + condition[key]);
			}
		}
		sql += temp.length ? ' where ' + temp.join(' and ') : '';

		this.connection.query(sql);
		return this;
	},
	escape : function(string){
		return this.connection.escape(string);
	}
}


module.exports = Mysql;