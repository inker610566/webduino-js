+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Module = scope.Module,
    BoardEvent = scope.BoardEvent,
    proto;

  var SSFRecvEvent = {
    MESSAGE: 'ssfmessage',
    MESSAGE_ERROR: 'ssfmessageError'
  };

  function SSF(board) {
    Module.call(this);
    this._board = board;
    this._messageHandler = onMessage.bind(this);
    this._recvCallback = function () {};
    this._recvErrorCallback = function () {};
    //this._board.send([0xf0, 0x04, 0x0A, 0x01, 0xf7]);
  }

  function onMessage(event) {
    var msg = event.message;
    var data = msg.slice(2);
    var str = '';
    var i, tp, len;

    if(msg.length < 2 || msg[1] != 0x10 || (msg[0] != 0x87 && msg[0] != 0x78)) {
        return false;
    }

    if(msg[0] == 0x87)
      this.emit(SSFRecvEvent.MESSAGE, parseFloat(data));
    else
      this.emit(SSFRecvEvent.MESSAGE, "Overflow");
  }

  SSF.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: SSF
    },
    state: {
      get: function () {
        return this._state;
      },
      set: function (val) {
        this._state = val;
      }
    }
  });

  proto.on = function (callback, errorCallback) {
    if (typeof callback !== 'function') {
      callback = function () {};
    }

    if (typeof errorCallback !== 'function') {
      errorCallback = function () {};
    }

    this._recvCallback = function (value) {
      callback(value);
    };
  
    this._recvErrorCallback = function (msg) {
      errorCallback(msg);
    };
  
    this._board.on(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.addListener(SSFRecvEvent.MESSAGE, this._recvCallback);
    this.addListener(SSFRecvEvent.MESSAGE_ERROR, this._recvErrorCallback);
  };

  proto.off = function () {
    this._state = 'off';

    this._board.removeListener(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.removeListener(SSFRecvEvent.MESSAGE, this._recvCallback);
    this.removeListener(SSFRecvEvent.MESSAGE_ERROR, this._recvErrorCallback);
    this._recvCallback = null;
    this._recvErrorCallback = null
  };

  scope.module.SSF = SSF;
}));
