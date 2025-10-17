const TaskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQueryParams
} = require('../middleware/taskValidation');

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

const handleTaskRoutes = async (req, res, method, path, parsedUrl) => {
  if (method === 'post' || method === 'patch') {
    await parseRequestBody(req);
  }

  // GET /tasks/:id
  if (method === 'get' && path.match(/^\/tasks\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateTaskId(req, res);
    if (validationResult !== true) return true;
    await TaskController.getTaskById(req, res);
    return true;
  }

  // GET /tasks (with optional query params)
  if (method === 'get' && path === '/tasks') {
    req.query = parsedUrl.query || {};
    const validationResult = validateTaskQueryParams(req, res);
    if (validationResult !== true) return true;
    await TaskController.getAllTasks(req, res);
    return true;
  }

  // POST /tasks
  if (method === 'post' && path === '/tasks') {
    const validationResult = validateCreateTask(req, res);
    if (validationResult !== true) return true;
    await TaskController.createTask(req, res);
    return true;
  }

  // PATCH /tasks/:id
  if (method === 'patch' && path.match(/^\/tasks\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const idValidationResult = validateTaskId(req, res);
    if (idValidationResult !== true) return true;
    const updateValidationResult = validateUpdateTask(req, res);
    if (updateValidationResult !== true) return true;
    await TaskController.updateTask(req, res);
    return true;
  }

  // DELETE /tasks/:id
  if (method === 'delete' && path.match(/^\/tasks\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateTaskId(req, res);
    if (validationResult !== true) return true;
    await TaskController.deleteTask(req, res);
    return true;
  }

  // Check if it's a valid task path but invalid method
  if (path === '/tasks' || path.match(/^\/tasks\/\d+$/)) {
    // Valid task path but invalid method - return 405
    res.writeHead(405, {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST, PATCH, DELETE'
    });
    res.end(JSON.stringify({
      success: false,
      error: 'Method Not Allowed',
      message: `Method ${method.toUpperCase()} is not allowed for this endpoint`,
      allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE']
    }, null, 2));
    return true;
  }

  // No matching route found
  return false;
};

module.exports = {
  handleTaskRoutes
};
