import path from 'path';
const {name: app, version} = require(path.join(process.cwd(), 'package.json'));


const wrap = obj => Object.assign({timestamp: new Date().toISOString(), app, version}, obj);


const readableError = ({name, message, stack, payload = {}}) => Object.assign({
  error: name,
  message,
  stack
}, payload, {
  errors: JSON.stringify(payload.errors ? payload.errors.map(readableError) : [])
});


export const log = obj => {
  process.stdout.write(`${JSON.stringify(wrap(obj))}\n`);
};


export const err = error => {
  process.stderr.write(`${JSON.stringify(wrap(readableError(error)))}\n`);
};


export const datadog = obj => {
  process.stdout.write(`${JSON.stringify({datadog: obj})}\n`);
};
