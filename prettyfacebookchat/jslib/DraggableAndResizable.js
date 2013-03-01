/*
    Pretty Facebook Chat
    Chrome Extensions for improve facebook chat
    Copyright (C) 2013  Luca Rainone <luca.rainone@gmail.com>

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

$.fn.DraggableAndResizable = function(selectors, config, animation) {
	var cssRotate0 = ' rotate(0deg)',
		cssRotate1 = ' rotate(360deg)'
		
	var $window = $(window),
	$document = $(document);		
			
	function enableTransition($el) {
		$el.css({
			'transition-timing-function'         : 'cubic-bezier'+animation,
			'transition'                         : 'all 800ms cubic-bezier'+animation,
			'-webkit-transition-timing-function' : 'cubic-bezier'+animation,
			'-webkit-transition'                 : 'all 800ms cubic-bezier'+animation,
		})
	}

	function disableTransition($el) {
		$el.css({
			'transition-timing-function'         : 'none',
			'-webkit-transition-timing-function' : 'none',
			'transition'                         : 'none',
			'-webkit-transition'                 : 'none',
		})
	}
	
	return this.each(function() {
		config.pfc_add_rotate = Math.random()<.5? 1 : 0;
		
		var $chatWindow = $(this);
		if($chatWindow.attr("data-pfc-enabled") == "1")
			return;
		
		// sign that's already prettified
		$chatWindow.attr("data-pfc-enabled","1").addClass('pfc');
		
		// cache current x,y,z position
		var currentTranslate = [0,0,0];
		

		
		var $self   = $chatWindow.find( selectors.chatWindow.selfWindow ),
			$body   = $chatWindow.find( selectors.chatWindow.selfBody ),
			$header = $chatWindow.find( selectors.chatWindow.selfTitlebar),
			$outer  = $chatWindow.find( selectors.chatWindow.selfOuter),
			$emoticonPanel = $self.find( '.emoticonsPanel'),
			$conversation = $self.find( '.conversation'),
			$input  = $self.find( '.uiTextareaAutogrow.input' ),
			$chatMessage = $self.find(".conversationContainer .fbChatMessage")
			;
		
		$self.css({width: $self.width(), 'max-width':$self.width(), height:$self.height(), 'max-height':$self.height()})
		$body.css(
				{height: $body.height(), 'max-height':$body.height()}
		);
		
		// corner for resize
		var $corner = $('<div></div>').addClass('pfc_service_resize');
		$outer.append($corner);

		setTimeout(init,100);
		
		// minimum size and resize only when cursor is in the last valid position
		var lastValidX = 0, lastValidY = 0, xBlocked = false, yBlocked = false;
		function resizeWithoutAnimation(w,h,deltaX,deltaY, cPosX,cPosY) {
			var oldW = w;
			var oldH = h;
			
			if(w < 200) {
				w = 200;
				xBlocked = true;
			}
			
			if(h < 200) {
				h = 200;
				yBlocked = true;
			}
			
			if(!xBlocked || (xBlocked && cPosX > lastValidX)) {
				console.log(xBlocked);
				console.log(cPosX);
				console.log(lastValidX);
				$self.css({
					width               : w,
					'max-width'         : w,
				});
				xBlocked = false;
			}
			
			if(!yBlocked || (yBlocked && cPosY > lastValidY)) {
				$self.css({
					height              : h, 
					'max-height'        : h
				});
				yBlocked = false;
			}

			if(!xBlocked) {
				currentTranslate[0] += deltaX;
				lastValidX = cPosX;
			}
			if(!yBlocked) {
				currentTranslate[1] += deltaY;
				lastValidY = cPosY;
			}
			
			$self.css(
				{'-webkit-transform' : 'translate3d('+currentTranslate[0]+'px,'+currentTranslate[1]+'px,'+currentTranslate[2]+')'+(config.pfc_add_rotate? cssRotate1 : '')}	
			);
			setTimeout(function() {
				$body.css(
						{height: h-51, 'max-height':h}
				);
				$emoticonPanel  .css({left:w-26})
				$conversation   .width(w-20);
				$input          .css('width',w-20);
				$chatMessage    .css('max-width',-w-50);
			},1);
		}
		
		// ANIMATION START
		function init() {
			enableTransition($self.add($body));
			$self.add($body).css({
				'-webkit-transform'                  : 'translate3d(0,0,0)'+(config.pfc_add_rotate? cssRotate0 : ''),
			})
			var oWidth = $self.width();
			var oHeight = $self.height();
			$self.css({
				width               : config.pfc_size,
				height              : config.pfc_size, 
				'max-width'         : config.pfc_size,
				'max-height'        : config.pfc_size, 
				'box-shadow'        : config.pfc_size[2]+'px ' +config.pfc_size[1]+'px '+config.pfc_size[0]+'px #333',
				'-webkit-transform' : 'translate3d(-100px,-'+(config.pfc_size-250)+'px,0)'+(config.pfc_add_rotate? cssRotate1 : '')
			});
			currentTranslate = [-100,-config.pfc_size+250,0];
			setTimeout(function() {
				$body.css(
						{height: config.pfc_size-51, 'max-height':config.pfc_size}
				);
				$emoticonPanel.css({left:config.pfc_size+-26})
				$conversation.width(config.pfc_size-20);
				$input.css('width',config.pfc_size-20);
				$chatMessage.css('max-width',-config.pfc_size-50);
			},10);
		}
		setTimeout(function() {
			disableTransition($self.add($body));
		},1100);
		
		// RESIZABLE
		$corner.bind('mousedown',function(e) {
			e.stopPropagation();
			e.preventDefault();
			disableTransition($self.add($body));
			var startmousedown = +new Date(),
				lastposx = e.pageX,
				lastposy = e.pageY,
				
				_addListeners = function() {
					$window.bind('mousemove',_handlemousemove);
					$window.bind('mouseup', _handlemouseup);
				},
				_removeListeners = function() {
					$window.unbind('mousemove',_handlemousemove);
					$window.unbind('mouseup', _handlemouseup);
				},
				_handlemousemove = function(me) {
					me.preventDefault();
					me.stopPropagation();
					var deltaX = me.pageX-lastposx;
					var deltaY = me.pageY-lastposy;

					resizeWithoutAnimation($self.width()+deltaX,$self.height()+deltaY, deltaX,deltaY, me.pageX,me.pageY);
					
					lastposx = me.pageX;
					lastposy = me.pageY;
				},
				_handlemouseup = function(me) {
					setTimeout(_removeListeners,10);
				};
			
			_addListeners();
		});
		
		
		// DRAGGABLE
		$header.bind('mousedown', function(e) {
			e.stopPropagation();
			e.preventDefault();
			var TIMER = +new Date();
			var windowHeight = $window.height();
			var chatWindowHeight = $self.height();
			var limity = windowHeight-chatWindowHeight;
			var startmousedown = +new Date(),
				lastposx = e.pageX,
				lastposy = e.pageY,
				_addListeners = function() {
					$window.bind('mousemove',_handlemousemove);
					$window.bind('mouseup', _handlemouseup);
					//$header.bind('mouseup', _handlemouseup2);
					$header[0].addEventListener('click',_handleclick,true);
				},
				_removeListeners = function() {
					$window.unbind('mousemove',_handlemousemove);
					$window.unbind('mouseup', _handlemouseup);
					$header.unbind('mouseup', _handlemouseup2);
					$header[0].removeEventListener('click',_handleclick,true);
				},
				_handlemousemove = function(me) {
					me.preventDefault();
					me.stopPropagation();
					var deltaX = me.pageX-lastposx, 
						deltaY = me.pageY - lastposy;
					
					currentTranslate[0] += deltaX;
					currentTranslate[1] += deltaY;
					
					if(limity < -currentTranslate[1]) {
						currentTranslate[1] = -limity;
					}
					
					$self.css(
						{'-webkit-transform' : 'translate3d('+currentTranslate[0]+'px,'+currentTranslate[1]+'px,'+currentTranslate[2]+')'+(config.pfc_add_rotate? cssRotate1 : '')}	
					);
					
					lastposx = me.pageX;
					lastposy = me.pageY;
				},
				_handlemouseup = function(me) {
					setTimeout(_removeListeners,10);
				},
				_handlemouseup2 = function(me) {

					setTimeout(_removeListeners,10);
				},
				// Prevent default hide window if in drag
				_handleclick = function(e) {
					console.log(+new Date()-TIMER);
					if(+new Date()-TIMER>150) {
						e.stopPropagation();
					}
					_removeListeners();
				};
			
			_addListeners();
			
		});
		
		
		
	});
	
	return this;
}
