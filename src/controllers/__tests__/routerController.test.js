const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const routerController = require('../routerController');

// Create a new instance of axios mock adapter
const mock = new MockAdapter(axios);

describe('Router Controller Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mock.reset();
  });

  describe('Authentication', () => {
    const mockToken = 'mock-jwt-token';
    const mockRouterInfo = {
      model: 'TestModel',
      firmwareVersion: '1.0.0',
      macAddress: '00:11:22:33:44:55',
      serialNumber: 'SN123456',
      uptime: '1 day',
      wifiStatus: 'enabled',
      firewallStatus: 'disabled'
    };

    test('should successfully authenticate and get router info', async () => {
      // Mock the login endpoint
      mock.onPost('https://wifi-admin.netlify.app/api/login').reply(200, {
        token: mockToken
      });

      // Mock the router info endpoint
      mock.onGet('https://wifi-admin.netlify.app/api/router/info').reply(200, mockRouterInfo);

      const req = {
        body: {
          username: 'admin',
          password: 'admin'
        }
      };

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await routerController.interrogateRouter(req, res);

      expect(res.json).toHaveBeenCalledWith({
        model: 'TestModel',
        firmwareVersion: '1.0.0',
        macAddress: '00:11:22:33:44:55',
        serialNumber: 'SN123456',
        uptime: '1 day',
        wifiStatus: 'enabled',
        firewallStatus: 'disabled'
      });
    });

    test('should handle authentication failure', async () => {
      // Mock failed login
      mock.onPost('https://wifi-admin.netlify.app/api/login').reply(401, {
        error: 'Invalid credentials'
      });

      const req = {
        body: {
          username: 'admin',
          password: 'wrongpassword'
        }
      };

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await routerController.interrogateRouter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication failed'
      });
    });

    test('should handle missing credentials', async () => {
      const req = {
        body: {}
      };

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await routerController.interrogateRouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username and password are required'
      });
    });
  });
}); 