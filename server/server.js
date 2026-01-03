import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDb, openDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.resolve(__dirname, '..', 'dist');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust for your frontend URL
    credentials: true
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(DIST_PATH));

// Email transporter setup (using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
        pass: process.env.EMAIL_PASS || 'your-app-password' // Use app password, not regular password
    }
});


// Auth Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (user) {
        res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password, name, email, phone } = req.body;
    const db = await openDb();
    try {
        const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        const result = await db.run(
            'INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
            [username, password, name, email, phone]
        );
        res.json({ success: true, user: { id: result.lastID, username, name } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CART Endpoints
app.get('/api/cart/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await openDb();
    const items = await db.all(`
        SELECT cart_items.id as id, cart_items.quantity, products.id as product_id, products.name, products.price, products.image, products.category
        FROM cart_items
        JOIN products ON cart_items.product_id = products.id
        WHERE cart_items.user_id = ?
    `, [userId]);
    res.json(items);
});

app.post('/api/cart', async (req, res) => {
    const { userId, productId, change } = req.body; // change: +1 or -1
    const db = await openDb();
    try {
        const existing = await db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

        if (existing) {
            let newQuantity = existing.quantity;
            if (change) {
                newQuantity += change;
            } else {
                newQuantity += 1; // Default to add 1 if no change specified
            }

            if (newQuantity <= 0) {
                await db.run('DELETE FROM cart_items WHERE id = ?', [existing.id]);
            } else {
                // Check stock before increasing
                if (change > 0) {
                    const product = await db.get('SELECT stock FROM products WHERE id = ?', [productId]);
                    if (newQuantity > product.stock) {
                        return res.status(400).json({ success: false, message: 'Not enough stock' });
                    }
                }
                await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existing.id]);
            }
        } else {
            if (change && change < 0) {
                return res.status(400).json({ success: false, message: 'Item not in cart' });
            }
            // Check stock first
            const product = await db.get('SELECT stock FROM products WHERE id = ?', [productId]);
            if (!product || product.stock < 1) {
                return res.status(400).json({ success: false, message: 'Out of stock' });
            }
            await db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)', [userId, productId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    const { id } = req.params;
    const db = await openDb();
    await db.run('DELETE FROM cart_items WHERE id = ?', [id]);
    res.json({ success: true });
});

// CHECKOUT Endpoint
app.post('/api/checkout', async (req, res) => {
    const { userId } = req.body;
    const db = await openDb();

    try {
        // Get Cart Items with current Stock
        const cartItems = await db.all(`
      SELECT cart_items.quantity, products.id as product_id, products.name, products.price, products.stock, products.discount 
      FROM cart_items 
      JOIN products ON cart_items.product_id = products.id 
      WHERE cart_items.user_id = ?
    `, [userId]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check Stock Availability
        for (const item of cartItems) {
            if (item.quantity > (item.stock || 0)) {
                return res.status(400).json({ message: `Not enough stock for ${item.name}. Available: ${item.stock || 0}` });
            }
        }

        // Calculate Total (considering discount)
        const total = cartItems.reduce((sum, item) => {
            const finalPrice = item.price * (1 - (item.discount || 0) / 100);
            return sum + (finalPrice * item.quantity);
        }, 0);

        // Create Order
        const orderResult = await db.run('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)', [userId, Math.round(total * 100) / 100, 'Pending']);
        const orderId = orderResult.lastID;

        // Create Order Items and Deduct Stock
        for (const item of cartItems) {
            const finalPrice = item.price * (1 - (item.discount || 0) / 100);
            await db.run(
                'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.name, item.quantity, Math.round(finalPrice * 100) / 100]
            );
            // Deduct Stock
            await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // Clear Cart
        await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        res.json({ success: true, orderId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Admin Orders
app.get('/api/orders', async (req, res) => {
    const db = await openDb();
    const orders = await db.all(`
    SELECT orders.id, orders.total, orders.status, orders.created_at, users.name as user_name, users.phone as user_phone, users.email as user_email
    FROM orders 
    JOIN users ON orders.user_id = users.id 
    ORDER BY orders.created_at DESC
  `);

    // Fetch items for each order
    for (const order of orders) {
        const items = await db.all('SELECT product_name, quantity, price FROM order_items WHERE order_id = ?', [order.id]);
        order.items = items;
    }

    res.json(orders);
});

// UPDATE Order Status
app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = await openDb();
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // If status is Confirmed, send email to customer (simplified placeholder as per previous view)
    if (status === 'Confirmed') {
        // ... email logic
    }

    // Create app notification
    const order = await db.get('SELECT user_id FROM orders WHERE id = ?', [id]);
    if (order) {
        await db.run(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [order.user_id, `Your order #${id} status has been updated to: ${status}`]
        );
    }

    res.json({ success: true });
});

// GET user notifications
app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await openDb();
    try {
        const notifications = await db.all(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notifications as read
app.put('/api/notifications/read/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await openDb();
    try {
        await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Order
app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received request to delete order: ${id}`);
    const db = await openDb();
    try {
        const itemsResult = await db.run('DELETE FROM order_items WHERE order_id = ?', [id]);
        console.log(`Deleted ${itemsResult.changes} items for order ${id}`);
        const orderResult = await db.run('DELETE FROM orders WHERE id = ?', [id]);
        console.log(`Deleted order ${id}: ${orderResult.changes > 0 ? 'Success' : 'Not found'}`);
        res.json({ success: true, changes: orderResult.changes });
    } catch (err) {
        console.error(`Error deleting order ${id}:`, err);
        res.status(500).json({ error: err.message });
    }
});

// GET All Products
app.get('/api/products', async (req, res) => {
    const db = await openDb();
    const products = await db.all('SELECT * FROM products');
    res.json(products);
});

// ADD Product
app.post('/api/products', async (req, res) => {
    const { name, category, price, image, rating, stock, discount } = req.body;
    const db = await openDb();
    try {
        const result = await db.run(
            'INSERT INTO products (name, category, price, image, rating, stock, discount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, price, image, rating || 0, stock || 0, discount || 0]
        );
        res.json({ id: result.lastID, name, category, price, image, rating, stock, discount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE Product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, price, image, stock, discount } = req.body;
    const db = await openDb();
    try {
        await db.run(
            'UPDATE products SET name = ?, category = ?, price = ?, image = ?, stock = ?, discount = ? WHERE id = ?',
            [name, category, price, image, stock, discount, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const db = await openDb();
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
});

// Catch-all route to serve the React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Initialize DB and Start Server
const startServer = async () => {
    try {
        await setupDb();
        console.log('Database initialized successfully');

        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
            } else {
                console.error('Server error:', err);
            }
        });
    } catch (err) {
        console.error('DB Setup Failed', err);
        process.exit(1);
    }
};

startServer();
