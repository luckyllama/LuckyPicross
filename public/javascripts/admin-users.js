$(function () {

    var updateStatus = function (data, successMessage, errorMessage) {
        var $closeLink = $('<a>').addClass('close').attr('data-dismiss', 'alert').text('x');
        if (data.success) {
            $('#response').html($('<div>').addClass('alert alert-success')
                .text(successMessage).append($closeLink));
        } else {
            $('#response').html($('<div>').addClass('alert alert-error')
                .text(errorMessage).append($closeLink));
        }
    };

    $('a.delete').click(function () {
        var link = $(this);
        $.ajax(link.attr('href'), { type: 'DELETE'})
            .done(function (data) {
                if (data.success) {
                    link.closest('tr').remove();
                }
                updateStatus(data, 'User has been deleted.', 'Could not delete user.')
            });
        return false;
    });

    $('td.role select').change(function () {
        var select = $(this);
        console.log('changed');
        $.ajax(select.data('url'), { type: 'POST', data: { role: select.val() } })
            .done(function (data) {
                updateStatus(data, 'User role has been updated.', 'Could not update user role.')
            });
    });

});