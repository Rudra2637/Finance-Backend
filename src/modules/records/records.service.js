import { AppError } from '../../core/errors/AppError.js'
import { store } from '../../data/store.js'

export const recordsService = {
  list({ page, pageSize, type, category, from, to, search }) {
    let entries = [...store.records.values()].sort((a, b) => {
      return (
        b.recordDate.localeCompare(a.recordDate) ||
        b.createdAt.localeCompare(a.createdAt)
      )
    })

    if (type) {
      entries = entries.filter((entry) => entry.type === type)
    }
    if (category) {
      entries = entries.filter(
        (entry) => entry.category.toLowerCase() === category.toLowerCase(),
      )
    }
    if (from) {
      entries = entries.filter((entry) => entry.recordDate >= from)
    }
    if (to) {
      entries = entries.filter((entry) => entry.recordDate <= to)
    }
    if (search) {
      const searchTerm = search.toLowerCase()
      entries = entries.filter(
        (entry) =>
          entry.category.toLowerCase().includes(searchTerm) ||
          entry.note.toLowerCase().includes(searchTerm),
      )
    }

    const totalItems = entries.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const startIndex = (page - 1) * pageSize

    return {
      items: entries.slice(startIndex, startIndex + pageSize),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    }
  },

  getById(id) {
    const record = store.records.get(id)
    if (!record) {
      throw new AppError(404, 'Financial record not found')
    }

    return record
  },

  create(input) {
    const timestamp = new Date().toISOString()
    const record = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    }

    store.records.set(record.id, record)
    return record
  },

  update(id, input) {
    const existingRecord = store.records.get(id)
    if (!existingRecord) {
      throw new AppError(404, 'Financial record not found')
    }

    const updatedRecord = {
      ...existingRecord,
      ...input,
      updatedAt: new Date().toISOString(),
    }

    store.records.set(id, updatedRecord)
    return updatedRecord
  },

  remove(id) {
    const record = store.records.get(id)
    if (!record) {
      throw new AppError(404, 'Financial record not found')
    }

    store.records.delete(id)
    return { deleted: true, id }
  },
}
