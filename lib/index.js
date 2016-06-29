'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

Object.defineProperty(exports, 'log', {
  enumerable: true,
  get: function get() {
    return _log.log;
  }
});
Object.defineProperty(exports, 'err', {
  enumerable: true,
  get: function get() {
    return _log.err;
  }
});
Object.defineProperty(exports, 'datadog', {
  enumerable: true,
  get: function get() {
    return _log.datadog;
  }
});

var _requestLog = require('./requestLog');

Object.defineProperty(exports, 'requestErr', {
  enumerable: true,
  get: function get() {
    return _requestLog.requestErr;
  }
});
Object.defineProperty(exports, 'requestLog', {
  enumerable: true,
  get: function get() {
    return _requestLog.requestLog;
  }
});
Object.defineProperty(exports, 'logRequestErr', {
  enumerable: true,
  get: function get() {
    return _requestLog.logRequestErr;
  }
});
Object.defineProperty(exports, 'getIp', {
  enumerable: true,
  get: function get() {
    return _requestLog.getIp;
  }
});