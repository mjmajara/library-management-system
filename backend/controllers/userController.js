const db = require('../config/db');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let sql = `
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.type = 'BORROW') as borrow_count
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      sql += ' AND u.role = ?';
      params.push(role.toLowerCase());
    }

    if (search) {
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.membership_id) LIKE ? OR LOWER(u.email) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY u.id DESC';

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

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    const txResult = await db.query(
      `SELECT t.*, b.title as book_title, b.isbn as book_isbn 
       FROM transactions t 
       JOIN books b ON t.book_id = b.id 
       WHERE t.user_id = ? 
       ORDER BY t.transaction_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        transactions: txResult.rows || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, membership_id, role, email } = req.body;

    if (!name || !membership_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and Membership ID are required fields',
      });
    }

    const assignedRole = (role || 'member').toLowerCase();
    if (!['admin', 'member'].includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "admin" or "member"',
      });
    }

    const existing = await db.query('SELECT id FROM users WHERE membership_id = ?', [
      membership_id.trim().toUpperCase(),
    ]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Membership ID "${membership_id}" is already assigned to another user`,
      });
    }

    const insertSql = `
      INSERT INTO users (name, membership_id, role, email, status)
      VALUES (?, ?, ?, ?, 'active')
    `;

    const result = await db.query(insertSql, [
      name.trim(),
      membership_id.trim().toUpperCase(),
      assignedRole,
      email ? email.trim() : null,
    ]);

    let createdUser = null;
    if (result.insertId) {
      const fetchNew = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      createdUser = fetchNew.rows[0];
    } else {
      const fetchNew = await db.query('SELECT * FROM users WHERE membership_id = ?', [
        membership_id.trim().toUpperCase(),
      ]);
      createdUser = fetchNew.rows[0];
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: createdUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, membership_id, role, email, status } = req.body;

    const checkUser = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!checkUser.rows || checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    const currentUser = checkUser.rows[0];

    if (!name || !membership_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and Membership ID are required fields',
      });
    }

    const newMembershipId = membership_id.trim().toUpperCase();
    const existingId = await db.query('SELECT id FROM users WHERE membership_id = ? AND id != ?', [
      newMembershipId,
      id,
    ]);

    if (existingId.rows && existingId.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Membership ID "${newMembershipId}" is already taken`,
      });
    }

    const updatedRole = (role || currentUser.role).toLowerCase();
    const updatedStatus = (status || currentUser.status || 'active').toLowerCase();

    const updateSql = `
      UPDATE users
      SET name = ?, membership_id = ?, role = ?, email = ?, status = ?
      WHERE id = ?
    `;

    await db.query(updateSql, [
      name.trim(),
      newMembershipId,
      updatedRole,
      email ? email.trim() : currentUser.email,
      updatedStatus,
      id,
    ]);

    const updated = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkUser = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!checkUser.rows || checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    await db.query('UPDATE transactions SET user_id = NULL WHERE user_id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `User "${checkUser.rows[0].name}" (${checkUser.rows[0].membership_id}) deleted successfully`,
      deletedId: parseInt(id, 10),
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { membership_id, role } = req.body;

    if (!membership_id) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required to login',
      });
    }

    const memId = membership_id.trim().toUpperCase();
    const result = await db.query('SELECT * FROM users WHERE membership_id = ?', [memId]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: `No user found with Membership ID "${membership_id}". Please check your ID or contact an administrator.`,
      });
    }

    const user = result.rows[0];

    if (role && role.toLowerCase() !== user.role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User "${user.name}" has role "${user.role}", not "${role}".`,
      });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        membership_id: user.membership_id,
        role: user.role,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
