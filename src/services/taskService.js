const Task = require('../models/Task');
const User = require('../models/User');
const UserService = require('./userService');


class TaskService {
  static async createTask(taskData, createdBy) {
    const { title, description, priority, status, assignedTo } = taskData;

    // Validate required fields
    if (!title || !createdBy) {
      throw new Error('Title and created by user ID are required');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (priority && !validPriorities.includes(priority)) {
      throw new Error('Invalid priority. Must be one of: ' + validPriorities.join(', '));
    }

    // Validate status
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
    }

    // Verify creator exists
    const creator = await UserService.getUserById(createdBy);

    // Verify assigned user exists if provided
    if (assignedTo) {
      await UserService.getUserById(assignedTo);
    }

    // Create the task
    const newTask = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'backlog',
      createdBy,
      assignedTo
    });

    // Add task to user arrays
    const userIds = [createdBy];
    if (assignedTo && assignedTo !== createdBy) {
      userIds.push(assignedTo);
    }
    await User.addTaskToUsers(userIds, newTask.id);

    return newTask;
  }

  static async getAllTasks(filters = {}) {
    return await Task.findAll(filters);
  }

  static async getTaskById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid task ID is required');
    }

    const task = await Task.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  static async updateTask(id, updateData) {
    if (!id || isNaN(id)) {
      throw new Error('Valid task ID is required');
    }

    // Get current task
    const currentTask = await Task.findById(id);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Validate priority if provided
    if (updateData.priority) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(updateData.priority)) {
        throw new Error('Invalid priority. Must be one of: ' + validPriorities.join(', '));
      }
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
      }
    }

    // Handle assignee change
    if (updateData.assigned_to !== undefined) {
      const newAssigneeId = updateData.assigned_to;
      const oldAssigneeId = currentTask.assignedTo;

      // Verify new assignee exists if provided
      if (newAssigneeId) {
        await UserService.getUserById(newAssigneeId);
      }

      // Update user task arrays if assignee changed
      if (newAssigneeId !== oldAssigneeId) {
        // Remove task from old assignee (if exists and different from creator)
        if (oldAssigneeId && oldAssigneeId !== currentTask.createdBy) {
          await User.removeTaskFromUser(oldAssigneeId, id);
        }

        // Add task to new assignee (if exists and different from creator)
        if (newAssigneeId && newAssigneeId !== currentTask.createdBy) {
          await User.addTaskToUser(newAssigneeId, id);
        }
      }
    }

    // Update the task
    const updatedTask = await Task.update(id, updateData);
    if (!updatedTask) {
      throw new Error('Task not found');
    }

    return updatedTask;
  }

  static async deleteTask(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid task ID is required');
    }

    const task = await Task.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Remove task from user arrays before deletion
    const userIds = [task.createdBy];
    if (task.assignedTo && task.assignedTo !== task.createdBy) {
      userIds.push(task.assignedTo);
    }
    await User.removeTaskFromUsers(userIds, id);

    return await Task.delete(id);
  }
}

module.exports = TaskService;
