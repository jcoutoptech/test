const { query } = require('../../config/database');

class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.status = data.status;
    this.createdBy = data.created_by;
    this.assignedTo = data.assigned_to;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(taskData) {
    const { title, description, priority = 'medium', status = 'backlog', createdBy, assignedTo } = taskData;
    
    const result = await query(
      `INSERT INTO tasks (title, description, priority, status, created_by, assigned_to) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, priority, status, createdBy, assignedTo]
    );

    const newTask = await Task.findById(result.rows.insertId);
    return newTask;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new Task(result.rows[0]);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    // Add filters
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.createdBy) {
      sql += ' AND created_by = ?';
      params.push(parseInt(filters.createdBy));
    }

    if (filters.assignedTo) {
      sql += ' AND assigned_to = ?';
      params.push(parseInt(filters.assignedTo));
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows.map(row => new Task(row));
  }

  static async update(id, updateData) {
    const allowedFields = ['title', 'description', 'priority', 'status', 'assigned_to'];
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
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

    const result = await query(sql, values);
    
    if (result.rows.affectedRows === 0) {
      return null;
    }

    return await Task.findById(id);
  }

  static async delete(id) {
    const task = await Task.findById(id);
    if (!task) {
      return null;
    }

    await query('DELETE FROM tasks WHERE id = ?', [id]);
    return task;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      createdBy: this.createdBy,
      assignedTo: this.assignedTo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Task;
