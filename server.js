const http = require('http');
const url = require('url');
require('dotenv').config();

// Import database and routes
const { testConnection, initializeDatabase } = require('./config/database');
const { handleUserRoutes } = require('./src/routes/userRoutes');

// Configuration
const PORT = process.env.PORT || 3000;

// Route handler for GET /
const handleRootRoute = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  
  const response = {
    message: 'Hello World',
    timestamp: new Date().toISOString(), 
    method: req.method,
    url: req.url
  };
  
  res.end(JSON.stringify(response, null, 2));
};

// Route handler for 404 Not Found
const handleNotFound = (req, res) => {
  res.writeHead(404, {
    'Content-Type': 'application/json'
  });
  
  const response = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  };
  
  res.end(JSON.stringify(response, null, 2));
};

// Main request handler
const requestHandler = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method.toLowerCase();
  
  // Log incoming requests
  console.log(`${new Date().toISOString()} - ${method.toUpperCase()} ${path}`);
  
  // Route handling
  if (method === 'get' && path === '/') {
    handleRootRoute(req, res);
  } else if (path.startsWith('/users')) {
    // Handle user routes
    const routeHandled = await handleUserRoutes(req, res, method, path, parsedUrl);
    if (!routeHandled) {
      handleNotFound(req, res);
    }
  } else {
    handleNotFound(req, res);
  }
};

// Create and configure the HTTP server
const server = http.createServer(requestHandler);

// Error handler for the server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('  GET    /users       - Get all users');
      console.log('  GET    /users/:id   - Get user by ID');
      console.log('  POST   /users       - Create new user');
      console.log('  PATCH  /users/:id   - Update user');
      console.log('  DELETE /users/:id   - Delete user');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();


