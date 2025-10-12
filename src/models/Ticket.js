const { query } = require('../../config/database');

class Ticket {
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

  static async create(ticketData) {
    const { title, description, priority = 'medium', status = 'backlog', createdBy, assignedTo } = ticketData;
    
    const result = await query(
      `INSERT INTO tickets (title, description, priority, status, created_by, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, description, priority, status, createdBy, assignedTo]
    );
    
    return new Ticket(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let queryText = 'SELECT * FROM tickets';
    const queryParams = [];
    const conditions = [];

    if (filters.status) {
      conditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(filters.status);
    }

    if (filters.priority) {
      conditions.push(`priority = $${queryParams.length + 1}`);
      queryParams.push(filters.priority);
    }

    if (filters.createdBy) {
      conditions.push(`created_by = $${queryParams.length + 1}`);
      queryParams.push(filters.createdBy);
    }

    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${queryParams.length + 1}`);
      queryParams.push(filters.assignedTo);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, queryParams);
    return result.rows.map(row => new Ticket(row));
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = key === 'createdBy' ? 'created_by' : 
                       key === 'assignedTo' ? 'assigned_to' : key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const queryText = `
      UPDATE tickets
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM tickets WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows.length > 0 ? new Ticket(result.rows[0]) : null;
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

module.exports = Ticket;
