INSERT INTO users (name, membership_id, role, email, status) VALUES
('Alexander Wright', 'ADM-1001', 'admin', 'alex.wright@library.org', 'active'),
('Sarah Connor', 'MEM-2001', 'member', 'sarah.c@techuniv.edu', 'active'),
('David Mitchell', 'MEM-2002', 'member', 'd.mitchell@readmail.com', 'active'),
('Elena Rostova', 'MEM-2003', 'member', 'elena.rostova@academics.org', 'active');

INSERT INTO books (title, author, genre, isbn, initial_quantity, available_quantity) VALUES
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Computer Science', '978-0132350884', 5, 4),
('The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas & Andrew Hunt', 'Computer Science', '978-0135957059', 3, 1),
('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Software Engineering', '978-0201633610', 4, 0),
('Atomic Habits: An Easy & Proven Way to Build Good Habits', 'James Clear', 'Self-Help', '978-0735211292', 6, 5),
('To Kill a Mockingbird', 'Harper Lee', 'Classic Fiction', '978-0060935467', 4, 3),
('Introduction to Algorithms (CLRS)', 'Thomas H. Cormen', 'Computer Science', '978-0262046305', 2, 1);

INSERT INTO transactions (book_id, user_id, type, quantity, previous_quantity, new_quantity, notes) VALUES
(1, 2, 'BORROW', 1, 5, 4, 'Sarah Connor borrowed Clean Code for semester project'),
(2, 3, 'BORROW', 1, 2, 1, 'David Mitchell borrowed for system architecture course'),
(3, 4, 'BORROW', 1, 1, 0, 'Elena Rostova borrowed last copy of Design Patterns'),
(4, 1, 'RESTOCK', 2, 4, 6, 'Annual library inventory restock by administrator');
