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

    // Validate role
    const validRoles = ['admin', 'user'];
    if (role && !validRoles.includes(role)) {
      throw new Error('Invalid role. Must be either admin or user');
    }

    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Create the user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'user'
    });

    return newUser;
  }

  static async getAllUsers(filters = {}) {
    return await User.findAll(filters);
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

  static async updateUser(id, updateData) {
    if (!id || isNaN(id)) {
      throw new Error('Valid user ID is required');
    }

    // Get current user
    const currentUser = await User.findById(id);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists (excluding current user)
      const emailExists = await User.emailExists(updateData.email, id);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      updateData.email = updateData.email.toLowerCase().trim();
    }

    // Validate role if provided
    if (updateData.role) {
      const validRoles = ['admin', 'user'];
      if (!validRoles.includes(updateData.role)) {
        throw new Error('Invalid role. Must be either admin or user');
      }
    }

    // Trim name if provided
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    // Update the user
    const updatedUser = await User.update(id, updateData);
    return updatedUser;
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
