var site = {
    waiter: false,
    busy: function () {
        if (!site.waiter) {
            site.waiter = $('<div id="site_busy_div"><div></div></div>');
            site.waiter.appendTo($('body'));
        }
        site.waiter.stop(true, false).css({'opacity': '.2', 'display': 'block'}).animate({opacity: .90}, 2000);
    },
    ready: function () {
        if (!site.waiter)
            return;
        site.waiter.stop(true, false).animate({opacity: 0}, 100, function () {
            $(this).css({'display': 'none'});
        });
    }
};

function pageLoad(res) {
    if (!$('#inline_window').length)
        $('body').append($('<div id="inline_window"></div>'));
    $('#inline_window').html(res);
    init_html($('#inline_window'));
    vioCMS2.popup($('#inline_window'), {width: 'auto'});
    site.ready();
}

function init_html(ob) {
    $ob = $(ob);
    vioCMS2.init();
    vioCMS2.initAjaxHrefs('a[rel="contents"]', {click: site.busy, callback: pageLoad});

    $('#dg-container').mousewheel(function (event, delta) {
        if (delta > 0)
            $('#dg-container').find('.dg-prev').click();
        else
            $('#dg-container').find('.dg-next').click();
        return false;
    });
    app.vacance.init();

    $ob.find('.section').each(function () {
        if ($(this).data('sectioninit'))
            return;
        $(this).data('sectioninit', true);
        var $this = $(this);
        $this.hover(function () {
            $this.data('hovered', true);
            setTimeout(function () {
                if ($this.data('hovered'))
                    $this.find('img').not(':animated').stop(true).animate({opacity: '0'}, 1000);
            }, 250);
            $this.find('h3').stop(true).animate({bottom: '0', backgroundPosition: '100%'}, 500);
            setTimeout(function () {
                if ($this.data('hovered'))
                    $this.addClass('section_hovered');
            }, 250);
        }, function () {
            $this.data('hovered', false);
            $this.find('img').stop(true).animate({opacity: '1'}, 500);
            $this.find('h3').stop(true).animate({bottom: '40%', backgroundPosition: '0%'}, 500);
            setTimeout(function () {
                if (!$this.data('hovered'))
                    $this.removeClass('section_hovered');
            }, 50);
        });

    });

    $ob.find('.news').each(function () {
        if ($(this).data('newsinit'))
            return;
        $(this).data('newsinit', true);
        $(this).find('div>span').css({'background-size': '0%'});
        $(this).hover(function () {
            $(this).find('div>span').stop(true).animate({"background-size": '2.5%'}, 1000);
        }, function () {
            $(this).find('div>span').stop(true).animate({"background-size": '0'}, 500);
        });

    });

    $ob.find('.project').each(function () {
        if ($(this).data('projectinit'))
            return;
        $(this).data('projectinit', true);
        $(this).find('div>span').css({'background-size': '0%'});
        $(this).hover(function () {
            $(this).find('div>span').stop(true).animate({"background-size": '2.5%'}, 1000);
        }, function () {
            $(this).find('div>span').stop(true).animate({"background-size": '0'}, 500);
        });

    });

    $ob.find('.title').each(function () {
        if ($(this).find('i').length)
            return;
        $(this).prepend('<i></i>');
    });
}

var $pimages = new Array();
$(document).ready(function () {
    app.init();
	$('#photogal_raw').appendTo($('#content')).css({left:0});
    events.init();
    //$pimages.push('/site-imgs/wait_d.gif');
    $.preloadImages($pimages);
    vioCMS2.settings.dimmerBackground = '#000';
    vioCMS2.settings.dimmerOpacity = .5;
    vioCMS2.settings.dimmerDuration = 300;
    hs.dimmingOpacity = .5;
    hs.allowSizeReduction = true;
    hs.allowWidthReduction = true;
    hs.allowHeightReduction = true;
    hs.enableKeyListener = true;
    init_html($('body'));
    setTimeout(function () {
        if (!$('body').hasClass('no-csstransforms'))
            $('#dg-container').gallery();
    }, 10)

    promo.init();
    events.recall();
    menu.init();
    menu_local.init();
});

var menu = {
    stack: {
        timeout: 3000
    },
   init: function () {
        $('#menu_area').mouseleave(function () {
            menu.startTimeout();
        });

        $('#menu_area,#menu_area *').mouseover(function () {
            menu.disabletimer();
        });

        $('.menubox a.submenuitem').each(function () {
            var $this = $(this);
            if($this.data('parent') !== $this.data('menusection')){
                return;
            }
            if (!$('#submenu' + $this.data('menusection')).length) {
                $('#menu_area').prepend($('<div id="submenu' + $this.data('menusection') + '" class="submenu"></div>'));

                $('#menusection' + $this.data('menusection')).addClass('submenu_exists').mouseenter(function () {
                    menu.disabletimer();
                    menu.hideTimeout();
                    menu.showMenu(this, $this);
                });
            }
            $('#submenu' + $(this).data('menusection')).append($this.clone(true));
        });
    },
    disabletimer: function () {
        if (menu.stack.timer) {
            clearTimeout(menu.stack.timer);
            menu.stack.timer = false;
        }
    },
    hideTimeout: function () {
        //$('menu > a').removeClass('focused');
        var height = $('.submenu').not('.focused').outerHeight(); 
        $('.submenu').not('.focused').stop(true).animate({height: -height}, 500, function () {
            menu.stack.timer = false;
        });
    },
    showMenu: function (mnu, a_menu) {
        $(mnu).addClass('focused');
        $('#submenu' + a_menu.data('menusection')).stop(true).animate({height: 35}, 500);
    },
    startTimeout: function () {
       if (!menu.stack.timer) {
            menu.stack.timer = setTimeout(menu.hideTimeout, menu.stack.timeout);
        }
    }
};

var menu_local = {
    init: function() {
        var $container = $('.menubox');
        if(!$container.length) {
            return;
        }
        var $menu_elems = $container.find('[data-active]');
        if(!$menu_elems.length){
            return;
        }

        var active_elem_id = $menu_elems.first().data('active');
        var $parent = null;
        var parent_id = '';
        var $current_elem = $container.find('[data-id="' + active_elem_id + '"]');

        if(!$current_elem.length) {
            $container.find('[data-parent="' + active_elem_id + '"]').removeClass('invis');
            // Мы находимся на самом верхнем уровне и показываем только второй уровень вложенности меню
            return;
        } else {
            $container.find('[data-parent="' +$current_elem.data('menusection') + '"]').removeClass('invis');
        }

        if ($current_elem.data('parent') === $current_elem.data('menusection')) {
            // Мы находимся на втором уровне, показываем весь второй уровень и чайлдов текущего элемента
            $parent = $current_elem;
            parent_id = active_elem_id;
        } else {
            // мы находимся на третьем уровне, показываем второй уровень и текущий вложенный
            $parent = $container.find('[data-id="' + $current_elem.data('parent') + '"]');
            parent_id = $parent.data('id');
        }

        if($parent && parent_id) {
            var $children = $container.find('[data-parent="' + parent_id + '"]');
            if(!$children.length) {
                return;
            }
            var $child_container = $('<div class="nested-menu"></div>');
            $children.each(function() {
               var $child_clone = $(this).clone().removeClass('invis');
               $child_container.prepend($child_clone);
            });
            $parent.parent().append($child_container);
        }
    }
};

var events = {
    stack: {},
    init: function () {
        $(window).resize(events.resize);
        $(window).scroll(events.scroll);
        $(window).mousemove(events.mouse);
        $('body').click(events.click);

        if ($('#project-image').length) {
            events.stack.scrollpi = true;
        }
    },
    recall: function () {
        $(window).trigger('resize');
        $(window).trigger('scroll');
        $(window).trigger('mousemove');
        $('body').trigger('click');
    },
    /* events */
    click: function (e) {
        //$('a.focused').click();
    },
    mouse: function (e) {
        wbd = $(window).width();
        clx = e.clientX;
        if (!clx)
            clx = 1;
        if (!wbd)
            wbd = 1;
        var x = Math.round(45 + (clx * 100 / wbd) / 10);
        $('#header > div > div').css({'background-position': x + '%'});
    },
    scroll: function (e) {
        if (events.stack.scrollpi) {
            p100 = $('#project-image').offset().top;
            d = ($(window).scrollTop() / p100 * 100) * 2;
            if (d > 100)
                d = 100;
            //d=100-d;
            $('#project-image').css({'background-position': 'center ' + d + '%'});
        }
    },
    resize: function (e) {
        if (events.stack._resizewidth == $(window).width())
            return;
        events.stack._resizewidth = $(window).width();

        //events
        promo.resync();
    }
}
var promo = {
    hz: false,
    autohz: false,
    animating: false,
    width: 670,
    padoffest: 10,
    left: false,
    right: false,
    cpos: 0,
    lpos: 0,
    rpos: 0,
    init: function () {
        var $idx = 1;
        $('#promo > div')
                .css({
                    visibility: 'visible',
                    width: promo.width,
                    left: $(window).width() / 2 - promo.width / 2 - promo.padoffest})
                .each(function () {
                    $(this).data('idx', $idx);
                    $(this).css({zIndex: 1});
                    $(this).find('>img').css({display: 'block'}).animate({opacity: 1}, 500);
                    $idx++;
                });
        promo.left = $('#promo > div:last');
        promo.center = $('#promo > div:nth(0)');
        promo.right = $('#promo > div:nth(1)');
        promo.center.addClass('active').css({zIndex: 5}).find('>img').stop(true).animate({opacity: 0}, 500);
        $('#promo_next, #promo_next2').click(promo.next);
        $('#promo_prev, #promo_prev2').click(promo.prev);

        promo.rotate();
    },
    rotate: function () {
        if (promo.autohz)
            clearTimeout(promo.autohz);
        promo.autohz = setTimeout(function () {
            promo.next();
        }, 10000);
    },
    next: function () {
        sub_right = promo.right.next('div').length ? promo.right.next('div') : promo.left.parent().find('>div:first');
        $('#promo > div').not('.active').css({zIndex: 1});

        sub_right.css({zIndex: 2, left: promo.lpos});

        promo.center.find('>img').stop(true).css({display: 'block'}).animate({opacity: 1}, 2000);
        promo.center.stop(true).css({zIndex: 3}).removeClass('active').animate({left: promo.rpos}, 1500, 'easeInOutExpo');

        promo.left.css({zIndex: 2});
        promo.right.stop(true).addClass('active').css({zIndex: 5}).animate({left: promo.cpos}, 750, 'easeInOutExpo');
        promo.right.find('>img').stop(true).css({display: 'block'}).animate({opacity: 0}, 1500, function () {
            $(this).css({display: 'none'});
        });

        $PL = promo.center;
        $PC = promo.right;
        $PR = sub_right;
        promo.left = $PL;
        promo.center = $PC;
        promo.right = $PR;


        promo.rotate();
    },
    prev: function () {
        sub_right = promo.left.prev('div').length ? promo.left.prev('div') : promo.right.parent().find('>div:last');
        $('#promo > div').not('.active').css({zIndex: 1});

        sub_right.css({zIndex: 2, left: promo.rpos});

        promo.center.find('>img').stop(true).css({display: 'block'}).animate({opacity: 1}, 2000);
        promo.center.stop(true).css({zIndex: 3}).removeClass('active').animate({left: promo.lpos}, 1500, 'easeInOutExpo');

        promo.right.css({zIndex: 2});
        promo.left.stop(true).addClass('active').css({zIndex: 5}).animate({left: promo.cpos}, 750, 'easeInOutExpo');
        promo.left.find('>img').stop(true).css({display: 'block'}).animate({opacity: 0}, 1500, function () {
            $(this).css({display: 'none'});
        });

        $PL = sub_right;
        $PC = promo.left;
        $PR = promo.center;
        promo.left = $PL;
        promo.center = $PC;
        promo.right = $PR;


        promo.rotate();
    },
    resync: function () {
        $('#promo > div').css({width: promo.width, left: $(window).width() / 2 - promo.width / 2 - promo.padoffest});
        if (promo.hz)
            clearTimeout(promo.hz);
        promo.hz = setTimeout(function () {
            $prev = promo.left;
            $next = promo.right;
            pwx = ($(window).width() / 2 - promo.width / 2 - promo.width) + promo.padoffest;
            pwx2 = ($(window).width() / 2 + promo.width / 2) - promo.padoffest;
            $prev.stop(true).animate({'left': pwx}, 1000, 'easeOutBack');
            $next.stop(true).animate({'left': pwx2}, 1000, 'easeOutBack');

            promo.rpos = ($(window).width() / 2 - promo.width / 2 - promo.width) + promo.padoffest;
            promo.cpos = ($(window).width() / 2 - promo.width / 2) - promo.padoffest;
            promo.lpos = ($(window).width() / 2 + promo.width / 2) - promo.padoffest;


        }, 300);
    }
};

$.preloadImages = function () {
    if (typeof arguments[arguments.length - 1] == 'function') {
        var callback = arguments[arguments.length - 1];
    } else {
        var callback = false;
    }
    if (typeof arguments[0] == 'object') {
        var images = arguments[0];
        var n = images.length;
    } else {
        var images = arguments;
        var n = images.length - 1;
    }
    var not_loaded = n;
    for (var i = 0; i < n; i++) {
        $(new Image()).load(function () {
            if (--not_loaded < 1 && typeof callback == 'function') {
                callback();
            }
        }).attr('src', images[i]);
    }
}

var app = {
    init: function(){
        app.banner.init();
        
        
    }
};

app.helper = {
    detectIE: function () {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    } 
};

app.banner =  {
    init: function(){
      /*  console.log(app.helper.detectIE());
        if(app.helper.detectIE()){
            $('head').append(' <link rel="stylesheet" href="/site-css/anniversary_ms.css" type="text/css" >')
        }else{
            $('head').append(' <link rel="stylesheet" href="/site-css/anniversary.css" type="text/css" >')
        }*/
    }
};

app.menu = {
   
    selectors: {
      menu: 'menu',
      submenu: '.submenu',
      menuItem: "menu a"  
    },
    hoverOutTimeout: 0,
    elements: {},
   init: function(){
       this.elements.menu = $(this.selectors.menu);
       if(this.elements.menu.length){
           this.elementsInit();
              this.listener();
       }
   },
   elementsInit: function(){
     
     this.elements.menuItem = $(this.selectors.menuItem);
 
        this.elements.submenu = $(this.selectors.submenu);
        this.elements.submenu.each(function(index, elem){
            var $elem = $(elem);
            var h = $(elem).outerHeight();
            $elem.css('top', -h);  
         
        }.bind(this));
  
   },
   listener: function(){
       this.elements.menuItem.hover(this.itemHoverIn.bind(this), this.itemHoverOut.bind(this));
       this.elements.submenu.hover(this.submenuHoverIn.bind(this), this.itemHoverOut.bind(this));
   },
   submenuHoverIn: function(e){
           if(this.hoverOutTimeout)
          clearTimeout(this.hoverOutTimeout);
       this.elements.submenu.removeClass('submenu-out');
       $(e.currentTarget).css('top', 36);
      
        this.hoverOutTimeout = setTimeout(function(){
           $(e.currentTarget).addClass('submenu-out');
        }, 500)
   },
   itemHoverIn: function(e){
            if(this.hoverOutTimeout)
          clearTimeout(this.hoverOutTimeout);
        this.elements.submenu.removeClass('submenu-out');
        var id = $(e.currentTarget).attr('id');
        var menuId = parseInt(id.replace('menusection', ''));
        var submenu = $('#submenu' + menuId);
        this.hoverOutTimeout = setTimeout(function(){
            submenu.addClass('submenu-out');
        }, 500)
        submenu.css({
            left: $(e.currentTarget).offset().left,
            top: 34
        });        
   }, 
   itemHoverOut: function(e){
       if(this.hoverOutTimeout)
        clearTimeout(this.hoverOutTimeout);
        
            this.elements.submenu.each(function(index, elem){
                var $elem = $(elem);
                var h = $(elem).outerHeight();
                $elem.css('top', -h);  
           
        }.bind(this));
   },
   
};

app.vacance = {
  _selectors: {
      vacancyInputFile: '.vacancy-input-file',
      inputFile: 'input[type=file]',
      listItem: '.vacancy_list-item',
      containerForm: '.vacancy_form'
  },
    _elements: {},
    _init: false,
    init: function () {
        if($(this._selectors.containerForm).length && !this._init){
            this._init = true;
            this._elements.containerForm = $(this._selectors.containerForm);
            this._elements.inputFile =  this._elements.containerForm.find(this._selectors.inputFile);
            this._elements.vacancyInputFile =  this._elements.containerForm.find(this._selectors.vacancyInputFile);
            this._listener();
        }
    },
    _listener: function () {
        $('body').on('click', this._selectors.listItem, this._openVacancy.bind(this));
        this._elements.vacancyInputFile.focus(this._fileFocus.bind(this));
        this._elements.inputFile.change(this._fileChange.bind(this));
    },
    _openVacancy: function (e) {
        var link = $(e.currentTarget).find('a').attr("href");
        if(link){
            location.assign(link);
        }
    },
    _fileFocus: function () {
        this._elements.inputFile.trigger("click");
    },
    _fileChange: function(e){
        var val = this._elements.inputFile.val();
        console.log(val);
        this._elements.vacancyInputFile.val(val);
    }



};