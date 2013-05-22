	// http://developer.chrome.com/extensions/tabs.htm
!function(undefined) {
	var CTabs = chrome.tabs;
	var ACONTEXT = "|popup|content|pageaction|background";

	var _chromeruntime = chrome.runtime && chrome.runtime.sendMessage ?
                         'runtime' : 'extension';

    var idCounter = 0;
	Rain1Overlay = function (context) {
		if(ACONTEXT.indexOf(context) == -1 ) {
			_error("context unknown ("+context+")")
		}
		this.debug = false;
		
		/**
		 * shortcut internalization
		 */
		this._ = function(text) {
			return chrome.i18n.getMessage(text) || text;
		}
		/**
		 * translate html
		 */
		this.translate = function() {
			var toTranslate = document.querySelectorAll('.i18n');
			for(var i = 0; i < toTranslate.length; i++) {
				var el = toTranslate[i];
				el.innerHTML = this._(el.dataset.key) || el.dataset.text;
			}
		}
	
		/**
		 * get the tab active when I trigger the event
		 */
		this.getCurrentTab = function(callback) {
			// Doc says: "May be undefined if called from a non-tab context (for example: a background page or popup view)"
			// So in this case I want the active tab in the current window.
			_log("getCurrentTab called");
			var _callback = function(tab) {
				if(tab.length == 1) {
					callback(new Rain1Overlay.Tab(tab[0]));
				}else if(tab.length == 0) {
					callback(false);
				}else {
					_error("More than one tab found in getCurrentTab call");
				}
			}
			if( context == "popup" || context == "background" ) {
				CTabs.query({
					currentWindow: true,
					active:true
				} , _callback);
			}else {
				CTabs.getCurrent(_callback);
			}
		}
		this.getStorageOverlay = function() {
			return new Rain1Overlay.Store(context);
		}
		
		this.getBackground = function(method) {
			return chrome.extension.getBackgroundPage()[method]();
		}
		
		this.openUrl = function(url,callback) {
			CTabs.create({url:url},callback);
		}
		
		function _log(a) {
			if ( this.debug )
				console.log(a);
		}
	}
	
	Rain1Overlay.Tab = function(tab) {
		this.tab = tab;
	}
	Rain1Overlay.Tab.prototype.hasChromeProtocol = function() {
		return this.tab.url.indexOf("chrome") == 0 || this.tab.url.indexOf("view-source:") == 0
	}
	Rain1Overlay.Tab.prototype.update = function(object) {
		CTabs.update(this.tab.id, object);
	}
	Rain1Overlay.Tab.prototype.togglePin = function() {
		var newState = !this.tab.pinned;
		CTabs.update(this.tab.id, {pinned:newState});
		return newState;
	}
	
	Rain1Overlay.Store = function(name) {
		this.storage = chrome.storage.local;
	}
	Rain1Overlay.Store.prototype.set = function(object, success) {
		this.storage.set(object,success);
	}
	Rain1Overlay.Store.prototype.get = function(key, onGet) {
		this.storage.get(key,onGet);
	}
	Rain1Overlay.Store.prototype.clearAll = function(onClear) {
		this.storage.clear(onClear);
	}
	
	Rain1Overlay.Settings = function(namespace, context) {
		var settingsInstance = this;
		if(ACONTEXT.indexOf(context) == -1 ) {
			_error("settings context unknown ("+context+")");
			return ;
		}
		this._context   = context;
		this._namespace = namespace;
		this._callbacks = {};

		// in order to listen command from content script
		if(context == "content") {
			this._port = chrome[_chromeruntime].connect({name: namespace});
			//console.error("localstorage in content is not supported");

			
			//port.postMessage({joke: "Knock knock"});
			this._port.onMessage.addListener(function(msg) {
				if (msg.action == "update") {
					settingsInstance._global[msg.key] = JSON.parse(msg.value);
				}else if(msg.action == "fetchAll") {
					settingsInstance._callbacks[msg.callbackname](msg.result);
					delete settingsInstance._callbacks[msg.callbackname];
				}else if(msg.action == "get") {
					settingsInstance._callbacks[msg.callbackname](msg.result);
					delete settingsInstance._callbacks[msg.callbackname];
				}else {
					settingsInstance._callbacks[msg.callbackname](msg.result);
					delete settingsInstance._callbacks[msg.callbackname];
				}
			});
		}else if(context == "background") {
			chrome[_chromeruntime].onConnect.addListener(function(port) {
				settingsInstance._port = port;
				settingsInstance._port.onMessage.addListener(function(msg) {
					if(msg.action == "set") {
						settingsInstance.set(msg.key,msg.value);
					}else if(msg.action == "get") {

						settingsInstance._port.postMessage({action:'get', result:settingsInstance.get(msg.key), callback:msg.callback});
					}else if(msg.action == "fetchAll") {
						settingsInstance._port.postMessage({action:'fetchAll', result:settingsInstance.fetchAll(msg.defaults), callbackname:msg.callbackname});
					}
				});
			});
		}else {
			this._port = chrome[_chromeruntime].connect({name: namespace});
			this._port.onMessage.addListener(function(msg) {
				if(msg.action == "fetchAll") {
					settingsInstance._callbacks[msg.callbackname](msg.result);
					this._global = msg.result;
					delete settingsInstance._callbacks[msg.callbackname];
				}
			});
		}

		this._global = JSON.parse(localStorage.getItem(namespace) || "{}") || {};
		return this;
	}
	Rain1Overlay.Settings.prototype.get = function(key,callback) {
		if(this._context == "content") {
			callbackname = 'get'+(idCounter++);
			this._callbacks[callbackname] = callback;
			this._port.postMessage({action:'get', key:key, callbackname:callbackname});
		}else {
			if(this._global.hasOwnProperty(key))
				return this._global[key]
			else
				return null;
		}
	}
	Rain1Overlay.Settings.prototype.set = function(key,value) {
		console.log("set " + key + " = " + value);
		if(this._context == "content" || this._context == "popup") {
			this._port.postMessage({action:'set', key:key, value:value});
			this._global[key] = value;
		}else {
			this._global[key] = value;
			console.log("try to save all localstorage.");
			localStorage.setItem(this._namespace, JSON.stringify(this._global));
		}
	}
	Rain1Overlay.Settings.prototype.fetchAll = function(defaults, callback) {
		if(this._context == "content" || this._context == "popup") {
			callbackname = 'fetchAll'+(idCounter++);
			this._callbacks[callbackname] = callback;
			this._port.postMessage({action:'fetchAll', defaults:defaults, callbackname:callbackname});
		}else {
			for(var i in defaults) {
				if(typeof this._global[i] == "undefined") {
					this._global[i] = defaults[i];
				}
			}
			return this._global;
		}
	}
	
	Rain1Overlay.DOM = function() {
		this.observeNodes = function(selector, callback) {
			//select the target node
			var target = document.querySelector( selector );
			
			// prepare for specification
			var NativeObserverFunction = (typeof MutationObserver != "undefined")?  MutationObserver : WebKitMutationObserver;
			
			// create an observer instance
			var observer = new NativeObserverFunction(callback);
			  
			// configuration of the observer:
			var config = { attributes: false, childList: true, characterData: false };
			  
			// pass in the target node, as well as the observer options
			observer.observe(target, config);
			  
			// later, you can stop observing
			//observer.disconnect();
		};
		this.observeAttributes = function(selector, callback) {
			//select the target node
			var target = document.querySelector( selector );
			
			// prepare for specification
			var NativeObserverFunction = (typeof MutationObserver != "undefined")?  MutationObserver : WebKitMutationObserver;
			
			// create an observer instance
			var observer = new NativeObserverFunction(callback);
			  
			// configuration of the observer:
			var config = { attributes: true, childList: false, characterData: true };
			  
			// pass in the target node, as well as the observer options
			observer.observe(target, config);
			  
			// later, you can stop observing
			//observer.disconnect();
		};
		this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		
		
	}
	
	function _error(a) {
		console.error(a);
	}
	
}();