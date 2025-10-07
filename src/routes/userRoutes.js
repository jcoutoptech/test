const UserController = require('../controllers/userController');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateUserId, 
  validateQueryParams 
} = require('../middleware/validation');

const handleUserRoutes = async (req, res, method, path, parsedUrl) => {
  if (method === 'post' || method === 'patch') {
    await parseRequestBody(req);
  }

  // GET /users/:id
  if (method === 'get' && path.match(/^\/users\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateUserId(req, res);
    if (validationResult !== true) return true;
    await UserController.getUserById(req, res);
    return true;
  }

  // Route: GET /users (with optional query params)
  if (method === 'get' && path === '/users') {
    req.query = parsedUrl.query || {};
    const validationResult = validateQueryParams(req, res);
    if (validationResult !== true) return true;
    await UserController.getAllUsers(req, res);
    return true;
  }

  // Route: POST /users
  if (method === 'post' && path === '/users') {
    const validationResult = validateCreateUser(req, res);
    if (validationResult !== true) return true;
    await UserController.createUser(req, res);
    return true;
  }

  // Route: PATCH /users/:id
  if (method === 'patch' && path.match(/^\/users\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const idValidationResult = validateUserId(req, res);
    if (idValidationResult !== true) return true;
    const updateValidationResult = validateUpdateUser(req, res);
    if (updateValidationResult !== true) return true;
    await UserController.updateUser(req, res);
    return true;
  }

  // Route: DELETE /users/:id
  if (method === 'delete' && path.match(/^\/users\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateUserId(req, res);
    if (validationResult !== true) return true;
    await UserController.deleteUser(req, res);
    return true;
  }

  // No matching route found
  return false;
};

/**
 * Parse request body for POST/PATCH requests
 */
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        resolve();
      } catch (error) {
        req.body = {};
        resolve();
      }
    });
    
    req.on('error', reject);
  });
};



module.exports = {
  handleUserRoutes
};
