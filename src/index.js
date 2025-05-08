const express = require('express');
const cors = require('cors');
const routerController = require('./controllers/routerController');

const app = express();
const PORT = process.env.PORT || 3000;
  
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Router interrogation endpoint
app.post('/api/router/interrogate', routerController.interrogateRouter);

// Router action endpoints
app.post('/api/router/wifi/toggle', routerController.toggleWifi);
app.post('/api/router/firewall/toggle', routerController.toggleFirewall);

// Generic action endpoint
app.post('/api/router/action', routerController.performAction);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server timeouts
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 120000; // 2 minutes 