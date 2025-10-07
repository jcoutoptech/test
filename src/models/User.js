const { query } = require('../../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(userData) {
    const { name, email, role = 'user' } = userData;

    const result = await query(
      `INSERT INTO users (name, email, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, role]
    );

    return new User(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let queryText = 'SELECT * FROM users';
    const queryParams = [];
    const conditions = [];

    // Add role filter if provided
    if (filters.role) {
      conditions.push(`role = $${queryParams.length + 1}`);
      queryParams.push(filters.role);
    }

    // Add conditions to query
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, queryParams);
    return result.rows.map(row => new User(row));
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const queryText = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await query(queryText, values);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async emailExists(email, excludeId = null) {
    let queryText = 'SELECT id FROM users WHERE email = $1';
    const queryParams = [email];

    if (excludeId) {
      queryText += ' AND id != $2';
      queryParams.push(excludeId);
    }

    const result = await query(queryText, queryParams);
    return result.rows.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
