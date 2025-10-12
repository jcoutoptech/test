const validateCreateTicket = (req, res) => {
  const { title, description, priority, status, assignedTo, createdBy } = req.body;
  const errors = [];

  if (!title) {
    errors.push('Title is required');
  } else if (typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!createdBy) {
    errors.push('Created by user ID is required');
  } else if (isNaN(createdBy) || parseInt(createdBy) <= 0) {
    errors.push('Created by must be a valid user ID');
  }

  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
    errors.push('Priority must be one of: low, medium, high, critical');
  }

  if (status && !['backlog', 'todo', 'in_progress', 'review', 'done'].includes(status)) {
    errors.push('Status must be one of: backlog, todo, in_progress, review, done');
  }

  if (assignedTo && (isNaN(assignedTo) || parseInt(assignedTo) <= 0)) {
    errors.push('Assigned to must be a valid user ID');
  }

  if (errors.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }));
    return false;
  }

  return true;
};

const validateUpdateTicket = (req, res) => {
  const { title, description, priority, status, assignedTo } = req.body;
  const errors = [];

  if (!title && !description && !priority && !status && assignedTo === undefined) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'At least one field (title, description, priority, status, assignedTo) must be provided'
    }));
    return false;
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  if (priority !== undefined && !['low', 'medium', 'high', 'critical'].includes(priority)) {
    errors.push('Priority must be one of: low, medium, high, critical');
  }

  if (status !== undefined && !['backlog', 'todo', 'in_progress', 'review', 'done'].includes(status)) {
    errors.push('Status must be one of: backlog, todo, in_progress, review, done');
  }

  if (assignedTo !== undefined && assignedTo !== null && (isNaN(assignedTo) || parseInt(assignedTo) <= 0)) {
    errors.push('Assigned to must be a valid user ID or null');
  }

  if (errors.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }));
    return false;
  }

  return true;
};

const validateTicketId = (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Ticket ID is required'
    }));
    return false;
  }

  if (isNaN(id) || parseInt(id) <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Ticket ID must be a positive number'
    }));
    return false;
  }

  return true;
};

const validateTicketQueryParams = (req, res) => {
  const { status, priority, createdBy, assignedTo } = req.query;

  if (status && !['backlog', 'todo', 'in_progress', 'review', 'done'].includes(status)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Status filter must be one of: backlog, todo, in_progress, review, done'
    }));
    return false;
  }

  if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Priority filter must be one of: low, medium, high, critical'
    }));
    return false;
  }

  if (createdBy && (isNaN(createdBy) || parseInt(createdBy) <= 0)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Created by filter must be a valid user ID'
    }));
    return false;
  }

  if (assignedTo && (isNaN(assignedTo) || parseInt(assignedTo) <= 0)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Assigned to filter must be a valid user ID'
    }));
    return false;
  }

  return true;
};

module.exports = {
  validateCreateTicket,
  validateUpdateTicket,
  validateTicketId,
  validateTicketQueryParams
};
