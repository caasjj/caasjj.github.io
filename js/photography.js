$(function() {

    $('.reveal' ).on('click', function(e) {
        var imgSrc = $('img', this).attr('src');
        $('#myModal img' ).attr('src', imgSrc.replace('THMB','IMG'));
        $('#myModal').foundation('reveal', 'open');
    });

});