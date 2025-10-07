const User = require('../models/User');

class UserService {

  static async createUser(userData) {
    const { name, email, role } = userData;

    // Validate required fields
    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate role
    const validRoles = ['admin', 'user'];
    if (role && !validRoles.includes(role)) {
      throw new Error('Invalid role. Must be admin or user');
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      role: role || 'user'
    });

    return newUser;
  }

  static async getUserById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid user ID is required');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async getAllUsers(filters = {}) {
    // Validate role filter if provided
    if (filters.role) {
      const validRoles = ['admin', 'user'];
      if (!validRoles.includes(filters.role)) {
        throw new Error('Invalid role filter. Must be admin or user');
      }
    }

    return await User.findAll(filters);
  }

  static async updateUser(id, updateData) {
    if (!id || isNaN(id)) {
      throw new Error('Valid user ID is required');
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const { name, email, role } = updateData;
    const fieldsToUpdate = {};

    // Validate and prepare fields to update
    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('Name cannot be empty');
      }
      fieldsToUpdate.name = name.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists (excluding current user)
      const emailExists = await User.emailExists(email, id);
      if (emailExists) {
        throw new Error('Email already exists');
      }
      fieldsToUpdate.email = email;
    }

    if (role !== undefined) {
      const validRoles = ['admin', 'user'];
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role. Must be admin or user');
      }
      fieldsToUpdate.role = role;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No valid fields to update');
    }

    return await User.update(id, fieldsToUpdate);
  }

  static async deleteUser(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid user ID is required');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await User.delete(id);
  }


}

module.exports = UserService;
