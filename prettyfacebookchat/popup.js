/*
    Pretty Facebook Chat
    Chrome Extension for improve facebook chat
    Copyright (C) 2012  Luca Rainone <luca.rainone@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var o         = new Rain1Overlay("popup"),
	oStorage  = o.getStorageOverlay();

function changeRounded(e) {
	localStorage.setItem("pfc_shadow",e.target.value);
	chrome.tabs.executeScript(null, {code:"changeShadow("+e.target.value+")"});
}
function changeSize(e) {
	localStorage.setItem("pfc_size",e.target.value);
	chrome.tabs.executeScript(null, {code:"config.pfc_size = "+e.target.value+"; EVENT_SIZE_CHANGED = true;"});
}
function changeFont(e) {
	localStorage.setItem("pfc_font",e.target.value);
	chrome.tabs.executeScript(null, {code:"changeFont("+e.target.value+");"});
}
function changeFontColor(color) {
	localStorage.setItem("pfc_font_color",color);
	chrome.tabs.executeScript(null, {code:"changeFontColor('"+color+"');"});
	document.getElementById("currentColor").style.backgroundColor = color;
}
function changeFontFamily(e) {
	localStorage.setItem("pfc_fontfamily",e.target.options[e.target.selectedIndex].value);
	chrome.tabs.executeScript(null, {code:"changeFontFamily('"+e.target.options[e.target.selectedIndex].value+"');"});
}
function changeTheme(e) {
	localStorage.setItem("pfc_theme",e.target.options[e.target.selectedIndex].value);
	chrome.tabs.executeScript(null, {code:"changeTheme('"+e.target.options[e.target.selectedIndex].value+"');"});
}

window.onload = function() {
	var stored = ['pfc_active',
	'pfc_add_rotate',
	'pfc_shadow',
	'pfc_shadow3d',
	'pfc_size',
	'pfc_font',
	'pfc_fontfamily',
	'pfc_favorites_smiles',
	'pfc_font_color',
	'pfc_theme']         
	
	oStorage.get(stored, function(config) {
		init(config);
	});
}
function init(config) {
	var els = document.getElementsByClassName('gettext');
	for(var i = 0; i<els.length; i++) {
		el = els[i];
		var text = el.getAttribute("id").split("text_").join("");
		el.innerHTML = chrome.i18n.getMessage(text)
	}
	

	
	var sha = localStorage.getItem("pfc_shadow");
	document.getElementById("oshadow").value = sha==null? 5 : sha;

	var siz = localStorage.getItem("pfc_size");
	document.getElementById("osize").value = siz==null? 400 : siz;
	
	var fsiz = localStorage.getItem("pfc_font");
	document.getElementById("fsize").value = fsiz==null? 11 : fsiz;
	
	var ffam = localStorage.getItem("pfc_fontfamily");
	var selffindex = 0;
	for(var i = 0; i<document.getElementById("ffamily").options.length; i++) {
		if(ffam == document.getElementById("ffamily").options[i].value) {
			selffindex = i;
			break;
		}
	}
	
	var color = localStorage.getItem("pfc_font_color");
	changeFontColor(color);
	
	document.getElementById("ffamily").selectedIndex = selffindex;
	
	
	
	
	var hasshared = localStorage.getItem("hasshared");
	if(hasshared) {
		document.getElementById('tohide').style.display = 'block';
	}else {
		document.getElementById('please_share').innerHTML = '<div id="pleaseshare">'+chrome.i18n.getMessage("please_share_me")+'<br /></div>';
	}

	
	if(!hasshared) {
		document.getElementById('footerlink').innerHTML = '<a style="text-decoration:none; color:#6666ff;" href="https://www.facebook.com/sharer/sharer.php?u=https://chrome.google.com/webstore/detail/ihamlfilbdodiokndlfmmlpjlnopaobi" target="_blank" id="share_ok">'+chrome.i18n.getMessage("share")+' <img src="img/like.png" /></a>';		
	}else {
		if(Math.random()<=.5) {
			document.getElementById('footerlink').innerHTML = '<a style="text-decoration:none; color:#6666ff;" href="https://www.facebook.com/sharer/sharer.php?u=http://www.rain1.it/funny/chrome_extensions/pretty_facebook_chat.html?utm_source=pwindow50" target="_blank">Share <img src="img/like.png" /></a>';
		}else {
			document.getElementById('footerlink').innerHTML = '<a style="text-decoration:none; color:#6666ff;" href="https://chrome.google.com/webstore/detail/ihamlfilbdodiokndlfmmlpjlnopaobi/reviews" target="_blank"> Vote me :)</a>';
		}
	}
	if(document.getElementById('share_ok'))
		document.getElementById('share_ok').onclick = function() {sharedok(); return true};
	document.getElementById('oshadow').onchange = changeRounded;
	document.getElementById('osize').onchange = changeSize;
	document.getElementById('fsize').onchange = changeFont;
	document.getElementById('ffamily').onchange = changeFontFamily;
	document.getElementById('ftheme').onchange = changeTheme;
	
	var theForm = document.getElementById("theForm");

	var colorpicker = document.getElementById('colorpicker');
	colorpicker.style.width = 120;
	colorpicker.style.height = 60;
	var html = "";
	for(var r =0; r<16; r+=5) {
		for(var g=0; g<16; g+=5) {
			for(var b=0; b<16; b+=5) {
				html+='<div data-color="#'+r.toString(16)+""+g.toString(16)+""+b.toString(16)+'" style="cursor:crosshair; float:left; width:10px; height:10px; background-color:#'+r.toString(16)+""+g.toString(16)+""+b.toString(16)+'"></div>';
			}
		}
	}
	colorpicker.innerHTML = html;
	
	var divs = colorpicker.getElementsByTagName('DIV');
	var MOUSEDOWN = false;
	for(var i = 0; i<divs.length; i++) {
		divs[i].onmousedown = function(e) {
			changeFontColor(this.dataset.color);
			MOUSEDOWN = true;
			e.preventDefault();
		}
		divs[i].onmouseover = function() {
			if(MOUSEDOWN)
				changeFontColor(this.dataset.color);
		}
	}
	document.onmouseup = function() {MOUSEDOWN = false;}
	
	
	
	// SHADOW
	
	var circleShadow = document.querySelector('#circular_pointer');
	var _mousedownCircle = function(e) {
		e.preventDefault();
		console.log(e);
		var prevX = e.pageX;
		var prevY = e.pageY;
		var initX = +circleShadow.style.left.replace("px","");
		var initY = +circleShadow.style.top.replace("px","");
		var x,y;
		var _mousemove = function(mme) {
			console.log("mouse move");
			var deltaX = mme.pageX-prevX;
			var deltaY = mme.pageY-prevY;
			x = + deltaX + initX;
			y = + deltaY + initY;
			
			var raggio = Math.sqrt( Math.pow(20-x,2)+Math.pow(20-y,2) );
			if(raggio > 20) {
				var k = raggio/20;
				x = 20 + (x-20)/k;
				y = 20 + (y-20)/k
			}
			circleShadow.style.top = y+"px";
			circleShadow.style.left = x+"px";
			chrome.tabs.executeScript(null, {code:"changeShadow(16,"+(-x+20)*2+","+(-y+20)*2+");"});
			
		}
		var _mouseup = function() {
			console.log("mouseup");
			document.removeEventListener('mousemove',_mousemove);
			document.removeEventListener('mouseup',_mouseup);
			// store
			oStorage.set({pfc_shadow3d:[y-20,x-20,6]}, function() {});
		}
		document.addEventListener('mousemove',_mousemove);
		document.addEventListener('mouseup',_mouseup);
	}
	circleShadow.addEventListener('mousedown', _mousedownCircle);
	if(config.pfc_shadow3d) {
		circleShadow.style.top  = 20+config.pfc_shadow3d[0];
		circleShadow.style.left = 20+config.pfc_shadow3d[1];
	}

}

function sharedok() {
	localStorage.setItem("hasshared",1);
	setTimeout(function() { document.getElementById('tohide').style.display = 'block'; document.getElementById('tohide').innerHTML = 'Thank you'; },3000);
}