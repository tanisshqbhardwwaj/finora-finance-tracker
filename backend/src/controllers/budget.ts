import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const setBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit, month } = req.body;

    if (!limit || isNaN(parseFloat(limit))) {
      return res.status(400).json({ error: 'Valid budget limit is required' });
    }

    const budgetDate = month ? new Date(month) : new Date();
    const monthStart = new Date(budgetDate.getFullYear(), budgetDate.getMonth(), 1);

    const budget = await prisma.budget.upsert({
      where: { userId_month: { userId: userId!, month: monthStart } },
      update: { limit: parseFloat(limit.toString()) },
      create: {
        userId: userId!,
        month: monthStart,
        limit: parseFloat(limit.toString()),
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set budget' });
  }
};

export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { month } = req.query;

    const budgetDate = month ? new Date(month as string) : new Date();
    const monthStart = new Date(budgetDate.getFullYear(), budgetDate.getMonth(), 1);

    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: userId!, month: monthStart } },
    });

    if (!budget) {
      return res.status(404).json({ error: 'No budget set for this month' });
    }

    res.json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};

export const checkBudgetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { month } = req.query;

    const budgetDate = month ? new Date(month as string) : new Date();
    const monthStart = new Date(budgetDate.getFullYear(), budgetDate.getMonth(), 1);
    const monthEnd = new Date(budgetDate.getFullYear(), budgetDate.getMonth() + 1, 0, 23, 59, 59);

    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: userId!, month: monthStart } },
    });

    if (!budget) {
      return res.json({ hasBudget: false });
    }

    const expenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const spent = expenses._sum.amount?.toNumber() || 0;
    const limit = budget.limit.toNumber();

    res.json({
      hasBudget: true,
      limit,
      spent,
      remaining: limit - spent,
      exceeded: spent > limit,
      percentage: Math.round((spent / limit) * 100),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check budget status' });
  }
};
