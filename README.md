# Jira-like Board Application

A simplified Jira-like project management system built with vanilla Node.js and PostgreSQL. This application provides essential ticket management functionality with a clean, minimal architecture.

**Database Entities:**
- **Users** (1) - Manages user accounts with role-based permissions
- **Tickets** (Many) - Project tasks with status tracking and assignment capabilities
- **Relationship**: One-to-Many (Users can create/be assigned multiple tickets)

## Database Schema

### Users Table
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL  
- role: VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user'))
- tickets: INTEGER[] DEFAULT '{}' -- Array of ticket IDs
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tickets Table
```sql
- id: SERIAL PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT
- priority: VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'))
- status: VARCHAR(50) DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done'))
- created_by: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- assigned_to: INTEGER REFERENCES users(id) ON DELETE SET NULL
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## API Endpoints

### User Management
```
GET    /users              - Get all users (with optional role filter)
GET    /users/:id          - Get user by ID 
POST   /users              - Create new user
PATCH  /users/:id          - Update user details
DELETE /users/:id          - Delete user
```

### Ticket Management
```
GET    /tickets            - Get all tickets (with optional filters)
GET    /tickets/:id        - Get ticket by ID
POST   /tickets            - Create new ticket (admin only)
PATCH  /tickets/:id        - Update ticket (status, assignment, etc.)
DELETE /tickets/:id        - Delete ticket
```

## Authorization

- **Ticket Creation**: Only users with `admin` role can create tickets
- **Other Operations**: All authenticated users can view, update, and manage tickets
- **Error Handling**: Returns `401 Unauthorized` for insufficient permissions

## Frontend Perspectives

The API is designed to support these frontend views:

### Board View
- **Endpoint**: `GET /tickets?status=in_progress` or `GET /tickets?status=review`
- **Purpose**: Kanban-style board showing active work

### Backlog View  
- **Endpoint**: `GET /tickets?status=backlog`
- **Purpose**: List of pending tickets awaiting assignment

### Completed View
- **Endpoint**: `GET /tickets?status=done`
- **Purpose**: Archive of finished work

### Ticket Detail View
- **Endpoint**: `GET /tickets/:id`
- **Purpose**: Individual ticket management and updates

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=jira_board
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── controllers/           # HTTP request/response handling
│   ├── userController.js
│   └── ticketController.js
├── middleware/           # Validation logic
│   ├── userValidation.js
│   └── ticketValidation.js
├── models/              # Database models
│   ├── User.js
│   └── Ticket.js
├── routes/              # Route handling
│   ├── userRoutes.js
│   └── ticketRoutes.js
└── services/            # Business logic
    ├── userService.js
    └── ticketService.js
config/
└── database.js          # Database configuration
```

### Next Steps
- **Authentication System**: JWT-based user authentication
- **API Documentation**: Swagger/OpenAPI specification
- **Testing**: Comprehensive unit/integration test coverage
