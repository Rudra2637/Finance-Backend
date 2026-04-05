import { AppError } from '../../core/errors/AppError.js'
import { store } from '../../data/store.js'
import { authService } from '../auth/auth.service.js'

export const usersService = {
  list(includeInactive = false) {
    return [...store.users.values()]
      .filter((user) => includeInactive || user.status === 'active')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(authService.hidePassword)
  },

  getById(id) {
    const user = store.users.get(id)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return authService.hidePassword(user)
  },

  create(input) {
    const existingUser = [...store.users.values()].find(
      (entry) => entry.email.toLowerCase() === input.email.toLowerCase(),
    )

    if (existingUser) {
      throw new AppError(409, 'A user with this email already exists')
    }

    const timestamp = new Date().toISOString()
    const user = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    }

    store.users.set(user.id, user)
    return authService.hidePassword(user)
  },

  update(id, input) {
    const currentUser = store.users.get(id)
    if (!currentUser) {
      throw new AppError(404, 'User not found')
    }

    if (input.email) {
      const emailTaken = [...store.users.values()].find(
        (entry) =>
          entry.id !== id &&
          entry.email.toLowerCase() === input.email.toLowerCase(),
      )

      if (emailTaken) {
        throw new AppError(409, 'A user with this email already exists')
      }
    }

    const updatedUser = {
      ...currentUser,
      ...input,
      updatedAt: new Date().toISOString(),
    }

    store.users.set(id, updatedUser)
    return authService.hidePassword(updatedUser)
  },
}
