/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// tiles start

$( document ).ready(function() {
  $(".tile").height($("#tile1").width());
  $(".carousel").height($("#tile1").width());
   $(".item").height($("#tile1").width());

  $(window).resize(function() {
  if(this.resizeTO) clearTimeout(this.resizeTO);
this.resizeTO = setTimeout(function() {
  $(this).trigger('resizeEnd');
}, 10);
  });

  $(window).bind('resizeEnd', function() {
    $(".tile").height($("#tile1").width());
      $(".carousel").height($("#tile1").width());
      $(".item").height($("#tile1").width());
  });

});
