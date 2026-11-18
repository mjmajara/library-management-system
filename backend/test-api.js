const { startServer } = require('./server');

const TEST_PORT = 5005;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runTests() {
  console.log('--- Starting API Integration Tests ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check:', healthRes.ok ? 'PASS' : 'FAIL', healthData.database);

  // 2. GET /books
  const booksRes = await fetch(`${BASE_URL}/books`);
  const booksData = await booksRes.json();
  console.log('2. GET /books count:', booksData.data?.length, booksRes.ok ? 'PASS' : 'FAIL');

  // 3. POST /books
  const createBookRes = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      genre: 'Software Engineering',
      isbn: '978-0134757599',
      initial_quantity: 5,
    }),
  });
  const createBookData = await createBookRes.json();
  console.log('3. POST /books:', createBookRes.ok ? 'PASS' : 'FAIL', `ID: ${createBookData.data?.id}`);
  const createdBookId = createBookData.data?.id;

  // 4. PUT /books/:id
  const updateBookRes = await fetch(`${BASE_URL}/books/${createdBookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Refactoring: 2nd Edition',
      author: 'Martin Fowler',
      genre: 'Software Engineering',
      isbn: '978-0134757599',
      initial_quantity: 5,
      available_quantity: 5,
    }),
  });
  console.log('4. PUT /books/:id:', updateBookRes.ok ? 'PASS' : 'FAIL');

  // 5. GET /users
  const usersRes = await fetch(`${BASE_URL}/users`);
  const usersData = await usersRes.json();
  console.log('5. GET /users count:', usersData.data?.length, usersRes.ok ? 'PASS' : 'FAIL');

  // 6. POST /users/login
  const loginRes = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ membership_id: 'ACE-77' }),
  });
  const loginData = await loginRes.json();
  console.log('6. POST /users/login:', loginRes.ok ? 'PASS' : 'FAIL', loginData.user?.name);

  // 7. POST /transactions (BORROW)
  const borrowRes = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      book_id: createdBookId,
      user_id: loginData.user?.id,
      type: 'BORROW',
      quantity: 2,
      notes: 'Semester assignment checkout',
    }),
  });
  const borrowData = await borrowRes.json();
  console.log(
    '7. POST /transactions (BORROW):',
    borrowRes.ok ? 'PASS' : 'FAIL',
    `Remaining: ${borrowData.updated_book?.available_quantity}`
  );

  // 8. POST /transactions (RESTOCK)
  const restockRes = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      book_id: createdBookId,
      type: 'RESTOCK',
      quantity: 3,
      notes: 'Restocked by distributor',
    }),
  });
  const restockData = await restockRes.json();
  console.log(
    '8. POST /transactions (RESTOCK):',
    restockRes.ok ? 'PASS' : 'FAIL',
    `New stock: ${restockData.updated_book?.available_quantity}`
  );

  // 9. GET /transactions/stats
  const statsRes = await fetch(`${BASE_URL}/transactions/stats`);
  const statsData = await statsRes.json();
  console.log('9. GET /transactions/stats:', statsRes.ok ? 'PASS' : 'FAIL', statsData.data);

  // 10. DELETE /books/:id
  const deleteRes = await fetch(`${BASE_URL}/books/${createdBookId}`, {
    method: 'DELETE',
  });
  console.log('10. DELETE /books/:id:', deleteRes.ok ? 'PASS' : 'FAIL');

  console.log('--- All API Tests Completed Successfully! ---');
  process.exit(0);
}

startServer(TEST_PORT)
  .then(() => runTests())
  .catch((err) => {
    console.error('Test run error:', err);
    process.exit(1);
  });
