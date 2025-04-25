import { Server } from 'http';

// Mock the app module
const mockListen = jest.fn((port, callback) => {
    callback();
    return { close: jest.fn() } as unknown as Server;
});

const mockApp = {
    listen: mockListen
};

jest.mock('../app', () => mockApp);

describe('Server', () => {
    const originalEnv = process.env;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        process.env = { ...originalEnv };
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        process.env = originalEnv;
        consoleLogSpy.mockRestore();
    });

    it('should start server on default port 5000 if PORT env is not set', async () => {
        delete process.env.PORT;
        await import('../index');
        
        expect(mockListen).toHaveBeenCalledWith(5000, expect.any(Function));
        expect(consoleLogSpy).toHaveBeenCalledWith('Server is running on http://localhost:5000');
    });

    it('should start server on specified PORT from env', async () => {
        process.env.PORT = '3000';
        await import('../index');
        
        expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
        expect(consoleLogSpy).toHaveBeenCalledWith('Server is running on http://localhost:3000');
    });
}); 