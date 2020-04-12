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