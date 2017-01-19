/*   
	Pretty FaceLook Chat
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
var settings = new Rain1Overlay.Settings("prettyfacelookchat","background");
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab ) {

		if(changeInfo.status == "complete" && tab.url.indexOf("www.facebook.com") != -1) {
			chrome.pageAction.show(tabId);
			//console.log(settings.fetchAll(SHARED.defaults));
			/*
			if(localStorage['pfc_fontfamily'])
				chrome.tabs.executeScript(tabId, {code:"setTimeout(function() {changeFontFamily('"+localStorage.getItem('pfc_fontfamily')+"'); },500)"});
			for(var i in localStorage)  {
				console.log(i);
				chrome.tabs.executeScript(tabId, {code:"config['"+i+"'] = '"+localStorage[i]+"'; "});
			}
			chrome.tabs.executeScript(tabId, {code:"setTimeout(function() { refreshConfigs();},500)"});
			*/
		  }
	});
	chrome.tabs.onActiveChanged.addListener(function(tabId, changeInfo ) {
		chrome.tabs.get(tabId,function(tab) {
			if(tab.url.indexOf("www.facebook.com")!==-1) {
				chrome.pageAction.show(tabId);
			}
		});
	});
  // Called when the user clicks on the page action.
  chrome.pageAction.onClicked.addListener(function(tab) {
    
  });
//console.log($);
chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.getJQuery == "1")
				sendResponse({result: $});
		}
);

function getJQuery() {
	return $;
}