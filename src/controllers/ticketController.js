const TicketService = require('../services/ticketService');
const UserService = require('../services/userService');

class TicketController {
  static async getAllTickets(req, res) {
    try {
      const { status, priority, createdBy, assignedTo } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (createdBy) filters.createdBy = createdBy;
      if (assignedTo) filters.assignedTo = assignedTo;

      const tickets = await TicketService.getAllTickets(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: tickets.map(ticket => ticket.toJSON()),
        count: tickets.length
      }, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketService.getTicketById(id);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: ticket.toJSON()
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async createTicket(req, res) {
    try {
      const { title, description, priority, status, assignedTo, createdBy } = req.body;

      // Check if the creator is an admin
      const creator = await UserService.getUserById(createdBy);
      if (!creator || creator.role !== 'admin') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Unauthorized. Only admins can create tickets'
        }, null, 2));
        return;
      }

      const ticket = await TicketService.createTicket({
        title,
        description,
        priority,
        status,
        assignedTo
      }, createdBy);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: ticket.toJSON(),
        message: 'Ticket created successfully'
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

  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, assignedTo } = req.body;

      const ticket = await TicketService.updateTicket(id, {
        title,
        description,
        priority,
        status,
        assignedTo
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: ticket.toJSON(),
        message: 'Ticket updated successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }

  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;

      const ticket = await TicketService.deleteTicket(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: ticket.toJSON(),
        message: 'Ticket deleted successfully'
      }, null, 2));
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }, null, 2));
    }
  }
}

module.exports = TicketController;
