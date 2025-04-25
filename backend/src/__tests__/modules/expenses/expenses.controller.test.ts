import { Request, Response } from 'express';
import { 
    createExpenseController, 
    getExpensesController, 
    getMyExpensesController,
    getGroupBalancesController,
    getMyBalancesController
} from '../../../modules/expenses/expenses.controller';
import { 
    createExpense, 
    getExpenses, 
    getMyExpenses, 
    getGroupBalances,
    getMyBalances 
} from '../../../modules/expenses/expenses.service';
import { isUserInGroup } from '../../../modules/groups/groups.service';

// Mock the dependencies
jest.mock('../../../modules/expenses/expenses.service');
jest.mock('../../../modules/groups/groups.service');

describe('Expenses Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockResponse = {
            json: mockJson,
            status: mockStatus
        };
        mockRequest = {
            user: { userId: 'test-user-id' },
            body: {},
            params: {},
            query: {}
        };
        jest.clearAllMocks();
    });

    describe('createExpenseController', () => {
        it('should create an expense successfully', async () => {
            const mockExpense = { id: '1', description: 'Test expense' };
            (createExpense as jest.Mock).mockResolvedValue(mockExpense);
            (isUserInGroup as jest.Mock).mockResolvedValue(true);

            mockRequest.body = {
                description: 'Test expense',
                total: 100,
                currency: 'USD',
                splitMethod: 'EQUAL',
                groupId: 'test-group-id',
                paidById: 'test-user-id',
                splits: []
            };

            await createExpenseController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).toHaveBeenCalledWith('test-group-id', 'test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Expense created successfully.',
                expense: mockExpense
            });
        });

        it('should create an expense successfully without groupId', async () => {
            const mockExpense = { id: '1', description: 'Test expense' };
            (createExpense as jest.Mock).mockResolvedValue(mockExpense);

            mockRequest.body = {
                description: 'Test expense',
                total: 100,
                currency: 'USD',
                splitMethod: 'EQUAL',
                paidById: 'test-user-id',
                splits: []
            };

            await createExpenseController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Expense created successfully.',
                expense: mockExpense
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await createExpenseController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
        });

        it('should return 403 if user is not in the group', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(false);
            mockRequest.body = {
                description: 'Test expense',
                total: 100,
                currency: 'USD',
                splitMethod: 'EQUAL',
                groupId: 'test-group-id',
                paidById: 'test-user-id',
                splits: []
            };

            await createExpenseController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).toHaveBeenCalledWith('test-group-id', 'test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "The user doesn't have permission to create an expense in the group." 
            });
        });

        it('should handle errors', async () => {
            (createExpense as jest.Mock).mockRejectedValue(new Error('Test error'));
            mockRequest.body = {
                description: 'Test expense',
                total: 100
            };

            await createExpenseController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });

    describe('getExpensesController', () => {
        it('should get expenses successfully', async () => {
            const mockExpenses = [{ id: '1', description: 'Test expense' }];
            const mockTotal = 1;
            (getExpenses as jest.Mock).mockResolvedValue({ expenses: mockExpenses, total: mockTotal });
            (isUserInGroup as jest.Mock).mockResolvedValue(true);

            mockRequest.params = { groupId: 'test-group-id' };
            mockRequest.query = { page: '1', limit: '10' };

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).toHaveBeenCalledWith('test-group-id', 'test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                expenses: mockExpenses,
                pagination: {
                    total: mockTotal,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            });
        });

        it('should get expenses successfully with default pagination', async () => {
            const mockExpenses = [{ id: '1', description: 'Test expense' }];
            const mockTotal = 1;
            (getExpenses as jest.Mock).mockResolvedValue({ expenses: mockExpenses, total: mockTotal });
            (isUserInGroup as jest.Mock).mockResolvedValue(true);

            mockRequest.params = { groupId: 'test-group-id' };
            mockRequest.query = {};

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).toHaveBeenCalledWith('test-group-id', 'test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                expenses: mockExpenses,
                pagination: {
                    total: mockTotal,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            });
        });

        it('should get expenses successfully with sorting', async () => {
            const mockExpenses = [{ id: '1', description: 'Test expense' }];
            const mockTotal = 1;
            (getExpenses as jest.Mock).mockResolvedValue({ expenses: mockExpenses, total: mockTotal });
            (isUserInGroup as jest.Mock).mockResolvedValue(true);

            mockRequest.params = { groupId: 'test-group-id' };
            mockRequest.query = { 
                page: '1', 
                limit: '10',
                sortField: 'createdAt',
                sortOrder: 'desc'
            };

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(getExpenses).toHaveBeenCalledWith(expect.objectContaining({
                sortField: 'createdAt',
                sortOrder: 'desc'
            }));
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
        });

        it('should return 403 if user is not in the group', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(false);
            mockRequest.params = { groupId: 'test-group-id' };
            mockRequest.query = { page: '1', limit: '10' };

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(isUserInGroup).toHaveBeenCalledWith('test-group-id', 'test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "The user doesn't have permission to see the expenses in the group." 
            });
        });

        it('should handle errors', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(true);
            (getExpenses as jest.Mock).mockRejectedValue(new Error('Test error'));
            mockRequest.params = { groupId: 'test-group-id' };
            mockRequest.query = { page: '1', limit: '10' };

            await getExpensesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });

    describe('getGroupBalancesController', () => {
        it('should get group balances successfully', async () => {
            const mockBalances = { 'user1': { 'user2': 100 } };
            (getGroupBalances as jest.Mock).mockResolvedValue(mockBalances);

            mockRequest.params = { groupId: 'test-group-id' };

            await getGroupBalancesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockBalances);
        });

        it('should handle errors', async () => {
            (getGroupBalances as jest.Mock).mockRejectedValue(new Error('Test error'));
            mockRequest.params = { groupId: 'test-group-id' };

            await getGroupBalancesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });

    describe('getMyExpensesController', () => {
        it('should get user expenses successfully', async () => {
            const mockExpenses = [{ id: '1', description: 'Test expense' }];
            (getMyExpenses as jest.Mock).mockResolvedValue(mockExpenses);

            await getMyExpensesController(mockRequest as Request, mockResponse as Response);

            expect(getMyExpenses).toHaveBeenCalledWith('test-user-id');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockExpenses);
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getMyExpensesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should handle errors', async () => {
            (getMyExpenses as jest.Mock).mockRejectedValue(new Error('Test error'));

            await getMyExpensesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });

    describe('getMyBalancesController', () => {
        it('should get user balances successfully', async () => {
            const mockBalances = { 'user2': 100 };
            (getMyBalances as jest.Mock).mockResolvedValue(mockBalances);

            mockRequest.params = { groupId: 'test-group-id' };

            await getMyBalancesController(mockRequest as Request, mockResponse as Response);

            expect(getMyBalances).toHaveBeenCalledWith('test-user-id', 'test-group-id');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockBalances);
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getMyBalancesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should handle errors', async () => {
            (getMyBalances as jest.Mock).mockRejectedValue(new Error('Test error'));
            mockRequest.params = { groupId: 'test-group-id' };

            await getMyBalancesController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });
}); 