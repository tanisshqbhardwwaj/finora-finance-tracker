import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

interface TransactionRow {
  date: Date;
  category: string;
  type: string;
  amount: { toNumber: () => number };
  note: string | null;
}

export const exportTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const transactions = (await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })) as TransactionRow[];

    const headers = ['Date', 'Category', 'Type', 'Amount', 'Note'];
    const rows = transactions.map((t: TransactionRow) => [
      new Date(t.date).toISOString().split('T')[0],
      t.category,
      t.type,
      t.amount.toNumber().toFixed(2),
      t.note ? `"${t.note.replace(/"/g, '""')}"` : '',
    ]);

    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
};
