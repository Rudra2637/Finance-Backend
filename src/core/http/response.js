export function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload, null, 2)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  })
  res.end(body)
}

export function success(res, statusCode, data, requestId, meta = {}) {
  sendJson(res, statusCode, {
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  })
}

export function noContent(res) {
  res.writeHead(204)
  res.end()
}
