import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'database.sqlite');

export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function setupDb() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      price REAL,
      image TEXT,
      rating REAL,
      stock INTEGER DEFAULT 0,
      discount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_name TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Seed Admin User
  const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin123']);
  if (!admin) {
    // In a real app we would hash passwords, but keeping it simple as requested
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin123', '123']);
    console.log('Admin user created');
  }

  // Seed Products if empty
  const count = await db.get('SELECT count(*) as count FROM products');
  if (count.count === 0) {
    const products = [
      { name: 'Cream Crackers', category: 'snacks', price: 150, image: 'https://placehold.co/300x300/png?text=Crackers', rating: 4.5, stock: 50, discount: 10 },
      { name: 'Chocolate Biscuit', category: 'snacks', price: 200, image: 'https://placehold.co/300x300/png?text=Choco+Biscuit', rating: 4.8, stock: 20 },
      { name: 'Cola 500ml', category: 'beverages', price: 120, image: 'https://placehold.co/300x300/png?text=Cola', rating: 4.2, stock: 100 },
      { name: 'Orange Juice', category: 'beverages', price: 350, image: 'https://placehold.co/300x300/png?text=Juice', rating: 4.6, stock: 15 },
      { name: 'Basmati Rice 1kg', category: 'groceries', price: 550, image: 'https://placehold.co/300x300/png?text=Rice', rating: 5.0, stock: 30 },
      { name: 'Red Dhal 1kg', category: 'groceries', price: 320, image: 'https://placehold.co/300x300/png?text=Dhal', rating: 4.4, stock: 40 },
      { name: 'Exercise Book 80pg', category: 'books', price: 120, image: 'https://placehold.co/300x300/png?text=Book', rating: 4.0, stock: 60 },
      { name: 'Blue Pen Set', category: 'books', price: 80, image: 'https://placehold.co/300x300/png?text=Pens', rating: 4.3, stock: 100 },
      { name: 'Dish Wash Liquid', category: 'household', price: 420, image: 'https://placehold.co/300x300/png?text=Dish+Wash', rating: 4.7, stock: 25 },
      { name: 'Laundry Powder', category: 'household', price: 650, image: 'https://placehold.co/300x300/png?text=Detergent', rating: 4.6, stock: 10, discount: 5 },
    ];

    for (const p of products) {
      await db.run(
        'INSERT INTO products (name, category, price, image, rating, stock, discount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.category, p.price, p.image, p.rating, p.stock || 0, p.discount || 0]
      );
    }
    console.log('Seed products created');
  }
}
