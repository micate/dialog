/**
 * a douban.com like jQuery dialog for common usage
 *
 * @author  micate<yawewe@gmail.com>
 * @version $Id$
 * @depends jquery 1.3.2+
 */
(function($, window, undefined) {
var LANG = {
        OK: '确定',
        CANCEL: '取消',
        CLOSE: '关闭',
        TIPS: '提示',
        LOADING: '加载中...',
        ERROR: '呃，没有成功，请重试'
    },
    CONFIG = {
        title: LANG.TIPS,
        message: LANG.LOADING,
        errorMessage: LANG.ERROR,
        overlay: true,
        shadow: true,
        draggable: true,
        iframe: true,
        minWidth: 200,
        minHeight: 60,
        dialogClass: ''
    },
    CLASS = {
        overlay: 'dialog-overlay',
        shadow: 'dialog-shadow', 
        box: 'dialog-box',
        dialog_ok: 'dialog-ok',
        dialog_error: 'dialog-error',
        dialog_confirm: 'dialog-confirm',
        header: 'dialog-header',
        title: 'dialog-title',
        close: 'dialog-close',
        content: 'dialog-content',
        content_box: 'dialog-content-box',
        content_tips: 'dialog-content-tips',
        footer: 'dialog-footer',
        widget: 'dialog-widget',
        buttons: 'dialog-buttons',
        button: 'dialog-button',
        button_hover: 'dialog-button-over',
        button_focus: 'dialog-button-active'
    },
    TEMPLATE = {
        button: '<span class="{clazz}"><input type="button" value="{value}" /></span>'
    },
    GUID = 0,
    PREFIX = 'dialog_',
    ZINDEX = 1000,
    OPACITY = 0.8,
    SHADOW_OPACITY = 0.2,
    UNIT_PX = 'px',
    ATTR_AUTO = 'auto',
    TYPE_FUNCTION = 'function',
    TYPE_STRING = 'string',
    BLANK_SRC = 'about:blank',

    SHADOW_PADDING = 10,
    BOX_BORDER_WIDTH = 1,
    DURATION_DEFAULT = 2500,
    DURATION_KEEP = -1,

    msie6 = $.browser.msie && $.browser.version == 6,

    doc = document,
    doe = doc.documentElement,
    documentWidth,
    documentHeight,
    pageWidth,
    pageHeight,

    max = Math.max,
    min = Math.min;

!$.fn.bgiframe && ($.fn.bgiframe = ($.browser.msie && /msie 6\.0/i.test(navigator.userAgent) ? function(s) {
    s = $.extend({
        top : ATTR_AUTO,
        left : ATTR_AUTO,
        width : ATTR_AUTO,
        height : ATTR_AUTO,
        opacity : true,
        src : BLANK_SRC
    }, s);
    var html = '<iframe class="bgiframe" frameborder="0" tabindex="-1" src="'+s.src+'"'+
                   'style="display:block;position:absolute;z-index:-1;'+
                       (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
                       'top:'+(s.top==ATTR_AUTO?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
                       'left:'+(s.left==ATTR_AUTO?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
                       'width:'+(s.width==ATTR_AUTO?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
                       'height:'+(s.height==ATTR_AUTO?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
                '"/>';
    return this.each(function() {
        if ( $(this).children('iframe.bgiframe').length === 0 )
            this.insertBefore( document.createElement(html), this.firstChild );
    });
} : function() { return ''; }));
!$.fn.ajaxSubmit && ($.fn.ajaxSubmit = function(options) {
    var url, data;

    if (!this.length) return this;
    if (typeof options == TYPE_FUNCTION) {
        options = {success: options};
    }

    url = $.trim(this.attr('action'));
    if (url) {
        url = (/^([^#]+)/.exec(url)||{})[1];
    }
    url = url || window.location.href || '';

    options = $.extend({
        url: url,
        type: this.attr('method') || 'GET'
    }, options || {});

    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
        return this;
    }

    data = this.serializeArray();
    if (options.data) {
        options.extraData = options.data;
        for (var n in options.data) {
          if(options.data[n] instanceof Array) {
            for (var k in options.data[n])
              data.push( { name: n, value: options.data[n][k] } );
          }
          else
             data.push( { name: n, value: options.data[n] } );
        }
    }

    if (options.beforeSubmit && options.beforeSubmit(data, this, options) === false) {
        return this;
    }

    options.data = data;
    $.ajax(options);

    this.trigger('formSubmit', [this, options]);
    return this;
});
function prop(n) {
    return n && n.constructor === Number ? n + 'px' : n;
}
function isFunction(func, context) {
    if (!func) {
        return false;
    }
    if (typeof func == TYPE_FUNCTION) {
        return func;
    }
    if (typeof func == TYPE_STRING) {
        func = func.split('.');
        var o = (context || window)[func[0]], w = null;
        if (!o) return undefined;
        for (var i = 1, l; l = func[i++];) {
            if (!o[l]) {
                return undefined;
            }
            w = o;
            o = o[l];
        }
        return o && (function(){
            return o.apply(w, arguments);
        });
    }
    return null;
}
function fromTemplate(template, params) {
    template = TEMPLATE[template] || '';
    for (var key in params) {
        template = template.replace(new RegExp('{'+key+'}',"gm"), params[key] || '');
    }
    return template;
}
function createIframe(src) {
    return $(['<iframe src="', src || BLANK_SRC, '" frameborder="0" scrolling="auto" style="width:100%; height:100%; border:0; margin:0; padding:0;"></iframe>'].join(''));
}
function createOverlay(options, clazz) {
    var overlay =  $(['<div id="', PREFIX, 'overlay_', GUID, '" class="', clazz.overlay, '"></div>'].join(''));
    overlay.css({'opacity': OPACITY, 'z-index': ZINDEX});
    return overlay;
}
function createShadow(options, clazz) {
    var shadow = $(['<div id="', PREFIX, 'shadow_', GUID, '" class="', clazz.shadow, '"></div>'].join(''));
    shadow.css({'opacity': SHADOW_OPACITY, 'z-index': ZINDEX,  'left': '-9999em', 'top': '-9999em'});
    return shadow;
}
function createBox(options, clazz) {
    var message = options.message, content, box;
    box = ['<div id="', PREFIX, 'box_', GUID, '" class="', clazz.box, options.dialogClass ? ' ' + options.dialogClass : '', '">'];
    options.title !== false && box.push('<div class="', clazz.header, '"><a href="javascript:void(0);" hideFocus="true" title="', LANG.CLOSE, '" class="', clazz.close, '">✖</a><span class="', clazz.title, '">', options.title, '</span></div>');
    box.push('<div class="', clazz.content, '"><div class="', clazz.content_box, '">', message && !message.jquery ? message : '', '</div></div>');
    options.buttons && box.push('<div class="', clazz.footer, '">', '<div class="', clazz.widget, '"></div>', '<div class="', clazz.buttons, '"></div>', '</div>');
    box.push('</div>');
    box = $(box.join(''));
    box.css({'z-index': ZINDEX, 'left': '-9999em', 'top': '-9999em'});
    if (message && message.jquery) {
        content = box.find('.' + clazz.content);
        content.empty();
        var clone = message.clone(true).show();
        content.append((message.parents('body').size() ? message.clone(true) : message).show());
    }
    return box;
}
function createButton(option, clazz) {
    var button = $(fromTemplate('button', {clazz: clazz.button, value: option.text}));
    button.hover(function() {
        $(this).addClass(clazz.button_hover);
    }, function() {
        $(this).removeClass(clazz.button_hover);
    });
    button.focus(function() {
        $(this).addClass(clazz.button_focus);
    });
    button.blur(function() {
        $(this).removeClass(clazz.button_focus);
    });
    return button;
}
function createTips(options, clazz) {
    var message = options.message,
        tips;
    tips = $(['<div class="', clazz.content_tips, '">', message && !message.jquery ? message : '', '</div>'].join(''));
    if (message && message.jquery) {
        tips.empty().append(message);
    } else {
        tips.addClass(clazz.content_box);
    }
    return tips;
}
function generateDefaultButtons(options) {
    return options.buttons !== false && !options.buttons;
}

window.dialog = {
    _clazz: CLASS,
    _common: function(options) {
        ! options && (options = {message: ''});
        (options.jquery || typeof options == TYPE_STRING) && (options = {message: options});
        return options;
    },
    _button: function(text, func) {
        var self = this;
        return {
            text: text,
            callback: function(guid) {
                if (isFunction(func) && func() === false) {
                    return false;
                }
                self.close(guid, true);
            }
        };
    },
    _normalizeUrl: function(url) {
        var location = document.location, 
            href = location.href;
        if (url && url.indexOf('://') === -1) {
            if (url[0] == '/') {
                url = href.substr(0, href.indexOf(location.pathname)) + url;
            } else {
                if (href.indexOf('?') > -1) {
                    href = href.substr(0, href.indexOf('?'));    
                }
                url = href.substr(0, href.lastIndexOf('/')) + '/' + url;
            }
        }
        return url;
    }, 
    setup: function(options, clazz, template) {
        $.extend(CONFIG, options || {});
        $.extend(this._clazz, clazz || {});
        $.extend(TEMPLATE, template || {});
        options.locale && (LANG = options.locale);
        return this;
    },
    ok: function(options, ok, close) {
        var self = this;
        options = this._common(options);
        if (generateDefaultButtons(options)) {
            options.buttons = [self._button(LANG.OK, ok)];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_ok;
        }
        return this.dialog(options, undefined, close || ok);
    }, 
    error: function(options, ok) {
        var self = this;
        options = this._common(options);
        if (generateDefaultButtons(options)) {
            options.buttons = [self._button(LANG.OK, ok)];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_error;
        }
        return this.dialog(options, undefined, ok);
    },
    confirm: function(options, ok, cancel) {
        var self = this;
        options = this._common(options);
        if (generateDefaultButtons(options)) {
            options.buttons = [self._button(LANG.OK, ok), self._button(LANG.CANCEL, cancel)];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_confirm;
        }
        return this.dialog(options, undefined, cancel);
    },
    tips: function(options, duration, close) {
        var self = this, guid;

        if (typeof options == TYPE_FUNCTION) {
            close = options;
            options = {};
        } else if (typeof duration == TYPE_FUNCTION) {
            close = duration;
            duration = undefined;
        }

        options = this._common(options);
        options && !options.overlay && (options.overlay = false);
        options = $.extend({}, CONFIG, options);
        options.message = createTips(options, this._clazz);

        guid = this.dialog(options, undefined, close);

        !duration && (duration = DURATION_DEFAULT);
        duration != DURATION_KEEP && (setTimeout(function() {
            self.close(guid);
        }, duration));

        return guid;
    },
    button: function(options, buttons) {
        var self = this, index, length;
        options = this._common(options);

        if (!buttons || !buttons.length) {
            throw 'dialg.button needs buttons';
        }

        options.buttons = [];
        for (index = 0, length = buttons.length; index < length; index++) {
            options.buttons.push(self._button(buttons[index].text, buttons[index].callback));
        }
        
        return this.dialog(options, undefined, buttons[length - 1].callback);
    },
    form: function(options, url, submit, load, error, beforeSubmit, beforeSerialize, cancel) {
        var self = this, div, guid;

        if (!options || !url) {
            throw 'dialog.form need options and url';
        }
        if (typeof options == TYPE_STRING && url) {
            options = {
                title: options
            };
        }
        function submitForm(guid) {
            var box = self.get(guid),
                form = box.find('form:last'),
                buttons = box.find('.' + self._clazz.buttons + ' :button'),
                callback = function(json) {
                    if (isFunction(submit) && submit(json) === false) {
                        return false;
                    }
                    self.close(guid, true);
                }, 
                complete = function() {
                    buttons.removeAttr('disabled');
                };
            if (form.size()) {
                form.ajaxSubmit({
                    dataType: 'json',
                    success: callback,
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        if (isFunction(error)) {
                            error(XMLHttpRequest, textStatus, errorThrown);
                        } else {
                            self.error(options.errorMessage);
                        }
                    },
                    complete: complete,
                    beforeSubmit: function() {
                        buttons.attr('disabled', 'disabled');
                        if (isFunction(beforeSubmit) && beforeSubmit(form, guid) === false) {
                            complete();
                            return false;
                        }
                        return true;
                    },
                    beforeSerialize: beforeSerialize
                });
                return false;
            }
            callback(box);
        }

        if (generateDefaultButtons(options)) {
            options.buttons = [{
                text: LANG.OK,
                callback: submitForm
            }, self._button(LANG.CANCEL, cancel)];
        }

        !options.message && (options.message = CONFIG.message);
        div = createTips(options, this._clazz);
        function callback(slient) {
            var box = self.get(guid);
            if (!box.size()) return;
            !slient && isFunction(load) && load(guid);
            self.resize(guid);
            box.find('.' + self._clazz.buttons + ' :button').removeAttr('disabled');
        }
        div.load(this._normalizeUrl(url), function() {
            div.removeClass(self._clazz.content_tips);
            callback();
            div.find(':input').keyup(function(e) {
                if (e.keyCode == 13) {
                    submitForm(guid);
                    return false;
                }
            });
            div.find('form:last').submit(function() {
                return false;
            });
        }).bind('ajaxComplete', function() {
            callback(true);
        });
        options.message = div;
        guid = this.dialog(options, function(box) {
            box.find('.' + self._clazz.buttons + ' :button').attr('disabled', 'disabled');
        }, cancel);

        return guid;
    },
    show: function(options, callback, load, cancel) {
        var self = this, clazz = this._clazz, guid, iframe;

        if (!options || options.jquery || ($(options).size() && !options.url)) {
            return this.ok(options, callback, cancel);
        }

        if (typeof options == TYPE_FUNCTION) {
            throw 'dialog.show need options';
        }

        options = $.extend({}, CONFIG, this._common(options));
        iframe = createIframe(options.url || options.message);

        options.message = iframe;
        guid = this.dialog(options, load, cancel);

        iframe.bind('load', function() {
            var interval = iframe.data('interval'), doc, doe, win;
            interval && clearInterval(interval);
            
            try {
                doc = this.contentDocument || this.contentWindow.document;
                doe = doc.documentElement;
                win = this.contentWindow || this;

                if (!iframe.data('bindclose')) {
                    iframe.bind('close', function() {
                        iframe.unbind().bind('load', function() {
                            self.close(guid);
                        });
                        win && (win.location = BLANK_SRC);
                    });
                    interval && clearInterval(interval);
                    iframe.data('bindclose', true);
                }

                if (!options.width || !options.height) {
                    !options.width && iframe.width(doe.scrollWidth);
                    !options.height && iframe.height(doe.scrollHeight);
                    iframe.data('interval') = setInterval(function() {
                        !options.width && iframe.width(doe.scrollWidth);
                        !options.height && iframe.height(doe.scrollHeight);
                    }, 600);
                    self.resize(guid);
                }

                win.getDialog = function() {
                    return self.get(guid);
                };

                win.closeDialog = function() {
                    self.close(guid);
                };

                callback && (win.dialogCallback = callback);
                !options.title && doc.title && doc.title.length && (self.get(guid).find('.' + clazz.title).html(doc.title));
            } catch (e) {
                self.get(guid).find('.' + clazz.title).html(options.title || iframe.attr('src'));
            }

            isFunction(load) && load(guid, iframe);
        });

        return guid;
    },
    dialog: function(options, open, close) {
        var self = this, clazz = this._clazz, guid, box, overlay, shadow, buttons, buttons_area;
        if (!options) {
            throw 'dialog.dialog need options.';
        }
        if (!isFunction(open)) {
            if (isFunction(options)) {
                open = options;
                options = {};
            } else if (typeof options == TYPE_STRING) {
                options = {
                    title: options
                };
            }
        }
        options = $.extend({}, CONFIG, options);

        ++ZINDEX;
        guid = ++GUID;

        box = createBox(options, clazz);
        box.data('options', options);

        if (options.overlay) {
            overlay = createOverlay(options, clazz);
            box.data('overlay', options.overlay);
            $('body').append(overlay);
            options.iframe && overlay.bgiframe();
        }
        if (options.shadow) {
            shadow = createShadow(options, clazz);
            box.data('shadow', options.shadow);
            $('body').append(shadow);
            !options.overlay && options.iframe && (shadow.bgiframe());
        }

        buttons = options.buttons;
        buttons_area = box.find('.' + clazz.buttons);
        if (buttons && buttons.length) {
            var button, index, length = buttons.length, option;
            for (index = length - 1; index >= 0; index--) {
                (function(option) {
                    button = createButton(option, clazz);
                    if (isFunction(option.callback)) {
                        button.click(function() {
                            option.callback(guid, box);
                        });
                    }
                    buttons_area.append(button);
                })(buttons[index]);
            }
        }

        $('body').append(box);

        !options.overlay && !options.shadow && options.iframe && (box.bgiframe());

        $(window).resize(function() {
            self.resize(guid);
        });
        setTimeout(function() {
            self.resize(guid);
        }, 50);

        options.draggable && this.dragable(guid);

        isFunction(open) && open(box);
        isFunction(close) && box.data('close', close);
        box.find('.' + clazz.close).click(function(e) {
            self.close(guid);
            return false;
        });

        options.shadow && shadow.show();
        box.show();
        return guid;
    },
    get: function(guid) {
        return $('#' + PREFIX + 'box_' + guid);
    },
    getOverlay: function(guid) {
        return $('#' + PREFIX + 'overlay_' + guid);
    },
    getShadow: function(guid) {
        return $('#' + PREFIX + 'shadow_' + guid);
    },
    close: function(guid, slient) {
        var box = this.get(guid), close;
        if (!box.size()) {
            return false;
        }
        close = box.data('close');
        if (!slient && isFunction(close) && close(guid) === false) {
            return false;
        }
        if (box.data('overlay')) {
            this.getOverlay(guid).remove();
        }
        if (box.data('shadow')) {
            this.getShadow(guid).remove();
        }
        box.remove();
        return true;
    },
    resize: function(guid) {
        var box = this.get(guid), options = box.data('options'),
            overlay, shadow, content, isVisible,
            width, height, osize, cheight, noneContentHeight, minContentHeight, autoHeight;

        documentWidth = doe.clientWidth;
        documentHeight = doe.clientHeight;
        pageWidth = $(doc).width();
        pageHeight = max($(doc).height(), documentHeight);

        if (!box.size() || box.data('resizing')) {
            return false;
        }

        box.data('resizing', true);

        isVisible = box.is(':visible');
        osize = 2 * SHADOW_PADDING + 2 * BOX_BORDER_WIDTH;
        cheight = box.find('.' + CLASS.header).outerHeight(true) + box.find('.' + CLASS.footer).outerHeight(true);
        content = box.find('.' + CLASS.content);
        content.css({
            width: 'auto',
            minHeight: 0,
            height: 0
        });
        if (options.width < options.minWidth) {
            options.width = options.minWidth;
        }
        if (content.width() < options.width) {
            content.width(options.width);
        }
        if (options.maxWidth && content.width() > options.maxWidth) {
            content.width(options.maxWidth);
        }
        noneContentHeight = box.css({
            height: 'auto',
            width: (min(options.width, options.maxWidth)) || 'auto'
        }).height();
        minContentHeight = max(0, options.minHeight - noneContentHeight);
        if (options.height === 'auto' || !options.height) {
            if ($.support.minHeight) {
                content.css({
                    minHeight: minContentHeight,
                    height: 'auto'
                });
            } else {
                box.show();
                autoHeight = content.css('height', 'auto').height();
                !isVisible && box.hide();
                content.height(max(autoHeight, minContentHeight));
            }
        } else {
            content.height(max(options.height - noneContentHeight, 0));
        }
        width = content.width();
        height = content.height();
        if (width < options.width || width < options.minWidth) {
            width = max(options.width || 0, options.minWidth || 0);
        }
        if (options.maxWidth && width > options.maxWidth) {
            width = options.maxWidth;
        }
        height += cheight;
        box.data('overlay') && this.getOverlay(guid).css({
            height: pageHeight
        });
        box.css({
            width: width,
            height: height,
            left: max(SHADOW_PADDING, Math.floor((documentWidth - width) / 2)),
            top: (msie6 ? $(doc).scrollTop() : 0) + max(SHADOW_PADDING, Math.floor(max(documentHeight - height, 0) / 2))
        });
        content.css({
            width: width
        });
        box.data('shadow') && this.getShadow(guid).css({
            width: width + osize,
            height: height + osize,
            left: max(0, Math.floor((documentWidth - width) / 2 - SHADOW_PADDING)),
            top: (msie6 ? $(doc).scrollTop() : 0) + max(0, Math.floor(max(documentHeight - height, 0) / 2 - SHADOW_PADDING))
        });
        box.data('resizing', false);
        
        return true;
    },
    dragable: function(guid) {
        var self = this, box = this.get(guid),
            header = box.find('.' + this._clazz.header),
            xOffset = SHADOW_PADDING + BOX_BORDER_WIDTH,
            yOffset = xOffset,
            draging;

        (function(box, header) {
            var startLeft, startTop, startX, startY,
                shadow = self.getShadow(guid), elem = shadow.size() ? shadow : box;
            draging = false;
            header.bind('mousedown.dragment', function(e) {
                draging && $(doc).trigger('mouseup.dragment');
                draging = true;
                var offset = elem.position();
                startLeft = offset.left;
                startTop = offset.top;
                startX = e.pageX;
                startY = e.pageY;
                $(doc).bind('mousemove.dragment', function(e) {
                    if (!draging) return false;
                    var left = startLeft + e.clientX - startX, top = startTop + e.clientY - startY;
                    left = max(0, min(pageWidth - elem.width(), left));
                    top = (msie6 ? $(doc).scrollTop() : 0) + max(0, min(pageHeight - elem.height(), top));
                    shadow.size() && (shadow.css({left: left, top: top}), left += xOffset, top += yOffset);
                    box.css({left: left, top: top});
                }).bind('selectstart.dragment', function() {return false;});
                $(doc).bind('mouseup.dragment', function() {
                    $(doc).unbind('.dragment');
                    draging = false;
                });
            }).css('cursor', 'move');
        })(box, header);
    }
};
})(jQuery, window);
