const validateCreateTask = (req, res) => {
  const { title, description, priority, status, assignedTo, createdBy } = req.body;
  const errors = [];

  // Validate title
  if (!title) {
    errors.push('Title is required');
  } else if (typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (title.trim().length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  // Validate description (optional)
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // Validate priority (optional)
  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Priority must be one of: ' + validPriorities.join(', '));
    }
  }

  // Validate status (optional)
  if (status) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      errors.push('Status must be one of: ' + validStatuses.join(', '));
    }
  }

  // Validate createdBy
  if (!createdBy) {
    errors.push('Created by user ID is required');
  } else if (isNaN(createdBy) || parseInt(createdBy) <= 0) {
    errors.push('Created by must be a valid user ID');
  }

  // Validate assignedTo (optional)
  if (assignedTo && (isNaN(assignedTo) || parseInt(assignedTo) <= 0)) {
    errors.push('Assigned to must be a valid user ID');
  }

  if (errors.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }, null, 2));
    return false;
  }

  return true;
};

const validateUpdateTask = (req, res) => {
  const { title, description, priority, status, assigned_to } = req.body;
  const errors = [];

  // Validate title (optional for update)
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    } else if (title.trim().length > 255) {
      errors.push('Title must be less than 255 characters');
    }
  }

  // Validate description (optional)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
  }

  // Validate priority (optional)
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Priority must be one of: ' + validPriorities.join(', '));
    }
  }

  // Validate status (optional)
  if (status !== undefined) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      errors.push('Status must be one of: ' + validStatuses.join(', '));
    }
  }

  // Validate assigned_to (optional, can be null)
  if (assigned_to !== undefined && assigned_to !== null) {
    if (isNaN(assigned_to) || parseInt(assigned_to) <= 0) {
      errors.push('Assigned to must be a valid user ID or null');
    }
  }

  if (errors.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }, null, 2));
    return false;
  }

  return true;
};

const validateTaskId = (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Valid task ID is required'
    }, null, 2));
    return false;
  }

  return true;
};

const validateTaskQueryParams = (req, res) => {
  const { status, priority, createdBy, assignedTo } = req.query;
  const errors = [];

  // Validate status filter
  if (status) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      errors.push('Status filter must be one of: ' + validStatuses.join(', '));
    }
  }

  // Validate priority filter
  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Priority filter must be one of: ' + validPriorities.join(', '));
    }
  }

  // Validate createdBy filter
  if (createdBy && (isNaN(createdBy) || parseInt(createdBy) <= 0)) {
    errors.push('Created by filter must be a valid user ID');
  }

  // Validate assignedTo filter
  if (assignedTo && (isNaN(assignedTo) || parseInt(assignedTo) <= 0)) {
    errors.push('Assigned to filter must be a valid user ID');
  }

  if (errors.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }, null, 2));
    return false;
  }

  return true;
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQueryParams
};
