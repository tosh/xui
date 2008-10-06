(function() {
  	// private constructor
	function _$(els) {
		this.elements = [];
		for (var i=0; i<els.length; i++) {
			var element = els[i];
			if (typeof element == 'string') {
				var element = document.querySelectorAll(element);
				for (var x=0;x<element.length;x++) {				
					this.elements.push(element[x]);	
				}
			} else {
				this.elements.push(element);
			}
		}	
		return this;
	}
  _$.prototype = {
	reClassNameCache: {},
	each: function(fn) {
      	for ( var i = 0, len = this.elements.length; i<len; ++i ) {
        	fn.call(this,this.elements[i]);
      	}
      	return this;
    },
    setStyle: function(prop, val) {
      	this.each(function(el) {
        	el.style[prop] = val;
      	});
      return this;
    },
	getClassRegEx: function(className) {
        var re = this.reClassNameCache[className];
        if (!re) {
            re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
            this.reClassNameCache[className] = re;
        }
        return re;
    },
    addClass: function(className) {
    	this.each(function(el) {
        	el.className += ' '+className;
      	});
      	return this;
    },
	hasClass:function(el,className) {
		var re = this.getClassRegEx(className);
	    return re.test(el.className);
	},
	removeClass:function(className) {
		var re = this.getClassRegEx(className);
		this.each(function(el) {
        	el.className = el.className.replace(re, ' ');
      	});
		return this;
	},
	toggleClass:function(className) {
		var that = this;
		this.each(function(el) {
			(this.hasClass(el,className)==true)? this.removeClass(className) : this.addClass(className);
      	});
		return this;
	},
	// aliases 
	click: function(fn) { return this.on('click',fn); },
	dblclick: function(fn) { return this.on('dblclick',fn); },
	load: function(fn) { return this.on('load',fn); },
    on: function(type, fn) {
		var listen = function(el) {
			if (window.addEventListener) {
				el.addEventListener(type, fn, false);
			}
		};
		this.each(function(el) {
			listen(el);
		});
		return this;
    },
    css: function(o) {
		var that = this;
		this.each(function(el) {
			for (var prop in o) {
				that.setStyle(prop, o[prop]);
			}
		});
		return this;
    },
	position: function () {
		this.each(function(el){
			var topValue= 0,leftValue= 0;
		    obj = el;
			while(obj) {
				leftValue += obj.offsetLeft;
				topValue += obj.offsetTop;
				obj = obj.offsetParent;
		    }
			el.leftPos = leftValue;
			el.topPos = topValue; 
		});
	    
	    return this;
	},
	animate: function( options, duration ) {
		var that = this;
		var duration = duration || 1;
		
		var isset = function(prop) {
	    	return (typeof prop !== 'undefined');
	    };
		
		this.each(function(el){
			//that.setStyle('-webkit-transition','all '+duration+'s ease-in');		
			var start;
			var end;
			var run = [];
			
			for (var prop in options) {
				
				if ( !isset(options[prop]['to']) && !isset(options[prop]['by']) ) {
					return false; // note return; nothing to animate to
				}
		
				start = ( isset(options[prop]['from']) ) ? options[prop]['from'] : getStyle(el,prop);	
				
				if ( isset(options[prop]['to']) ) {
					end = options[prop]['to'];
				} else if ( options[prop]['by'] ) {
					end = start + options[prop]['by'] * 1;
				}
				
				run[prop] = {};
				run[prop].start = start;
				run[prop].end = end;
				
				el.run = run;
				that.setStyle(prop,start + 'px');
				
				//var by = options[prop]['by'];
				//var dist = by + parseInt(getStyle(el,prop));
				//that.setStyle(prop,dist + 'px');
			}	
			
		});
		
		this.each(function(el){
			that.setStyle('-webkit-transition','all '+duration+'s ease-in');
			for(var i in el.run) {
				console.log(i);
				//that.setStyle(i,el.run[i].start + 'px');
				
				that.setStyle(i,el.run[i].end + 'px');		
			}
		});
	},
	canimate: function( options, duration ) {
		var that = this;
		var duration = duration || 1;
		
		this.each(function(el){
			that.setStyle('-webkit-transition','all '+duration+'s ease-in');
			for (var prop in options) {
				var from = options[prop].from || getStyle(el,prop);
				that.setStyle(prop,from);
				var to = options[prop].to;
				that.setStyle(prop,to);			
			}							
		});
	},
	swipe: function(dir) {
		var dir = dir || 'right'; 
		var that = this;
		width = document.getElementsByTagName('body')[0].clientWidth;
		this.each(function(el){
			that.position();
			if (dir == 'right') dist = width - el.leftPos; else dist = el.leftPos - width;
			that.css({
				'-webkit-transform':'translate('+ dist +'px,0)',
	        	'-webkit-transition-duration':'.5s',
	        	'-webkit-transition-timing-function':'ease-in'
			});				
		});
		return this;
	},
	clean: function(){
        var ns = /\S/;
 	    this.each(function(el){
			var d = el, n = d.firstChild, ni = -1;
			while(n){
	 	        var nx = n.nextSibling;
	 	        if (n.nodeType == 3 && !ns.test(n.nodeValue)){
	 	            d.removeChild(n);
	 	        } else {
	 	            n.nodeIndex = ++ni;
	 	        }
	 	        n = nx;
	 	    }
		});
 	    return this;
 	},
	wrap:function(html,tag) {
		var element = document.createElement(tag);
		element.innerHTML = html;
		return element;
	},
	html:function(html,loc) {
		var that = this;
		this.clean();
		loc = (loc != null) ? loc : 'inner'; 
		this.each(function(el) {
			switch(loc) {
				case "inner": el.innerHTML = html; break;
				case "outer":
					if (typeof html == 'string') html = this.wrap(html,el.firstChild.tagName);
					el.parentNode.replaceChild(html,el);
				break;
				case "top": 
					if (typeof html == 'string') html = this.wrap(html,el.firstChild.tagName);
					el.insertBefore(html,el.firstChild);
				break;
				case "bottom":
					if (typeof html == 'string') html = this.wrap(html,el.firstChild.tagName);
					el.insertBefore(html,null);
				break;
			}
        });
		return this;
	},
	xhr:function(url,callback) {	
		var that = this;
		if (typeof url == 'string') {
			var req = new XMLHttpRequest();
			var method = 'get';
			var async = false;
			req.open(method,url,async);
			req.onload = (callback != null) ? callback : function() { that.html(this.responseText); }
			req.send(null);
      	}
	  	return this;
	},
	xhrjson:function(url,map) {
		var that = this;
		callback = function() { 
			var o = eval('(' + this.responseText + ')');
			for (var prop in o) { x$(map[prop]).html(o[prop]); }
		}
		this.xhr(url,callback);
		return this;
	}
  };
  var xui = window.x$ = function() {
    return new _$(arguments);
  }
})();



function getStyle(oElm, strCssRule){
	var strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}