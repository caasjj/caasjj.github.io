var whWebSite = whWebSite || {};

whWebSite.banner = $( function () {

  function init () {

    $( '.parallax' ).on( 'scroll', function () {
      var scroll = $( '.foreground' ).offset().top;
      $( '.site-banner .banner' ).css( 'opacity', Math.min( 1, Math.max( 0, scroll / (2 * window.innerHeight / 3) ) ) );
    } );

  }

  init();
  return {

  }
} );
