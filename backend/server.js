const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db.getDbInfo()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db.getDbInfo()
  });
});

app.use('/books', bookRoutes);
app.use('/api/books', bookRoutes);

app.use('/transactions', transactionRoutes);
app.use('/api/transactions', transactionRoutes);

app.use('/users', userRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Library Management System REST API',
    database: db.getDbInfo(),
    documentation: {
      books: '/books or /api/books',
      transactions: '/transactions or /api/transactions',
      users: '/users or /api/users',
      health: '/health'
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await db.initDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  Library Management System Backend is running!`);
      console.log(`  Local URL: http://localhost:${PORT}`);
      console.log(`  Database Engine: ${db.getDbInfo().engine.toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
