const validateCreateUser = (req, res) => {
  const { name, email, role } = req.body;
  const errors = [];

  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  if (role && !['admin', 'user'].includes(role)) {
    errors.push('Role must be either admin or user');
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

const validateUpdateUser = (req, res) => {
  const { name, email, role } = req.body;
  const errors = [];

  if (!name && !email && !role) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'At least one field (name, email, role) must be provided'
    }));
    return false;
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string') {
      errors.push('Email must be a string');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }
  }

  if (role !== undefined && !['admin', 'user'].includes(role)) {
    errors.push('Role must be either admin or user');
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

const validateUserId = (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'User ID is required'
    }));
    return false;
  }

  if (isNaN(id) || parseInt(id) <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'User ID must be a positive number'
    }));
    return false;
  }

  return true;
};

const validateQueryParams = (req, res) => {
  const { role } = req.query;

  if (role && !['admin', 'user'].includes(role)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Role filter must be either admin or user'
    }));
    return false;
  }

  return true;
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateQueryParams
};
