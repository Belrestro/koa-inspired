const http = require('http');
const { Pipeline } = require('../lib');

const app = new Pipeline();

// request logger
app.use(async (ctx, next) => {
  const { method, path } = ctx.request;
  console.log('Server recieved request at', method, path);
	await next();
});
// echo server
app.use(ctx => {
	ctx.req.pipe(ctx.res);
});

http.createServer(app.callback()).listen(3000);