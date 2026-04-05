import { AppError } from '../errors/AppError.js'

export function ensureString(value, field, { min = 1, max = 255 } = {}) {
  if (typeof value !== 'string') {
    throw new AppError(400, `${field} must be a string`)
  }

  const trimmed = value.trim()
  if (trimmed.length < min) {
    throw new AppError(400, `${field} must be at least ${min} characters`)
  }
  if (trimmed.length > max) {
    throw new AppError(400, `${field} must be at most ${max} characters`)
  }

  return trimmed
}

export function optionalString(value, field, options = {}) {
  if (value === undefined) {
    return undefined
  }

  return ensureString(value, field, options)
}

export function ensureEmail(value, field = 'email') {
  const email = ensureString(value, field, { min: 5, max: 120 }).toLowerCase()
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) {
    throw new AppError(400, `${field} must be a valid email address`)
  }

  return email
}

export function ensurePositiveAmount(value, field = 'amount') {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new AppError(400, `${field} must be a positive number`)
  }

  return Number(value.toFixed(2))
}

export function optionalPositiveAmount(value, field = 'amount') {
  if (value === undefined) {
    return undefined
  }

  return ensurePositiveAmount(value, field)
}

export function ensureEnum(value, field, allowedValues) {
  if (typeof value !== 'string' || !allowedValues.includes(value)) {
    throw new AppError(400, `${field} must be one of: ${allowedValues.join(', ')}`)
  }

  return value
}

export function optionalEnum(value, field, allowedValues) {
  if (value === undefined) {
    return undefined
  }

  return ensureEnum(value, field, allowedValues)
}

export function ensureIsoDate(value, field) {
  const date = ensureString(value, field, { min: 10, max: 10 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new AppError(400, `${field} must be in YYYY-MM-DD format`)
  }

  return date
}

export function optionalIsoDate(value, field) {
  if (value === undefined) {
    return undefined
  }

  return ensureIsoDate(value, field)
}

export function ensureInteger(value, field, fallback, { min = 1, max = 100 } = {}) {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const numeric = Number(value)
  if (!Number.isInteger(numeric) || numeric < min || numeric > max) {
    throw new AppError(400, `${field} must be an integer between ${min} and ${max}`)
  }

  return numeric
}
