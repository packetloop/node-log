import path from 'path';
import morgan from 'morgan';
import onFinished from 'on-finished';
import {log, err, datadog} from './log';
const {name} = require(path.join(process.cwd(), 'package.json'));


const safe = max => (str = '') => str.substr(0, max);
const safeString = safe(200);
const safeUrl = safe(500);


export const getIp = req =>
  safeString((req.headers['X-Forwarded-For'] || morgan['remote-addr'](req) || '').split(',')[0]);


export const requestLog = ({ENVIRONMENT, CLUB_ID, CLUB_NAME, SERVICE_NAME}) =>
  morgan((tokens, req, res) => {
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
    log(logObject);

    const tags = [
      `service_name:${SERVICE_NAME}`,
      `env:${ENVIRONMENT}`,
      `club_id:${CLUB_ID}`,
      `club_name:${CLUB_NAME}`,
      `http_method:${logObject.method.toLowerCase()}`,
      `http_path:${logObject.url}`
    ];

    const host = req.headers.Host;
    const ts = Math.round(Date.now() / 1000);

    datadog({
      series: [
        {
          metric: `${name}.responseTime`,
          points: [[ts, parseFloat(tokens['response-time'](req, res))]],
          host,
          tags
        },
        {
          metric: `${name}.http_${Math.floor(logObject.status / 100)}xx`,
          points: [[ts, 1]],
          host,
          tags
        }
      ].concat(logObject.status === 206 ? [
        {
          metric: `${name}.http_${logObject.status}`,
          points: [[ts, 1]],
          host,
          tags
        }
      ] : [])
    });
  });


const errorStatus = error => (error.payload || {}).status || 500;


export const logRequestErr = (error, req, res, callback) => {
  // To output error after logging request
  onFinished(res, () => {
    err(Object.assign(error, {
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


export const requestErr = (error, req, res, next) => // eslint-disable-line no-unused-vars
  logRequestErr(error, req, res, () => {
    if (!res.headersSent) {
      res.status(errorStatus(error));
    }
    res.end(error.message);
  });
