function init_html(ob) {
    $ob = $(ob);
    $('#dg-container').mousewheel(function (event, delta) {
        if (delta > 0)
            $('#dg-container').find('.dg-prev').click();
        else
            $('#dg-container').find('.dg-next').click();
        return false;
    });
}

$(document).ready(function () {
    init_html($('body'));
    $('#dg-container').gallery();
});

var app = {
    init: function(){
    }
};