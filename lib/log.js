'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.datadog = exports.err = exports.log = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require(_path2.default.join(process.cwd(), 'package.json'));

const app = _require.name;
const version = _require.version;


const wrap = obj => Object.assign({ timestamp: new Date().toISOString(), app, version }, obj);

const readableError = _ref => {
  let name = _ref.name;
  let message = _ref.message;
  let stack = _ref.stack;
  var _ref$payload = _ref.payload;
  let payload = _ref$payload === undefined ? {} : _ref$payload;
  return Object.assign({
    error: name,
    message,
    stack
  }, payload, {
    errors: JSON.stringify(payload.errors ? payload.errors.map(readableError) : [])
  });
};

const log = exports.log = obj => {
  process.stdout.write(`${ JSON.stringify(wrap(obj)) }\n`);
};

const err = exports.err = error => {
  process.stderr.write(`${ JSON.stringify(wrap(readableError(error))) }\n`);
};

const datadog = exports.datadog = obj => {
  process.stdout.write(`${ JSON.stringify({ datadog: obj }) }\n`);
};