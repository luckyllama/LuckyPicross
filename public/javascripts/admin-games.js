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
                updateStatus(data, 'Game has been deleted.', 'Could not delete game.')
            });
        return false;
    });

    $('td.preview').each(function () {
        var $preview = $(this);
        var game = new App.Models.Game({ hash: $preview.data('hash'), height: $preview.data('height'), width: $preview.data('width') });

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("version", "1.2");
        svg.setAttribute("baseProfile", "tiny");
        svg.setAttribute("style", "width: 60px; height: 60px;")

        var width = game.get('width');
        var height = game.get('height');
        var squareSize = 60 / height;
        
        _.each(game.get('board').split(''), function (value, index) {
            if (value === "1") {
                var square = document.createElementNS("http://www.w3.org/2000/svg", "rect");

                square.style.fill = "black";
                square.width.baseVal.value = squareSize;
                square.height.baseVal.value = squareSize;
                square.x.baseVal.value = (index % width) * squareSize;
                square.y.baseVal.value = parseInt(index / height) * squareSize;

                svg.appendChild(square);
            }
        });

        $preview.append(svg);
    });

});