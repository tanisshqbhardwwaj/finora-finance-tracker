import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const totalIncome = await prisma.transaction.aggregate({
      where: { userId, type: 'income' },
      _sum: { amount: true },
    });

    const totalExpenses = await prisma.transaction.aggregate({
      where: { userId, type: 'expense' },
      _sum: { amount: true },
    });

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const incomeAmount = totalIncome._sum.amount?.toNumber() || 0;
    const expensesAmount = totalExpenses._sum.amount?.toNumber() || 0;
    const totalBalance = incomeAmount - expensesAmount;

    // Get current month's budget status
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: userId!, month: monthStart } },
    });

    const monthlyExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const monthlyExpenseAmount = monthlyExpenses._sum.amount?.toNumber() || 0;

    const topExpenseGroups = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'expense',
        date: { gte: monthStart },
      },
      _sum: { amount: true },
      orderBy: {
        _sum: { amount: 'desc' },
      },
      take: 5,
    });

    const topExpenseCategories = topExpenseGroups.map((item) => {
      const amount = item._sum.amount?.toNumber() || 0;
      return {
        category: item.category,
        amount,
        percentage: monthlyExpenseAmount > 0 ? Number(((amount / monthlyExpenseAmount) * 100).toFixed(1)) : 0,
      };
    });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const spentTodayAggregate = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: { gte: todayStart },
      },
      _sum: { amount: true },
    });
    const spentToday = spentTodayAggregate._sum.amount?.toNumber() || 0;

    const rollingWindowDays = 30;
    const windowStart = new Date(todayStart);
    windowStart.setDate(windowStart.getDate() - (rollingWindowDays - 1));
    const rollingExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: { gte: windowStart },
      },
      _sum: { amount: true },
    });
    const averageDailySpend = (rollingExpenses._sum.amount?.toNumber() || 0) / rollingWindowDays;

    const trendMonthCount = 6;
    const trendStart = new Date(now.getFullYear(), now.getMonth() - (trendMonthCount - 1), 1);
    const trendExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: trendStart },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    const trendMap = new Map<string, number>();
    for (const tx of trendExpenses) {
      const txDate = new Date(tx.date);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      trendMap.set(key, (trendMap.get(key) || 0) + tx.amount.toNumber());
    }

    const monthlyExpenseTrend = Array.from({ length: trendMonthCount }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (trendMonthCount - 1 - index), 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      return {
        month: monthDate.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        amount: Number((trendMap.get(key) || 0).toFixed(2)),
      };
    });

    const expenseToIncomeRatio = incomeAmount > 0 ? Number(((expensesAmount / incomeAmount) * 100).toFixed(1)) : null;

    res.json({
      totalBalance,
      totalIncome: incomeAmount,
      totalExpenses: expensesAmount,
      recentTransactions,
      analytics: {
        averageDailySpend: Number(averageDailySpend.toFixed(2)),
        spentToday,
        spentThisMonth: monthlyExpenseAmount,
        expenseToIncomeRatio,
        topExpenseCategories,
        monthlyExpenseTrend,
      },
      budget: budget
        ? {
            limit: budget.limit.toNumber(),
            spent: monthlyExpenseAmount,
            remaining: budget.limit.toNumber() - monthlyExpenseAmount,
            exceeded: monthlyExpenseAmount > budget.limit.toNumber(),
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
