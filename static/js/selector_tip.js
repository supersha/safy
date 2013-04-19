;(function(){
	
function showCode(code,callback){
	var __div = document.createElement("div");
	var __mask=document.createElement("div");
	__mask.onclick=function(){
		document.body.removeChild(__mask);
		document.body.removeChild(__div);

		callback && callback();
	};

	__div.setAttribute("data-notip","true");
	__mask.setAttribute("data-notip","true");

	__mask.style.cssText="background:#000;opacity:0.7;width:100%;height:100%;position:absolute;left:0;top:0;z-index:10000";

	document.body.appendChild(__mask);

	__div.style.cssText="position:fixed;top:0;left:0;z-index:10001;border:1px solid #eee;padding:4px;background:#fff;width:400px;height:300px;font-size:13px;overflow:hidden;box-shadow: 0px 0px 13px #000;border-radius:4px;";
	__div.style.left=parseInt(window.innerWidth / 2) - 200 + "px";
	__div.style.top=parseInt(window.innerHeight / 2) - 150 + "px";
	__div.innerHTML = "<textarea style='border:0;width:99%;height:99%;font-family:Monaco,Menlo,Consolas,\"Courier New\",monospace'>" + code + "</textarea>";
	document.body.appendChild(__div);
}


window.startGetSelector = function(){

	var timeout = 0;
	$(document.body).mouseover(function(e){
		var target = e.target;
		var pos = {x: e.pageX,y: e.pageY};
		if(target && target.nodeType == 1 && target.nodeName){
			clearTimeout(timeout);

			if(($(target).data("notip")) || ($(target.parentNode).data('notip'))){return;}

			//currentTargetElement = target;

			timeout = setTimeout(function(){
				var selector = window.getSelector(target);
				if(!selector){return;}

				$("#selector-tip-content").html(selector);
				$("#selector-tip").show().css({left : pos.x + "px", top : pos.y + "px"});
			},1000);
		}
	});

	$("#selector-tip-btn").click(function(){
		var selector = $("#selector-tip-content").text();
		if($(selector).size() == 1){
			var orign = $(selector).css("backgroundColor") || "#fff";
			$(selector).css("backgroundColor","yellow");
			setTimeout(function(){
				$(selector).css("backgroundColor",orign);
			},300);
		}else{
		}
	});

	$("#text-valid-btn").click(function(){
		var selector = $("#selector-tip-content").text();
		var method = "text";

		var tagName = $(selector).get(0).tagName.toLowerCase();

		if(tagName == "input" || tagName == "textarea" || tagName == "select"){
			method = "val";
		}
		var code = 'should($("' + selector + '").' + method + '()).beEqual("' + $(selector)[method]() + '").error("内容不符合");';
		showCode(code);
	});

	$("#selector-exist-btn").click(function(){
		var selector = $("#selector-tip-content").text();
		var code = 'should($("' + selector + '").be().exist().error("元素不存在");';
		showCode(code);
	});

	$("#selector-display-btn").click(function(){
		var selector = $("#selector-tip-content").text();
		var code = 'should($("' + selector + '").css("display")).beEqual("' + $(selector).css("display") + '").error("元素未显示");';
		showCode(code);
	});
}

})();
