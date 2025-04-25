import request from 'supertest';
import express from 'express';
import authRoutes from '../../../modules/auth/auth.routes';
import { register, login } from '../../../modules/auth/auth.controller';

// Mock the controller functions
jest.mock('../../../modules/auth/auth.controller', () => ({
    register: jest.fn(),
    login: jest.fn()
}));

describe('Auth Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should call register controller', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com'
            };

            (register as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json({
                    message: 'User registered successfully.',
                    user: mockUser
                });
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                message: 'User registered successfully.',
                user: mockUser
            });
            expect(register).toHaveBeenCalled();
        });
    });

    describe('POST /api/auth/login', () => {
        it('should call login controller', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com'
            };

            (login as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({
                    message: 'Login successful.',
                    token: 'mock-token',
                    user: mockUser
                });
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Login successful.',
                token: 'mock-token',
                user: mockUser
            });
            expect(login).toHaveBeenCalled();
        });
    });
}); 