// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
var whWebSite = whWebSite || {};

/*******************************************************************
 *
 * Post Loader
 *
 * API:
 * .init(): attach event handlers
 *          read basePath
 *          load the page in url hash or redirect to #/page1 if none
 *
 * .loadPage(page): load pagination page ('/pageX') in '.posts'
 *
 * events: click -> .pagination-get-page -> getCurrentPage
 *         click -> .paginator-step-page -> stepPage
 *
 ********************************************************************/
whWebSite.postsLoader = (function () {

  // A page removed from the DOM is cached here by 'swapPage'
  var pageCache = {};

  // We use basePath#/pageX to fetch /pageX
  var basePath = null;
  var paginatePath = null;
  var paginatePage;
  var firstPage;

  // DOM selectors and elements
  var pagePaginator = '.blog-paginator';
  var pageSelector = '.paginator-get-page';
  var pageStepper = '.paginator-step-page';
  var postsContainer = '.posts';
  var spinner = '.spinner';

  var $window = $( window );
  var $pagePaginator = $( pagePaginator );
  var $pageSelector = $( pageSelector );
  var $pageStepper = $( pageStepper );
  var $postsContainer = $( postsContainer );
  var $spinner = $(spinner);

  var currentPage;

  function showSpinner() {
    $spinner.removeClass('removed');
  }

  function hideSpinner() {
    $spinner.addClass('removed')
  }
  function init () {
    if ($('#blog' ).length !== 1) return;
    $pageSelector.on( 'click', getCurrentPage );
    $pageStepper.on( 'click', stepPage );
    basePath = $pagePaginator.attr( 'data-url' )
    basePath += $pagePaginator.attr( 'data-baseurl' );
    paginatePath = $pagePaginator.attr('data-paginate-path' ).split('/');
    paginatePage = '/' + (paginatePath[1].split(':'))[0];
    paginatePath = '/' + paginatePath[0];
    firstPage = paginatePage + '1';
    $window.on( 'popstate', navigateHistory );
    currentPage = readLocationHash();
    loadPage( currentPage );
  }

  function readLocationHash () {
    var hash = document.location.hash.replace( '#', '' ).replace( '/index.html', firstPage );
    if ( hash.length === 0 )
      {
        hash = firstPage;
      }
    return hash;
  }

  function navigateHistory () {
    if ( currentPage !== readLocationHash() )
      {
        currentPage = readLocationHash();
        loadPage( currentPage );
      }
  }

  function getCurrentPage ( event ) {
    var $elem = $( this );
    var page = $elem.attr( 'href' ).replace( '#', '' ).replace( '/index.html', firstPage );
    event.preventDefault();
    currentPage = page;
    showSpinner();
    loadPage( page );
  }

  function stepPage ( event ) {
    var $elem = $( this );
    var newer = $elem.hasClass( 'newer' );
    var pageIndex = +readLocationHash().replace( paginatePage, '' );
    if ( isNaN( pageIndex ) )
      {
        pageIndex = 1;
      }

    var numPages = $pageSelector.length;

    event.preventDefault();
    if ( pageIndex === 1 && newer ) return;
    if ( pageIndex === numPages && !newer ) return;

    if ( newer )
      {
        currentPage = paginatePage + Math.max( 1, pageIndex - 1 );
        loadPage( currentPage );
      }
    else
      {
        currentPage = paginatePage + Math.min( numPages, pageIndex + 1 )
        loadPage( currentPage );
      }

  }

  function loadPage ( page ) {

    page = page || readLocationHash();
    if ( pageCache.hasOwnProperty( page ) )
      {
        console.log( 'Cache hit on ', page );
        swapPage( page, pageCache[page] );
        return;
      }
    console.log( 'Fetching ', page );
    sendRequest( page )
  }

  function sendRequest ( page ) {

    var url = basePath + paginatePath + page.replace( firstPage, '/index.html' );

    function parseData ( data ) {
      var newPosts = $( postsContainer + ' .post', data );
      swapPage( page, newPosts );
    }

    function alertPageError ( reason ) {
      console.error( reason );
    }

    $.get( url )

      .done( parseData )

      .fail( alertPageError );

  }

  function swapPage ( page, newPosts ) {
    var removedPosts = $( '.post', postsContainer ).detach();
    var removedPage = readLocationHash();

    if ( removedPosts.length &&
         !(page === removedPage) &&
         !pageCache.hasOwnProperty( removedPage ) )
      {
        console.log('adding ', removedPosts, 'to cache key ', removedPage);
        pageCache[removedPage] = removedPosts;
      }

    $postsContainer.append( newPosts );
    window.location.hash = page;
    updatePaginator( page );
  }

  function updatePaginator ( page ) {

    var pageId = page.replace( '/', '' );
    var $selectedPage = $( '#' + pageId ).closest( 'li' );
    var index = $selectedPage.index();
    var numPages = $pageSelector.length;
    var $newer = $( pageStepper + '.newer' ).closest( 'li' );
    var $older = $( pageStepper + '.older' ).closest( 'li' );

    $pageSelector.each( function ( index, elem ) {
      $( elem ).closest( 'li' ).removeClass( 'current' );
    } );

    $selectedPage.addClass( 'current' );

    if ( index === 1 )
      {
        $newer.addClass( 'unavailable' );
        $older.removeClass( 'unavailable' );
      }
    else
      {
        if ( index === numPages )
          {
            $newer.removeClass( 'unavailable' );
            $older.addClass( 'unavailable' );
          }
        else
          {
            $newer.removeClass( 'unavailable' );
            $older.removeClass( 'unavailable' );
          }
      }
    hideSpinner();
  }

  return {
    init:init,
    load:loadPage
  };

})();

$( function () {

  whWebSite.postsLoader.init();

} );
$(document).foundation();