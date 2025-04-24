import { SplitMethod } from "@prisma/client";

export interface ExpenseSplitInput {
    userId: string;
    amount: number;
    percent?: number;
    shares?: number;
}

export interface CreateExpenseInput {
    description: string;
    total: number;
    currency: string;
    paidById: string;
    groupId: string;
    splitMethod: SplitMethod;
    splits: ExpenseSplitInput[];
}

export interface GetExpensesInput {
    groupId: string;
    skip: number;
    take: number;
    sortField: string;
    sortOrder: 'asc' | 'desc';
}