const db = require('../config/db');

exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, genre, lowStock } = req.query;
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(isbn) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (genre && genre !== 'All') {
      sql += ' AND genre = ?';
      params.push(genre);
    }

    if (lowStock === 'true' || lowStock === '1') {
      sql += ' AND available_quantity < 2';
    }

    sql += ' ORDER BY id DESC';

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

exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM books WHERE id = ?', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${id} not found`,
      });
    }

    const historyResult = await db.query(
      `SELECT t.*, u.name as user_name, u.membership_id
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.book_id = ?
       ORDER BY t.transaction_date DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        recent_transactions: historyResult.rows || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const { title, author, genre, isbn, initial_quantity } = req.body;

    if (!title || !author || !genre || !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Title, Author, Genre, and ISBN are required fields',
      });
    }

    const qty = parseInt(initial_quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial quantity must be a non-negative number',
      });
    }

    const existing = await db.query('SELECT id FROM books WHERE isbn = ?', [isbn.trim()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `A book with ISBN "${isbn}" already exists`,
      });
    }

    const insertSql = `
      INSERT INTO books (title, author, genre, isbn, initial_quantity, available_quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(insertSql, [
      title.trim(),
      author.trim(),
      genre.trim(),
      isbn.trim(),
      qty,
      qty,
    ]);

    const createdId = result.insertId;
    let newBook = null;
    if (createdId) {
      const fetchNew = await db.query('SELECT * FROM books WHERE id = ?', [createdId]);
      newBook = fetchNew.rows[0];
    } else {
      const fetchNew = await db.query('SELECT * FROM books WHERE isbn = ?', [isbn.trim()]);
      newBook = fetchNew.rows[0];
    }

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, genre, isbn, initial_quantity, available_quantity } = req.body;

    const checkBook = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (!checkBook.rows || checkBook.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${id} not found`,
      });
    }

    const currentBook = checkBook.rows[0];

    if (!title || !author || !genre || !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Title, Author, Genre, and ISBN are required fields',
      });
    }

    const existingIsbn = await db.query('SELECT id FROM books WHERE isbn = ? AND id != ?', [
      isbn.trim(),
      id,
    ]);
    if (existingIsbn.rows && existingIsbn.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Another book with ISBN "${isbn}" already exists`,
      });
    }

    const initQty = initial_quantity !== undefined ? parseInt(initial_quantity, 10) : currentBook.initial_quantity;
    const availQty = available_quantity !== undefined ? parseInt(available_quantity, 10) : currentBook.available_quantity;

    if (isNaN(initQty) || initQty < 0 || isNaN(availQty) || availQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantities must be non-negative numbers',
      });
    }

    const updateSql = `
      UPDATE books
      SET title = ?, author = ?, genre = ?, isbn = ?, initial_quantity = ?, available_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(updateSql, [
      title.trim(),
      author.trim(),
      genre.trim(),
      isbn.trim(),
      initQty,
      availQty,
      id,
    ]);

    const updated = await db.query('SELECT * FROM books WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkBook = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (!checkBook.rows || checkBook.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${id} not found`,
      });
    }

    await db.query('DELETE FROM transactions WHERE book_id = ?', [id]);
    await db.query('DELETE FROM books WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Book "${checkBook.rows[0].title}" deleted successfully`,
      deletedId: parseInt(id, 10),
    });
  } catch (error) {
    next(error);
  }
};
