/*
    Pretty Facebook Chat
    Chrome Extensions for improve facebook chat
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
if(document.domain == "facebook.com") {
	var pfc_emoticons = EMOTICONS.pfc_emoticons;
	var extrasem      = EMOTICONS.extrasem;
	var asciicode     = EMOTICONS.asciicode;
	var asciipic      = EMOTICONS.asciipic;
	var CHUCK         = EMOTICONS.CHUCK;
	
	CAN_DRAG = screen.height<650? false : true;

	pfc_localStorage = ["pfc_active","pfc_shadow","pfc_size","pfc_font","pfc_fontfamily","pfc_favorites_smiles"];
	
	OPTIONS_ACTIVE = 1;
	if(localStorage.getItem("pfc_active")!=null){
//		OPTIONS_ACTIVE  = localStorage.getItem("pfc_active");
		OPTIONS_ACTIVE  = 1;
	}

	if(localStorage.getItem("pfc_shadow")==null){
		localStorage.setItem("pfc_shadow",5);
		OPTIONS_SHADOW = 5;
	}else {
		OPTIONS_SHADOW = localStorage.getItem("pfc_shadow");
	}
	if(localStorage.getItem("pfc_size")==null){
		localStorage.setItem("pfc_size",400);
		OPTIONS_SIZE = 400;
	}else {
		OPTIONS_SIZE = localStorage.getItem("pfc_size");
	}
	
	if(localStorage.getItem("pfc_font")==null){
		localStorage.setItem("pfc_font",11);
		OPTIONS_FONT = 11;
	}else {
		OPTIONS_FONT = localStorage.getItem("pfc_font");
	}
	if(localStorage.getItem("pfc_fontfamily")==null){
		localStorage.setItem("pfc_fontfamily","");
		OPTIONS_FONT_FAMILY = "";
	}else {
		OPTIONS_FONT_FAMILY = localStorage.getItem("pfc_fontfamily");
		if(OPTIONS_FONT_FAMILY)
			$('head').append("<link href='https://fonts.googleapis.com/css?family="+OPTIONS_FONT_FAMILY+"' rel='stylesheet' type='text/css'>");
	}
	function changeFont(f) {
		OPTIONS_FONT = f;
		localStorage.setItem("pfc_font",OPTIONS_FONT);
		$('#fbDockChat .fbDockChatTabFlyout').each(function() {
			var classes = $(this).attr("class");
			classes= classes.replace(/fontbig[09]*/i,"").replace("  "," ");
			$(this).attr("class",classes);
			$('#fbDockChat .fbDockChatTabFlyout').addClass("fontbig"+f);
		});
	}
	function changeFontFamily(f) {
		OPTIONS_FONT_FAMILY = f;
		localStorage.setItem("pfc_fontfamily",OPTIONS_FONT_FAMILY);
		$('head').append("<link href='https://fonts.googleapis.com/css?family="+f+"' rel='stylesheet' type='text/css'>");
		$('#fbDockChat .fbDockChatTabFlyout').each(function() {
			$(this).css("font-family",f);
		});
	}
	if(localStorage.getItem("pfc_favorites_smiles")== null) {
		var favorites_smiles = [];
	}else {
		try {
			var favorites_smiles = JSON.parse(localStorage.getItem("pfc_favorites_smiles"));
		}catch(e) {
			var favorites_smiles = [];
		}
	}
	

	EVENT_SHADOW_CHANGED = false;
	EVENT_SIZE_CHANGED = false;

	
	for(var i in pfc_emoticons) {
		if(pfc_emoticons[i].substr(0,4)!="http") {
			pfc_emoticons[i] = chrome.extension.getURL("emoticons/"+pfc_emoticons[i]);
		}
	}
	var cssURL = chrome.extension.getURL("ui-lightness/jquery-ui-1.8.16.custom.css");
	$('head').append('<link rel="stylesheet" type="text/css" href="'+cssURL+'" />');

	// R.I.P Autoconfirm share.
	
	// easter egg
	function chucky($s,$t) {
		i=1;
		$s.find('img').each(function() {
			i++;
			if($t[0] == $(this)[0]) {
				$(this).attr("src",chrome.extension.getURL("chucknorris.jpg")).css('width','64px').css('height','64px');
				return ;
			}
			$(this).css('position','relative');
			var $this = $(this);
			setTimeout(function() {
			$this.animate({
				'top':'+='+Math.random()*50* ((Math.random()<.5)? -1 : 1),
				'left':'+='+Math.random()*50* ((Math.random()<.5)? -1 : 1),
				'opacity':0
			});
			},10*i);
		});
	}
	
	var c_interval = -1;
	
	function _controlWindows() {
		// control if new windows are opened.
		if(!OPTIONS_ACTIVE) {
			clearInterval(c_interval);
			return ;
		}
		$("#fbDockChatTabs>div").each(function() {
			if($(this).hasClass("opened")) {
				$(this).css('-webkit-box-shadow', '');
				$(this).removeClass("uiextshadow");
			}
			if(!$(this).hasClass("uiextshadow") && !$(this).hasClass("opened")) {
				$(this).css('-webkit-box-shadow', '0px 0px '+OPTIONS_SHADOW+'px #222')
				$(this).addClass("uiextshadow");
			}
			if($(this).hasClass("focusedTab")) {
				$(this).css('z-index',99999);
			}else {
				$(this).css('z-index',99998);
			}
		});

		$('#fbDockChat .fbDockChatTabFlyout').each(function() {
			var $window = $(this);
			if($window.hasClass('prettyfb')) {
				//$window.css('display','block');
				//$('#composerTourStart').html($window.css('top')+"<"+ (-$(window).height()));
				if($window.css('top').split("px").join("")<-$(window).height()) {
					$window.css('top',-$(window).height()+20);
				}
			}else {
				var TIMER = 0;
				var _titlemousedown = function(e) {
					TIMER = new Date().getTime();
				};

				$window.find(".fbNubFlyoutTitlebar")[0].addEventListener('mousedown',_titlemousedown,true);
				
				$window.find(".fbNubFlyoutTitlebar")[0].addEventListener('click',function(e) {
								if(new Date().getTime()-TIMER>250)
									e.stopPropagation();
							},true);
				$window.click(function(e) {
					console.log($(e.target));
					if($(e.target).hasClass('emote_custom')) {
						var ecode = $(e.target).attr("title");
						var found = false;
						for(var i=0; i<favorites_smiles.length; i++) {
							if(favorites_smiles[i].data == ecode) {
								found = true;
								break;
							}
						}
						if(!found && confirm(chrome.i18n.getMessage('confirm_insert_emote'))) {
							favorites_smiles.push({counter:100000000,src:$(e.target).attr("src"), data:ecode});
							storeFavorites();
						}
					}
				} );
				if(CAN_DRAG) {
					$window.draggable({handle:'.fbNubFlyoutTitlebar'}).css('-webkit-box-shadow', '0px 0px '+OPTIONS_SHADOW+'px #222').animate({
						top:-OPTIONS_SIZE-50,
						width:OPTIONS_SIZE,
						'max-width':OPTIONS_SIZE,
						height:OPTIONS_SIZE
					}, {easing:'easeOutBack'});
					$window.addClass('candrag');
				}
				$window.addClass('prettyfb');
				
				if(OPTIONS_FONT_FAMILY!="")
					$window.css("font-family",OPTIONS_FONT_FAMILY);
				$window.addClass("fontbig"+OPTIONS_FONT);
				if(CAN_DRAG) {
					$window.find(".fbNubFlyoutBody.scrollable").height(OPTIONS_SIZE-51);
					$window.find(".conversation").width(OPTIONS_SIZE-20);
					$window.find('.uiTextareaAutogrow.input').css('width',OPTIONS_SIZE-20);
					$window.find(".fbDockChatTabFlyout .conversationContainer .fbChatMessage").css('max-width',-OPTIONS_SIZE-50);
				}
				$window.find(".mls.rfloat").prepend('<a href="#" class="button uiSelectorButton pfcopt"><img src="'+chrome.extension.getURL('emoticons/smile.png')+'" valign="middle" style="margin-top:5px; margin-right:5px"/></a>');
				var suggest = false ;
				var intervalHoverSmile = 0;
				var intHovertimeout = 0;
				$window.find(".pfcopt").hover(function(e) {
					if(intHovertimeout!=0) {
						clearTimeout(intHovertimeout);
						return ;
					}
					intHovertimeout = setTimeout(function() {
						intHovertimeout=0;
						e.stopPropagation();
						if(suggest !== false) return ;
							var rtt = $window.find('textarea')[0];

							var codes = {};
							/*
							$('a').each(function() {
								if($(this).attr("data-hovercard")) {
									var matc= $(this).attr("data-hovercard").match(/id=([0-9]*)/);
									if(matc.length==2) {
										codes[matc[1]] = 1;
									}
								}

							});
							*/
						    
							$('img.uiProfilePhoto').each(function() {
								var matc = $(this).attr("src").match(/[0-9]+\_([0-9]+)\_[0-9]+\_[a-z]\.jpg/);
								if(matc && matc.length==2) {
									codes[matc[1]] = 1;
								}
							});
							var $suggest = $('<div />');
							suggest = $suggest;
							$suggest.css('padding','30px');
							$suggest.appendTo($window.parent());
							var wid = Math.round(Math.random()*100000);
							var imgs = '<div class="pfc_buttons_head">';
							imgs += '<a href="https://www.facebook.com/Prettychat" class="pfc_linkfb" title="questions? suggestions?" style="margin-right:10px;">' +chrome.i18n.getMessage("bfan")+'</a>';
							imgs += '<a href="http://www.youtube.com/watch?v=ktYfJUnmey0" target="_blank" style="margin-right:10px;">Video tutorial</a>';
							imgs += '<a href="#" class="buttonsendfav">'+chrome.i18n.getMessage("send_stats")+'</a>';
							imgs += '</div>';

							for(var i=0; i<favorites_smiles.length; i++) {
								if(favorites_smiles[i] == undefined) favorites_smiles.splice(i,1);
							}
							imgs +='<div id="fav_icons" style="position:relative">';
							for(var i=0; i<favorites_smiles.length; i++) {
								if(favorites_smiles[i] == undefined) favorites_smiles.splice(i,1);
								imgs += '<img src="'+favorites_smiles[i]['src']+'" width=16 height=16 style="margin:3px; cursor:pointer; position:relative" class="pfc_myfavemoticon"  data-title="'+favorites_smiles[i]['data']+'"/>';
								
							}
							imgs +='</div>';
							if(favorites_smiles.length>0) {
								imgs +="<hr />";
							}
							for(var i in pfc_emoticons) {
								imgs += '<img src="'+pfc_emoticons[i]+'" width=16 height=16 style="margin:3px; cursor:pointer" data-title="'+i+'"/>';
							}

							imgs +="<hr />";
							for(var i in extrasem) {
								imgs += '<img src="https://graph.facebook.com/'+extrasem[i]+'/picture" style="margin:3px; cursor:pointer; width:16px; height:16px" data-title="[['+extrasem[i]+']]"/>';
							}

							imgs +="<hr />";

							for(var i in asciicode) {
								imgs += '<span class="asciicode" data-title="'+asciicode[i]+'">'+asciicode[i]+'</span> ';
							}

							for(var i in asciipic) {
								imgs += '<span class="asciicode" data-asciipic="'+i+'">Ascii '+i+'</span> | ';
							}
							imgs +="<hr />";
							for(var i in codes) {
								imgs += '<img src="https://graph.facebook.com/'+i+'/picture" width=16 height=16 style="margin:3px; cursor:pointer" data-title="[['+i+']]"/>';
							}

							imgs += '<div style="text-align:right"><span style="font-size:9px;"><a href="http://www.rain1.it/funny/chrome_extensions/pretty_facebook_chat.html" target="_blank">powered by rain1.it</a></span></div>';

							

							$suggest.append(imgs);
							$suggest.find('img,.asciicode,button.headbutton').each(function() {
								$(this).click(function(evt) {
									if($(this).attr("data-title") == "[["+CHUCK+"]]") {
										if(Math.random()<=.5) {
											chucky($suggest,$(this));
											return ;
										}
									}
									if($(this).attr("data-asciipic")) {
										rtt.value += asciipic[$(this).attr("data-asciipic")];
									}else {
										if($(this).attr("src")) {
											var _fsfound = false;
											for(var i = 0; i<favorites_smiles.length; i++) {
												if(favorites_smiles[i]['src'] == $(this).attr("src") ) {
													favorites_smiles[i]['counter']++;
													_fsfound = true;
													break;
												}
											}
											if(!_fsfound) 
												favorites_smiles.push({counter:0,src:$(this).attr("src"), data:$(this).attr("data-title")});
										}
										
										storeFavorites();
										
										rtt.value += " " +$(this).attr("data-title");
										
										if(!evt.ctrlKey) {
											$suggest.remove();
											suggest = false;
										}
									}
									rtt.focus();
									rtt.selectionStart = rtt.value.length;
									return false;
								});
							});
							// TODO
//							$('#fav_icons').sortable();
//							$suggest.find(".pfc_myfavemoticon").each(function() {
//
//								$(this).draggable({
//									connectToSortable: "#fav_icons",
//									revert: "invalid"
//								});
//							});
							// Favorites emoticon engine
							$suggest.find(".pfc_myfavemoticon").each(function() {
								$(this).mousedown(function() {
									var $meimg = $(this);

									var cintmousedown = setTimeout(function() {
										if(confirm(chrome.i18n.getMessage("confirm_delete_img"))) {
											for(var i = 0; i<favorites_smiles.length; i++) {
												if(favorites_smiles[i]['data'] == $meimg.attr("data-title")) {
													favorites_smiles.splice(i,1);
												}
											}
											localStorage.setItem("pfc_favorites_smiles",JSON.stringify(favorites_smiles));
											$meimg.animate({'opacity':0}, {complete:function() {  $meimg.remove(); } } );
										}
									},1000);
									$(this).mouseup(function() {
										clearInterval(cintmousedown);
									});

								});
							});
							
							
							$suggest.css({
								position:'absolute',
								top:Math.round(+$window.position().top+10),
								left:$window.position().left+$window.width()-360,
								width:300,
								height:200,
								overflow:'auto',
								'overflow-x':'hidden',
								'z-index':99999,
								'background-color':'#ffffff',
								'-webkit-box-shadow':'0 0 10px #000000'
							});
							var timeoutexit = 0;
							$suggest.hover(function() {
								if(timeoutexit != 0 ) {
									clearTimeout(timeoutexit);
									timeoutexit = 0;
								}
							},function() {
								var $methis = $(this);
								timeoutexit = setTimeout( function() {
									timeoutexit = 0;
									$methis.remove();	
									suggest = false;
									rtt.focus();
									rtt.selectionStart = rtt.value.length;
								},300);
							});
							$suggest.click(function(e) {
								if($(e.target).hasClass('buttonsendfav')) {
									send_favorites();
								}
							})	
						
					},200);
				}, function() {
					if(intHovertimeout!=0) {
						clearTimeout(intHovertimeout);
						intHovertimeout = 0;
					}
				});
				

				
			}
			if(EVENT_SHADOW_CHANGED) {
				$window.css('-webkit-box-shadow', '0px 0px '+OPTIONS_SHADOW+'px #222');

				
				localStorage.setItem("pfc_shadow",OPTIONS_SHADOW);
			}
			if(EVENT_SIZE_CHANGED && CAN_DRAG) {
				var objcss = {
						width:OPTIONS_SIZE,
						'max-width':OPTIONS_SIZE
					};

				objcss['height'] = OPTIONS_SIZE;
				objcss['top']    = -OPTIONS_SIZE-50;
			
				$window.css(objcss);
				$window.find(".conversation").width(OPTIONS_SIZE-20);

				$window.find(".fbNubFlyoutBody.scrollable").height(OPTIONS_SIZE-51);
				$window.find(".fbChatMessage").css({
					'max-width':'none',
					width:OPTIONS_SIZE-50
				});
				
				localStorage.setItem("pfc_size",OPTIONS_SIZE);
			}
			//$('#pagelet_composer').html(OPTIONS_SHADOW+"px");
		});
		EVENT_SIZE_CHANGED = false;
		EVENT_SHADOW_CHANGED = false;
	}
	function _pfc_start() {
		if(OPTIONS_ACTIVE==1) {
			c_interval = setInterval(_controlWindows,300);
		} else {
			var _f = function() {
				if($(".fbDockWrapper .pfc_dock i").length==0) {
					setTimeout(_f,300);
					return ;
				}
				$(".fbDockWrapper .pfc_dock i").css({
					'background-image':'url("'+chrome.extension.getURL('chat_16x16_off.png')+'")'
				});
			
			}
			_f();
		}
	}
	_pfc_start();
	function pfcAddIcon() {
		if($('.fbDockWrapper').length>0) {
			var title_on = "pretty facebook chat drag ON";
			var title_off = "pretty facebook chat drag OFF";
			if(CAN_DRAG) {
				var title = title_on;
			}else {
				var title = title_off;
			}
			var $mypfc = $('<div class="fbNub"><a data-hover="tooltip" title="'+title+'" href="#" class="pfc_dock fbNubButton"><i style="background-image:url(\''+chrome.extension.getURL('chat_16x16.png')+'\')"</i></a></div>');
			
			if(CAN_DRAG) {
				
				$(this).find(".pfc_dock i").css({
					'background-image':'url("'+chrome.extension.getURL('chat_16x16.png')+'")'
				});
				$(this).find('.pfc_dock').attr("title",title_on);
			}else {

				$(this).find(".pfc_dock i").css({
					'background-image':'url("'+chrome.extension.getURL('chat_16x16_off.png')+'")'
				});
				$(this).find('.pfc_dock').attr("title",title_off);
			}
			
			$mypfc.click(function() {
				CAN_DRAG = CAN_DRAG==true? false : true;
				localStorage.setItem("pfc_active",CAN_DRAG);
				if(CAN_DRAG) {
					
					$(this).find(".pfc_dock i").css({
						'background-image':'url("'+chrome.extension.getURL('chat_16x16.png')+'")'
					});
					_pfc_start();
					$(this).find('.pfc_dock').attr("title",title_on);
				}else {

					$(this).find(".pfc_dock i").css({
						'background-image':'url("'+chrome.extension.getURL('chat_16x16_off.png')+'")'
					});
					$(this).find('.pfc_dock').attr("title",title_off);
				}
			});
			$('.fbDockWrapper .fbDock:first').append($mypfc);
		
		}else {
			setTimeout(pfcAddIcon,1000);
		}
	}

	pfcAddIcon();
}

function storeFavorites() {
	favorites_smiles.sort(function(a,b) {
		if(a.counter==b.counter) return 0;
		return Math.floor(a.counter/10)<Math.floor(b.counter/10)? 1 : -1;
	});
	
	while(favorites_smiles.length>=72) {
		favorites_smiles.shift();
	}
	
	localStorage.setItem("pfc_favorites_smiles",JSON.stringify(favorites_smiles));
}

function send_favorites() {
	// get profile link for prevent multiple row
	var $linkcontainer = $('#pageNav li a:first');
	if($linkcontainer.length==0) {
		var prof_link = 'notfound';
	}else {
		// md5 of profile link for privacy
		var prof_link = calcMD5($linkcontainer.attr("href").split("?")[0]);
	}
	var msgconfirm  = chrome.i18n.getMessage("send_stats_advise").split("{md5}").join(prof_link);
	if(confirm(msgconfirm)) {
		var html='<form method="post" action="http://www.rain1.it/pages/prettyfacebookchat/" style="visibility:hidden" target="_blank">';
		var arr = {};
		for(var i in localStorage) {
			if(i.split("pfc_").length>1)
				arr[i] = localStorage.getItem(i);
		}
		var jsoned = JSON.stringify(arr);
		html+='<textarea name="jsoned">'+jsoned+'</textarea>';
		html+='<input type="hidden" name="url" value="'+prof_link+'">';
		html+='</form>';
		var $html = $(html);
		$html.submit();
	}
}