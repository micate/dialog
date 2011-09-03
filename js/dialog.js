(function($, window, undefined) {

var LOCALES = {
        'zh-cn': {
            OK: '确定',
            CANCEL: '取消',
            CLOSE: '关闭',
            TIPS: '提示',
            LOADING: '加载中...',
            ERROR: '呃，没有成功，请重试'
        },
        'en-us': {
            OK: 'OK',
            CANCEL: 'Canel',
            CLOSE: 'Close',
            TIPS: 'Tips',
            LOADING: 'loading...',
            ERROR: 'Operation failed, please try again.'
        }
    },
    getLocale = function(config) {
        var ng = navigator,
            locale = (config || ng.language || ng.userLanguage || ng.browserLanguage || navigator.systemLanguage).toLowerCase();
        return LOCALES[locale] || LOCALES['zh-cn'];
    },
    LANG = getLocale(),
    CONFIG = {
        title: LANG.TIPS,
        message: LANG.LOADING,
        errorMessage: LANG.ERROR,
        overlay: true,
        shadow: true,
        iframe: true,
        minWidth: 200,
        minHeight: 90,
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
        content_inner: 'dialog-content-inner',
        footer: 'dialog-footer',
        widget: 'dialog-widget',
        buttons: 'dialog-buttons',
        button: 'dialog-button',
        button_hover: 'dialog-button-over',
        button_focus: 'dialog-button-active',
        tips: 'dialog-tips'
    },
    GUID = 0,
    PREFIX = 'dialog_',
    ZINDEX = 1000,
    OPACITY = 0.8,
    SHADOW_OPACITY = 0.2,
    UNIT_PX = 'px',
    BLANK_SRC = 'about:blank',

    SHADOW_PADDING = 10,
    BOX_BORDER_WIDTH = 1,

    doc = document,
    doe = doc.documentElement,

    max = Math.max,
    min = Math.min;

!$.fn.bgiframe && ($.fn.bgiframe = ($.browser.msie && /msie 6\.0/i.test(navigator.userAgent) ? function(s) {
    s = $.extend({
        top : 'auto',
        left : 'auto',
        width : 'auto',
        height : 'auto',
        opacity : true,
        src : BLANK_SRC
    }, s);
    var html = '<iframe class="bgiframe" frameborder="0" tabindex="-1" src="'+s.src+'"'+
                   'style="display:block;position:absolute;z-index:-1;'+
                       (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
                       'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
                       'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
                       'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
                       'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
                '"/>';
    return this.each(function() {
        if ( $(this).children('iframe.bgiframe').length === 0 )
            this.insertBefore( document.createElement(html), this.firstChild );
    });
} : function() { return ''; }));
!$.fn.ajaxSubmit && ($.fn.ajaxSubmit = function(options) {
    var url, data;

    if (!this.length) return this;
    if (typeof options == 'function') {
        options = {success:options};
    }

    url = $.trim(this.attr('action'));
    if (url) {
        url = (/^([^#]+)/.exec(url)||{})[1];
    }
    url = url || window.location.href || '';

    options = $.extend({
        url:  url,
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
    if (typeof func == 'function') {
        return func;
    }
    if (typeof func == 'string') {
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
function createIframe(src, width, height) {
    width = width ? width + UNIT_PX : 'auto';
    height = height ? height + UNIT_PX : 'auto';
    return $(['<iframe src="', src || BLANK_SRC, '" style="overflow:hidden; width:', width, '; height:', height, '; border:0; margin:0; padding:0;"></iframe>'].join(''));
}
function createOverlay(options, clazz) {
    var overlay =  $(['<div id="', PREFIX, 'overlay_', GUID, '" class="', clazz.overlay, '"></div>'].join(''));
    overlay.css({'opacity': OPACITY, 'z-index': ZINDEX});
    return overlay;
}
function createShadow(options, clazz) {
    var shadow = $(['<div id="', PREFIX, 'shadow_', GUID, '" class="', clazz.shadow, '"></div>'].join(''));
    shadow.css({'z-index': ZINDEX, 'opacity': SHADOW_OPACITY});
    return shadow;
}
function createBox(options, clazz) {
    var box = $([
        '<div id="', PREFIX, 'box_', GUID, '" class="', clazz.box, options.dialogClass ? ' ' + options.dialogClass : '', '">',
            '<div class="', clazz.header, '"><a href="javascript:void(0);" title="', LANG.CLOSE, '" class="', clazz.close, '">X</a><span class="', clazz.title, '">', options.title, '</span></div>',
            '<div class="', clazz.content, '"><div class="', clazz.content_inner, '">', options.message && !options.message.jquery ? options.message : '', '</div></div>',
            '<div class="', clazz.footer, '">',
                '<div class="', clazz.widget, '"></div>',
                '<div class="', clazz.buttons, '"></div>',
            '</div>',
        '</div>'
    ].join(''));
    box.css({'z-index': ZINDEX});
    options.message && options.message.jquery && (box.find('.' + clazz.content_inner).append(options.message));
    return box;
}
function createButton(option, clazz) {
    var button = $(['<span class="', clazz.button, '"><input type="button" value="', option.text, '" /></span>'].join(''));
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
function createTips(option, clazz) {
    return $(['<div class="', clazz.tips, '">', option.message, '</div>'].join(''));
}

window.dialog = {
    _options: CONFIG,
    _clazz: CLASS,
    _common: function(options) {
        if (!options) {
            throw 'dialog need message or callback';
        }
        if (options.jquery || typeof options == 'string') {
            options = {
                'message': options
            };
        }
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
    setup: function(options, clazz, locale) {
        $.extend(this._options, options || {});
        $.extend(this._clazz, clazz || {});
        $.extend(LOCALES, locale || {});
        options.locale && (LANG = getLocale(options.locale));
        return this;
    },
    ok: function(options, ok, close) {
        var self = this;
        options = this._common(options);
        if (!options.buttons) {
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
        if (!options.buttons) {
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
        if (!options.buttons) {
            options.buttons = [self._button(LANG.OK, ok), self._button(LANG.CANCEL, cancel)];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_confirm;
        }
        return this.dialog(options, undefined, cancel);
    },
    tips: function(options, duration, close) {
        var self = this, guid;

        if (typeof options == 'function') {
            close = options;
            options = {};
        } else if (typeof duration == 'function') {
            close = duration;
        }

        options = $.extend({}, this._options, this._common(options));
        options.message = createTips(options, this._clazz);

        guid = this.dialog(options, undefined, close);

        !duration && (duration = 2500);
        duration != -1 && (setTimeout(function() {
            self.close(guid);
        }, duration));
    },
    form: function(options, url, submit, load, error, beforeSubmit, beforeSerialize, cancel) {
        var self = this, div, guid;

        if (!options) {
            throw 'dialog.form need title';
        }
        if (typeof options == 'string') {
            options = {
                'title': options
            };
        }

        if (!options.buttons) {
            options.buttons = [{
                text: LANG.OK,
                callback: function(guid) {
                    var box = self.get(guid),
                        form = box.find('form:last'),
                        buttons = box.find('.' + self._clazz.buttons + ' :button'),
                        callback, complete;

                    callback = function(json) {
                        if (isFunction(submit) && submit(json) === false) {
                            return false;
                        }
                        self.close(guid, true);
                    };
                    complete = function() {
                        buttons.removeAttr('disabled');
                    };

                    if (form.size()) {
                        form.ajaxSubmit({
                            dataType:'json',
                            type:'post',
                            success:callback,
                            error:function(XMLHttpRequest, textStatus, errorThrown) {
                                if (isFunction(error)) {
                                    error(XMLHttpRequest, textStatus, errorThrown);
                                } else {
                                    self.error(options.errorMessage);
                                }
                            },
                            complete:complete,
                            beforeSubmit:function() {
                                buttons.attr('disabled', 'disabled');
                                if (isFunction(beforeSubmit) && beforeSubmit(form, guid) === false) {
                                    complete();
                                    return false;
                                }
                                return true;
                            },
                            beforeSerialize:beforeSerialize
                        });
                        return false;
                    }
                    
                    callback(box);
                }
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
        div.load(url, function() {
            callback();
        }).bind('ajaxComplete', function() {
            callback(true);
        });

        options.message = div;
        guid = this.dialog(options, function(box) {
            box.find('.' + self._clazz.buttons + ' :button').attr('disabled', 'disabled');
        }, cancel);
    },
    show: function(options, callback, load, cancel) {
        var self = this, clazz = this._clazz, guid, iframe;

        if (!options || options.jquery || ($(options).size() && !options.url)) {
            return this.ok(options, callback, cancel);
        }

        if (typeof options == 'function') {
            throw 'dialog.show need options';
        }

        options = $.extend({}, this._options, this._common(options));
        iframe = createIframe(options.url || options.message, options.width, options.height);

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

                !options.title && doc.title && doc.title.length && (self.get(guid).find('.' + clazz.title).html(doc.title));
            } catch (e) {
                self.get(guid).find('.' + clazz.title).html(options.title || iframe.attr('src'));
            }
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
            } else if (typeof options == 'string') {
                options = {
                    title: options
                };
            }
        }
        options = $.extend({}, this._options, options);

        guid = ++GUID;
        ZINDEX++;

        box = createBox(options, clazz);
        box.data('options', options);

        if (options.overlay) {
            overlay = createOverlay(options, clazz);
            box.data('overlay', options.overlay);
            $(doc.body).append(overlay);
            options.iframe && overlay.bgiframe();
        }
        if (options.shadow) {
            shadow = createShadow(options, clazz);
            box.data('shadow', options.shadow);
            $(doc.body).append(shadow);
            !options.overlay && options.iframe && (shadow.bgiframe());
        }

        if (options.buttons || options.widget) {
            buttons = options.buttons;
            buttons_area = box.find('.' + clazz.buttons);
            if (buttons && buttons.length) {
                var button, index, length = buttons.length, option;
                for (index = 0; index < length; index++) {
                    (function(option) {
                        button = createButton(option, clazz);
                        if (isFunction(option.callback)) {
                            button.click(function() {
                                option.callback(guid);
                            });
                        }
                        buttons_area.prepend(button);
                    })(buttons[index]);
                }
            }
        } else {
            box.find('.' + clazz.footer).remove();
        }

        $(doc.body).append(box);
        !options.overlay && !options.shadow && options.iframe && (box.bgiframe());

        $(window).resize(function() {
            self.resize(guid);
        });
        setTimeout(function() {
            self.resize(guid);
        }, 500);

        isFunction(open) && open(box);
        isFunction(close) && box.data('close', close);
        box.find('.' + clazz.close).click(function() {
            self.close(guid);
            return false;
        });

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
            overlay, shadow, content,
            width, height, awidth, aheight, osize,
            title_height, footer_height,
            documentWidth = doe.clientWidth,
            documentHeight = doe.clientHeight,
            pageWidth = $(doc).width(),
            pageHeight = max($(doc).height(), documentHeight);

        // 未找到容器
        if (!box.size() || box.data('resizing')) {
            return false;
        }
        box.data('resizing', true);

        // 如果有遮罩层，设置遮罩层
        if (box.data('overlay')) {
            overlay = this.getOverlay(guid);
            overlay.css({
                width: pageWidth,
                height: pageHeight
            });
        }

        // 找到内容区域
        content = box.find('.' + CLASS.content);

        // 获取标题和按钮区域的高度
        title_height = box.find('.' + CLASS.header).outerHeight(true);
        footer_height = box.find('.' + CLASS.footer).outerHeight(true);

        // 重设大小
        content.css({
            width: 'auto',
            height:'auto'
        });
        box.css({
            width: 'auto',
            height: 'auto'
        });

        // 阴影和边框大小
        osize = 2 * SHADOW_PADDING + 2 * BOX_BORDER_WIDTH;

        width = box.width();
        awidth = documentWidth - osize;
        width = max(awidth < width ? awidth : width, options.minWidth);
        options.width && (width = min(width, options.width));
        // TODO IE6 / IE7 下的兼容性问题
        /*width = min(width, 550);*/

        box.data('shadow') && this.getShadow(guid).css({
            width: width + osize,
            left: '50%',
            'margin-left': Math.floor(width / 2) * -1 - SHADOW_PADDING
        });
        box.css({
            width: width,
            left: '50%',
            'margin-left': Math.floor(width / 2) * -1
        });
        content.css({
            width: width
        });

        height = box.height();
        aheight = documentHeight - osize;
        height = max(aheight < height ? aheight : height, options.minHeight);
        options.height && (height = min(height, options.height));

        box.data('shadow') && this.getShadow(guid).css({
            height: height + osize,
            top: max(0, Math.floor(max(documentHeight - height, 0) / 2) - SHADOW_PADDING)
        });
        box.css({
            height: height,
            top: max(SHADOW_PADDING, Math.floor(max(documentHeight - height, 0) / 2))
        });
        content.css({
            height: height - title_height - footer_height
        });

        box.data('resizing', false);
        return true;
    }
};
})(jQuery, window);
