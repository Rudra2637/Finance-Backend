import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { handleRequest } from '../src/app.js'

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => handleRequest(req, res))
    server.listen(0, () => {
      const address = server.address()
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      })
    })
  })
}

async function run() {
  const { server, baseUrl } = await startServer()

  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@fintrack.local',
        password: 'Admin@123',
      }),
    })

    assert.equal(loginResponse.status, 200)
    const loginPayload = await loginResponse.json()
    const adminToken = loginPayload.data.accessToken
    assert.ok(adminToken)

    const summaryResponse = await fetch(`${baseUrl}/api/dashboard/summary`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    assert.equal(summaryResponse.status, 200)
    const summaryPayload = await summaryResponse.json()
    assert.equal(summaryPayload.data.totals.netBalance, 8830)

    const createRecordResponse = await fetch(`${baseUrl}/api/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        amount: 999.99,
        type: 'income',
        category: 'Assessment',
        recordDate: '2026-04-02',
        note: 'Added by smoke test',
      }),
    })

    assert.equal(createRecordResponse.status, 201)

    const viewerLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'viewer@fintrack.local',
        password: 'Viewer@123',
      }),
    })

    const viewerPayload = await viewerLoginResponse.json()
    const viewerToken = viewerPayload.data.accessToken

    const forbiddenResponse = await fetch(`${baseUrl}/api/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({
        amount: 15,
        type: 'expense',
        category: 'Blocked',
        recordDate: '2026-04-02',
        note: 'Viewer should not be allowed',
      }),
    })

    assert.equal(forbiddenResponse.status, 403)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

run()
  .then(() => {
    console.log('Checks passed')
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
