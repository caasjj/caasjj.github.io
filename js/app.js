// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

var whWebSite = whWebSite || {};

whWebSite.topbar = $(function() {

  function init() {

    function clearInputContent(event) {
      if (event.keyCode == 13) {
        $(this ).val('');
        return false;
      }
    }

    function handleInputEnter(event) {
      if (event.keyCode == 13) {
        $(this ).val('');
        return false;
      }
    }

    function hideBottomPostNav() {
      if ($('.post' ).height() > window.innerHeight ) {
        $('.bottom-postnav' ).removeClass('removed');
      } else {
        $('.bottom-postnav' ).addClass('removed');
      }
    }

    $('.topbar-search' ).on('blur',  clearInputContent.bind(this) )
    $('.topbar-search' ).on('keydown', handleInputEnter.bind(this) ) ;
    hideBottomPostNav();

  }

  init();
  return {
    search: function() { }
  }
});
