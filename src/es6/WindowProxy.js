export default class WindowProxy{
    constructor(targetWindowName){
        this.targetWindowName = targetWindowName;
        this.origin = window.location.protocol + '//' + window.location.host;
        this.onMessageHandlers = [];
    }

    getTargetWindowName(){
        return this.targetWindowName;
    }

    getOrigin(){
        return this.origin;
    }

    getTargetWindow() {
        if (this.targetWindowName === '') {
            return parent;
        } else if (this.targetWindowName === 'top' || this.targetWindowName === 'parent') {
            return window[this.targetWindowName];
        }
        return window.frames[this.targetWindowName];
    };

    post(data, targetOrigin = '*') {
        this.dispatchMessage({
            'data' : data,
            'sourceOrigin' : this.getOrigin(),
            'targetOrigin' : targetOrigin,
            'sourceWindowName' : window.name,
            'targetWindowName' : this.getTargetWindowName()
        });
    }

    dispatchMessage(message) {
        this.getTargetWindow().postMessage(JSON.stringify(message), message.targetOrigin);
    }

    addHandler(f) {
        if (this.onMessageHandlers.length === 0) {
            var self = this;
            if (window.addEventListener) {
                window.addEventListener('message', event => { this.onMessage(this, event); }, false);
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", event => { this.onMessage(this, window.event); });
            }
        }

        this.onMessageHandlers.push(f);
    }

    clearHandlers() {
        this.onMessageHandlers = [];

        if (this.onMessageHandlers.length === 0) {
            //TODO: Wont work without callback reference
            if (window.removeEventListener) {
                window.removeEventListener('message', event => { this.onMessage(this, event); });
            } else if (window.detachEvent) {
                if (typeof window.onmessage === 'undefined') window.onmessage = null;
                window.detachEvent('onmessage', event => { this.onMessage(this, window.event); });
            }
        }
    }

    onMessage(self, nativeEvent) {
        // Do not call
        if(self.onMessageHandlers.length == 0)
            return;

        let eventArgs = JSON.parse(nativeEvent.data);
        if (eventArgs && (self.targetWindowName === '' || eventArgs.sourceWindowName == self.targetWindowName)) {
            var msg = new Message(eventArgs.data, nativeEvent.origin, self);
            let i;
            for (i = 0; i < this.onMessageHandlers.length; i++) {
                try {
                    this.onMessageHandlers[i](msg);
                } catch (e) {
                }
            }
        }
    }
}

export class Message{
    constructor(data, origin, source){
        this.data = data;
        this.origin = origin;
        this.source = source;
    }
}