const Ticket = require('../models/Ticket');
const User = require('../models/User');
const UserService = require('./userService');

class TicketService {
  static async createTicket(ticketData, createdBy) {
    const { title, description, priority, status, assignedTo } = ticketData;

    if (!title) {
      throw new Error('Title is required');
    }

    if (!createdBy) {
      throw new Error('Created by user ID is required');
    }

    // Verify creator exists
    const creator = await UserService.getUserById(createdBy);

    // Verify assigned user exists if provided
    if (assignedTo) {
      await UserService.getUserById(assignedTo);
    }

    const newTicket = await Ticket.create({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'medium',
      status: status || 'backlog',
      createdBy,
      assignedTo: assignedTo || null
    });

    // Add ticket to user arrays
    const userIds = [createdBy];
    if (assignedTo && assignedTo !== createdBy) {
      userIds.push(assignedTo);
    }
    await User.addTicketToUsers(userIds, newTicket.id);

    return newTicket;
  }

  static async getTicketById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid ticket ID is required');
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  static async getAllTickets(filters = {}) {
    const validFilters = {};

    if (filters.status) {
      const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      if (!validStatuses.includes(filters.status)) {
        throw new Error('Invalid status filter');
      }
      validFilters.status = filters.status;
    }

    if (filters.priority) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(filters.priority)) {
        throw new Error('Invalid priority filter');
      }
      validFilters.priority = filters.priority;
    }

    if (filters.createdBy) {
      if (isNaN(filters.createdBy)) {
        throw new Error('Created by must be a valid user ID');
      }
      validFilters.createdBy = parseInt(filters.createdBy);
    }

    if (filters.assignedTo) {
      if (isNaN(filters.assignedTo)) {
        throw new Error('Assigned to must be a valid user ID');
      }
      validFilters.assignedTo = parseInt(filters.assignedTo);
    }

    return await Ticket.findAll(validFilters);
  }

  static async updateTicket(id, updateData) {
    if (!id || isNaN(id)) {
      throw new Error('Valid ticket ID is required');
    }

    // Check if ticket exists
    const existingTicket = await Ticket.findById(id);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    const { title, description, priority, status, assignedTo } = updateData;
    const fieldsToUpdate = {};

    if (title !== undefined) {
      if (!title.trim()) {
        throw new Error('Title cannot be empty');
      }
      fieldsToUpdate.title = title.trim();
    }

    if (description !== undefined) {
      fieldsToUpdate.description = description?.trim() || null;
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(priority)) {
        throw new Error('Invalid priority. Must be low, medium, high, or critical');
      }
      fieldsToUpdate.priority = priority;
    }

    if (status !== undefined) {
      const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be backlog, todo, in_progress, review, or done');
      }
      fieldsToUpdate.status = status;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null) {
        fieldsToUpdate.assignedTo = null;
      } else {
        if (isNaN(assignedTo)) {
          throw new Error('Assigned to must be a valid user ID or null');
        }
        // Verify assigned user exists
        await UserService.getUserById(assignedTo);
        fieldsToUpdate.assignedTo = parseInt(assignedTo);
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedTicket = await Ticket.update(id, fieldsToUpdate);

    // Handle ticket assignment changes
    if (assignedTo !== undefined) {
      // Remove ticket from old assignee if they exist and are different
      if (existingTicket.assignedTo && existingTicket.assignedTo !== assignedTo) {
        await User.removeTicketFromUser(existingTicket.assignedTo, id);
      }

      // Add ticket to new assignee if they exist and are different from creator
      if (assignedTo && assignedTo !== existingTicket.createdBy) {
        await User.addTicketToUser(assignedTo, id);
      }
    }

    return updatedTicket;
  }

  static async deleteTicket(id) {
    if (!id || isNaN(id)) {
      throw new Error('Valid ticket ID is required');
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Remove ticket from user arrays before deletion
    const userIds = [ticket.createdBy];
    if (ticket.assignedTo && ticket.assignedTo !== ticket.createdBy) {
      userIds.push(ticket.assignedTo);
    }
    await User.removeTicketFromUsers(userIds, id);

    return await Ticket.delete(id);
  }
}

module.exports = TicketService;
