const UserService = require('../services/userService');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const { role } = req.query;
      const filters = {};

      if (role) {
        filters.role = role;
      }

      const users = await UserService.getAllUsers(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: users.map(user => user.toJSON()),
        count: users.length
      }, null, 2));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: user.toJSON()
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      const user = await UserService.createUser({
        name,
        email,
        password,
        role
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: user.toJSON(),
        message: 'User created successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await UserService.updateUser(id, updateData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: user.toJSON(),
        message: 'User updated successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 :
                        error.message.includes('already exists') ? 409 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.deleteUser(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: deletedUser.toJSON(),
        message: 'User deleted successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }


}

module.exports = UserController;
