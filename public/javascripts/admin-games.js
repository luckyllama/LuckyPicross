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
        var modal = $('#delete-modal');
        var $row = link.closest('tr');
        $('.preview-thumbnail', modal).html(generateSvg($row.data('hash'), $row.data('height'), $row.data('width'), 300));
        modal.modal();
        $('.btn-danger', modal).off('click').on('click', function () {
            $.ajax(link.attr('href'), { type: 'DELETE'})
                .done(function (data) {
                    if (data.success) {
                        link.closest('tr').remove();
                    }
                    updateStatus(data, 'Game has been deleted.', 'Could not delete game.');
                    modal.modal('hide');
                });
        });
        $('.keep', modal).off('click').on('click', function () {
            modal.modal('hide');
        });
        return false;
    });

    var generateSvg = function (gameHash, gameHeight, gameWidth, svgWidth) {
        console.log(gameHash, gameHeight, gameWidth, svgWidth)
            var game = new App.Models.Game({ hash: gameHash, height: gameHeight, width: gameWidth });

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("version", "1.2");
            svg.setAttribute("baseProfile", "tiny");
            svg.style.width = svgWidth;
            svg.style.height = svgWidth;

            var width = game.get('width');
            var height = game.get('height');
            var squareSize = svgWidth / height;
            
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
            return svg;
    }

    $('a.preview').hover(function () {
        var $preview = $(this);
        var $previewArea = $preview.siblings('.preview-thumbnail');

        if ($previewArea.find('svg').length === 0) {
            var $row = $preview.closest('tr');
            $previewArea.append(generateSvg($row.data('hash'), $row.data('height'), $row.data('width'), 100));
        }
        $previewArea.show();
    }, function () {
        $(this).siblings('.preview-thumbnail').hide();
    });

});