import { AppError } from '../errors/AppError.js'

export async function readJsonBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')

  try {
    const parsed = JSON.parse(rawBody)
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new AppError(400, 'Request body must be a JSON object')
    }

    return parsed
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(400, 'Malformed JSON body')
  }
}

export function getQueryParams(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams
}
