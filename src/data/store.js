const userSeeds = [
  {
    name: 'Ava Admin',
    email: 'admin@fintrack.local',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Noah Analyst',
    email: 'analyst@fintrack.local',
    password: 'Analyst@123',
    role: 'analyst',
    status: 'active',
  },
  {
    name: 'Mia Viewer',
    email: 'viewer@fintrack.local',
    password: 'Viewer@123',
    role: 'viewer',
    status: 'active',
  },
  {
    name: 'Ivy Inactive',
    email: 'inactive@fintrack.local',
    password: 'Inactive@123',
    role: 'viewer',
    status: 'inactive',
  },
]

const recordSeeds = [
  {
    amount: 4200,
    type: 'income',
    category: 'Consulting',
    recordDate: '2026-01-05',
    note: 'January advisory retainer',
    createdByEmail: 'admin@fintrack.local',
  },
  {
    amount: 650,
    type: 'expense',
    category: 'Software',
    recordDate: '2026-01-08',
    note: 'Team tooling subscriptions',
    createdByEmail: 'admin@fintrack.local',
  },
  {
    amount: 1800,
    type: 'income',
    category: 'Training',
    recordDate: '2026-02-11',
    note: 'Corporate workshop payment',
    createdByEmail: 'analyst@fintrack.local',
  },
  {
    amount: 320,
    type: 'expense',
    category: 'Travel',
    recordDate: '2026-02-14',
    note: 'Client visit commute',
    createdByEmail: 'analyst@fintrack.local',
  },
  {
    amount: 5000,
    type: 'income',
    category: 'Subscription',
    recordDate: '2026-03-02',
    note: 'Annual dashboard license',
    createdByEmail: 'admin@fintrack.local',
  },
  {
    amount: 1200,
    type: 'expense',
    category: 'Payroll',
    recordDate: '2026-03-28',
    note: 'Contract analyst payout',
    createdByEmail: 'admin@fintrack.local',
  },
]

function now() {
  return new Date().toISOString()
}

function createState() {
  const users = new Map()
  const records = new Map()
  const sessions = new Map()

  for (const seed of userSeeds) {
    const timestamp = now()
    const user = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...seed,
    }
    users.set(user.id, user)
  }

  for (const seed of recordSeeds) {
    const owner = [...users.values()].find((user) => user.email === seed.createdByEmail)
    if (!owner) {
      continue
    }

    const timestamp = now()
    const record = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      amount: seed.amount,
      type: seed.type,
      category: seed.category,
      recordDate: seed.recordDate,
      note: seed.note,
      createdByUserId: owner.id,
    }

    records.set(record.id, record)
  }

  return { users, records, sessions }
}

const state = createState()

export const store = {
  users: state.users,
  records: state.records,
  sessions: state.sessions,
}
