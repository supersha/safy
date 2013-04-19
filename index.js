/**
 * Module dependencies.
 */

var express = require('express'), 
	page = require('./lib'), 
	http = require('http'),
	path = require('path'),
	cons = require("consolidate"),
	swig = require("swig"),
	SocketIO = require("socket.io"),
	exec = require("child_process").exec,
	port = 3000;


var app = express(),
	server = http.createServer(app),
	io = SocketIO.listen(server);

swig.init({
    root: __dirname + '/views',
    allowErrors: true
});


//获取配置的port
try{
	var setting = require("./lib/setting");
	port = setting.site.port;
}catch(e){}


// all environments
app.set('port', port);
app.set('views', __dirname + '/views');
app.engine(".html",cons.swig);
app.set('view engine', 'html');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(true));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'static')));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}


app.get("/api/*.json",page.apiPageHandler);
app.post("/api/*.json",page.apiPageHandler);


app.get("/tool/*",page.toolPageHandler);
app.post("/tool/*",page.toolPageHandler);


app.get("/",page.pageHandler);
app.get(/\/(create)|(list)|(result)|(doc)|(help)|(login)|(loginout)|(register)|(tool)|(forget)|(initsafy)/,page.pageHandler);


server.listen(app.get('port'),function(){
  console.log('Express server listening on port ' + app.get('port'));
});


io.sockets.on("connection",function(socket){
	socket.on("ErrorLogEvent",function(data){
		socket.broadcast.to([data.room]).emit("ErrorMessages",data);
	});

	socket.on("addRoom",function(room){
		socket.join(room);
		socket.emit("joinRoom",room);
	});
});



