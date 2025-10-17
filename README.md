# Jira-like Board Application

A simplified Jira-like project management system built with vanilla Node.js and MySQL. This application provides essential task management functionality with a clean, minimal architecture.

**Database Entities:**
- **Users** - Manages user accounts with role-based permissions (includes JSON array of task IDs)
- **Tasks** - Project tasks with status tracking and assignment capabilities
- **Relationship** - Simple 1-to-many: Users can create/be assigned to multiple tasks

## Database Schema

### Users Table
```sql
- id: INT AUTO_INCREMENT PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL
- role: ENUM('admin', 'user') DEFAULT 'user'
- tasks: JSON DEFAULT (JSON_ARRAY()) -- Array of task IDs
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### Tasks Table
```sql
- id: INT AUTO_INCREMENT PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT
- priority: ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium'
- status: ENUM('backlog', 'todo', 'in_progress', 'review', 'done') DEFAULT 'backlog'
- created_by: INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
- assigned_to: INT REFERENCES users(id) ON DELETE SET NULL
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```



## API Endpoints

### User Management
```
GET    /users              - Get all users (with optional role filter)
GET    /users/:id          - Get user by ID (includes task relationships)
POST   /users              - Create new user
PATCH  /users/:id          - Update user details
DELETE /users/:id          - Delete user
```

### Task Management
```
GET    /tasks              - Get all tasks (with optional filters)
GET    /tasks/:id          - Get task by ID
POST   /tasks              - Create new task (admin only)
PATCH  /tasks/:id          - Update task (status, assignment, etc.)
DELETE /tasks/:id          - Delete task
```

**Query Parameters for GET /tasks:**
- `status` - Filter by status (backlog, todo, in_progress, review, done)
- `priority` - Filter by priority (low, medium, high, critical)
- `createdBy` - Filter by creator user ID
- `assignedTo` - Filter by assigned user ID

**Query Parameters for GET /users:**
- `role` - Filter users by role (admin or user)

## Authorization

- **Task Creation**: Only users with `admin` role can create tasks
- **Other Operations**: All authenticated users can view, update, and manage tasks
- **Error Handling**: Returns `401 Unauthorized` for insufficient permissions

## Frontend Perspectives

The API is designed to support these frontend views:

### Board View
- **Endpoint**: `GET /tasks?status=in_progress` or `GET /tasks?status=review`
- **Purpose**: Kanban-style board showing active work

### Backlog View
- **Endpoint**: `GET /tasks?status=backlog`
- **Purpose**: List of pending tasks awaiting assignment

### Completed View
- **Endpoint**: `GET /tasks?status=done`
- **Purpose**: Archive of finished work

### Task Detail View
- **Endpoint**: `GET /tasks/:id`
- **Purpose**: Individual task management and updates

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
   DB_PORT=3306
   DB_NAME=sh_db
   DB_USER=root
   DB_PASSWORD=password
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
│   └── taskController.js
├── middleware/           # Validation logic
│   ├── userValidation.js
│   └── taskValidation.js
├── models/              # Database models
│   ├── User.js
│   └── Task.js
├── routes/              # Route handling
│   ├── userRoutes.js
│   └── taskRoutes.js
└── services/            # Business logic
    ├── userService.js
    └── taskService.js
config/
└── database.js          # Database configuration
```

### Next Steps
- **Authentication System**: JWT-based user authentication
- **API Documentation**: Swagger/OpenAPI specification
- **Testing**: Comprehensive unit/integration test coverage
