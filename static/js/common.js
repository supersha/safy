var monitor = monitor || {};

monitor.util = {};

monitor.util.showSuccessAlert = function(message,callback){
	callback = callback || function(){};

	var winWidth = $(window).width();

	$(".alert-content").html(message);

	var contentWidth = $(".alert").show().width();
	$(".alert").hide();


	$(".alert").css("left",(winWidth / 2) - (contentWidth / 2) + "px");

	$(".alert").removeClass("alert-error").fadeIn(function(){
		setTimeout(function(){
			$(".alert").fadeOut(callback);
		},1500);
	});
}


monitor.util.showFailAlert = function(message,callback){
	callback = callback || function(){};

	var winWidth = $(window).width();

	$(".alert-content").html(message);

	var contentWidth = $(".alert").show().width();
	$(".alert").hide();

	$(".alert").css("left",(winWidth / 2) - (contentWidth / 2) + "px");
	$(".alert").addClass("alert-error").fadeIn(function(){
		setTimeout(function(){
			$(".alert").fadeOut(callback);
		},1500);
	});
};


monitor.util.isURL = function(url){
	return (/^(((http[s]?:\/\/)|(ftp:\/\/))([\w-]+\.)+(com|edu|gov|int|mil|net|org|biz|info|pro|name|museum|coop|aero|xxx|idv|al|dz|af|ar|ae|aw|om|az|eg|et|ie|ee|ad|ao|ai|ag|at|au|mo|bb|pg|bs|pk|py|ps|bh|pa|br|by|bm|bg|mp|bj|be|is|pr|ba|pl|bo|bz|bw|bt|bf|bi|bv|kp|gq|dk|de|tl|tp|tg|dm|do|ru|ec|er|fr|fo|pf|gf|tf|va|ph|fj|fi|cv|fk|gm|cg|cd|co|cr|gg|gd|gl|ge|cu|gp|gu|gy|kz|ht|kr|nl|an|hm|hn|ki|dj|kg|gn|gw|ca|gh|ga|kh|cz|zw|cm|qa|ky|km|ci|kw|cc|hr|ke|ck|lv|ls|la|lb|lt|lr|ly|li|re|lu|rw|ro|mg|im|mv|mt|mw|my|ml|mk|mh|mq|yt|mu|mr|us|um|as|vi|mn|ms|bd|pe|fm|mm|me|md|ma|mc|mz|mx|nr|np|ni|ne|ng|nu|no|nf|na|za|zq|aq|gs|eu|pw|pn|pt|jp|se|ch|sv|ws|yu|sl|sn|cy|sc|sa|cx|st|sh|kn|lc|sm|pm|vc|lk|sk|si|sj|sz|sd|sr|sb|so|tj|tw|th|tz|to|tc|tt|tn|tv|tr|tm|tk|wf|vu|gt|ve|bn|ug|ua|uy|uz|es|eh|gr|hk|sg|nc|nz|hu|sy|jm|am|ac|ye|iq|ir|il|it|in|id|uk|vg|io|jo|vn|zm|je|td|gi|cl|cf|cn)(:\d+)?(\/[^\s]*)?)$/).test(url);
}


monitor.util.cookie = {};
monitor.util.cookie.set = function(name,value){
	var exp = new Date();
	exp.setTime(exp.getTime() + 360 * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

monitor.util.cookie.remove = function(name){
	document.cookie = name + "=;expires="+(new Date(0)).toGMTString();
}

monitor.util.sendSMS = function(user,message){
	var img = window["__Monitor_ERROR_IMG" + (+new Date())] = new Image();
	img.src = "/send.php?type=sms&user=" + encodeURIComponent(user) + "&msg=" + encodeURIComponent(message) + "&t=" + (+new Date());
}


monitor.util.sendMail = function(user,subject,body){
	var subject = "[" + subject + "]";
	var img = window["__Monitor_ERROR_IMG" + (+new Date())] = new Image();
	img.src = "/send.php?type=mail&user=" + encodeURIComponent(user) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body) + "&t=" + (+new Date());
}