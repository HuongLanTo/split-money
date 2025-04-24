import { PrismaClient } from "@prisma/client";
import { CreateExpenseInput, GetExpensesInput } from "./expenses.types";

const prisma = new PrismaClient();

export const createExpense = async (input: CreateExpenseInput, createdById: string) => {
    const expense = await prisma.expense.create({
        data: {
            description: input.description,
            total: input.total,
            currency: input.currency,
            splitMethod: input.splitMethod,
            groupId: input.groupId ?? null,
            paidById: input.paidById,
            createdById: createdById,
            splits: {
                create: input.splits.map((split) => {
                    return {
                        userId: split.userId,
                        amount: split.amount,
                        percent: split.percent,
                        shares: split.shares
                    }
                })
            }
        },
        include: {
            splits: true
        }
    });

    return expense;
}

export const getExpenses = async (input: GetExpensesInput) => {
    const where: any = { groupId: input.groupId };

    const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
            where,
            include: {
                paidBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                splits: {
                    select: {
                        userId: true,
                        amount: true
                    }
                }
            },
            orderBy: { [input.sortField]: input.sortOrder },
            skip: input.skip,
            take: input.take
        }),
        prisma.expense.count({ where })
    ]);

    return { expenses, total };
}

export const getGroupBalances = async (groupId: string) => {
    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
            paidBy: true,
            splits: true
        }
    });
  
    const balances: Record<string, Record<string, number>> = {};
  
    expenses.forEach(expense => {
        const paidBy = expense.paidById;
        expense.splits.forEach(split => {
            if (split.userId === paidBy) return; 
    
            balances[split.userId] = balances[split.userId] || {};
            balances[paidBy] = balances[paidBy] || {};
            balances[split.userId][paidBy] = (balances[split.userId][paidBy] || 0) + split.amount;
            balances[paidBy][split.userId] = (balances[paidBy][split.userId] || 0) - split.amount;
        });
    });
  
    return balances;
}

export const getMyExpenses = async (userId: string) => {
    return await prisma.expense.findMany({
        where: {
            splits: {
                some: { userId }
            }
        },
        include: {
            paidBy: { select: { id: true, name: true, email: true } },
            splits: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export const getMyBalances = async (userId: string, groupId?: string) => {
    const expenses = await prisma.expense.findMany({
        where: groupId ? { groupId } : {},
        include: {
            paidBy: true,
            splits: true
        }
    });
  
    const balances: Record<string, number> = {};
  
    expenses.forEach(expense => {
        const paidBy = expense.paidById;
        expense.splits.forEach(split => {
            if (split.userId === userId && paidBy !== userId) {
                balances[paidBy] = (balances[paidBy] || 0) + split.amount;
            }

            if (paidBy === userId && split.userId !== userId) {
                balances[split.userId] = (balances[split.userId] || 0) - split.amount;
            }
        });
    });
  
    // Clean up 0-balance users
    Object.keys(balances).forEach(uid => {
        if (Math.abs(balances[uid]) < 0.01) delete balances[uid];
    });
  
    return balances;
  };