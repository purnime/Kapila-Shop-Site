import { fileURLToPath } from 'url';

const API_BASE_URL = 'http://localhost:3000';

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin123', password: '123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error('Login failed');
        const userId = loginData.user.id;
        console.log('Logged in as user:', userId);

        // 2. Get Notifications
        console.log('Fetching notifications...');
        const notifRes = await fetch(`${API_BASE_URL}/api/notifications/${userId}`);
        const notifications = await notifRes.json();
        const testNotif = notifications.find(n => n.message === 'Test Notification to Delete');

        if (!testNotif) throw new Error('Test notification not found');
        console.log('Found notification:', testNotif.id);

        // 3. Delete Notification
        console.log('Deleting notification...');
        const delRes = await fetch(`${API_BASE_URL}/api/notifications/${testNotif.id}`, {
            method: 'DELETE'
        });
        const delData = await delRes.json();
        if (!delData.success) throw new Error('Delete failed');
        console.log('Delete successful');

        // 4. Verify gone
        const verifyRes = await fetch(`${API_BASE_URL}/api/notifications/${userId}`);
        const verifyNotifs = await verifyRes.json();
        if (verifyNotifs.find(n => n.id === testNotif.id)) {
            throw new Error('Notification still exists!');
        }
        console.log('Verification successful: Notification is gone.');

    } catch (err) {
        console.error('Verification Failed:', err.message);
        process.exit(1);
    }
}
run();
