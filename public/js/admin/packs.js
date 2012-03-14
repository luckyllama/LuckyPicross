$(function () {

    var updateStatus = function (success, successMessage, errorMessage) {
        var $closeLink = $('<a>').addClass('close').attr('data-dismiss', 'alert').text('x');
        if (success) {
            $('#response').html($('<div>').addClass('alert alert-success')
                .text(successMessage).append($closeLink));
        } else {
            $('#response').html($('<div>').addClass('alert alert-error')
                .text(errorMessage).append($closeLink));
        }
    };

    $('table').on('click', 'a.delete', function (ev) {
        var link = $(this);
        var modal = $('#delete-modal');

        modal.modal();
        $('.btn-danger', modal).off('click').on('click', function () {
            $.ajax(link.attr('href'), { type: 'DELETE'})
                .done(function (data) {
                    if (data.success) {
                        link.closest('tr').remove();
                    }
                    updateStatus(data.success, 'Pack "' + data.name + '" has been deleted.', 'Could not delete pack.');
                    modal.modal('hide');
                });
        });
        ev.preventDefault();
    });

    $('table').on('click', 'td.active input', function (ev) {
        var checkbox = $(this);
        $.ajax(checkbox.data('updateUrl'), { data: { isActive: checkbox.is(':checked') }, type: 'POST' })
            .done(function (data) {
                var updated = checkbox.is(':checked') ? 'activated' : 'deactivated';
                updateStatus(data.success, 'Pack has been ' + updated + '.', 'Could not update pack.');
            }).fail(function () {
                updateStatus(false, null, 'Server error: could not update pack.')
            });
    })

    $('tfoot a.new-pack').click(function (ev) {
        ev.preventDefault();
        var link = $(this);
        var $name = $('tfoot td.name input');
        if ($name.val().trim().length <= 0) {
            $name.closest('.control-group').addClass('error');
            return;
        } else {
            $name.closest('.control-group').removeClass('error');
        }
        var data = { name: $name.val() };
        $.ajax(link.attr('href'), { type: 'PUT', data: data })
            .done(function (data) {
                if (data.success) {
                    var compiled = _.template($('#row').html());
                    data.value.createdDate = new Date(data.value.created).toDateString();
                    $('tbody').append(
                        compiled(data.value)
                    );
                    $('span.timeago').timeago();
                    $name.val(''); // clear the name just posted
                }
                updateStatus(data.success, "Pack has been created!", data.message);
            });
    });
    
    $('span.timeago').timeago();

});