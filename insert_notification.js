import { setupDb, openDb } from './server/database.js';

async function run() {
    try {
        await setupDb();
        const db = await openDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', ['admin123']);
        if (user) {
            await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [user.id, 'Test Notification to Delete']);
            console.log('Notification inserted');
        } else {
            console.error('Admin user not found');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}
run();
