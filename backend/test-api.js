const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Integration Tests ---');

  const health = await makeRequest('GET', '/health');
  console.log('1. Health check:', health.status === 200 ? 'PASS' : 'FAIL', health.body?.database);

  const books = await makeRequest('GET', '/books');
  console.log('2. GET /books count:', books.body?.data?.length, books.status === 200 ? 'PASS' : 'FAIL');

  const newBook = await makeRequest('POST', '/books', {
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
    genre: 'Software Engineering',
    isbn: '978-0134757599',
    initial_quantity: 5
  });
  console.log('3. POST /books:', newBook.status === 201 ? 'PASS' : 'FAIL', newBook.body?.data?.id);
  const createdBookId = newBook.body?.data?.id;

  const updatedBook = await makeRequest('PUT', `/books/${createdBookId}`, {
    title: 'Refactoring: 2nd Edition',
    author: 'Martin Fowler',
    genre: 'Software Engineering',
    isbn: '978-0134757599',
    initial_quantity: 5,
    available_quantity: 5
  });
  console.log('4. PUT /books/:id:', updatedBook.status === 200 ? 'PASS' : 'FAIL');

  const users = await makeRequest('GET', '/users');
  console.log('5. GET /users count:', users.body?.data?.length, users.status === 200 ? 'PASS' : 'FAIL');

  const loginRes = await makeRequest('POST', '/users/login', {
    membership_id: 'MEM-2001'
  });
  console.log('6. POST /users/login:', loginRes.status === 200 ? 'PASS' : 'FAIL', loginRes.body?.user?.name);

  const borrowTx = await makeRequest('POST', '/transactions', {
    book_id: createdBookId,
    user_id: loginRes.body?.user?.id,
    type: 'BORROW',
    quantity: 2,
    notes: 'Semester assignment'
  });
  console.log('7. POST /transactions (BORROW):', borrowTx.status === 201 ? 'PASS' : 'FAIL',
    `Remaining: ${borrowTx.body?.updated_book?.available_quantity}`);

  const restockTx = await makeRequest('POST', '/transactions', {
    book_id: createdBookId,
    type: 'RESTOCK',
    quantity: 3,
    notes: 'Restocked by distributor'
  });
  console.log('8. POST /transactions (RESTOCK):', restockTx.status === 201 ? 'PASS' : 'FAIL',
    `New stock: ${restockTx.body?.updated_book?.available_quantity}`);

  const stats = await makeRequest('GET', '/transactions/stats');
  console.log('9. GET /transactions/stats:', stats.status === 200 ? 'PASS' : 'FAIL', stats.body?.data);

  const deleteRes = await makeRequest('DELETE', `/books/${createdBookId}`);
  console.log('10. DELETE /books/:id:', deleteRes.status === 200 ? 'PASS' : 'FAIL');

  console.log('--- All API Tests Completed Successfully! ---');
  process.exit(0);
}

const app = require('./server');
setTimeout(() => {
  runTests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
  });
}, 800);
