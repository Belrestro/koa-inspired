### Koa inspired http flow

usage `Pipeline`

```
const http = require('http');
const { Pipeline } = require('./lib');

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
```

usage `Router`

```
const http = require('http');
const { Pipeline, Router } = require('../lib');

let bottlesOfBeer = 99;

const app = new Pipeline();
const sheepRouter = new Router('/bob');

sheepRouter
  .get('/take-one-down', (ctx) => {
    let lyrics = '';
    if (bottlesOfBeer > 0 ) {
      lyrics = `${bottlesOfBeer} bottles of beer on the wall, ${bottlesOfBeer} bottles of beer.
        Take one down and pass it around, ${--bottlesOfBeer} bottles of beer on the wall.`;
    } else {
      lyrics = `No more bottles of beer on the wall, no more bottles of beer.
        Go to the store and buy some more, and there will be 99 bottles of beer on the wall.`
    }
    ctx.body = lyrics;
  })
  .post('/buy-some-more', (ctx) => {
    bottlesOfBeer = 99;
    ctx.status = 201;
  })

app.use(sheepRouter.routes());

http.createServer(app.callback()).listen(3000);
```

serve static files

```
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
```