'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestErr = exports.logRequestErr = exports.requestLog = exports.getIp = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

var _log = require('./log');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require(_path2.default.join(process.cwd(), 'package.json'));

const name = _require.name;


const safe = max => function () {
  let str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  return str.substr(0, max);
};
const safeString = safe(200);
const safeUrl = safe(500);

const getIp = exports.getIp = req => safeString((req.headers['X-Forwarded-For'] || _morgan2.default['remote-addr'](req) || '').split(',')[0]);

const requestLog = exports.requestLog = _ref => {
  let NODE_ENV = _ref.NODE_ENV;
  let CLUB_ID = _ref.CLUB_ID;
  let CLUB_NAME = _ref.CLUB_NAME;
  let SERVICE_NAME = _ref.SERVICE_NAME;
  return (0, _morgan2.default)((tokens, req, res) => {
    const logObject = {
      url: safeUrl(tokens.url(req, res)),
      method: tokens.method(req, res),
      status: parseInt(tokens.status(req, res), 10),
      responseTime: parseFloat(tokens['response-time'](req, res)),
      httpVersion: tokens['http-version'](req, res),
      referrer: safeUrl(tokens.referrer(req, res)),
      remoteAddr: getIp(req),
      remoteUser: safeString(tokens['remote-user'](req, res)),
      userAgent: safeString(tokens['user-agent'](req, res))
    };
    (0, _log.log)(logObject);

    const tags = [`service_name:${ SERVICE_NAME }`, `env:${ NODE_ENV }`, `club_id:${ CLUB_ID }`, `club_name:${ CLUB_NAME }`, `http_method:${ logObject.method.toLowerCase() }`, `http_path:${ logObject.url }`];

    const host = req.headers.Host;
    const ts = Math.round(Date.now() / 1000);

    (0, _log.datadog)({
      series: [{
        metric: `${ name }.responseTime`,
        points: [[ts, parseFloat(tokens['response-time'](req, res))]],
        host,
        tags
      }, {
        metric: `${ name }.http_${ Math.floor(logObject.status / 100) }xx`,
        points: [[ts, 1]],
        host,
        tags
      }].concat(logObject.status === 206 ? [{
        metric: `${ name }.http_${ logObject.status }`,
        points: [[ts, 1]],
        host,
        tags
      }] : [])
    });
  });
};

const errorStatus = error => (error.payload || {}).status || 500;

const logRequestErr = exports.logRequestErr = (error, req, res, callback) => {
  // To output error after logging request
  (0, _onFinished2.default)(res, () => {
    (0, _log.err)(Object.assign(error, {
      payload: Object.assign({
        url: safeUrl(req.url),
        method: req.method,
        status: errorStatus(error)
      }, error.payload || {})
    }));
  });

  if (callback) {
    callback();
  }
};

const requestErr = exports.requestErr = (error, req, res, next) => // eslint-disable-line no-unused-vars
logRequestErr(error, req, res, () => {
  if (!res.headersSent) {
    res.status(errorStatus(error));
  }
  res.end(error.message);
});