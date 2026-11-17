const db = require('../config/db');

exports.getAllTransactions = async (req, res, next) => {
  try {
    const { bookId, userId, type } = req.query;
    let sql = `
      SELECT 
        t.id,
        t.book_id,
        t.user_id,
        t.type,
        t.quantity,
        t.previous_quantity,
        t.new_quantity,
        t.notes,
        t.transaction_date,
        b.title AS book_title,
        b.isbn AS book_isbn,
        b.author AS book_author,
        u.name AS user_name,
        u.membership_id AS user_membership_id
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (bookId) {
      sql += ' AND t.book_id = ?';
      params.push(bookId);
    }
    if (userId) {
      sql += ' AND t.user_id = ?';
      params.push(userId);
    }
    if (type) {
      sql += ' AND t.type = ?';
      params.push(type.toUpperCase());
    }

    sql += ' ORDER BY t.transaction_date DESC, t.id DESC';

    const result = await db.query(sql, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { book_id, user_id, type, quantity, notes } = req.body;

    if (!book_id || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'book_id, type, and quantity are required',
      });
    }

    const txType = type.toUpperCase();
    if (!['BORROW', 'RESTOCK', 'RETURN'].includes(txType)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be BORROW, RESTOCK, or RETURN',
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const bookRes = await db.query('SELECT * FROM books WHERE id = ?', [book_id]);
    if (!bookRes.rows || bookRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${book_id} not found`,
      });
    }
    const book = bookRes.rows[0];

    let user = null;
    if (user_id) {
      const userRes = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
      if (userRes.rows && userRes.rows.length > 0) {
        user = userRes.rows[0];
      } else {
        return res.status(404).json({
          success: false,
          message: `User with ID ${user_id} not found`,
        });
      }
    } else if (txType === 'BORROW') {
      return res.status(400).json({
        success: false,
        message: 'A registered user is required to borrow books',
      });
    }

    const previousQty = book.available_quantity;
    let newQty = previousQty;
    let newInitialQty = book.initial_quantity;

    if (txType === 'BORROW') {
      if (previousQty < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Only ${previousQty} copies available, but requested ${qty}.`,
        });
      }
      newQty = previousQty - qty;
    } else if (txType === 'RESTOCK') {
      newQty = previousQty + qty;
      newInitialQty = book.initial_quantity + qty;
    } else if (txType === 'RETURN') {
      newQty = previousQty + qty;
      if (newQty > book.initial_quantity) {
        newInitialQty = newQty;
      }
    }

    await db.query(
      'UPDATE books SET available_quantity = ?, initial_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQty, newInitialQty, book_id]
    );

    const defaultNote = txType === 'BORROW'
      ? `${user ? user.name : 'User'} borrowed ${qty} copy(ies)`
      : txType === 'RESTOCK'
      ? `Stock replenished by ${qty} copy(ies)`
      : `Returned ${qty} copy(ies)`;

    const txNote = (notes && notes.trim().length > 0) ? notes.trim() : defaultNote;

    const insertSql = `
      INSERT INTO transactions (book_id, user_id, type, quantity, previous_quantity, new_quantity, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const txRes = await db.query(insertSql, [
      book_id,
      user_id || null,
      txType,
      qty,
      previousQty,
      newQty,
      txNote,
    ]);

    let createdTx = null;
    const selectSql = `
      SELECT 
        t.id, t.book_id, t.user_id, t.type, t.quantity, t.previous_quantity, t.new_quantity, t.notes, t.transaction_date,
        b.title AS book_title, b.isbn AS book_isbn, b.author AS book_author,
        u.name AS user_name, u.membership_id AS user_membership_id
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;

    if (txRes.insertId) {
      const fetchNew = await db.query(selectSql, [txRes.insertId]);
      createdTx = fetchNew.rows[0];
    } else {
      const fetchLatest = await db.query(selectSql + ' ORDER BY t.id DESC LIMIT 1', []);
      createdTx = fetchLatest.rows[0];
    }

    res.status(201).json({
      success: true,
      message: `Transaction recorded: ${txType} ${qty} copy(ies) of "${book.title}"`,
      data: createdTx,
      updated_book: {
        id: book.id,
        title: book.title,
        previous_quantity: previousQty,
        available_quantity: newQty,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionStats = async (req, res, next) => {
  try {
    const totalBooksRes = await db.query('SELECT COUNT(*) as count, SUM(available_quantity) as total_available, SUM(initial_quantity) as total_initial FROM books');
    const lowStockRes = await db.query('SELECT COUNT(*) as count FROM books WHERE available_quantity < 2');
    const totalUsersRes = await db.query('SELECT COUNT(*) as count FROM users');
    const totalTxRes = await db.query('SELECT COUNT(*) as count FROM transactions');
    const borrowsRes = await db.query("SELECT COUNT(*) as count, SUM(quantity) as total_borrowed FROM transactions WHERE type = 'BORROW'");

    const stats = {
      totalTitles: parseInt(totalBooksRes.rows[0]?.count || 0, 10),
      totalCopiesAvailable: parseInt(totalBooksRes.rows[0]?.total_available || 0, 10),
      totalCopiesInitial: parseInt(totalBooksRes.rows[0]?.total_initial || 0, 10),
      lowStockCount: parseInt(lowStockRes.rows[0]?.count || 0, 10),
      totalUsers: parseInt(totalUsersRes.rows[0]?.count || 0, 10),
      totalTransactions: parseInt(totalTxRes.rows[0]?.count || 0, 10),
      totalBorrowedCopies: parseInt(borrowsRes.rows[0]?.total_borrowed || 0, 10),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
