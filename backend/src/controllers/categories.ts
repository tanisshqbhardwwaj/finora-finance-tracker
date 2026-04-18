import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

const LEGACY_DEFAULT_CATEGORIES = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Travel',
  'Entertainment',
  'Utilities',
  'Healthcare',
];

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const usedCategories = await prisma.transaction.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    const usedCategoryNames = new Set(usedCategories.map((item) => item.category));
    const legacyUnusedCategories = LEGACY_DEFAULT_CATEGORIES.filter((name) => !usedCategoryNames.has(name));

    if (legacyUnusedCategories.length > 0) {
      await prisma.category.deleteMany({
        where: {
          userId,
          name: { in: legacyUnusedCategories },
        },
      });
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({
      where: { userId_name: { userId: userId!, name: normalizedName } },
    });

    if (existing) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: { userId: userId!, name: normalizedName },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
