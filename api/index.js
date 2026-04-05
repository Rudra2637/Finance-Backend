import { handleRequest } from '../src/app.js'

export default async function handler(req, res) {
  return handleRequest(req, res)
}
