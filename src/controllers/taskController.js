const TaskService = require('../services/taskService');
const UserService = require('../services/userService');

class TaskController {
  static async getAllTasks(req, res) {
    try {
      const filters = req.query || {};
      const tasks = await TaskService.getAllTasks(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: tasks.map(task => task.toJSON()),
        count: tasks.length
      }, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskById(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: task.toJSON()
      }, null, 2));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async createTask(req, res) {
    try {
      const { title, description, priority, status, assignedTo, createdBy } = req.body;

      // Check if the creator is an admin
      const creator = await UserService.getUserById(createdBy);
      if (!creator || creator.role !== 'admin') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Unauthorized. Only admins can create tasks'
        }, null, 2));
        return;
      }

      const task = await TaskService.createTask({
        title,
        description,
        priority,
        status,
        assignedTo
      }, createdBy);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: task.toJSON(),
        message: 'Task created successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const task = await TaskService.updateTask(id, updateData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: task.toJSON(),
        message: 'Task updated successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const deletedTask = await TaskService.deleteTask(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: deletedTask.toJSON(),
        message: 'Task deleted successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }
}

module.exports = TaskController;
