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
function changeRounded(e) {
	localStorage.setItem("pfc_shadow",e.target.value);
	chrome.tabs.executeScript(null, {code:"config.pfc_shadow = "+e.target.value+"; EVENT_SHADOW_CHANGED = true;"});
}
function changeSize(e) {
	localStorage.setItem("pfc_size",e.target.value);
	chrome.tabs.executeScript(null, {code:"config.pfc_size = "+e.target.value+"; EVENT_SIZE_CHANGED = true;"});
}
function changeFont(e) {
	localStorage.setItem("pfc_font",e.target.value);
	chrome.tabs.executeScript(null, {code:"changeFont("+e.target.value+");"});
}

function changeFontFamily(e) {
	localStorage.setItem("pfc_fontfamily",e.target.options[e.target.selectedIndex].value);
	chrome.tabs.executeScript(null, {code:"changeFontFamily('"+e.target.options[e.target.selectedIndex].value+"');"});
}

window.onload = function() {
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
	
	
	
}

function sharedok() {
	localStorage.setItem("hasshared",1);
	setTimeout(function() { document.getElementById('tohide').style.display = 'block'; document.getElementById('tohide').innerHTML = 'Thank you'; },3000);
}