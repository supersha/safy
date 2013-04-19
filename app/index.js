var url = require("url");


//各个页面的routes
exports.pageHandler = function(req, res){
	var pathname = url.parse(req.url).pathname.replace("/","") || "index";	
	try{
		require("./page/" + pathname).showPage(req,res);
	}catch(e){
		res.writeHead(500,{"Content-Type":"text/plain"});
		res.write(e.message);
		res.end();
	}
};


//api的routes
exports.apiPageHandler = function(req,res){
	var pathname = url.parse(req.url).pathname.replace("/api/","").replace(".json","");
	try{
		require("./api/" + pathname).showPage(req,res);
	}catch(e){
		res.writeHead(500,{"Content-Type":"text/plain"});
		res.write(e.message);
		res.end();
	}
}


//tool的routes
exports.toolPageHandler = function(req,res){
	var pathname = url.parse(req.url).pathname.replace("/tool/","");
	try{
		require("./tool/" + pathname).showPage(req,res);
	}catch(e){
		res.writeHead(500,{"Content-Type":"text/plain"});
		res.write(e.message);
		res.end();
	}
}