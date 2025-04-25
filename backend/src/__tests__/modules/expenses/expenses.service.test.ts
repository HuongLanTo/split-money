import { PrismaClient, SplitMethod } from '@prisma/client';
import { createExpense, getExpenses, getGroupBalances, getMyExpenses, getMyBalances } from '../../../modules/expenses/expenses.service';
import { CreateExpenseInput, GetExpensesInput } from '../../../modules/expenses/expenses.types';

// Mock Prisma client
jest.mock('@prisma/client', () => {
    const mockCreate = jest.fn();
    const mockFindMany = jest.fn();
    const mockCount = jest.fn();

    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            expense: {
                create: mockCreate,
                findMany: mockFindMany,
                count: mockCount
            }
        })),
        SplitMethod: {
            EQUAL: 'EQUAL',
            EXACT: 'EXACT',
            SHARES: 'SHARES',
            PERCENTAGE: 'PERCENTAGE'
        },
        __mockCreate: mockCreate,
        __mockFindMany: mockFindMany,
        __mockCount: mockCount
    };
});

// Get the mock functions
const { __mockCreate: mockCreate, __mockFindMany: mockFindMany, __mockCount: mockCount } = require('@prisma/client');

describe('ExpenseService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createExpense', () => {
        it('should create an expense with splits', async () => {
            const mockExpense = {
                id: '1',
                description: 'Test expense',
                total: 100,
                currency: 'USD',
                splitMethod: SplitMethod.EQUAL,
                groupId: 'group-1',
                paidById: 'user-1',
                createdById: 'user-1',
                createdAt: new Date(),
                splits: [
                    {
                        id: 'split-1',
                        expenseId: '1',
                        userId: 'user-1',
                        amount: 50,
                        percent: null,
                        shares: null
                    },
                    {
                        id: 'split-2',
                        expenseId: '1',
                        userId: 'user-2',
                        amount: 50,
                        percent: null,
                        shares: null
                    }
                ]
            };

            const input: CreateExpenseInput = {
                description: 'Test expense',
                total: 100,
                currency: 'USD',
                splitMethod: SplitMethod.EQUAL,
                groupId: 'group-1',
                paidById: 'user-1',
                splits: [
                    { userId: 'user-1', amount: 50 },
                    { userId: 'user-2', amount: 50 }
                ]
            };

            mockCreate.mockResolvedValue(mockExpense);

            const result = await createExpense(input, 'user-1');
            expect(result).toEqual(mockExpense);
            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    description: input.description,
                    total: input.total,
                    currency: input.currency,
                    splitMethod: input.splitMethod,
                    groupId: input.groupId,
                    paidById: input.paidById,
                    createdById: 'user-1',
                    splits: {
                        create: input.splits.map(split => ({
                            userId: split.userId,
                            amount: split.amount,
                            percent: split.percent,
                            shares: split.shares
                        }))
                    }
                },
                include: {
                    splits: true
                }
            });
        });
    });

    describe('getExpenses', () => {
        it('should get expenses with pagination and sorting', async () => {
            const mockExpenses = [
                {
                    id: '1',
                    description: 'Test expense',
                    total: 100,
                    currency: 'USD',
                    splitMethod: SplitMethod.EQUAL,
                    groupId: 'group-1',
                    paidById: 'user-1',
                    createdById: 'user-1',
                    createdAt: new Date(),
                    paidBy: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com'
                    },
                    splits: [
                        {
                            userId: 'user-1',
                            amount: 50
                        },
                        {
                            userId: 'user-2',
                            amount: 50
                        }
                    ]
                }
            ];

            const input: GetExpensesInput = {
                groupId: 'group-1',
                sortField: 'createdAt',
                sortOrder: 'desc',
                skip: 0,
                take: 10
            };

            mockFindMany.mockResolvedValue(mockExpenses);
            mockCount.mockResolvedValue(1);

            const result = await getExpenses(input);
            expect(result).toEqual({ expenses: mockExpenses, total: 1 });
            expect(mockFindMany).toHaveBeenCalledWith({
                where: { groupId: input.groupId },
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
            });
        });
    });

    describe('getGroupBalances', () => {
        it('should calculate group balances', async () => {
            const mockExpenses = [
                {
                    id: '1',
                    description: 'Test expense',
                    total: 100,
                    currency: 'USD',
                    splitMethod: SplitMethod.EQUAL,
                    groupId: 'group-1',
                    paidById: 'user-1',
                    createdById: 'user-1',
                    createdAt: new Date(),
                    paidBy: {
                        id: 'user-1',
                        name: 'Test User'
                    },
                    splits: [
                        {
                            userId: 'user-1',
                            amount: 50
                        },
                        {
                            userId: 'user-2',
                            amount: 50
                        }
                    ]
                }
            ];

            mockFindMany.mockResolvedValue(mockExpenses);

            const result = await getGroupBalances('group-1');
            expect(result).toEqual({
                'user-1': { 'user-2': -50 },
                'user-2': { 'user-1': 50 }
            });
            expect(mockFindMany).toHaveBeenCalledWith({
                where: { groupId: 'group-1' },
                include: {
                    paidBy: true,
                    splits: true
                }
            });
        });
    });

    describe('getMyExpenses', () => {
        it('should get user expenses', async () => {
            const mockExpenses = [
                {
                    id: '1',
                    description: 'Test expense',
                    total: 100,
                    currency: 'USD',
                    splitMethod: SplitMethod.EQUAL,
                    groupId: 'group-1',
                    paidById: 'user-1',
                    createdById: 'user-1',
                    createdAt: new Date(),
                    paidBy: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com'
                    },
                    splits: [
                        {
                            userId: 'user-1',
                            amount: 50
                        },
                        {
                            userId: 'user-2',
                            amount: 50
                        }
                    ]
                }
            ];

            mockFindMany.mockResolvedValue(mockExpenses);

            const result = await getMyExpenses('user-1');
            expect(result).toEqual(mockExpenses);
            expect(mockFindMany).toHaveBeenCalledWith({
                where: {
                    splits: {
                        some: { userId: 'user-1' }
                    }
                },
                include: {
                    paidBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    splits: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('getMyBalances', () => {
        it('should return my balances', async () => {
            const mockExpenses = [
                {
                    id: 'expense-1',
                    description: 'Test expense 1',
                    total: 100,
                    currency: 'USD',
                    splitMethod: SplitMethod.EQUAL,
                    groupId: 'test-group-id',
                    paidById: 'user-2',
                    createdById: 'user-2',
                    createdAt: new Date(),
                    paidBy: {
                        id: 'user-2',
                        name: 'Test User 2',
                        email: 'test2@example.com'
                    },
                    splits: [
                        { userId: 'user-1', amount: 50 },
                        { userId: 'user-2', amount: 50 }
                    ]
                }
            ];

            mockFindMany.mockResolvedValue(mockExpenses);

            const result = await getMyBalances('user-1');

            expect(mockFindMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    paidBy: true,
                    splits: true
                }
            });

            expect(result).toEqual({
                'user-2': 50
            });
        });

        it('should return my balances filtered by group', async () => {
            const mockExpenses = [
                {
                    id: 'expense-1',
                    description: 'Test expense 1',
                    total: 100,
                    currency: 'USD',
                    splitMethod: SplitMethod.EQUAL,
                    groupId: 'test-group-id',
                    paidById: 'user-2',
                    createdById: 'user-2',
                    createdAt: new Date(),
                    paidBy: {
                        id: 'user-2',
                        name: 'Test User 2',
                        email: 'test2@example.com'
                    },
                    splits: [
                        { userId: 'user-1', amount: 50 },
                        { userId: 'user-2', amount: 50 }
                    ]
                }
            ];

            mockFindMany.mockResolvedValue(mockExpenses);

            const result = await getMyBalances('user-1', 'test-group-id');

            expect(mockFindMany).toHaveBeenCalledWith({
                where: { groupId: 'test-group-id' },
                include: {
                    paidBy: true,
                    splits: true
                }
            });

            expect(result).toEqual({
                'user-2': 50
            });
        });
    });
}); 