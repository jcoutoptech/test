const TicketController = require('../controllers/ticketController');
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateTicketId,
  validateTicketQueryParams
} = require('../middleware/ticketValidation');

const parseRequestBody = async (req) => {
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
        reject(new Error('Invalid JSON'));
      }
    });
  });
};

const handleTicketRoutes = async (req, res, method, path, parsedUrl) => {
  if (method === 'post' || method === 'patch') {
    try {
      await parseRequestBody(req);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }));
      return true;
    }
  }

  // GET /tickets/:id
  if (method === 'get' && path.match(/^\/tickets\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateTicketId(req, res);
    if (validationResult !== true) return true;
    await TicketController.getTicketById(req, res);
    return true;
  }

  // GET /tickets (with optional query params)
  if (method === 'get' && path === '/tickets') {
    req.query = parsedUrl.query || {};
    const validationResult = validateTicketQueryParams(req, res);
    if (validationResult !== true) return true;
    await TicketController.getAllTickets(req, res);
    return true;
  }

  // POST /tickets
  if (method === 'post' && path === '/tickets') {
    const validationResult = validateCreateTicket(req, res);
    if (validationResult !== true) return true;
    await TicketController.createTicket(req, res);
    return true;
  }

  // PATCH /tickets/:id
  if (method === 'patch' && path.match(/^\/tickets\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const idValidationResult = validateTicketId(req, res);
    if (idValidationResult !== true) return true;
    const updateValidationResult = validateUpdateTicket(req, res);
    if (updateValidationResult !== true) return true;
    await TicketController.updateTicket(req, res);
    return true;
  }

  // DELETE /tickets/:id
  if (method === 'delete' && path.match(/^\/tickets\/\d+$/)) {
    const id = path.split('/')[2];
    req.params = { id };
    const validationResult = validateTicketId(req, res);
    if (validationResult !== true) return true;
    await TicketController.deleteTicket(req, res);
    return true;
  }

  return false;
};

module.exports = { handleTicketRoutes };
