/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

	
function skipNavigation(skipNavContainer) {
	var defaultHeight = $('#'+skipNavContainer).height(); // get default container height before this script minimizes the container
	closeSkipNavContainer(skipNavContainer); // minimize the container so that later we can slide it open
	skipNavTimeout = null;
	
	// if a link in the skip-nav container receives focus:
	// 1. apply class="active" to the container (class="active" should be set to 'visible' via CSS)
	// 2. slide open the container  
	// 3. apply class="nav-focused" to the linked element
	$('#'+skipNavContainer+' a').bind('focusin', function(event) {
		if ( !$('#'+skipNavContainer).hasClass('active') ) {
			$('#'+skipNavContainer).addClass('active');
			$('#'+skipNavContainer).animate({"height":defaultHeight},{duration:"medium"}); //
		}
		$(event.target).addClass('nav-focused');
	});
	
	// remove class 'nav-focused' if linked element loses focus
	$('#'+skipNavContainer+' a').bind('focusout', function(event) { // if skip nav link loses focus
		$(event.target).removeClass('nav-focused'); // remove 'nav-focused' class
		
		// if none of the links in the skip-nav container have class="nav-focused" run the function to hide the container
		if ( !skipNavTimeout ) { // if skipNavTimeout is not set
			skipNavTimeout = setTimeout( function() { // set timer
				if ( $('#'+skipNavContainer+' .nav-focused').length == 0 ) { // if 'nav-focused' is not found close container
					closeSkipNavContainer(skipNavContainer);
				}
				skipNavTimeout = null;
			}, 500 );
		}
		
	});

	// reduce container height to 1 px and remove class="active" (CSS should be set to hide container if class is absent)
	function closeSkipNavContainer(skipNavContainer) {
		$('#'+skipNavContainer).animate( {"height": '1px'}, 'medium', 'linear', function() { 
			$(this).removeClass('active');
		});
	}
}


