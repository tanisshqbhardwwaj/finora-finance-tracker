import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export interface SignupPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateTransactionPayload {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note?: string;
  date: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface SetBudgetPayload {
  limit: number;
  month?: string;
}
