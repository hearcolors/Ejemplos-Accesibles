var Course = {
	counter : 0,
	disableExpandButtons : function() {
		var numExpanded = $('li[aria-expanded=true]').length,
			numCollapsed = $('li[aria-expanded=false]').length;

		if (numExpanded === 0) {
			$('button.collapseAll').attr('disabled', 'disabled').attr('aria-disabled', 'true');
		} else {
			$('button.collapseAll').removeAttr('disabled').removeAttr('aria-disabled');
		}
		if (numCollapsed === 0) {
			$('button.expandAll').attr('disabled', 'disabled').attr('aria-disabled', 'true');
		} else {
			$('button.expandAll').removeAttr('disabled').removeAttr('aria-disabled');
		}
	},
	toggleMenu : function(item) {
		var $a = $(item),
			$li = $a.parent(),
			$ul = $li.children('ul'),
			$openclose = $($li.find('a.openclose'));

		if ($openclose.hasClass('collapsed')) {
			$openclose.removeClass('collapsed').addClass('expanded');
			$ul.removeClass('collapsed')
				.attr('aria-hidden', false)
				.removeAttr('hidden')
				.parent()
					.attr('aria-expanded', true)
					.removeClass('collapsed')
					.addClass('expanded');
			$ul.children('li')
				.removeAttr('hidden')
				.attr('aria-hidden', false);
			$li.find('span.offscreen').html('Opened submenu');
		} else if ($openclose.hasClass('expanded')) {
			$openclose.removeClass('expanded').addClass('collapsed');
			$ul
				.addClass('collapsed')
				.attr('aria-hidden', true)
				.attr('hidden', 'hidden')
				.parent()
					.attr('aria-expanded', false)
					.removeClass('expanded')
					.addClass('collapsed');
			$ul.children('li').attr({
				'hidden': 'hidden',
				'aria-hidden': true
			});
			$li.find('span.offscreen').html('Closed submenu');
		}
		Course.disableExpandButtons();
	},
	makeSelectionVisible : function(el) {
		var rect = el.getBoundingClientRect();

		var isVisible =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth);

		if (!isVisible) {
			var scrollTo = $(el).position().top + ($(el).outerHeight() - $(window).height())/2;
			$('html,body').scrollTop(scrollTo);
		}
	},
	
	announce: function(str) {
		var $into = $('#aria-live');
		if ($into) {
			$into.html(str);
		}
	},
	init: function(course) {
		var $head = $('#head-marker'),
			//$container = $('<div id="container">\n').appendTo($head),
			$headcontainer = $('<div id="headcontainer">\n').appendTo($head),
			$headerDiv = $('<div id="header">\n').appendTo($headcontainer),
			$header = $('<header>\n').appendTo($headerDiv),
			$headerH2 = $('<h2 id="course_title">\n').appendTo($header),
			$headerLink = $('<a>').attr('href', '00-introduction.html').html(course.name).appendTo($headerH2),

			$nav = $('<nav id="topics" role="navigation">\n').appendTo($headcontainer),
			$navH2 = $('<h2>').html('Topics').appendTo($nav),
			$expandWrapper = $('<div>').addClass('expandWrapper').appendTo($nav);
			$expandAll = $('<button>').addClass('expandAll navtree').html('<img src="img/plus-9.png" alt=""> Expand all').appendTo($expandWrapper);
			$collapseAll = $('<button>').addClass('collapseAll navtree').html('<img src="img/minus-9.png" alt=""> Collapse all').appendTo($expandWrapper);
         // NOTE: Used .prop in the line below instead of .attr. This fixes a bug for IE in "IE7" compatability mode.
			$navDiv = $('<div>').attr('role', 'application').prop('aria-label', 'Main navigation tree menu').appendTo($nav);
			$navList = $('<ul id="topics_list" class="menu">').appendTo($navDiv),
			$liveRegion = $('<div>').attr({
				'aria-live': 'polite',
				'role': 'alert',
				'aria-relevant': 'additions',
				'class': 'offscreen',
				'id': 'aria-live'
			}).appendTo($nav);
			$content = $("#content");
			
			$("#skipnav").click(function(ev) {
			$content.attr('tabindex', -1).focus();
			ev.preventDefault();
			return false;
		});

		this.course = course;

		var ua = navigator.userAgent.toLowerCase();
		this.VoiceOver = (ua.indexOf('safari') != -1 && ua.indexOf('chrome') === -1);
		Course.fixExternalLinks();
	}
};
