var mobile_getSelector = function(element) {
	var tagName = element.tagName.toLowerCase();
	//如果是单条结果最外层的table
	if(tagName == "table" && ($(element).hasClass("result") || $(element).hasClass("result-op")) && $(element).attr("mu")){
		var mu = element.getAttribute("mu");
		var tpl = element.getAttribute("tpl");
		//如果存在tpl字段，则使用tpl字段
		if(tpl){
			return tagName + "[tpl=" + tpl + "]";
		}else{
			//如果存在mu字段，则使用mu字段做selector
			if(mu){
				return tagName + "[mu*='" + mu.split("").reverse().slice(0,15).reverse().join("") + "']";
			}else{
				return "#" + element.id;
			}
		}
	}else if (element.id && !(/\d{13}/).test(element.id)){ 
		//如果是外层的table标签
		if((/^\d+$/).test(element.id)){
			if(tagName == "table"){
				return tagName + "." + element.className;
			}
		}else{
			return '#' + element.id;
		}
	}

	if(element == document || element == document.documentElement){
		return 'html';
	}

	if (element == document.body){ return 'html>' + element.tagName.toLowerCase(); }


	if(!element.parentNode){return element.tagName.toLowerCase();}

	var ix = 0, 
	    siblings = element.parentNode.childNodes,
	    elementTagLength = 0;

	for (var i = 0,l = siblings.length; i < l; i++) {
		if((siblings[i].nodeType == 1) && (siblings[i].tagName == element.tagName)){
			++elementTagLength;
		}
	}

	for (var i = 0,l = siblings.length; i < l; i++) {
		var sibling = siblings[i];
		if (sibling === element){
		    return arguments.callee(element.parentNode) + '>' + element.tagName.toLowerCase() + ((!ix && elementTagLength === 1) ? '' : ':nth-child(' + (ix + 1) + ')');
		}else if(sibling.nodeType == 1){
		    ix++;
		}
	}
};


window.getSelector = function(target) {
	var selector = target.nodeName.toLowerCase();
	if(target.id && !(/\d{13}/).test(target.id)){
		return "#" + target.id;
	}else{
		var parent = target.parentNode;
		while(parent && parent.tagName){
			if(parent.id && !(/\d{13}/).test(parent.id)){
				selector = "#"+parent.id + " " + selector;
				break;
			}else{
				parent = parent.parentNode;
			}
		}
	}
	if(target.className){
		selector += "." + target.className.split(" ")[0];
	}
	var others = jQuery(selector)
	if(others.length > 1){
		return selector+":eq("+others.index(target)+")";
	}else{
		return selector;
	}
}