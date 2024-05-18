import console from "console";

/**
 *
 * @param {import("express").RequestHandler} fn
 * @returns
 */
export function asyncExpressMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error(error.message, error.stack);
      res.status(500).json({ error: error.message });
    });
  };
}

export function defaultUserAgent() {
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36";
}
