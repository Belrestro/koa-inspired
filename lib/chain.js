
class Chain {
  constructor() {
    this.stack = [];
  }

  static chainRequests(stack, ctx, move) {
    const handlers = stack.slice(0);

    const next = async () => {
      const handler = handlers.shift();
      if (!ctx.finished && handler) {
        await handler(ctx, next);
      }
      if (!ctx.finished && move) {
        await move();
      }
    }
  
    return next;
  }

  use(...middleware) {
    for (const fn of middleware) {
      if (!(fn instanceof Function)) {
        throw new Error('Invalid argument, chain middleware must be a function');
      }
    }

    const stackFn = async (ctx, move) => {
      const next = Chain.chainRequests(middleware, ctx, move);

      await next()
    }

    this.stack.push(stackFn);

    return this;
  }

  async execute(ctx, ...rest) {
    const next = Chain.chainRequests(this.stack, ctx, ...rest);

    await next();
  }
}

module.exports = Chain;
