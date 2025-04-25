import request from 'supertest';
import express from 'express';
import expensesRoutes from '../../../modules/expenses/expenses.routes';
import { 
    createExpenseController, 
    getExpensesController,
    getGroupBalancesController,
    getMyExpensesController,
    getMyBalancesController
} from '../../../modules/expenses/expenses.controller';

// Mock the controller functions
jest.mock('../../../modules/expenses/expenses.controller', () => ({
    createExpenseController: jest.fn(),
    getExpensesController: jest.fn(),
    getGroupBalancesController: jest.fn(),
    getMyExpensesController: jest.fn(),
    getMyBalancesController: jest.fn()
}));

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { userId: 'test-user-id' };
        next();
    }
}));

describe('Expenses Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/expenses', expensesRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /expenses', () => {
        it('should call createExpenseController', async () => {
            const mockExpense = {
                id: '1',
                description: 'Test Expense',
                total: 100,
                currency: 'USD',
                groupId: '1',
                paidById: '1'
            };

            (createExpenseController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({
                    message: 'Expense created successfully.',
                    expense: mockExpense
                });
            });

            const response = await request(app)
                .post('/expenses')
                .send({
                    description: 'Test Expense',
                    total: 100,
                    currency: 'USD',
                    groupId: '1',
                    paidById: '1',
                    splitMethod: 'EQUAL',
                    splits: []
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Expense created successfully.',
                expense: mockExpense
            });
            expect(createExpenseController).toHaveBeenCalled();
        });
    });

    describe('GET /expenses/group/:groupId', () => {
        it('should call getExpensesController', async () => {
            const mockExpenses = {
                expenses: [
                    {
                        id: '1',
                        description: 'Test Expense 1',
                        total: 100,
                        groupId: '1',
                        paidById: '1'
                    },
                    {
                        id: '2',
                        description: 'Test Expense 2',
                        total: 200,
                        groupId: '1',
                        paidById: '2'
                    }
                ],
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            };

            (getExpensesController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockExpenses);
            });

            const response = await request(app)
                .get('/expenses/group/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockExpenses);
            expect(getExpensesController).toHaveBeenCalled();
        });
    });

    describe('GET /expenses/group/:groupId/balances', () => {
        it('should call getGroupBalancesController', async () => {
            const mockBalances = {
                'user1': { 'user2': 50 },
                'user2': { 'user1': -50 }
            };

            (getGroupBalancesController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockBalances);
            });

            const response = await request(app)
                .get('/expenses/group/1/balances');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBalances);
            expect(getGroupBalancesController).toHaveBeenCalled();
        });
    });

    describe('GET /expenses/me', () => {
        it('should call getMyExpensesController', async () => {
            const mockExpenses = [
                {
                    id: '1',
                    description: 'Test Expense 1',
                    total: 100,
                    groupId: '1',
                    paidById: '1'
                }
            ];

            (getMyExpensesController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockExpenses);
            });

            const response = await request(app)
                .get('/expenses/me');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockExpenses);
            expect(getMyExpensesController).toHaveBeenCalled();
        });
    });

    describe('GET /expenses/me/balances', () => {
        it('should call getMyBalancesController', async () => {
            const mockBalances = {
                'user1': 50,
                'user2': -50
            };

            (getMyBalancesController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockBalances);
            });

            const response = await request(app)
                .get('/expenses/me/balances');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBalances);
            expect(getMyBalancesController).toHaveBeenCalled();
        });
    });
}); 