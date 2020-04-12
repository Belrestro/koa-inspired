const Context = require('./context');
const Chain = require('./chain');
const { Readable } = require('stream');

class HttpPipeline extends Chain {
  callback () {
    return async (req, res) => {
      const ctx = new Context(req, res);

      // execute pipeline
      await this.execute(ctx);

      const { status, type } = ctx;
      // finalize response
      const headers = Object.fromEntries(ctx.headers.entries());

      if (ctx.body instanceof Readable) {
        return ctx.body.pipe(res);
      }

      res.writeHead(status, {
        ...headers,
        'Content-Type': type,
      });

      if (ctx.body) {
        const contentType = type.toLocaleLowerCase().trim();
        let body;
        switch (contentType) {
          case 'application/json':
            body = JSON.stringify(ctx.body);
            break;
          default:
            body = ctx.body.toString()
            break
        }
        res.end(Buffer.from(body), 'utf-8');
      } else {
        res.end();
      }
    };
  }
};

module.exports = HttpPipeline;
