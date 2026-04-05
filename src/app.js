import { AppError } from './core/errors/AppError.js'
import { readJsonBody } from './core/http/request.js'
import { Router } from './core/http/router.js'
import { noContent, sendJson, success } from './core/http/response.js'
import {
  ensureEmail,
  ensureEnum,
  ensureInteger,
  ensureIsoDate,
  ensurePositiveAmount,
  ensureString,
  optionalEnum,
  optionalIsoDate,
  optionalPositiveAmount,
  optionalString,
} from './core/validation/index.js'
import { authService } from './modules/auth/auth.service.js'
import { dashboardService } from './modules/dashboard/dashboard.service.js'
import { apiSpec, swaggerHtml } from './modules/docs/swagger.js'
import { recordsService } from './modules/records/records.service.js'
import { usersService } from './modules/users/users.service.js'

const router = new Router()
const allReadRoles = ['viewer', 'analyst', 'admin']
const adminOnly = ['admin']

function getBearerToken(req) {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization token')
  }

  return authorization.slice('Bearer '.length).trim()
}

function ensureRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError(403, 'You do not have permission to perform this action')
  }
}

router.register('GET', '/health', async (req, res, context) => {
  success(
    res,
    200,
    {
      status: 'ok',
      service: 'finance-dashboard-api',
    },
    context.requestId,
  )
})

router.register('GET', '/', async (req, res) => {
  res.writeHead(302, { Location: '/docs' })
  res.end()
})

router.register('GET', '/docs', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(swaggerHtml)
})

router.register('GET', '/openapi.json', async (req, res) => {
  sendJson(res, 200, apiSpec)
})

router.register('GET', '/api/auth/demo-accounts', async (req, res, context) => {
  success(res, 200, authService.demoAccounts(), context.requestId)
})

router.register('POST', '/api/auth/login', async (req, res, context) => {
  const body = await readJsonBody(req)
  const payload = authService.login(
    ensureEmail(body.email),
    ensureString(body.password, 'password', { min: 8, max: 64 }),
  )

  success(res, 200, payload, context.requestId)
})

router.register('GET', '/api/auth/me', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  success(res, 200, authService.hidePassword(user), context.requestId)
})

router.register('POST', '/api/auth/logout', async (req, res) => {
  const token = getBearerToken(req)
  authService.logout(token)
  noContent(res)
})

router.register('GET', '/api/users', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  const includeInactive = context.query.get('includeInactive') === 'true'
  success(res, 200, usersService.list(includeInactive), context.requestId)
})

router.register('GET', '/api/users/:id', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  success(res, 200, usersService.getById(context.params.id), context.requestId)
})

router.register('POST', '/api/users', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  const body = await readJsonBody(req)
  const created = usersService.create({
    name: ensureString(body.name, 'name', { min: 2, max: 80 }),
    email: ensureEmail(body.email),
    password: ensureString(body.password, 'password', { min: 8, max: 64 }),
    role: ensureEnum(body.role, 'role', ['viewer', 'analyst', 'admin']),
    status: ensureEnum(body.status, 'status', ['active', 'inactive']),
  })

  success(res, 201, created, context.requestId)
})

router.register('PATCH', '/api/users/:id', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  const body = await readJsonBody(req)
  const updated = usersService.update(context.params.id, {
    name: optionalString(body.name, 'name', { min: 2, max: 80 }),
    email: body.email === undefined ? undefined : ensureEmail(body.email),
    password: optionalString(body.password, 'password', { min: 8, max: 64 }),
    role: optionalEnum(body.role, 'role', ['viewer', 'analyst', 'admin']),
    status: optionalEnum(body.status, 'status', ['active', 'inactive']),
  })

  success(res, 200, updated, context.requestId)
})

router.register('GET', '/api/records', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, allReadRoles)

  const type = context.query.get('type')
  const from = context.query.get('from')
  const to = context.query.get('to')

  const result = recordsService.list({
    page: ensureInteger(context.query.get('page'), 'page', 1, { min: 1, max: 1000 }),
    pageSize: ensureInteger(context.query.get('pageSize'), 'pageSize', 10, {
      min: 1,
      max: 100,
    }),
    type: type ? ensureEnum(type, 'type', ['income', 'expense']) : undefined,
    category: context.query.get('category') || undefined,
    from: from ? ensureIsoDate(from, 'from') : undefined,
    to: to ? ensureIsoDate(to, 'to') : undefined,
    search: context.query.get('search') || undefined,
  })

  success(res, 200, result, context.requestId)
})

router.register('GET', '/api/records/:id', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, allReadRoles)

  success(res, 200, recordsService.getById(context.params.id), context.requestId)
})

router.register('POST', '/api/records', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  const body = await readJsonBody(req)
  const record = recordsService.create({
    amount: ensurePositiveAmount(body.amount),
    type: ensureEnum(body.type, 'type', ['income', 'expense']),
    category: ensureString(body.category, 'category', { min: 2, max: 60 }),
    recordDate: ensureIsoDate(body.recordDate, 'recordDate'),
    note: ensureString(body.note, 'note', { min: 3, max: 200 }),
    createdByUserId: user.id,
  })

  success(res, 201, record, context.requestId)
})

router.register('PATCH', '/api/records/:id', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  const body = await readJsonBody(req)
  const record = recordsService.update(context.params.id, {
    amount: optionalPositiveAmount(body.amount),
    type: optionalEnum(body.type, 'type', ['income', 'expense']),
    category: optionalString(body.category, 'category', { min: 2, max: 60 }),
    recordDate: optionalIsoDate(body.recordDate, 'recordDate'),
    note: optionalString(body.note, 'note', { min: 3, max: 200 }),
  })

  success(res, 200, record, context.requestId)
})

router.register('DELETE', '/api/records/:id', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, adminOnly)

  success(res, 200, recordsService.remove(context.params.id), context.requestId)
})

router.register('GET', '/api/dashboard/summary', async (req, res, context) => {
  const token = getBearerToken(req)
  const user = authService.getCurrentUser(token)
  ensureRole(user, allReadRoles)

  success(res, 200, dashboardService.getSummary(), context.requestId)
})

export async function handleRequest(req, res) {
  const requestId = crypto.randomUUID()

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('X-Request-Id', requestId)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  try {
    await router.handle(req, res, { requestId })
  } catch (error) {
    if (error instanceof AppError) {
      sendJson(res, error.statusCode, {
        error: error.message,
        details: error.details,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    console.error('Unhandled error', error)
    sendJson(res, 500, {
      error: 'Internal server error',
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  }
}
