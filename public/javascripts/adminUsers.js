$(function () {
    $('a.delete').click(function () {
        var link = $(this);
        $.ajax(link.attr('href'), { type: 'DELETE'})
            .done(function (data) {
                var $closeLink = $('<a>').addClass('close').text('x');
                if (data.success) {
                    link.closest('tr').remove();
                    $('#response').html($('<div>').addClass('alert alert-success')
                        .text('User has been deleted.').append($closeLink));
                } else {
                    $('#response').html($('<div>').addClass('alert alert-error')
                        .text('Could not delete user.').append($closeLink));
                }
            });
        return false;
    });

});