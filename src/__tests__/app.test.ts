import request from 'supertest';
import app from '../app';

describe('App', () => {
    describe('GET /', () => {
        it('should return 404 for root route', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(404);
        });
    });

    describe('GET /health', () => {
        it('should return health check status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'ok',
                timestamp: expect.any(String)
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 errors', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: 'Not Found',
                message: 'Route not found'
            });
        });

        it('should handle 500 errors', async () => {
            // Mock a route that throws an error
            const response = await request(app).get('/error');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                error: 'Internal Server Error',
                message: 'Something went wrong'
            });
        });
    });
}); 