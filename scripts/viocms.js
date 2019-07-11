var vioCMS2 = {
    ready: false,
    popupIndex: 0,
    settings: {
        dimmerOpacity: 0.75,
        dimmerDuration: 700,
        dimmerBackground: '#ccc',
        topOffset: 0,
        delimiter: ".",
        debug: false,
        preloadImgs: new Array()
    },
    funcs: {
        popup_settings: function (obj, settings) {
            return settings;
        }
    },
    gui: {
        dimmer: null,
        popups: null
    },
    debug: function () {
        if (vioCMS2.settings.debug)
            console.log(arguments);
    },
    langs: {},
    //funcs
    init: function (ob) {
        if (typeof (ob) === 'undefined')
            OB = $('body');
        else
            OB = $(ob);

        //first time init
        if (!vioCMS2.ready) {
            $(window).resize(vioCMS2._resize_event);
            $('head').append('<style>.viocms_popups_item{display:none;} #viocms_popups .viocms_popups_item{display:block;}</style>');
            //popup init
            $('body').append('<div id="viocms_dimmer"></div><div id="viocms_popups"></div>');
            vioCMS2.gui.dimmer = $("#viocms_dimmer");
            vioCMS2.gui.popups = $("#viocms_popups");
            vioCMS2.gui.popups.css({position: 'absolute', left: 0, top: 0});
            vioCMS2.gui.dimmer.css({position: 'absolute', left: 0, top: 0, opacity: 0, display: "none"});
            vioCMS2.gui.dimmer.bind('mousewheel', function () {
                return false;
            }).bind('click', vioCMS2._dimmer_click);

            //done
            vioCMS2.ready = true;
        }
        //object related init
        OB.find('*[data-popup]').each(function () {
            if ($(this).data('cmsinit'))
                return;
            $(this).data('cmsinit', true);
            var $this = $(this);
            $('#' + $this.data('popup')).addClass('viocms_popups_item');
            $this.click(function () {
                vioCMS2.popup($('#' + $this.data('popup')));
                return false;
            });
        });
        vioCMS2.ui_hints();
        vioCMS2._resize_event();
        vioCMS2._preload();
    },
    /* math funcs */
    float: function (val, digs) {
        val = $.trim(" " + val + " ");
        val = parseFloat(val.replace(",", "."));
        digs = parseInt(digs);
        if (isNaN(val))
            val = 0;
        return isNaN(digs) ? val : val.toFixed(digs);

    },
    int: function (val) {
        val = val + "";
        val = parseInt(val.replace(/\s+/g, ''));
        if (isNaN(val))
            val = 0;
        return val;
    },
    price: function (val, digs) {
        digs = parseInt(digs);
        if (isNaN(digs))
            digs = 0;
        $sval = $.trim(" " + val + " ");
        if ($sval.indexOf('.') > 0) {
            v = $sval.split('.');
        }
        else {
            v = $sval.split(',');
        }
        text = "";
        v0 = v[0];
        v1 = v[1] ? v[1] : '';
        idxtr = 0;
        for (i = v0.length - 1; i >= 0; i--) {
            if (idxtr % 3 == 0 && i != v0.length - 1)
                text = "&nbsp;" + text;
            text = v0[i] + text;
            idxtr++;
        }
        exp = "";
        if (digs > 0) {
            for (i = 0; i < digs; i++) {
                exp = exp + (i < v1.length ? v1[i] : "0");
            }
        }

        return text + (exp ? vioCMS2.settings.delimiter + exp : "");
    },
    /*gui funcs */
    show_dimmer: function (params) {
        if (params.animate === true)
            vioCMS2.gui.dimmer.stop(true, true).css({display: "block", zIndex: params.zIndex}).animate({opacity: vioCMS2.settings.dimmerOpacity}, vioCMS2.settings.dimmerDuration);
        else
            vioCMS2.gui.dimmer.stop(true, true).css({opacity: vioCMS2.settings.dimmerOpacity, zIndex: params.zIndex});
        vioCMS2.gui.dimmer.unbind('mousewheel');
        if (params.preventScroll) {
            vioCMS2.gui.dimmer.bind('mousewheel', function (event, delta, deltaX, deltaY) {
                event.preventDefault();
                return false;
            });
        }
    },
    hide_dimmer: function (params) {
        if (params.animate) {
            vioCMS2.gui.dimmer.stop(true, true).animate({opacity: 0}, vioCMS2.settings.dimmerDuration, function () {
                $(this).hide();
            });
        }
        else
            vioCMS2.gui.dimmer.stop(true, true).css({opacity: 0, display: 'none'});
    },
    popup: function (obj, params) {
        var intParams = {
            width: $(obj).outerWidth(true),
            height: $(obj).outerHeight(true),
            animate: true,
            dimmerClick: true,
            preventScroll: true
        };
        vioCMS2.popupIndex++;
        if (typeof (params) === 'object')
            $params = vioCMS2.funcs.popup_settings($(obj), $.extend(intParams, params));
        else
            $params = vioCMS2.funcs.popup_settings($(obj), intParams);

        $("<div id='viocms_replaceMarker" + vioCMS2.popupIndex + "'></div>").insertBefore($(obj));
        vioCMS2.gui.popups.append('<div id="popups_idx' + vioCMS2.popupIndex + '" data-idx="' + vioCMS2.popupIndex + '"></div>');
        $cont = $('#popups_idx' + vioCMS2.popupIndex);
        $cont.append($(obj));
        $cont.data('params', $params);
        if($params.class)
            $cont.addClass($params.class);
        vioCMS2._resize_event();
        cp = vioCMS2.popupIndex;
        while (cp.legth < 6)
            cp = '0' + cp;
        $params.zIndex = parseInt(999 + cp);
        vioCMS2.show_dimmer($params);
        $cont
                .css({display: 'block', opacity: 0, zIndex: $params.zIndex})
                .animate({opacity: 1}, 1000);
        $cont.unbind('mousewheel');
        if ($params.preventScroll) {
            $cont.bind('mousewheel', function (event) {
                event.preventDefault();
                return false;
            });
        }

        return false;
    },
    popup_close: function () {
        if (!vioCMS2.popupIndex)
            return;
        $params = $('#popups_idx' + vioCMS2.popupIndex).data('params');
        $this = $('#popups_idx' + vioCMS2.popupIndex).find('>*:first');
        if (typeof ($params.onclose) === 'function')
            $params.onclose($this);
        $('#viocms_replaceMarker' + vioCMS2.popupIndex).replaceWith($this);
        $('#popups_idx' + vioCMS2.popupIndex).remove();
        vioCMS2.popupIndex--;
        if (!vioCMS2.popupIndex)
            vioCMS2.hide_dimmer($params);
        else
            vioCMS2.show_dimmer($('#popups_idx' + vioCMS2.popupIndex).data('params'));
        return false;
    },
    ui_hints: function () {
        $('input, textarea').each(function () {
            var hint = $(this).attr('hint');
            if (hint && !$(this).data('cmsinit')) {
                $(this).data('cmsinit', true);
                $(this).bind('focus', function () {
                    if ($(this).val() == hint) {
                        $(this).val('');
                        $(this).removeClass('hint');
                    }
                });

                $(this).bind('blur', function () {
                    if ($.trim($(this).val()) == '') {
                        $(this).val(hint);
                        $(this).addClass('hint');
                    }
                });
                $(this).blur();
            }
        });
    },
    disable_ui_hints: function () {
        $('input, textarea').each(function () {
            var hint = $(this).attr('hint');
            $(this).data('cmsinit', false);
            if (hint) {
                if ($(this).val() == hint) {
                    $(this).val('');
                    $(this).removeClass('hint');
                }
            }
        });
    },
    getAjaxPage: function (obj, url, callback, part) {
        var $obj = $(obj);
        if ($obj.hasClass('ajaxLoading'))
            return false;
        $obj.addClass('ajaxLoading');
        $.get(url, {'type': 'html', 'var': part}, function (data) {
            $obj.removeClass('ajaxLoading');
            callback(data, $obj);
        }, 'html');
    },
    initAjaxHrefs: function (selector, inparams) {
        var params = inparams;
        $(selector).each(function () {
            var $this = this;
            $(this).click(function () {
                if (typeof (params.click) === 'function')
                    params.click($this);
                if (!params.part)
                    params.part = 'CONTENT';
                getAjaxPage(this, $(this).attr('href'), params.callback, params.part);
                return false;
            });
        });
    },
//
//         EVENTS
//

    _dimmer_click: function () {
        $dp = ($('#popups_idx' + vioCMS2.popupIndex).data('params'));
        if (!$dp || !$dp.dimmerClick)
            return false;
        if (typeof ($dp.dimmerClick) === 'function')
            res = $dp.dimmerClick();
        else
            res = $dp.dimmerClick;
        if (res)
            vioCMS2.popup_close();
        return false;
    },
    _resize_event: function () {
        vioCMS2.gui.dimmer.css({width: '0px', height: '0px'}).css({
            left: '0px',
            top: '0px',
            height: $(document).outerHeight(true),
            width: $(document).outerWidth(true),
            background: vioCMS2.settings.dimmerBackground
        });

        vioCMS2.gui.popups.find('>div').each(
                function () {
                    $params = $(this).data('params');
                    /*                        console.log($params.height);
                     if ($params.height>$(window).height()-vioCMS2.settings.topOffset) {
                     $params.height=$(window).height()-vioCMS2.settings.topOffset-80;
                     $(this).css({
                     'overflow':'hidden',
                     'overflow-y':'scroll'
                     });
                     }
                     */
                    $(this).css({
                        height: $params.height,
                        width: $params.width,
                        position: "absolute"
                    });
                    l = Math.round(($(window).width() - $(this).width()) / 2);
                    t = vioCMS2.settings.topOffset + Math.round($(window).scrollTop() + (($(window).height() - vioCMS2.settings.topOffset) - $(this).height()) / 2);
                    if (t < 0)
                        t = 0;
                    if (l < 0)
                        l = 0;
                    $(this).css({left: l + 'px', top: t + 'px'});
                });
    },
    preload: function (imgs) {
        if (typeof (imgs) === "array") {
            for (i = 0; i < imgs.length; i++) {
                vioCMS2.debug('preload: ' + imgs[i]);
                vioCMS2.settings.preloadImgs.push(imgs[i]);
            }
            return;
        }
        if (typeof (imgs) === "string") {
            vioCMS2.debug('preload: ' + imgs);
            vioCMS2.settings.preloadImgs.push(imgs);
            return;
        }
        vioCMS2.debug('error type');
    },
    _preload: function () {
        while (vioCMS2.settings.preloadImgs.length) {
            $(new Image()).load(function () {
                if (!vioCMS2.settings.preloadImgs.length && typeof (vioCMS2.funcs.images_loaded) === 'function') {
                    vioCMS2.funcs.images_loaded();
                }
            }).attr('src', vioCMS2.settings.preloadImgs[vioCMS2.settings.preloadImgs.length - 1]);
            vioCMS2.settings.preloadImgs.splice(vioCMS2.settings.preloadImgs.length - 1, 1);
        }
    }
};

//backward
function bookmarkSite(a) {
    vioCMS2.bookmarkSite(a);
}

function ui_hints() {
    vioCMS2.ui_hints();
}

function disable_ui_hints() {
    vioCMS2.disable_ui_hints();
}


function getAjaxPage(obj, url, callback, part) {
    vioCMS2.getAjaxPage(obj, url, callback, part);
}

function initAjaxHrefs(selector, inparams) {
    vioCMS2.initAjaxHrefs(selector, inparams);
}
