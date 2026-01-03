import { openDb, setupDb } from './server/database.js';

async function test() {
  try {
    console.log('Testing DB connection...');
    const db = await openDb();
    console.log('DB opened');
    
    await setupDb();
    console.log('Setup finished');
    
    const products = await db.all('SELECT * FROM products');
    console.log('Products count:', products.length);
    if (products.length > 0) {
      console.log('First product:', products[0].name);
    }
    
    await db.close();
    console.log('DB closed');
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

test();
