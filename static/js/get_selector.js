window.getSelector = function(element) {
	var tagName = element.tagName.toLowerCase();
	
	if(element.id && !(/\d{13}/).test(element.id)){ 
		return '#' + element.id;
	}

	if(element == document || element == document.documentElement){
		return 'html';
	}

	if (element == document.body){ return 'html>' + element.tagName.toLowerCase(); }


	if(!element.parentNode){return element.tagName.toLowerCase();}

	var ix = 0, 
	    siblings = element.parentNode.childNodes,
	    elementTagLength = 0,
	    classname = element.className;

	for (var i = 0,l = siblings.length; i < l; i++) {
		if(classname){
			if(siblings[i].className === classname){
				++elementTagLength;
			}
		}else{
			if((siblings[i].nodeType == 1) && (siblings[i].tagName == element.tagName)){
				++elementTagLength;
			}
		}
	}

	for (var i = 0,l = siblings.length; i < l; i++) {
		var sibling = siblings[i];
		if (sibling === element){
		    return arguments.callee(element.parentNode) + '>' + (classname ? "." + classname.replace(/\s+/g,".") : element.tagName.toLowerCase()) + ((!ix && elementTagLength === 1) ? '' : ':nth-child(' + (ix + 1) + ')');
		}else if(sibling.nodeType == 1){
		    ix++;
		}
	}
};