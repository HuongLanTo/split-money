import { PrismaClient } from '@prisma/client';
import { registerUser, loginUser } from '../../../modules/auth/auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock Prisma client
jest.mock('@prisma/client', () => {
    const mockCreate = jest.fn();
    const mockFindUnique = jest.fn();

    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            user: {
                create: mockCreate,
                findUnique: mockFindUnique
            }
        })),
        __mockCreate: mockCreate,
        __mockFindUnique: mockFindUnique
    };
});

// Get the mock functions
const { __mockCreate: mockCreate, __mockFindUnique: mockFindUnique } = require('@prisma/client');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secretkey';
    });

    describe('registerUser', () => {
        it('should register a new user', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            mockFindUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            mockCreate.mockResolvedValue(mockUser);

            const result = await registerUser({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'hashedPassword'
                }
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw error if email is already registered', async () => {
            mockFindUnique.mockResolvedValue({
                id: '1',
                email: 'test@example.com'
            });

            await expect(registerUser({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow('Email already registered.');
        });
    });

    describe('loginUser', () => {
        it('should login a user and return token', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            mockFindUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            const result = await loginUser({
                email: 'test@example.com',
                password: 'password123'
            });

            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: '1' },
                'secretkey',
                { expiresIn: '1d' }
            );
            expect(result).toEqual({
                token: 'mock-token',
                user: mockUser
            });
        });

        it('should throw error if email is not registered', async () => {
            mockFindUnique.mockResolvedValue(null);

            await expect(loginUser({
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow('The email is not registered.');
        });

        it('should throw error if password is incorrect', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            mockFindUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(loginUser({
                email: 'test@example.com',
                password: 'wrong-password'
            })).rejects.toThrow('The password is incorrect.');
        });
    });
}); 