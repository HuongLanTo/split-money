import { Request, Response } from 'express';
import { register, login } from '../../../modules/auth/auth.controller';
import { registerUser, loginUser } from '../../../modules/auth/auth.service';

// Mock the service layer
jest.mock('../../../modules/auth/auth.service');

describe('Auth Controller', () => {
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
            body: {}
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a user successfully', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User'
            };

            (registerUser as jest.Mock).mockResolvedValue(mockUser);
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'User registered successfully.',
                user: mockUser
            });
        });

        it('should return 400 if email is missing', async () => {
            mockRequest.body = {
                password: 'password123',
                name: 'Test User'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing email in the body.' });
        });

        it('should return 400 if password is missing', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                name: 'Test User'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing password in the body.' });
        });

        it('should return 400 if name is missing', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing name in the body.' });
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const mockToken = 'mock-jwt-token';
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User'
            };

            (loginUser as jest.Mock).mockResolvedValue({ token: mockToken, user: mockUser });
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Login successful.',
                token: mockToken,
                user: mockUser
            });
        });

        it('should return 400 if email is missing', async () => {
            mockRequest.body = {
                password: 'password123'
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing email in the body.' });
        });

        it('should return 400 if password is missing', async () => {
            mockRequest.body = {
                email: 'test@example.com'
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing password in the body.' });
        });

        it('should return 401 if credentials are invalid', async () => {
            (loginUser as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
            mockRequest.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });
}); 