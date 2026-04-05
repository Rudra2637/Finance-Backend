import { createServer } from 'node:http'
import { handleRequest } from './app.js'

const port = Number(process.env.PORT || 3000)

const server = createServer((req, res) => {
  handleRequest(req, res)
})

server.listen(port, () => {
  console.log(`Finance Dashboard API listening on http://localhost:${port}`)
  console.log(`API docs available at http://localhost:${port}/docs`)
})
