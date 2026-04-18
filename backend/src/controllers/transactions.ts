import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, category, startDate, endDate, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = { userId };

    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {} as Record<string, Date>;
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate as string);
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      data: transactions,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, type, category, note, date } = req.body;
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';

    if (!amount || !type || !normalizedCategory || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    await prisma.category.upsert({
      where: { userId_name: { userId: userId!, name: normalizedCategory } },
      update: {},
      create: { userId: userId!, name: normalizedCategory },
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: userId!,
        amount: parseFloat(amount.toString()),
        type,
        category: normalizedCategory,
        note: note || null,
        date: new Date(date),
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { amount, type, category, note, date } = req.body;
    const normalizedCategory = typeof category === 'string' ? category.trim() : undefined;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    if (normalizedCategory !== undefined && !normalizedCategory) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (normalizedCategory) {
      await prisma.category.upsert({
        where: { userId_name: { userId: userId!, name: normalizedCategory } },
        update: {},
        create: { userId: userId!, name: normalizedCategory },
      });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount.toString()) }),
        ...(type && { type }),
        ...(normalizedCategory && { category: normalizedCategory }),
        ...(note !== undefined && { note: note || null }),
        ...(date && { date: new Date(date) }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.transaction.delete({ where: { id } });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
