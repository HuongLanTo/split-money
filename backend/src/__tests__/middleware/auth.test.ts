import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();
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
            headers: {}
        };
        jest.clearAllMocks();
    });

    it('should return 401 if no authorization header is present', () => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid token.' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
        mockRequest.headers = { authorization: 'Invalid token' };

        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid token.' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', () => {
        mockRequest.headers = { authorization: 'Bearer invalid_token' };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if token is valid', () => {
        mockRequest.headers = { authorization: 'Bearer valid_token' };
        const mockPayload = { userId: 'test-user-id' };
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.user).toEqual(mockPayload);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
    });
}); 