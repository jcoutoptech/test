const { query, addTaskToUser, removeTaskFromUser } = require('../../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.tasks = data.tasks || [];
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(userData) {
    const { name, email, role = 'user' } = userData;
    
    const result = await query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );

    const newUser = await User.findById(result.rows.insertId);
    return newUser;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];

    // Parse JSON tasks array
    try {
      if (userData.tasks === null || userData.tasks === undefined) {
        userData.tasks = [];
      } else if (typeof userData.tasks === 'string') {
        userData.tasks = userData.tasks.trim() ? JSON.parse(userData.tasks) : [];
      } else if (Array.isArray(userData.tasks)) {
        // Already an array, keep as is
        userData.tasks = userData.tasks;
      } else {
        userData.tasks = [];
      }
    } catch (error) {
      console.error('Error parsing tasks JSON:', error);
      userData.tasks = [];
    }

    return new User(userData);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    // Add role filter
    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    // Parse JSON tasks for each user
    return result.rows.map(userData => {
      try {
        if (userData.tasks === null || userData.tasks === undefined) {
          userData.tasks = [];
        } else if (typeof userData.tasks === 'string') {
          userData.tasks = userData.tasks.trim() ? JSON.parse(userData.tasks) : [];
        } else if (Array.isArray(userData.tasks)) {
          userData.tasks = userData.tasks;
        } else {
          userData.tasks = [];
        }
      } catch (error) {
        console.error('Error parsing tasks JSON:', error);
        userData.tasks = [];
      }
      return new User(userData);
    });
  }

  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'role'];
    const fields = [];
    const values = [];

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await query(sql, values);
    return await User.findById(id);
  }

  static async delete(id) {
    const user = await User.findById(id);
    if (!user) {
      return null;
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return user;
  }

  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT id FROM users WHERE email = ?';
    const params = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  static async addTaskToUser(userId, taskId) {
    await addTaskToUser(userId, taskId);
  }

  static async removeTaskFromUser(userId, taskId) {
    await removeTaskFromUser(userId, taskId);
  }

  static async addTaskToUsers(userIds, taskId) {
    for (const userId of userIds) {
      if (userId) {
        await User.addTaskToUser(userId, taskId);
      }
    }
  }

  static async removeTaskFromUsers(userIds, taskId) {
    for (const userId of userIds) {
      if (userId) {
        await User.removeTaskFromUser(userId, taskId);
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      tasks: this.tasks || [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
