import { AppError } from '../../core/errors/AppError.js'
import { store } from '../../data/store.js'

function hidePassword(user) {
  const { password, ...publicUser } = user
  return publicUser
}

export const authService = {
  login(email, password) {
    const account = [...store.users.values()].find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase(),
    )

    if (!account || account.password !== password) {
      throw new AppError(401, 'Invalid email or password')
    }

    if (account.status !== 'active') {
      throw new AppError(403, 'User account is inactive')
    }

    const token = crypto.randomUUID()
    store.sessions.set(token, {
      token,
      userId: account.id,
      createdAt: new Date().toISOString(),
    })

    return {
      accessToken: token,
      tokenType: 'Bearer',
      user: hidePassword(account),
    }
  },

  getCurrentUser(token) {
    const session = store.sessions.get(token)
    if (!session) {
      throw new AppError(401, 'Session not found or expired')
    }

    const user = store.users.get(session.userId)
    if (!user) {
      throw new AppError(401, 'User linked to session was not found')
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'User account is inactive')
    }

    return user
  },

  logout(token) {
    store.sessions.delete(token)
  },

  demoAccounts() {
    return [...store.users.values()].map((user) => ({
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
    }))
  },

  hidePassword,
}
