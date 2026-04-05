import { AppError } from '../errors/AppError.js'

function compilePath(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const keys = []
  const pattern = segments
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1))
        return '([^/]+)'
      }

      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  return {
    keys,
    regex: new RegExp(`^/${pattern}/?$`),
  }
}

export class Router {
  constructor() {
    this.routes = []
  }

  register(method, pathname, handler, options = {}) {
    const { regex, keys } = compilePath(pathname)
    this.routes.push({
      method,
      pathname,
      regex,
      keys,
      handler,
      auth: options.auth ?? false,
      roles: options.roles ?? [],
    })
  }

  async handle(req, res, context) {
    const url = new URL(req.url, 'http://localhost')
    const match = this.routes.find(
      (route) => route.method === req.method && route.regex.test(url.pathname),
    )

    if (!match) {
      throw new AppError(404, `Route not found: ${req.method} ${url.pathname}`)
    }

    const values = match.regex.exec(url.pathname)
    const params = {}

    match.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(values[index + 1])
    })

    return match.handler(req, res, {
      ...context,
      params,
      query: url.searchParams,
      route: match,
    })
  }
}
