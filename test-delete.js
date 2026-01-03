async function testDelete() {
    try {
        console.log('Fetching orders...');
        const res = await fetch('http://localhost:3000/api/orders');
        const text = await res.text();
        console.log('Raw response:', text);

        const orders = JSON.parse(text);

        if (orders.length === 0) {
            console.log('No orders found to delete.');
            return;
        }

        const orderId = orders[0].id;
        console.log(`Attempting to delete order ID: ${orderId}`);

        const deleteRes = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            method: 'DELETE'
        });

        const deleteText = await deleteRes.text();
        console.log('Delete raw response:', deleteText);

        const result = JSON.parse(deleteText);
        console.log('Delete result:', result);

        if (result.success) {
            console.log('SUCCESS: Order deleted.');
        } else {
            console.log('FAILURE:', result.error);
        }
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testDelete();
