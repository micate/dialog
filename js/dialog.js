(function($, window, undefined) {

var CONFIG = {
        instance: 'dialog',
        title: '提示',
        overlay: true,
        shadow: true,
        minWidth: 200,
        minHeight: 165,
        dialogClass: ''
    },
    CLASS = {
        overlay: 'dialog-overlay',
        shadow: 'dialog-shadow', 
        box: 'dialog-box',
        dialog_ok: 'dialog-ok',
        dialog_error: 'dialog-error',
        dialog_confirm: 'dialog-confirm',
        title: 'dialog-title',
        close: 'dialog-close',
        content: 'dialog-content',
        content_inner: 'dialog-content-inner',
        footer: 'dialog-footer',
        widget: 'dialog-widget',
        buttons: 'dialog-buttons',
        button: 'dialog-button',
        button_hover: 'dialog-button-over',
        button_focus: 'dialog-button-active'
    },
    GUID = 0,
    PREFIX = 'dialog_',
    ZINDEX = 1000,
    OPACITY = 0.8,
    SHADOW_OPACITY = 0.2,
    UNIT_PX = 'px',

    SHADOW_PADDING = 10,
    BOX_BORDER_WIDTH = 1,

    doc = document,
    doe = doc.documentElement,

    max = Math.max,
    min = Math.min;

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
function floatval(val) {
    return val && parseFloat((val + '').replace(/[^\d]*/, '')) || 0;
}
function createIframe(src, width, height) {
    width = floatval(width) + UNIT_PX;
    height = floatval(height) + UNIT_PX;
    return $(['<iframe src="', src, '" style="width:', width, '; height:', height, '; border:0; margin:0; padding:0;'].join(''));
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
            '<div class="', clazz.title, '"><a href="javascript:void(0);" title="关闭" class="', clazz.close, '">X</a>', options.title, '</div>',
            '<div class="', clazz.content, '"><div class="', clazz.content_inner, '">', options.message, '</div></div>',
            '<div class="', clazz.footer, '">',
                '<div class="', clazz.widget, '"></div>',
                '<div class="', clazz.buttons, '"></div>',
            '</div>',
        '</div>'
    ].join(''));
    box.css({'z-index': ZINDEX});
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

window.dialog = {
    _options: CONFIG,
    _clazz: CLASS,
    _common: function(options) {
        if (!options) {
            throw 'dialog need message or callback';
        }
        if (typeof options == 'string') {
            options = {
                'message': options
            };
        }
        return options;
    },
    setup: function(options, clazz) {
        $.extend(this._options, options || {});
        $.extend(this._clazz, clazz || {});
        return this;
    },
    ok: function(options, ok) {
        var self = this;
        options = this._common(options);
        if (!options.buttons) {
            options.buttons = [{
                text: '确定',
                callback: function(guid) {
                    if (isFunction(ok) && ok() === false) {
                        return false;
                    }
                    self.close(guid, true);
                }
            }];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_ok;
        }
        return this.dialog(options, undefined, undefined, undefined, ok);
    }, 
    error: function(options, ok) {
        var self = this;
        options = this._common(options);
        if (!options.buttons) {
            options.buttons = [{
                text: '确定',
                callback: function(guid) {
                    if (isFunction(ok) && ok() === false) {
                        return false;
                    }
                    self.close(guid, true);
                }
            }];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_error;
        }
        return this.dialog(options, undefined, undefined, undefined, ok);
    },
    confirm: function(options, yes, no) {
        var self = this;
        options = this._common(options);
        if (!options.buttons) {
            options.buttons = [{
                text: '确定',
                callback: function(guid) {
                    if (isFunction(yes) && yes() === false) {
                        return false;
                    }
                    self.close(guid, true);
                }
            }, {
                text: '取消',
                callback: function(guid) {
                    if (isFunction(no) && no() === false) {
                        return false;
                    }
                    self.close(guid, true);
                }
            }];
        }
        if (!options.dialogClass) {
            options.dialogClass = this._clazz.dialog_confirm;
        }
        return this.dialog(options, undefined, undefined, undefined, undefined);
    },
    form: function(options, ok, error, close) {
        var self = this;
        options = this._common(options);
        // TODO
    },
    show: function(options, ok, cancel, open, close) {

    },
    dialog: function(options, ok, cancel, open, close) {
        var self = this, clazz = this._clazz, guid, box, overlay, shadow, buttons, buttons_area;
        if (!options) {
            throw 'dialog.dialog need options.';
        }
        if (!isFunction(ok)) {
            if (isFunction(options)) {
                ok = options;
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
        if (options.overlay) {
            overlay = createOverlay(options, clazz);
            box.data('overlay', options.overlay);
            $(doc.body).append(overlay);
        }
        if (options.shadow) {
            shadow = createShadow(options, clazz);
            box.data('shadow', options.shadow);
            $(doc.body).append(shadow);
        }

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
            //buttons_area.find(':button:eq(0)').focus();
        }

        $(doc.body).append(box);

        this.resize(guid, options);
        $(window).resize(function() {
            self.resize(guid, options);
        });

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
        if (!slient && isFunction(close) && close() === false) {
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
    resize: function(guid, options) {
        var box = this.get(guid), overlay, shadow, content,
            width, height, awidth, aheight, osize,
            title_height, footer_height,
            documentWidth = doe.clientWidth,
            documentHeight = doe.clientHeight,
            pageWidth = $(doc).width(),
            pageHeight = max($(doc).height(), documentHeight);

        // 未找到容器
        if (!box.size()) {
            return false;
        }

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
        title_height = box.find('.' + CLASS.title).outerHeight(true);
        footer_height = box.find('.' + CLASS.footer).outerHeight(true);

        // 重设大小
        content.css({
            height:'auto'
        });
        box.css({
            width: 'auto',
            height: 'auto'
        });

        // 阴影和边框大小
        osize = 2 * SHADOW_PADDING + 2 * BOX_BORDER_WIDTH;

        // 计算正确的大小
        width = box.width();
        awidth = documentWidth - osize;
        width = max(awidth < width ? awidth : width, options.minWidth);
        // TODO IE6 / IE7 下的兼容性问题
        width = min(width, 550);
        height = box.height();
        aheight = documentHeight - osize;
        height = max(aheight < height ? aheight : height, options.minHeight);

        // 设置阴影大小
        box.data('shadow') && this.getShadow(guid).css({
            width: width + osize,
            height: height + osize,
            left: '50%',
            'margin-left': Math.floor(width / 2) * -1 - SHADOW_PADDING,
            top: max(0, Math.floor(max(documentHeight - height, 0) / 2) - SHADOW_PADDING)
        });

        // 应用正确的大小
        box.css({
            width: width,
            height: height,
            left: '50%',
            'margin-left': Math.floor(width / 2) * -1,
            top: max(SHADOW_PADDING, Math.floor(max(documentHeight - height, 0) / 2))
        });
        content.css({
            height: height - title_height - footer_height
        });

        return true;
    }
};
})(jQuery, window);
