'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WindowProxy = (function () {
    function WindowProxy(targetWindowName) {
        _classCallCheck(this, WindowProxy);

        this.targetWindowName = targetWindowName;
        this.origin = window.location.protocol + '//' + window.location.host;
        this.onMessageHandlers = [];
    }

    _createClass(WindowProxy, [{
        key: 'getTargetWindowName',
        value: function getTargetWindowName() {
            return this.targetWindowName;
        }
    }, {
        key: 'getOrigin',
        value: function getOrigin() {
            return this.origin;
        }
    }, {
        key: 'getTargetWindow',
        value: function getTargetWindow() {
            if (this.targetWindowName === '') {
                return parent;
            } else if (this.targetWindowName === 'top' || this.targetWindowName === 'parent') {
                return window[this.targetWindowName];
            }
            return window.frames[this.targetWindowName];
        }
    }, {
        key: 'post',
        value: function post(data) {
            var targetOrigin = arguments[1] === undefined ? '*' : arguments[1];

            this.dispatchMessage({
                'data': data,
                'sourceOrigin': this.getOrigin(),
                'targetOrigin': targetOrigin,
                'sourceWindowName': window.name,
                'targetWindowName': this.getTargetWindowName()
            });
        }
    }, {
        key: 'dispatchMessage',
        value: function dispatchMessage(message) {
            this.getTargetWindow().postMessage(JSON.stringify(message), message.targetOrigin);
        }
    }, {
        key: 'addHandler',
        value: function addHandler(f) {
            var _this = this;

            if (this.onMessageHandlers.length === 0) {
                var self = this;
                if (window.addEventListener) {
                    window.addEventListener('message', function (event) {
                        _this.onMessage(_this, event);
                    }, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onmessage', function (event) {
                        _this.onMessage(_this, window.event);
                    });
                }
            }

            this.onMessageHandlers.push(f);
        }
    }, {
        key: 'clearHandlers',
        value: function clearHandlers() {
            var _this2 = this;

            this.onMessageHandlers = [];

            if (this.onMessageHandlers.length === 0) {
                //TODO: Wont work without callback reference
                if (window.removeEventListener) {
                    window.removeEventListener('message', function (event) {
                        _this2.onMessage(_this2, event);
                    });
                } else if (window.detachEvent) {
                    if (typeof window.onmessage === 'undefined') window.onmessage = null;
                    window.detachEvent('onmessage', function (event) {
                        _this2.onMessage(_this2, window.event);
                    });
                }
            }
        }
    }, {
        key: 'onMessage',
        value: function onMessage(self, nativeEvent) {
            // Do not call
            if (self.onMessageHandlers.length == 0) return;

            var eventArgs = JSON.parse(nativeEvent.data);
            if (eventArgs && (self.targetWindowName === '' || eventArgs.sourceWindowName == self.targetWindowName)) {
                var msg = new Message(eventArgs.data, nativeEvent.origin, self);
                var i = undefined;
                for (i = 0; i < this.onMessageHandlers.length; i++) {
                    try {
                        this.onMessageHandlers[i](msg);
                    } catch (e) {}
                }
            }
        }
    }]);

    return WindowProxy;
})();

exports['default'] = WindowProxy;

var Message = function Message(data, origin, source) {
    _classCallCheck(this, Message);

    this.data = data;
    this.origin = origin;
    this.source = source;
};

exports.Message = Message;