const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jira_board',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

const query = async (text, params = []) => {
  const start = Date.now();
  const [rows] = await pool.execute(text, params);
  const duration = Date.now() - start;
  console.log(`Query executed in ${duration}ms: ${text.split('\n')[0].trim()}`);
  return { rows };
};

const testConnection = async () => {
  try {
    await pool.execute('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        tasks JSON DEFAULT (JSON_ARRAY()),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create tasks table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('backlog', 'todo', 'in_progress', 'review', 'done') DEFAULT 'backlog',
        created_by INT NOT NULL,
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_by (created_by),
        INDEX idx_assigned_to (assigned_to)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);



    // Add tasks column to existing users table if it doesn't exist
    try {
      await pool.execute(`
        ALTER TABLE users
        ADD COLUMN tasks JSON DEFAULT (JSON_ARRAY())
      `);
      console.log('✅ Added tasks column to users table');

      // Update existing users to have empty JSON array for tasks
      await pool.execute(`
        UPDATE users
        SET tasks = JSON_ARRAY()
        WHERE tasks IS NULL
      `);
      console.log('✅ Updated existing users with empty tasks array');

    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ Tasks column already exists in users table');

        // Still update existing users that might have NULL tasks
        try {
          await pool.execute(`
            UPDATE users
            SET tasks = JSON_ARRAY()
            WHERE tasks IS NULL
          `);
          console.log('✅ Updated existing users with empty tasks array');
        } catch (updateError) {
          console.log('ℹ️  Update note:', updateError.message);
        }
      } else {
        console.log('ℹ️  Column addition note:', error.message);
      }
    }

    // Drop user_tasks table if it exists (no longer needed)
    try {
      await pool.execute('DROP TABLE IF EXISTS user_tasks');
      console.log('✅ Removed unnecessary user_tasks table');
    } catch (error) {
      console.log('ℹ️  Table removal note:', error.message);
    }

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Helper function to add task to user's JSON array
const addTaskToUser = async (userId, taskId) => {
  await query(`
    UPDATE users
    SET tasks = JSON_ARRAY_APPEND(tasks, '$', ?)
    WHERE id = ?
  `, [taskId, userId]);
};

// Helper function to remove task from user's JSON array
const removeTaskFromUser = async (userId, taskId) => {
  // Get current tasks
  const { rows } = await query('SELECT tasks FROM users WHERE id = ?', [userId]);

  if (rows.length > 0) {
    let currentTasks = [];
    try {
      if (rows[0].tasks) {
        currentTasks = typeof rows[0].tasks === 'string'
          ? JSON.parse(rows[0].tasks)
          : rows[0].tasks;
      }
    } catch (error) {
      currentTasks = [];
    }

    // Filter out the task (convert taskId to number for comparison)
    const taskIdNum = parseInt(taskId);
    const updatedTasks = currentTasks.filter(id => parseInt(id) !== taskIdNum);

    // Only update if the array actually changed
    if (updatedTasks.length !== currentTasks.length) {
      await query(
        'UPDATE users SET tasks = ? WHERE id = ?',
        [JSON.stringify(updatedTasks), userId]
      );
    }
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  initializeDatabase,
  addTaskToUser,
  removeTaskFromUser
};
