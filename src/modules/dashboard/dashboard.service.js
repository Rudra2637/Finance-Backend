import { store } from '../../data/store.js'

function round(value) {
  return Number(value.toFixed(2))
}

export const dashboardService = {
  getSummary() {
    const records = [...store.records.values()]
    const income = records.filter((record) => record.type === 'income')
    const expenses = records.filter((record) => record.type === 'expense')

    const totalIncome = income.reduce((sum, record) => sum + record.amount, 0)
    const totalExpenses = expenses.reduce((sum, record) => sum + record.amount, 0)

    const categoryWiseTotals = Object.values(
      records.reduce((accumulator, record) => {
        const bucket = accumulator[record.category] ?? {
          category: record.category,
          income: 0,
          expense: 0,
        }

        if (record.type === 'income') {
          bucket.income += record.amount
        } else {
          bucket.expense += record.amount
        }

        accumulator[record.category] = bucket
        return accumulator
      }, {}),
    ).map((bucket) => ({
      category: bucket.category,
      income: round(bucket.income),
      expense: round(bucket.expense),
      net: round(bucket.income - bucket.expense),
    }))

    const monthlyTrends = Object.values(
      records.reduce((accumulator, record) => {
        const month = record.recordDate.slice(0, 7)
        const bucket = accumulator[month] ?? { month, income: 0, expense: 0 }

        if (record.type === 'income') {
          bucket.income += record.amount
        } else {
          bucket.expense += record.amount
        }

        accumulator[month] = bucket
        return accumulator
      }, {}),
    )
      .sort((left, right) => left.month.localeCompare(right.month))
      .map((bucket) => ({
        month: bucket.month,
        income: round(bucket.income),
        expense: round(bucket.expense),
        net: round(bucket.income - bucket.expense),
      }))

    const recentActivity = [...records]
      .sort((a, b) => {
        return (
          b.recordDate.localeCompare(a.recordDate) ||
          b.createdAt.localeCompare(a.createdAt)
        )
      })
      .slice(0, 5)

    return {
      totals: {
        totalIncome: round(totalIncome),
        totalExpenses: round(totalExpenses),
        netBalance: round(totalIncome - totalExpenses),
      },
      categoryWiseTotals,
      monthlyTrends,
      recentActivity,
      recordCount: records.length,
      activeUserCount: [...store.users.values()].filter((user) => user.status === 'active')
        .length,
    }
  },
}
