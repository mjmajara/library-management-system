const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();
let activeEngine = 'sqlite';
let pool = null;
let sqliteDb = null;

function setupPostgres() {
  const { Pool } = require('pg');
  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'library_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000,
      };

  return new Pool(config);
}

function setupMySQL() {
  const mysql = require('mysql2/promise');
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'library_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

function setupSQLite() {
  const sqlite3 = require('sqlite3').verbose();
  const dbDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'library.db');
  return new sqlite3.Database(dbPath);
}

if (DB_TYPE === 'postgres' || DB_TYPE === 'postgresql') {
  try {
    pool = setupPostgres();
    activeEngine = 'postgresql';
    console.log('[DB] Configured for PostgreSQL');
  } catch (err) {
    console.warn('[DB] PostgreSQL init failed, falling back to SQLite:', err.message);
    sqliteDb = setupSQLite();
    activeEngine = 'sqlite';
  }
} else if (DB_TYPE === 'mysql') {
  try {
    pool = setupMySQL();
    activeEngine = 'mysql';
    console.log('[DB] Configured for MySQL');
  } catch (err) {
    console.warn('[DB] MySQL init failed, falling back to SQLite:', err.message);
    sqliteDb = setupSQLite();
    activeEngine = 'sqlite';
  }
} else {
  sqliteDb = setupSQLite();
  activeEngine = 'sqlite';
  console.log('[DB] Configured for SQLite (zero-config local storage)');
}

async function query(sql, params = []) {
  if (activeEngine === 'postgresql') {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await pool.query(pgSql, params);
    return {
      rows: res.rows || [],
      rowCount: res.rowCount,
      insertId: res.rows[0]?.id || null,
    };
  }

  if (activeEngine === 'mysql') {
    const [result] = await pool.query(sql, params);
    if (Array.isArray(result)) {
      return { rows: result, rowCount: result.length };
    }
    return {
      rows: [],
      rowCount: result.affectedRows,
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    };
  }

  return new Promise((resolve, reject) => {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: (rows || []).length });
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({
          rows: [],
          rowCount: this.changes,
          insertId: this.lastID,
          affectedRows: this.changes,
        });
      });
    }
  });
}

async function initDatabase() {
  try {
    if (activeEngine === 'postgresql') {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          membership_id VARCHAR(50) UNIQUE NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'member',
          email VARCHAR(120),
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          genre VARCHAR(100) NOT NULL,
          isbn VARCHAR(50) UNIQUE NOT NULL,
          initial_quantity INTEGER NOT NULL DEFAULT 1,
          available_quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          type VARCHAR(20) NOT NULL,
          quantity INTEGER NOT NULL,
          previous_quantity INTEGER NOT NULL,
          new_quantity INTEGER NOT NULL,
          notes TEXT,
          transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else if (activeEngine === 'mysql') {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          membership_id VARCHAR(50) UNIQUE NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'member',
          email VARCHAR(120),
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS books (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          genre VARCHAR(100) NOT NULL,
          isbn VARCHAR(50) UNIQUE NOT NULL,
          initial_quantity INT NOT NULL DEFAULT 1,
          available_quantity INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          book_id INT NOT NULL,
          user_id INT NULL,
          type ENUM('BORROW', 'RESTOCK', 'RETURN') NOT NULL,
          quantity INT NOT NULL,
          previous_quantity INT NOT NULL,
          new_quantity INT NOT NULL,
          notes TEXT,
          transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          membership_id TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL DEFAULT 'member',
          email TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          genre TEXT NOT NULL,
          isbn TEXT UNIQUE NOT NULL,
          initial_quantity INTEGER NOT NULL DEFAULT 1,
          available_quantity INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          user_id INTEGER,
          type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          previous_quantity INTEGER NOT NULL,
          new_quantity INTEGER NOT NULL,
          notes TEXT,
          transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);
    }

    const { rows: userCount } = await query('SELECT COUNT(*) as count FROM users');
    const uCount = userCount[0]?.count || userCount[0]?.COUNT || 0;

    if (parseInt(uCount, 10) === 0) {
      console.log('[DB] Seeding initial database records...');

      await query(`
        INSERT INTO users (name, membership_id, role, email, status) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
      `, [
        'Alexander Wright (Admin)', 'ADM-1001', 'admin', 'alex.admin@library.edu', 'active',
        'Sarah Connor', 'MEM-2001', 'member', 'sarah.c@techuniv.edu', 'active',
        'David Mitchell', 'MEM-2002', 'member', 'd.mitchell@readmail.com', 'active',
        'Elena Rostova', 'MEM-2003', 'member', 'elena.rostova@academics.org', 'active'
      ]);

      await query(`
        INSERT INTO books (title, author, genre, isbn, initial_quantity, available_quantity) VALUES
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?)
      `, [
        'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Computer Science', '978-0132350884', 6, 5,
        'The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas & Andrew Hunt', 'Computer Science', '978-0135957059', 3, 1,
        'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Software Engineering', '978-0201633610', 4, 0,
        'Atomic Habits: An Easy & Proven Way to Build Good Habits', 'James Clear', 'Self-Help', '978-0735211292', 5, 4,
        'To Kill a Mockingbird', 'Harper Lee', 'Classic Fiction', '978-0060935467', 4, 3,
        'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen', 'Computer Science', '978-0262046305', 2, 1
      ]);

      await query(`
        INSERT INTO transactions (book_id, user_id, type, quantity, previous_quantity, new_quantity, notes) VALUES
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
      `, [
        1, 2, 'BORROW', 1, 6, 5, 'Sarah Connor borrowed Clean Code for semester project',
        2, 3, 'BORROW', 1, 2, 1, 'David Mitchell borrowed Pragmatic Programmer',
        3, 4, 'BORROW', 1, 1, 0, 'Elena Rostova checked out the last copy of Design Patterns',
        4, 1, 'RESTOCK', 2, 3, 5, 'Librarian Alexander restocked inventory from distributor'
      ]);

      console.log('[DB] Seeding completed successfully.');
    }

    console.log(`[DB] Engine: ${activeEngine.toUpperCase()} initialized.`);
  } catch (error) {
    console.error('[DB] Initialization error:', error);
  }
}

function getDbInfo() {
  return {
    engine: activeEngine,
    name: process.env.DB_NAME || (activeEngine === 'sqlite' ? 'library.db' : 'library_db'),
    host: process.env.DB_HOST || (activeEngine === 'sqlite' ? 'local-file' : 'localhost')
  };
}

module.exports = {
  query,
  initDatabase,
  getDbInfo,
  activeEngine
};
