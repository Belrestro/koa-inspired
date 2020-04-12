const http = require('http');
const { Pipeline } = require('../lib');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const fileDir = path.resolve(process.cwd(), 'static');
const existsAsync = promisify(fs.exists);

const serveFiles = async (ctx, next) => {
  const filePath = path.resolve(fileDir, ctx.request.path.slice(1));
  if (!(await existsAsync(filePath))) {
    return next();
  }
  ctx.status = 200;
  ctx.type = 'application/octet-stream';
  ctx.body = fs.createReadStream(filePath);
}

const app = new Pipeline();

app.use(serveFiles);

http.createServer(app.callback()).listen(3000);