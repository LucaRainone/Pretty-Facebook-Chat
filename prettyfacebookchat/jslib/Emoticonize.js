// add path to internal emoticon
for(var i in EMOTICONS.pfc_emoticons) {
	if(EMOTICONS.pfc_emoticons[i].substr(0,4)!="http") {
		EMOTICONS.pfc_emoticons[i] = chrome.extension.getURL("emoticons/"+EMOTICONS.pfc_emoticons[i]);
	}
}


$.fn.Emoticonize = function(selectors, config) {

	var $window = $(window);
	
	var $emoticonWindow;
	if($('#pfc_emoticon_window').length == 0) {
		imgs = ''+
			'<div class="pfc_emoticon_tab_container">'+
			'<div class="pfc_emoticon_tab pfc_emoticon_tab_default statuson" data-tab="default"></div>'+
			'<div class="pfc_emoticon_tab pfc_emoticon_tab_meme" data-tab="meme"></div>'+
			'<div class="pfc_emoticon_tab pfc_emoticon_tab_smileys" data-tab="smileys"></div>'+
			
			'</div><div class="pfc_clear"></div>';
		
		
		imgs += '<div class="pfc_emoticons_group pfc_emoticons_default">';
		for(var i in EMOTICONS.pfc_emoticons) {
			imgs += '<img src="'+EMOTICONS.pfc_emoticons[i]+'" width=16 height=16 style="margin:3px; cursor:pointer" data-title="'+i+'"/>';
		}
		imgs += '</div>';

		var firstTime = true;
		for(var i in EMOTICONS.extrasem) {
			if(EMOTICONS.extrasem[i].substr(0,9) == ':::GROUP:') {
				if(!firstTime) {
					imgs +='</div>';
				}
				firstTime = false;
				imgs +='<div class="pfc_emoticons_group pfc_emoticons_'+EMOTICONS.extrasem[i].substr(9)+'">';
				continue;
			}
			imgs += '<img src="https://graph.facebook.com/'+EMOTICONS.extrasem[i]+'/picture" style="margin:3px; cursor:pointer; width:16px; height:16px" data-title="[['+EMOTICONS.extrasem[i]+']]"/>';
		}
		imgs +="</div>";
		
		
		$emoticonWindow = $('<div/>').attr("id","pfc_emoticon_window").html(imgs);
		$emoticonWindow.find('.pfc_emoticons_group').css('display','none');
		$emoticonWindow.find('.pfc_emoticons_default').css('display','');
		
		$emoticonWindow.on('click','.pfc_emoticon_tab',function(e){
			e.stopPropagation();
			$emoticonWindow.find('.pfc_emoticon_tab').removeClass("statuson");
			$(e.target).addClass("statuson");

			$emoticonWindow.find('.pfc_emoticons_group').css('display','none');
			$emoticonWindow.find('.pfc_emoticons_'+e.target.dataset.tab).css('display','');
		});
		// prevent waiting window onload
		

	}else {
		$emoticonWindow = $('#pfc_emoticon_window');
	}
	
	this.each(function() {
		var $chatWindow = $(this),
		$self   = $chatWindow.find( selectors.chatWindow.selfWindow ),
		$smile = $('<a href="#" class="button uiSelectorButton pfcopt" data-status="off"></a>');

		$chatWindow.find( selectors.chatWindow.selfMenu ).prepend($smile);
		$smile.css('opacity',.6);
		$smile.hover(function(e) {
			if($smile.attr('data-status') != "on")
				$smile.css('opacity',.9);
		},function(e) {
			if($smile.attr('data-status') != "on")
				$smile.css('opacity',.6);
		})
		$smile.click(function(e) {
			e.stopPropagation();
			e.preventDefault();

			if($smile.attr('data-status') == 'off') {
				openWindow()
			}else {
				closeWindow();
			}
		});

		$self.on('click','.pfc_emoticons_group img', function(e) {
			e.stopPropagation();
			var $this = $(this);
			var rtt = $self.find('textarea')[0];
			console.log($this);

			if($this.attr("data-asciipic")) {
				rtt.value += EMOTICONS.asciipic[$(this).attr("data-asciipic")];
			}else {
				
				
				rtt.value += " " +$this.attr("data-title");
				
				if(!e.ctrlKey) {
					closeWindow();
				}
			}
			rtt.focus();
			rtt.selectionStart = rtt.value.length;
			return false;
		});
		
		function openWindow() {
			$smile.attr('data-status','on').addClass('statuson');
			$smile.css('opacity',1);
			$chatWindow.find( selectors.chatWindow.selfHeader).append($emoticonWindow);
			$emoticonWindow.css({
				top: 0,
				right:20,
				display:'block'
			});
			var _close = function() {
				closeWindow();
				$window.unbind('click',_close);
			}
			$window.bind('click', _close);
		}
		
		function closeWindow() {
			$smile.css('opacity',.6).css('background-color','none');
			$smile.attr('data-status','off').removeClass('statuson');
			$emoticonWindow.css('display','none');
		}
		
	});
	return this;
}