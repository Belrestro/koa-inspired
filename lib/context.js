const URL = require('url');

const state = Symbol('state');

class HttpError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

class Context {
  constructor(req, res) {
    const { url, method, headers } = req;
    const currentContentType = headers['content-type'] || '';
    const { pathname: path, query } = URL.parse(url);
    const is = (types) => {
      const contentTypes = Array.isArray(types)
        ? types
        : [types];
      return contentTypes.some(type => currentContentType.startsWith(type));
    }

    const request = {
      url,
      path,
      method,
      headers,
      query,
      is,
    };

    this[state] = {
      finished: false,
      headers: new Map(),
      type: 'text/plain',
      status: 404,
      params: {}
    };

    Object.assign(this, {
      req, res, request,
    });
  }

  get body() {
    return this[state].body;
  }

  set body(value) {
    this[state].body = value;

    if (!this.finished) {
      this[state].status = 200;
    }

    this.markResponseCompleted();
  }

  get status() {
    return this[state].status;
  }

  set status(value = 404) {
    this[state].status = value;
    this.markResponseCompleted();
  }

  get type() {
    return this[state].type;
  }

  set type(value) {
    this[state].type = value;
  }

  get headers () {
    return new Map(this[state].headers);
  }

  setHeader(name, value) {
    this[state].headers.set(name, value)
  }

  get params() {
    return this[state].params;
  }

  throw (status = 500, message) {
    if (this.finished) return;
    this.markResponseCompleted();

    throw new HttpError(status, message);
  }

  markResponseCompleted() {
    this[state].finished = true;
  }

  get finished() {
    return this[state].finished;
  }
}

module.exports = Context;
