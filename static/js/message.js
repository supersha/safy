var socket = io.connect(host);

socket.on("connect",function(data){
	socket.emit("addRoom",room);
});

socket.on("joinRoom",function(room){});

socket.on("ErrorMessages",function(data){
	var classname = data.messageType,
		resultID = data.resultID;

	if(!$("#" + resultID).size()){
		$("#results").prepend("<div id='" + resultID + "'></div>");
	}

	var html = "";

	if(data.messageType == "title"){
		html = (data.url ? "<a href='" + data.url + "' target=_blank>" + data.title + "</a>" : data.title) + " <span class='ua info'>" + data.userAgent + "</span>";
	}else if(data.messageType == "subtitle"){
		html = "<span id='" + data.token + "'>[单侧名称: " + data.title + "]</span>";
	}else if(data.messageType == "complete"){
		if(data.errorCount === 0){
			$("#" + data.token).css("color","green");
		}
	}else{
		html = "错误类型:<strong>" + data.type + "</strong>, " + data.content + "<span class=\'info\'> -- " + data.time + "</span>";
	};

	$("<div class=\'"+ classname + (data.type ? " " + data.type : "") + "\'></div>").html(html).appendTo($("#" + resultID));

	parent.updateIframeHeight($(document.documentElement).height());
});