$(function(){
	if(!Modernizr.input.placeholder) {
		$('input').setup_placeholders();
	}

	$('#watch-player').youtube_controller();
	$('h1,h2,h3,h4,h5,h6').add_tabindex();

    // Test to see if user is at AEA
    // if(navigator.geolocation){
    //     aea_banner();
    // }
});

$(window).load(function(){
	$('[id^="___plusone_"]').each(function() {
		$(this).find('iframe').first().attr('title','Google Plus One');
	});
});

$.fn.setup_placeholders = function() {
	$(this).each(function() {
		var placeholder = $(this).attr('placeholder');
		if(placeholder) {
			if(!$(this).val() || $(this).val() == placeholder) {
				$(this).val(placeholder);
				$(this).addClass('placeholder');
			}
			$(this).focus(function(){
				if($(this).val() == placeholder) {
					$(this).val('');
					$(this).removeClass('placeholder');
				}
			});
			$(this).blur(function(){
				if(!$(this).val()) {
					$(this).val(placeholder);
					$(this).addClass('placeholder');
				}
			});
			$(this).parents('form').submit(function(){
				$('input').each(function(){
					if($(this).val() == placeholder)
						$(this).val('');
				});
			});
		}
	});
};

$.fn.youtube_controller = function() {
	var player = $(this);
	var playButton = $('<button />', {
		text: 'Pause',
		id: 'playBtn',
		'aria-controls': $(player).attr('id'),
		click: function(e){
            e.preventDefault();
            var ytplayer = document.getElementById('video-player');
            if (ytplayer) {
                playerState = ytplayer.getPlayerState();
                if (playerState == 2 || playerState == -1) {
                    ytplayer.playVideo();
                    $(this).text = 'Pause';
                } else if (ytplayer.getPlayerState() == 1) {
                    ytplayer.pauseVideo();
                    $(this).text('Play');
                }
            }
        }
	});
    
	$(player).append(playButton);
	var muteButton = $('<button />', {
		text: 'Mute',
		id: 'muteBtn',
		'aria-controls': $(player).attr('id'),
		click: function(e){
            e.preventDefault();
            var ytplayer = document.getElementById('video-player');
            if (ytplayer) {
                if (ytplayer.isMuted()) {
                    ytplayer.unMute();
                    $(this).text('Mute');
                } else {
                    ytplayer.mute();
                    $(this).text('Unmute');
                }
            }
        }
	});
	$(player).append(muteButton);
};

$.fn.add_tabindex = function() {
	var $elements = this;

	$elements.each(function() {
		$element = $(this);

		if($element.find('a').length === 0) {
			$element.attr('tabindex', 0)
				.focus(function(){
					$(this).addClass('focussed');
				})
				.blur(function(){
					$(this).removeClass('focussed');
				});
		}
	});
};


Number.prototype.toRad = function(){
    return this * Math.PI / 180;
};