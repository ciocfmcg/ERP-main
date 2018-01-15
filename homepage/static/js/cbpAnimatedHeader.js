/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = (function() {

	var docElem = document.documentElement,
		header = document.querySelector( '.navbar-default' ),
		didScroll = false,
		changeHeaderOn = 300;

	function init() {
		window.addEventListener( 'scroll', function( event ) {
			if( !didScroll ) {
				didScroll = true;
				setTimeout( scrollPage, 250 );
			}
		}, false );
	}

	function scrollPage() {
		var sy = scrollY();
		console.log(screen.availHeight);
		console.log(sy);
		if ( sy >= changeHeaderOn ) {
			classie.add( header, 'navbar-shrink' );
			if (sy > screen.availHeight-400 && sy <= 2*screen.availHeight-400) {
				classie.add( header, 'bg-blue' );
				classie.remove( header, 'bg-red' );
				classie.remove( header, 'bg-black' );
				console.log("blue");
			}else if (sy > 2*screen.availHeight-400 && sy <= 3*screen.availHeight-400) {
				classie.add( header, 'bg-red' );
				classie.remove( header, 'bg-blue' );
				classie.remove( header, 'bg-black' );
				console.log("red");
			}else if (sy > 3*screen.availHeight-400) {
				classie.add( header, 'bg-black' );
				classie.remove( header, 'bg-blue' );
				classie.remove( header, 'bg-red' );
				console.log("black");
			}
		}
		else {
			classie.remove( header, 'navbar-shrink' );
			classie.remove( header, 'bg-blue' );
			classie.remove( header, 'bg-red' );
			classie.remove( header, 'bg-black' );
		}
		didScroll = false;
	}

	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}

	init();

})();
