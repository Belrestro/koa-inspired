const Chain = require('./chain');

const AVAILABLE_METHODS = new Map([
  ['get', 'get'],
  ['post', 'post'],
  ['put', 'put'],
  ['update', 'update'],
  ['delete', 'delete'],
  ['options', 'options'],
  ['all', '']
]);

const pathToRegExp = (path) => {
  const pathParts = path.split('/');
  const regExp = pathParts.reduce((memo, part) => {
    if (!part) return memo;
    if (part.startsWith(':')) {
      memo += `\/(?<${part.slice(1)}>[^\/]+)`;
    } else {
      memo += `\/${part}`;
    }

    return memo;
  }, '');

  return regExp;
}

const state = Symbol('state')

class Router extends Chain {
  constructor(prefix) {
    super();
    this.prefix = prefix || '/';
    this[state] = {
      parameterHandlers: new Map(),
    };

    for (const [method, key] of AVAILABLE_METHODS.entries()) {
      this[method] = this.route.bind(this, key);
    }
  }

  route(method, path, ...middleware) {
    const { parameterHandlers } = this[state];
    const regExp = pathToRegExp(`${path}`);

    const runPathHandlers = async (ctx, param) => {
      if (!parameterHandlers.has(param)) return;
      const handlers = parameterHandlers.get(param);
      const value = ctx.params[param];
      const next = async () => {
        const handler = handlers.shift();

        if (!ctx.finished && handler) await handler(value, ctx, next);
      }

      await next();
    }

    const stackFn = async (ctx, next) => {
      const { request } = ctx;
      const methodMatch = request.method.toLowerCase().startsWith(method);
      const pathMatch = request.pathRemains.match(new RegExp(`^${regExp}\/?$`));

      if (methodMatch && pathMatch) {
        const { groups } = pathMatch;

        Object.assign(ctx.params, groups);
        for (const param of Object.keys(ctx.params)) {
          await runPathHandlers(ctx, param);
        }

        const middlewareChain = Chain.chainRequests(middleware, ctx);

        return await middlewareChain();
      }

      await next();
    }

    this.stack.push(stackFn);

    return this;
  }

  param(parameter, ...middleware) {
    const { parameterHandlers } = this[state];
    const handlers = parameterHandlers.get(parameter) || [];

    parameterHandlers.set(parameter, [ ...handlers, ...middleware ]);
    return this;
  }

  routes() {
    const routerRegExp = new RegExp(`^${pathToRegExp(this.prefix)}`);

    return async (ctx, next) => {
      const pathRemains = ctx.request.pathRemains || ctx.request.path;
      const prefixMatch = (pathRemains || path).match(routerRegExp);

      if (prefixMatch) {

        ctx.request.pathRemains = pathRemains.replace(prefixMatch[0], '');
        await this.execute(ctx);
      }
      if (!ctx.finished && next) {
        await next();
      }
    }
  }
}

module.exports = Router;
